import dotenv from "dotenv"
import dbConnect from "./database/databaseConnection.js"
import app from "./app.js"

dotenv.config()
const PORT = process.env.PORT || 8000

dbConnect().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}).catch((error) => {
    console.log("Error connecting to database")
    console.log(error.message)
    process.exit(1)
})
