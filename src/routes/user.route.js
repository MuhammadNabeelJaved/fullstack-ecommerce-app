import { Router } from "express"
import upload from "../utils/multer.js"
import { register, verifyEmail } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(upload.single("avatar"), register)
router.route("/verify-email").post(verifyEmail)


export default router


