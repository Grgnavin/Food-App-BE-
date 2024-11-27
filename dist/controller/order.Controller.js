"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.createCheckoutSession = exports.stripeWebhook = exports.createLineItems = void 0;
const resturantModel_1 = require("../models/resturantModel");
const orderModel_1 = require("../models/orderModel");
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const createLineItems = (checkOutSessionRequest, menuItems) => {
    if (!Array.isArray(checkOutSessionRequest.cartItems)) {
        throw new Error("Cartitems is not an array");
    }
    //create lineitems
    const lineitems = checkOutSessionRequest.cartItems.map((x) => {
        const menuItem = menuItems.find((y) => y._id.toString() === x.menuId);
        if (!menuItem)
            throw new Error('Menu item with id not found');
        return {
            price_data: {
                currency: 'npr',
                product_data: {
                    name: menuItem.name,
                    images: [menuItem.image],
                },
                unit_amount: menuItem.price * 100
            },
            quantity: x.quantity
        };
    });
    return lineitems;
};
exports.createLineItems = createLineItems;
const stripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let event;
    try {
        const signature = req.headers["stripe-signature"];
        // Construct the payload string for verification
        const payloadString = JSON.stringify(req.body, null, 2);
        const secret = process.env.WEBHOOK_ENDPOINT_SECRET;
        // Generate test header string for event construction
        const header = stripe.webhooks.generateTestHeaderString({
            payload: payloadString,
            secret,
        });
        // Construct the event using the payload string and header
        event = stripe.webhooks.constructEvent(payloadString, header, secret);
    }
    catch (error) {
        console.error('Webhook error:', error.message);
        return res.status(400).send(`Webhook error: ${error.message}`);
    }
    // Handle the checkout session completed event
    if (event.type === "checkout.session.completed") {
        try {
            const session = event.data.object;
            const order = yield orderModel_1.Order.findById((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.orderId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            // Update the order with the amount and status
            if (session.amount_total) {
                order.totalAmount = session.amount_total;
            }
            order.status = "confirmed";
            yield order.save();
        }
        catch (error) {
            console.error('Error handling event:', error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    // Send a 200 response to acknowledge receipt of the event
    res.status(200).send();
});
exports.stripeWebhook = stripeWebhook;
const createCheckoutSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkOutSessionRequest = req.body;
        const resturant = yield resturantModel_1.Resturant.findById(checkOutSessionRequest.resturantId).populate('menus');
        if (!resturant) {
            res.status(400).json({
                message: "Resturant not found"
            });
            return;
        }
        const order = new orderModel_1.Order({
            resturant: resturant._id,
            user: req.id,
            deliveryDetails: checkOutSessionRequest.deliveryDetails,
            cartItems: checkOutSessionRequest.cartItems,
            status: "pending"
        });
        //line items
        const menuitems = resturant.menus;
        const lineitems = (0, exports.createLineItems)(checkOutSessionRequest, menuitems);
        const orderID = order._id.toString();
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['GB', 'US', 'CA']
            },
            line_items: lineitems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/order/status`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            metadata: {
                orderId: orderID,
                image: JSON.stringify(menuitems.map((x) => x.image))
            }
        });
        if (!session.url) {
            res.status(400).json({
                success: false,
                messsage: "Error while creating session"
            });
            return;
        }
        yield order.save();
        res.status(200).json({
            session,
            success: true
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
});
exports.createCheckoutSession = createCheckoutSession;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield orderModel_1.Order.find({ user: req.id }).populate('user').populate('resturant');
        res.status(200).json({
            success: true,
            orders
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
});
exports.getOrders = getOrders;
