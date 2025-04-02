import { Router } from "express"
import { createOrder } from "../controllers/order.controller.js"
import { isAuthenticated } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/create", isAuthenticated, createOrder)


export default router
