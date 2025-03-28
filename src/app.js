import dotenv, { parse } from "dotenv";
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.route.js"
import cartRoutes from "./routes/cart.route.js"
import productRoutes from "./routes/product.route.js"
import reviewRoutes from "./routes/review.route.js"
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
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/reviews", reviewRoutes)

export default app