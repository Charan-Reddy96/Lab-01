
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());

// ========================================
// DATABASE CONFIGURATION
// ========================================

const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL;

const dbFolder = isVercel
  ? "/tmp"
  : path.join(__dirname, "database");

const dbPath = path.join(dbFolder, "library.db");

let db = null;
let dbPromise = null;

// Sample book records
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
  { id: 10, title: "The Da Vinci Code", author: "Dan Brown", price: 380, pages: 454 }
];

// ========================================
// INITIALIZE DATABASE
// ========================================

const initializeDB = async () => {
  if (db) {
    return db;
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = (async () => {
    try {
      // Load SQLite only when a database route is requested
      const { open } = require("sqlite");
      const sqlite3 = require("sqlite3");

      fs.mkdirSync(dbFolder, { recursive: true });

      // Copy the original database to Vercel's writable directory
      if (isVercel && !fs.existsSync(dbPath)) {
        const sourceDb = path.join(
          __dirname,
          "database",
          "library.db"
        );

        if (fs.existsSync(sourceDb)) {
          fs.copyFileSync(sourceDb, dbPath);
        }
      }

      const connection = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Create book table
      await connection.exec(`
        CREATE TABLE IF NOT EXISTS book (
          id INTEGER PRIMARY KEY,
          title TEXT,
          author TEXT,
          price INTEGER,
          pages INTEGER
        );
      `);

      // Check existing records
      const result = await connection.get(
        "SELECT COUNT(*) AS count FROM book;"
      );

      // Insert sample records if the table is empty
      if (result.count === 0) {
        const insertQuery = `
          INSERT INTO book (id, title, author, price, pages)
          VALUES (?, ?, ?, ?, ?);
        `;

        for (const book of sampleBooks) {
          await connection.run(insertQuery, [
            book.id,
            book.title,
            book.author,
            book.price,
            book.pages
          ]);
        }
      }

      db = connection;

      console.log("Database connected successfully.");

      return db;
    } catch (error) {
      dbPromise = null;
      console.error("Database initialization error:", error);
      throw error;
    }
  })();

  return dbPromise;
};

// Initialize SQLite only for book API requests
app.use("/books", async (req, res, next) => {
  try {
    await initializeDB();
    next();
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      error: "Database initialization failed",
      details: error.message
    });
  }
});

// ========================================
// VALIDATION FUNCTIONS
// ========================================

const isValidId = (id) => {
  return (
    typeof id === "string" &&
    /^[1-9]\d*$/.test(id) &&
    Number.isSafeInteger(Number(id))
  );
};

const isValidNumber = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
};

const isValidBook = (title, author, price, pages) => {
  return (
    typeof title === "string" &&
    title.trim() !== "" &&
    typeof author === "string" &&
    author.trim() !== "" &&
    isValidNumber(price) &&
    Number.isInteger(price) &&
    price >= 0 &&
    isValidNumber(pages) &&
    Number.isInteger(pages) &&
    pages > 0
  );
};

// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {
  res.status(200).send(
    "Backend Development Fundamentals Lab 3 - REST API, Query Parameters, Validation and Debugging"
  );
});

// ========================================
// GET ALL BOOKS
// SEARCH, SORTING, PAGINATION AND FILTERING
// ========================================

app.get("/books", async (req, res) => {
  try {
    const {
      search_q,
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price
    } = req.query;

    const allowedColumns = [
      "id",
      "title",
      "author",
      "price",
      "pages"
    ];

    // Validate order_by
    if (
      typeof order_by !== "string" ||
      !allowedColumns.includes(order_by)
    ) {
      return res.status(400).json({
        error: "Invalid order_by parameter"
      });
    }

    // Validate order
    if (
      typeof order !== "string" ||
      !["ASC", "DESC"].includes(order.toUpperCase())
    ) {
      return res.status(400).json({
        error: "Order must be ASC or DESC"
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
        error: "Limit must be a positive integer and offset must be a non-negative integer"
      });
    }

    const conditions = [];
    const params = [];

    // Search by title
    if (search_q !== undefined) {
      if (typeof search_q !== "string") {
        return res.status(400).json({
          error: "search_q must be a string"
        });
      }

      if (search_q.trim() !== "") {
        conditions.push("title LIKE ? COLLATE NOCASE");
        params.push(`%${search_q.trim()}%`);
      }
    }

    // Minimum price
    if (min_price !== undefined) {
      const minPrice = Number(min_price);

      if (
        typeof min_price !== "string" ||
        min_price.trim() === "" ||
        !Number.isFinite(minPrice) ||
        minPrice < 0
      ) {
        return res.status(400).json({
          error: "min_price must be a non-negative number"
        });
      }

      conditions.push("price >= ?");
      params.push(minPrice);
    }

    // Maximum price
    if (max_price !== undefined) {
      const maxPrice = Number(max_price);

      if (
        typeof max_price !== "string" ||
        max_price.trim() === "" ||
        !Number.isFinite(maxPrice) ||
        maxPrice < 0
      ) {
        return res.status(400).json({
          error: "max_price must be a non-negative number"
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
        error: "min_price cannot be greater than max_price"
      });
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    params.push(limitValue, offsetValue);

    const query = `
      SELECT * FROM book
      ${whereClause}
      ORDER BY ${order_by} ${order.toUpperCase()}
      LIMIT ? OFFSET ?;
    `;

    const books = await db.all(query, params);

    res.status(200).json(books);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

// ========================================
// GET BOOK BY ID
// ========================================

app.get("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!isValidId(bookId)) {
      return res.status(400).json({
        error: "Invalid book ID"
      });
    }

    const book = await db.get(
      "SELECT * FROM book WHERE id = ?;",
      [Number(bookId)]
    );

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

// ========================================
// CREATE A BOOK
// ========================================

app.post("/books", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body || {};

    if (!isValidBook(title, author, price, pages)) {
      return res.status(400).json({
        error: "Valid title, author, non-negative integer price and positive integer pages are required"
      });
    }

    const result = await db.run(
      `INSERT INTO book (title, author, price, pages)
       VALUES (?, ?, ?, ?);`,
      [title.trim(), author.trim(), price, pages]
    );

    res.status(201).json({
      message: "Book Added Successfully",
      bookId: result.lastID
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

// ========================================
// UPDATE BOOK
// ========================================

app.put("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!isValidId(bookId)) {
      return res.status(400).json({
        error: "Invalid book ID"
      });
    }

    const { title, author, price, pages } = req.body || {};

    if (!isValidBook(title, author, price, pages)) {
      return res.status(400).json({
        error: "Valid title, author, non-negative integer price and positive integer pages are required"
      });
    }

    const result = await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?;`,
      [
        title.trim(),
        author.trim(),
        price,
        pages,
        Number(bookId)
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    res.status(200).json({
      message: "Book Details Updated Successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

// ========================================
// DELETE BOOK
// ========================================

app.delete("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!isValidId(bookId)) {
      return res.status(400).json({
        error: "Invalid book ID"
      });
    }

    const result = await db.run(
      "DELETE FROM book WHERE id = ?;",
      [Number(bookId)]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    res.status(200).json({
      message: "Book Deleted Successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

// ========================================
// INVALID JSON AND ERROR HANDLING
// ========================================

app.use((error, req, res, next) => {
  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      error: "Invalid JSON request body"
    });
  }

  console.error(error);

  res.status(500).json({
    error: "Internal Server Error"
  });
});

// ========================================
// START SERVER LOCALLY
// ========================================

if (!isVercel) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}

// Export Express application for Vercel
module.exports = app;
