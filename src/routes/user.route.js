import { Router } from "express"
import upload from "../utils/multer.js"
import { register, verifyEmail, login } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(upload.single("avatar"), register)
router.route("/verify-email").post(verifyEmail)
router.route("/login").post(login)


export default router