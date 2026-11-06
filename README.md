
# BDF Lab 01 - Node.js and Express.js

## 1. Aim
To create a basic HTTP server using Node.js and develop a web server using Express.js with multiple GET endpoints and 404 error handling.

## 2. Technologies Used
- Node.js
- Express.js
- JavaScript
- Visual Studio Code

## 3. Project Structure

```text
lab-01/
├── screenshots/
├── http-server.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 4. Installation

Clone the repository and enter the project folder.

```bash
npm install
```

## 5. Run the Application

```bash
npm start
```

Open http://localhost:3000 in your browser.

## 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Welcome message |
| GET | /about | Student information in JSON |
| GET | /time | Current date and time |
| GET | Unknown route | Returns 404 Not Found |

## 7. Screenshots


### Express Homepage
![Homepage](screenshots/-homepage.png)

### About Endpoint
![About](screenshots/-about.png)

### Time Endpoint
![Time](screenshots/-time.png)

### 404 Error Handling
![404](screenshots/-notfound.png)

## 8. Student Details
- Name: Charan
- Section: AIML-2B
- Lab: Lab 01

## 9. Links
- GitHub Repository: https://github.com/Charan-Reddy96/Lab-01
- Live Deployment: To be added

## 10. Result
Successfully created and tested a Node.js HTTP server and an Express.js application with three GET endpoints and 404 error handling.
