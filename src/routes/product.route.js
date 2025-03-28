import { Router } from "express";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { upload } from "../utils/multer.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
const router = Router();

router.route("/create-product").post(isAuthenticated, upload.array("images"), createProduct);
router.route("/").get(getProducts);
router.route("/:id").get(getProductById);
router.route("/:id").put(isAuthenticated, updateProduct);
router.route("/:id").delete(isAuthenticated, deleteProduct);



export default router;
