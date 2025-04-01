import { Router } from "express";
import { addToCart, getCartItems, updateCartItemQuantity, removeCartItem, clearCart, getCartTotalPrice } from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import upload from "../utils/multer.js";

const router = Router();

router.route("/add-to-cart").post(isAuthenticated, upload.single("image"), addToCart);
router.route("/cart-items").get(isAuthenticated, getCartItems);
router.route("/update-cart-item-quantity").put(isAuthenticated, updateCartItemQuantity);
router.route("/remove-cart-item/:itemId").delete(isAuthenticated, removeCartItem);
router.route("/clear-cart").delete(isAuthenticated, clearCart);
router.route("/cart-total-price").get(isAuthenticated, getCartTotalPrice);

export default router;
