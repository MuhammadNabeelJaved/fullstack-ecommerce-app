import { Router } from "express";
import { createProduct, getAllProducts, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import upload from "../utils/multer.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/create-product").post(isAuthenticated, upload.single("image"), createProduct);
router.route("/").get(getAllProducts);
router.route("/:id").put(isAuthenticated, updateProduct);
router.route("/:id").delete(isAuthenticated, deleteProduct);



export default router;
