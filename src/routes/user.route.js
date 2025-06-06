import { Router } from "express"
import upload from "../utils/multer.js"
import { register, verifyEmail, login, logout, getCurrentUser, updateCurrentUserPassword, updateCurrentUserAvatar, refreshAccessToken } from "../controllers/user.controller.js"
import { isAuthenticated } from "../middlewares/auth.middleware.js"
const router = Router()

router.route("/register").post(upload.single("avatar"), register)
router.route("/verify-email").post(verifyEmail)
router.route("/login").post(login)
router.route("/logout").post(isAuthenticated, logout)
router.route("/current-user").get(isAuthenticated, getCurrentUser)
router.route("/update-current-user-password").put(isAuthenticated, updateCurrentUserPassword)
router.route("/update-current-user-avatar").put(isAuthenticated, upload.single("avatar"), updateCurrentUserAvatar)
router.route("/refresh-access-token").post(refreshAccessToken)

export default router