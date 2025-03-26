import { Router } from "express"
import upload from "../utils/multer.js"
import { register, verifyEmail, login, logout } from "../controllers/user.controller.js"
import { isAuthenticated } from "../middlewares/auth.middleware.js"
const router = Router()

router.route("/register").post(upload.single("avatar"), register)
router.route("/verify-email").post(verifyEmail)
router.route("/login").post(login)
router.route("/logout").post(isAuthenticated, logout)


export default router