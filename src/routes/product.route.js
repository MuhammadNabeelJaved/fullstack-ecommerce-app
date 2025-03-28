import { Router } from "express";
import { createProduct, getProducts, getProductById } from "../controllers/product.controller.js";
import { upload } from "../utils/multer.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
const router = Router();

router.route("/create-product").post(isAuthenticated, upload.array("images"), createProduct);
router.route("/").get(getProducts);
router.route("/:id").get(getProductById);



export default router;
