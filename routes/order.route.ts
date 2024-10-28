import express  from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { createCheckoutSession, getOrders } from "../controller/order.Controller";
const router = express.Router();

router.route('/').get(isAuthenticated, getOrders);
router.route('/checkout/create-checkout-session').post(isAuthenticated, createCheckoutSession);
// router.route('/webhook').post(isAuthenticated);

export default router;