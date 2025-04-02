import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { createReview, deleteReview, getAllReviews } from "../controllers/review.controller.js";
import upload from "../utils/multer.js";

const router = Router()

router.route("/create-review").post(isAuthenticated, upload.single("image"), createReview);
router.route("/:id").delete(isAuthenticated, upload.single("image"), deleteReview);
router.route("/").get(getAllReviews);


export default router