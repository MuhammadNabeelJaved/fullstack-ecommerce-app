import { Router } from "express";
import { createProduct, getAllProducts, updateProduct, deleteProduct, getProductById } from "../controllers/product.controller.js";
import upload from "../utils/multer.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/create-product").post(upload.single("image"), createProduct);
router.route("/").get(getAllProducts);
router.route("/:id").put(isAuthenticated, upload.single("image"), updateProduct);
router.route("/:id").delete(deleteProduct);
router.route("/:id").get(getProductById);


export default router;
