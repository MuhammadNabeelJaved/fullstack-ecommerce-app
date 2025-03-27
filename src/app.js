import dotenv, { parse } from "dotenv";
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.route.js"
import cartRoutes from "./routes/cart.route.js"
dotenv.config();
const app = express()



app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.json({
    limit: "15kb"
}))

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/cart", cartRoutes)

export default app