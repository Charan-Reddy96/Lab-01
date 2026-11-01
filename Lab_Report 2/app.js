const express = require("express");
const path = require("path");
const fs = require("fs");

// Attempt loading sqlite and sqlite3 safely
let sqlite;
let sqlite3;
try {
  sqlite = require("sqlite");
  sqlite3 = require("sqlite3");
} catch (err) {
  console.warn("Native sqlite3 module not loaded:", err.message);
}

const app = express();
app.use(express.json());

// Database folder and file path (compatible with local environment and Vercel serverless)
const isVercel = !!process.env.VERCEL;
const dbFolder = isVercel ? "/tmp" : path.join(__dirname, "database");
const dbPath = path.join(dbFolder, "library.db");
let db = null;

// Initial 10 sample books
const sampleBooks = [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", price: 399, pages: 281 },
  { id: 2, title: "1984", author: "George Orwell", price: 299, pages: 328 },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 250, pages: 180 },
  { id: 4, title: "The Catcher in the Rye", author: "J.D. Salinger", price: 350, pages: 234 },
  { id: 5, title: "Pride and Prejudice", author: "Jane Austen", price: 220, pages: 279 },
  { id: 6, title: "The Hobbit", author: "J.R.R. Tolkien", price: 450, pages: 310 },
  { id: 7, title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", price: 499, pages: 223 },
  { id: 8, title: "The Alchemist", author: "Paulo Coelho", price: 299, pages: 208 },
  { id: 9, title: "Crime and Punishment", author: "Fyodor Dostoevsky", price: 420, pages: 430 },
  { id: 10, title: "The Da Vinci Code", author: "Dan Brown", price: 380, pages: 454 },
];

// Fallback in-memory DB engine for environments where native binary addons cannot load (such as Vercel Serverless)
const createFallbackDB = () => {
  let books = [...sampleBooks];
  let nextId = 11;
  return {
    async all(query, params = []) {
      return [...books];
    },
    async get(query, params = []) {
      if (query.includes("COUNT(*)")) {
        return { count: books.length };
      }
      const id = parseInt(params[0]);
      return books.find((b) => b.id === id) || null;
    },
    async run(query, params = []) {
      if (query.includes("INSERT INTO book")) {
        const [title, author, price, pages] = params;
        const newBook = { id: nextId++, title, author, price: Number(price), pages: Number(pages) };
        books.push(newBook);
        return { lastID: newBook.id, changes: 1 };
      }
      if (query.includes("UPDATE book")) {
        const [title, author, price, pages, bookId] = params;
        const id = parseInt(bookId);
        const index = books.findIndex((b) => b.id === id);
        if (index === -1) return { changes: 0 };
        books[index] = { id, title, author, price: Number(price), pages: Number(pages) };
        return { changes: 1 };
      }
      if (query.includes("DELETE FROM book")) {
        const id = parseInt(params[0]);
        const initialLen = books.length;
        books = books.filter((b) => b.id !== id);
        return { changes: initialLen !== books.length ? 1 : 0 };
      }
      return { changes: 0 };
    },
    async exec(query) {
      return true;
    },
  };
};

