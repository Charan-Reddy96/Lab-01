
const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const PORT = 3000;

// Database configuration
const isVercel = !!process.env.VERCEL;
const dbFolder = isVercel ? "/tmp" : path.join(__dirname, "database");
const dbPath = path.join(dbFolder, "library.db");

let db = null;

// Sample book records
const sampleBooks = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 399,
    pages: 281,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    price: 299,
    pages: 328,
  },
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 250,
    pages: 180,
  },
  {
    id: 4,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    price: 350,
    pages: 234,
  },
  {
    id: 5,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 220,
    pages: 279,
  },
  {
    id: 6,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    price: 450,
    pages: 310,
  },
  {
    id: 7,
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    price: 499,
    pages: 223,
  },
  {
    id: 8,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 299,
    pages: 208,
  },
  {
    id: 9,
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    price: 420,
    pages: 430,
  },
  {
    id: 10,
    title: "The Da Vinci Code",
    author: "Dan Brown",
    price: 380,
    pages: 454,
  },
];

// Initialize database
const initializeDB = async () => {
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
  }

  // Copy database to writable storage on Vercel
  if (isVercel && !fs.existsSync(dbPath)) {
    const sourceDb = path.join(__dirname, "database", "library.db");

    if (fs.existsSync(sourceDb)) {
      fs.copyFileSync(sourceDb, dbPath);
    }
  }

  db = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create book table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY,
      title TEXT,
      author TEXT,
      price INTEGER,
      pages INTEGER
    );
  `);

  // Insert sample records if table is empty
  const result = await db.get(
    "SELECT COUNT(*) AS count FROM book;"
  );

  if (result.count === 0) {
    const insertQuery = `
      INSERT INTO book (id, title, author, price, pages)
      VALUES (?, ?, ?, ?, ?);
    `;

    for (const book of sampleBooks) {
      await db.run(insertQuery, [
        book.id,
        book.title,
        book.author,
        book.price,
        book.pages,
      ]);
    }

    console.log("Sample books inserted successfully.");
  }

  console.log("Database connected successfully.");
};

// Wait for database initialization before processing requests
const dbPromise = initializeDB();

app.use(async (req, res, next) => {
  try {
    await dbPromise;
    next();
  } catch (error) {
    console.error("Database initialization error:", error.message);

    res.status(500).json({
      error: "Database initialization failed",
    });
  }
});

// Validate book ID
const isValidId = (id) => {
  return /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));
};

// Validate numeric values
const isValidNumber = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
};

// ================= ROOT ROUTE =================

app.get("/", (req, res) => {
  res.send(
    "Backend Development Fundamentals Lab 3 - REST API, Query Parameters, Validation and Debugging"
  );
});

// ================= GET ALL BOOKS =================
// Supports search, sorting, pagination and price filtering

app.get(["/books", "/books/"], async (req, res) => {
  try {
    const {
      search_q,
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price,
    } = req.query;

    // Allowed sorting columns
    const allowedColumns = [
      "id",
      "title",
      "author",
      "price",
      "pages",
    ];

    // Validate sorting column
    if (!allowedColumns.includes(order_by)) {
      return res.status(400).json({
        error: "Invalid order_by parameter",
      });
    }

    // Validate sorting order
    const sortOrder = order.toUpperCase();

    if (!["ASC", "DESC"].includes(sortOrder)) {
      return res.status(400).json({
        error: "Order must be ASC or DESC",
      });
    }

    // Validate limit and offset
    const limitValue = Number(limit);
    const offsetValue = Number(offset);

    if (
      typeof limit !== "string" ||
      typeof offset !== "string" ||
      !/^\d+$/.test(limit) ||
      !/^\d+$/.test(offset) ||
      !Number.isSafeInteger(limitValue) ||
      !Number.isSafeInteger(offsetValue) ||
      limitValue <= 0
    ) {
      return res.status(400).json({
        error: "Limit must be a positive integer and offset must be a non-negative integer",
      });
    }

    // Build SQL conditions
    const conditions = [];
    const params = [];

    // Partial title search
    if (search_q !== undefined) {
      if (typeof search_q !== "string") {
        return res.status(400).json({
          error: "search_q must be a string",
        });
      }

      if (search_q.trim() !== "") {
        conditions.push("title LIKE ? COLLATE NOCASE");
        params.push(`%${search_q.trim()}%`);
      }
    }

    // Minimum price filtering
    if (min_price !== undefined) {
      const minPrice = Number(min_price);

      if (
        typeof min_price !== "string" ||
        min_price.trim() === "" ||
        !Number.isFinite(minPrice) ||
        minPrice < 0
      ) {
        return res.status(400).json({
          error: "min_price must be a non-negative number",
        });
      }

      conditions.push("price >= ?");
      params.push(minPrice);
    }

    // Maximum price filtering
    if (max_price !== undefined) {
      const maxPrice = Number(max_price);

      if (
        typeof max_price !== "string" ||
        max_price.trim() === "" ||
        !Number.isFinite(maxPrice) ||
        maxPrice < 0
      ) {
        return res.status(400).json({
          error: "max_price must be a non-negative number",
        });
      }

      conditions.push("price <= ?");
      params.push(maxPrice);
    }

    // Validate price range
    if (
      min_price !== undefined &&
      max_price !== undefined &&
      Number(min_price) > Number(max_price)
    ) {
      return res.status(400).json({
        error: "min_price cannot be greater than max_price",
      });
    }

    // Construct WHERE clause
    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // Add pagination parameters
    params.push(limitValue, offsetValue);

    // Final SQL query
    const getBooksQuery = `
      SELECT * FROM book
      ${whereClause}
      ORDER BY ${order_by} ${sortOrder}
      LIMIT ? OFFSET ?;
    `;

    const books = await db.all(getBooksQuery, params);

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

// ================= GET BOOK BY ID =================

app.get(["/books/:bookId", "/books/:bookId/"], async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!isValidId(bookId)) {
      return res.status(400).json({
        error: "Invalid book ID",
      });
    }

    const getBookQuery = `
      SELECT * FROM book WHERE id = ?;
    `;

    const book = await db.get(getBookQuery, [Number(bookId)]);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

// ================= CREATE A BOOK =================

app.post(["/books", "/books/"], async (req, res) => {
  try {
    const { title, author, price, pages } = req.body || {};

    // Validate required fields
    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof author !== "string" ||
      author.trim() === "" ||
      !isValidNumber(price) ||
      !Number.isInteger(price) ||
      price < 0 ||
      !isValidNumber(pages) ||
      !Number.isInteger(pages) ||
      pages <= 0
    ) {
      return res.status(400).json({
        error: "Valid title, author, non-negative integer price and positive integer pages are required",
      });
    }

    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(addBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages,
    ]);

    res.status(201).json({
      message: "Book Added Successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

// ================= UPDATE BOOK =================

app.put(["/books/:bookId", "/books/:bookId/"], async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!isValidId(bookId)) {
      return res.status(400).json({
        error: "Invalid book ID",
      });
    }

    const { title, author, price, pages } = req.body || {};

    // Validate input fields
    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof author !== "string" ||
      author.trim() === "" ||
      !isValidNumber(price) ||
      !Number.isInteger(price) ||
      price < 0 ||
      !isValidNumber(pages) ||
      !Number.isInteger(pages) ||
      pages <= 0
    ) {
      return res.status(400).json({
        error: "Valid title, author, non-negative integer price and positive integer pages are required",
      });
    }

    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    const result = await db.run(updateBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages,
      Number(bookId),
    ]);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book Details Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

// ================= DELETE BOOK =================

app.delete(["/books/:bookId", "/books/:bookId/"], async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!isValidId(bookId)) {
      return res.status(400).json({
        error: "Invalid book ID",
      });
    }

    const deleteBookQuery = `
      DELETE FROM book WHERE id = ?;
    `;

    const result = await db.run(deleteBookQuery, [Number(bookId)]);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});

// ================= ERROR HANDLING =================

// Handle invalid JSON and other middleware errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      error: "Invalid JSON request body",
    });
  }

  console.error(error);

  res.status(500).json({
    error: "Internal Server Error",
  });
});

// ================= START SERVER =================

if (!isVercel) {
  dbPromise
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`);
      });
    })
    .catch((error) => {
      console.error("Unable to start server:", error.message);
      process.exitCode = 1;
    });
}

module.exports = app;
