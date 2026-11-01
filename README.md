# Backend Development Fundamentals - Lab 2
## Project: SQLite Database and CRUD Routes

This repository contains the completed project for **Lab 2: SQLite Database and CRUD Routes**. Built using **Node.js**, **Express.js**, **SQLite**, and **nodemon**, it connects to a local SQLite database (`library.db`), initializes a `book` table with 10 sample records, and provides standard RESTful CRUD routes.

---

## 🔗 Project Links

- 📂 **GitHub Repository:** [https://github.com/Charan-Reddy96/Lab-01/tree/lab-2](https://github.com/Charan-Reddy96/Lab-01/tree/lab-2)
- 💻 **Localhost Home:** [http://localhost:3000/](http://localhost:3000/)
- 📚 **Localhost Books Endpoint:** [http://localhost:3000/books](http://localhost:3000/books)
- 🚀 **Live Deployment URL:** [https://labreport1-pi.vercel.app/](https://labreport1-pi.vercel.app/)
- 📖 **Live Books Endpoint:** [https://labreport1-pi.vercel.app/books/](https://labreport1-pi.vercel.app/books/)

---

## 👤 Author Information

- **Name:** Charan Reddy
- **Section:** CSE AIML-2B

---

## 📁 Project Structure

```text
Lab_Report 2/
├── database/
│   └── library.db         # SQLite database file containing the 'book' table
├── Screenshots/           # API and CRUD execution screenshots
├── app.js                 # Express application, DB initialization, and CRUD routes
├── package.json           # Node.js dependencies and script definitions
├── package-lock.json      # Locked versions of dependencies
├── .gitignore             # Ignores node_modules
└── README.md              # Project documentation and API guide
```

---

## 🗄️ Database Details

- **Database file:** `database/library.db`
- **Table name:** `book`

### Table Schema

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY` | Unique identifier for each book |
| `title` | `TEXT` | | Title of the book |
| `author` | `TEXT` | | Author of the book |
| `price` | `INTEGER` | | Price of the book |
| `pages` | `INTEGER` | | Total number of pages |

### 10 Sample Records Seeded

| id | title | author | price | pages |
| :--- | :--- | :--- | :--- | :--- |
| 1 | To Kill a Mockingbird | Harper Lee | 399 | 281 |
| 2 | 1984 | George Orwell | 299 | 328 |
| 3 | The Great Gatsby | F. Scott Fitzgerald | 250 | 180 |
| 4 | The Catcher in the Rye | J.D. Salinger | 350 | 234 |
| 5 | Pride and Prejudice | Jane Austen | 220 | 279 |
| 6 | The Hobbit | J.R.R. Tolkien | 450 | 310 |
| 7 | Harry Potter and the Philosopher's Stone | J.K. Rowling | 499 | 223 |
| 8 | The Alchemist | Paulo Coelho | 299 | 208 |
| 9 | Crime and Punishment | Fyodor Dostoevsky | 420 | 430 |
| 10 | The Da Vinci Code | Dan Brown | 380 | 454 |

---

## 🚀 Commands to Run the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server with Nodemon (Development Mode)
```bash
npm run dev
```

### 3. Start the Server with Node (Production Mode)
```bash
npm start
```
*The server starts listening on `http://localhost:3000/`.*

---

## 🌐 CRUD API Endpoints

| HTTP Method | Endpoint | Localhost Link | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | [http://localhost:3000/](http://localhost:3000/) | Root status message |
| **GET** | `/books` | [http://localhost:3000/books](http://localhost:3000/books) | Retrieve list of all books |
| **GET** | `/books/:bookId` | [http://localhost:3000/books/1](http://localhost:3000/books/1) | Retrieve a single book by ID |
| **POST** | `/books` | [http://localhost:3000/books](http://localhost:3000/books) | Add a new book (JSON body) |
| **PUT** | `/books/:bookId` | [http://localhost:3000/books/1](http://localhost:3000/books/1) | Update an existing book's details |
| **DELETE** | `/books/:bookId` | [http://localhost:3000/books/1](http://localhost:3000/books/1) | Delete a book by ID |

---

## 📸 Lab Execution & Verification Screenshots

| Execution Screenshot | Description |
| :--- | :--- |
| ![GET All Books](Screenshots/get.png) | GET /books endpoint execution |
| ![GET Book by ID](Screenshots/get%201.png) | Single book retrieval by ID (GET /books/:bookId) |
| ![POST Add Book](Screenshots/post.png) | Add new book with JSON request body (POST /books) |
| ![PUT Update Book](Screenshots/put.png) | Update existing book details (PUT /books/:bookId) |
| ![DELETE Book](Screenshots/delete.png) | Delete book by ID (DELETE /books/:bookId) |
