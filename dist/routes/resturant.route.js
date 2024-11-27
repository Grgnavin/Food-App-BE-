"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resturant_Controller_1 = require("../controller/resturant.Controller");
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const multer_1 = __importDefault(require("../middleware/multer"));
const router = express_1.default.Router();
router.route('/').post(isAuthenticated_1.isAuthenticated, multer_1.default.single("imageFile"), resturant_Controller_1.createResturant);
router.route('/').get(isAuthenticated_1.isAuthenticated, resturant_Controller_1.getResturant);
router.route('/').put(isAuthenticated_1.isAuthenticated, multer_1.default.single("imageFile"), resturant_Controller_1.updateResturant);
router.route('/order').get(isAuthenticated_1.isAuthenticated, resturant_Controller_1.getResturantOrder);
router.route('/order/:orderId/status').put(isAuthenticated_1.isAuthenticated, resturant_Controller_1.updateOrderStatus);
router.route('/search/:searchText').get(isAuthenticated_1.isAuthenticated, resturant_Controller_1.searchResturant);
router.route('/:id').get(isAuthenticated_1.isAuthenticated, resturant_Controller_1.getSingleResturant);
exports.default = router;
