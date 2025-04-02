import dotenv from "dotenv"
import dbConnect from "./database/databaseConnection.js"
import app from "./app.js"

dotenv.config()
const PORT = process.env.PORT || 8000

// Add retry mechanism for database connection
const connectWithRetry = async (retries = 5, delay = 5000) => {
    try {
        await dbConnect();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(`Error connecting to database: ${error.message}`);
        if (retries > 0) {
            console.log(`Retrying connection in ${delay/1000} seconds... (${retries} attempts remaining)`);
            setTimeout(() => connectWithRetry(retries - 1, delay), delay);
        } else {
            console.log("Max retries reached. Exiting process.");
            process.exit(1);
        }
    }
};

// Start the connection process
connectWithRetry();
