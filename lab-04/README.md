# Lab 4: Registration, Login and JWT

**Name:** Charan Reddy   
**Section:** [AIML-2B]

## Live Link

https://lab-01-2.onrender.com

## Objective

To implement user registration and login using Express.js, SQLite, bcrypt password hashing and JSON Web Tokens (JWT).

## Technologies Used

- Node.js
- Express.js
- SQLite
- bcrypt
- jsonwebtoken
- Postman

## Installation and Running

1. Open the `lab-04` folder in the terminal.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open `http://localhost:3000/` in your browser.

**Environment variables:** No manually configured environment variables are required for the current local lab version. The JWT secret is kept in a constant as specified in the lab instructions. The hosting platform supplies the `PORT` variable when deployed.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Checks whether the server is running |
| POST | `/register` | Registers a new user and stores a hashed password |
| POST | `/login` | Verifies credentials and returns a JWT token |

## Screenshots

### 1. Successful Registration

![alt text](<Screenshot 2026-11-18 193012-1.png>)
### 2. Duplicate Username Rejected

![alt text](<Screenshot 2026-11-18 193057-3.png>)
### 3. Successful Login and JWT Token

![alt text](<Screenshot 2026-11-18 193012.png>)

### 4. Wrong Password Rejected

![alt text](<Screenshot 2026-11-18 193038.png>)

### 5. Unknown Username Rejected

![alt text](<Screenshot 2026-11-18 193057-2.png>)



### 6. JWT Decoded

![alt text](<Screenshot 2026-11-18 193525-1.png>)

## Implementation Notes

- Passwords are hashed using `bcrypt.hash()` before being stored.
- Password verification is performed using `bcrypt.compare()`.
- Duplicate usernames are rejected.
- JWT tokens are generated using `jwt.sign()`.
- The JWT payload contains the username and does not contain the password.
- SQL queries use parameterized placeholders to help prevent SQL injection.

## Problems Faced and Solutions

- Used Postman POST requests to test registration and login APIs.
- Used bcrypt to store password hashes instead of plain-text passwords.
- Used JWT to generate a token after successful login.
- Verified the token by decoding it with jwt.io.

## Conclusion

Successfully implemented and tested user registration, login, password hashing and JWT token generation using Node.js, Express.js and SQLite.