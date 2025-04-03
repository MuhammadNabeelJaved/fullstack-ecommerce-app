import { Router } from "express"
import { createOrder, successOrder, cancelOrder } from "../controllers/order.controller.js"
import { isAuthenticated } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/pay", isAuthenticated, createOrder)
router.post("/success", isAuthenticated, successOrder)
router.post("/cancel", isAuthenticated, cancelOrder)


export default router
