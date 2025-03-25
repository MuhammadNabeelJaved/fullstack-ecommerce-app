import mongoose from "mongoose";

export const dbConnect = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL)
        console.log(`Connected to database: ${connection.connection.host}`)
    } catch (error) {
        console.log(`Error connecting to database: ${error.message}`)
    }
}


export default dbConnect