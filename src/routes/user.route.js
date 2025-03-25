import { Router } from "express"
import upload from "../utils/multer.js"
import { register } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(upload.single("avatar"), register)


export default router