// ================= INITIALIZE DB AND SERVER =================
const initializeDBAndServer = async () => {
  try {
    // Ensure the database folder exists
    if (!fs.existsSync(dbFolder)) {
      fs.mkdirSync(dbFolder, { recursive: true });
    }

    // In Vercel serverless, attempt copying bundled database to /tmp (writable directory)
    if (isVercel && !fs.existsSync(dbPath)) {
      const sourceDb = path.join(__dirname, "database", "library.db");
      if (fs.existsSync(sourceDb)) {
        try {
          fs.copyFileSync(sourceDb, dbPath);
        } catch (e) {
          console.warn("Could not copy sqlite file:", e.message);
        }
      }
    }

    // Connect using sqlite & sqlite3 if available
    if (sqlite && sqlite3) {
      db = await sqlite.open({
        filename: dbPath,
        driver: sqlite3.Database,
      });

      // Create the 'book' table if it does not already exist
      await db.exec(`
        CREATE TABLE IF NOT EXISTS book (
          id INTEGER PRIMARY KEY,
          title TEXT,
          author TEXT,
          price INTEGER,
          pages INTEGER
        );
      `);

      // Insert 10 sample books if table is empty (prevents duplicate records on restart)
      const bookCount = await db.get(`SELECT COUNT(*) AS count FROM book;`);
      if (bookCount.count === 0) {
        await db.exec(`
          INSERT OR IGNORE INTO book (id, title, author, price, pages) VALUES
          (1, 'To Kill a Mockingbird', 'Harper Lee', 399, 281),
          (2, '1984', 'George Orwell', 299, 328),
          (3, 'The Great Gatsby', 'F. Scott Fitzgerald', 250, 180),
          (4, 'The Catcher in the Rye', 'J.D. Salinger', 350, 234),
          (5, 'Pride and Prejudice', 'Jane Austen', 220, 279),
          (6, 'The Hobbit', 'J.R.R. Tolkien', 450, 310),
          (7, 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 499, 223),
          (8, 'The Alchemist', 'Paulo Coelho', 299, 208),
          (9, 'Crime and Punishment', 'Fyodor Dostoevsky', 420, 430),
          (10, 'The Da Vinci Code', 'Dan Brown', 380, 454);
        `);
        console.log("Sample book records inserted into library.db successfully.");
      }
    } else {
      console.log("Using fallback database engine for serverless deployment.");
      db = createFallbackDB();
    }

    // Start Express server on port 3000 locally (Vercel manages listening automatically)
    if (!isVercel) {
      app.listen(3000, () => {
        console.log("Server running at http://localhost:3000/");
      });
    }
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    // Fallback gracefully so serverless functions never crash with 500
    db = createFallbackDB();
    if (!isVercel) {
      app.listen(3000, () => {
        console.log("Server running at http://localhost:3000/");
      });
    }
  }
};

// Store promise so requests wait for DB initialization
const dbPromise = initializeDBAndServer();

// Middleware to ensure DB is initialized before route execution
app.use(async (req, res, next) => {
  if (!db) {
    await dbPromise;
  }
  next();
});

// ================= CRUD ROUTES =================

// 1. Root Route
app.get("/", (req, res) => {
  res.send("Backend Development Fundamentals Lab 2 - SQLite Database and CRUD Routes");
});

// 2. READ ALL: Get list of all books (supports both /books and /books/)
app.get(["/books", "/books/"], async (req, res) => {
  try {
    const getBooksQuery = `SELECT * FROM book ORDER BY id;`;
    const books = await db.all(getBooksQuery);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. READ ONE: Get a single book by ID
app.get(["/books/:bookId", "/books/:bookId/"], async (req, res) => {
  try {
    const { bookId } = req.params;
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. CREATE: Add a new book
app.post(["/books", "/books/"], async (req, res) => {
  try {
    // Check if request body exists
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { title, author, price, pages } = req.body;

    // Validate required fields: title, author, price, and pages
    if (
      title === undefined ||
      author === undefined ||
      price === undefined ||
      pages === undefined ||
      title === "" ||
      author === ""
    ) {
      return res.status(400).json({
        error: "All fields are required: title, author, price, pages",
      });
    }

    // Parameterized SQLite query with ? placeholders
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;
    const result = await db.run(addBookQuery, [title, author, price, pages]);

    res.status(201).json({
      message: "Book Added Successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. UPDATE: Update book details by ID
app.put(["/books/:bookId", "/books/:bookId/"], async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;
    const result = await db.run(updateBookQuery, [title, author, price, pages, bookId]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book Details Updated Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. DELETE: Delete a book by ID
app.delete(["/books/:bookId", "/books/:bookId/"], async (req, res) => {
  try {
    const { bookId } = req.params;
    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
    const result = await db.run(deleteBookQuery, [bookId]);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
