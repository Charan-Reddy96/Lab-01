# Lab 03 – SQLite Database and CRUD Routes

## Aim
To develop a RESTful API using Node.js, Express.js, and SQLite database to perform CRUD (Create, Read, Update, and Delete) operations on book records and implement query parameters for searching, sorting, filtering, and pagination.

## Technologies Used
- **Node.js** – JavaScript runtime environment.
- **Express.js** – Web framework for building REST APIs.
- **SQLite** – Lightweight relational database.
- **sqlite3** – SQLite database driver.
- **Postman** – API testing tool.

## Project Structure

```text
lab-03/
│
├── database/
│   └── library.db
│
├── Screenshots/
│   ├── 01-server-running.png
│   ├── 02-get-all-books.png
│   ├── 03-search-books.png
│   ├── 04-sort-books.png
│   ├── 05-pagination.png
│   ├── 06-post-book.png
│   ├── 07-update-book.png
│   └── 08-delete-book.png
│
├── app.js
├── package.json
├── package-lock.json
└── README.md
```

## Installation and Setup

1. Clone the repository or download the project.
2. Navigate to the project directory.

```bash
cd lab-03
```

3. Install the required dependencies.

```bash
npm install
```

4. Start the server.

```bash
node app.js
```

5. Open the following URL in your browser:

```text
http://localhost:3000/
```

## API Endpoints

### 1. GET – Retrieve All Books

```http
GET /books
```

Retrieves all book records from the SQLite database.

### 2. GET – Retrieve a Book by ID

```http
GET /books/:bookId
```

Retrieves the details of a specific book using its ID.

### 3. POST – Add a New Book

```http
POST /books
```

Adds a new book record to the database.

**Request Body:**

```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "price": 499,
  "pages": 320
}
```

### 4. PUT – Update Book Details

```http
PUT /books/:bookId
```

Updates the details of an existing book using its ID.

### 5. DELETE – Remove a Book

```http
DELETE /books/:bookId
```

Deletes a particular book record from the database.

## Query Parameters

The GET `/books` endpoint supports the following query parameters:

| Parameter | Description |
|---|---|
| `search_q` | Searches books by title |
| `order_by` | Specifies the sorting column |
| `order` | Sorts in ASC or DESC order |
| `limit` | Specifies the maximum number of records |
| `offset` | Specifies the starting position |
| `min_price` | Filters books by minimum price |
| `max_price` | Filters books by maximum price |

**Example Requests:**

Search books:

```http
GET /books?search_q=Harry
```

Sort by price:

```http
GET /books?order_by=price&order=ASC
```

Pagination:

```http
GET /books?limit=5&offset=0
```

Filter by price:

```http
GET /books?min_price=200&max_price=400
```

Combined query parameters:

```http
GET /books?search_q=The&order_by=price&order=ASC&limit=5&offset=0&min_price=200&max_price=450
```

## Database

The project uses an SQLite database named `library.db`.

The `book` table contains the following columns:

| Column | Data Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| title | TEXT | Book title |
| author | TEXT | Book author |
| price | INTEGER | Book price |
| pages | INTEGER | Number of pages |

Ten sample book records are initialized when the database is empty.

## Testing

The API endpoints are tested using Postman and a web browser.

The following operations are verified:

- Retrieving all books.
- Retrieving an individual book.
- Adding new book records.
- Updating existing book records.
- Deleting book records.
- Searching books using query parameters.
- Sorting book records.
- Implementing pagination.
- Filtering books based on price.
- Validating invalid query parameter inputs.

## Screenshots

All the screenshots related to server execution and API testing are stored in the `Screenshots` folder.

## Conclusion

Successfully developed and tested a RESTful API using Node.js, Express.js, and SQLite. Implemented CRUD operations and query parameters for searching, sorting, filtering, and pagination. The project provided practical experience in database connectivity, API development, request handling, and testing RESTful services.