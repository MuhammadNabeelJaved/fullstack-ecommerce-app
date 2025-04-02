import mongoose from "mongoose";
import databaseName from "./databaseName.js";

export const dbConnect = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URL}/${databaseName}`, {
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
            socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
            connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
            maxPoolSize: 10, // Limit connection pool size
            minPoolSize: 2, // Minimum connection pool size
        });
        console.log(`Connected to database: ${connection.connection.host}`);
    } catch (error) {
        console.log(`Error connecting to database: ${error.message}`);
        // Don't exit the process here, let the application handle the error
    }
}

export default dbConnect