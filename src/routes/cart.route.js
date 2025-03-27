import { Router } from "express";
import { addToCart, getCartItems, updateCartItemQuantity, removeCartItem, clearCart, getCartTotalPrice } from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();


router.post("/add-to-cart", isAuthenticated, addToCart);
router.get("/cart-items", isAuthenticated, getCartItems);
router.put("/update-cart-item-quantity", isAuthenticated, updateCartItemQuantity);
router.delete("/remove-cart-item/:itemId", isAuthenticated, removeCartItem);
router.delete("/clear-cart", isAuthenticated, clearCart);
router.get("/cart-total-price", isAuthenticated, getCartTotalPrice);

export default router;
