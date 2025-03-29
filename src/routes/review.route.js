import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { createReview, deleteReview, getAllReviews } from "../controllers/review.controller.js";

const router = Router()

router.route("/create-review").post(isAuthenticated, createReview);
router.route("/:id").delete(isAuthenticated, deleteReview);
router.route("/:id").get(getAllReviews);


export default router