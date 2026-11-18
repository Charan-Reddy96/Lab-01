
const dbPromise = require('./database');

async function testDatabase() {
    try {
        const db = await dbPromise;

        const result = await db.get(
            "SELECT name FROM sqlite_master WHERE type = ?",
            ["table"]
        );

        console.log("Database connected successfully!");
        console.log("Table created:", result.name);

        await db.close();

    } catch (error) {
        console.error("Database error:", error.message);
    }
}

testDatabase();
