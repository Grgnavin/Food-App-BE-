"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const multer_1 = __importDefault(require("../middleware/multer"));
const menu_Controller_1 = require("../controller/menu.Controller");
const router = express_1.default.Router();
router.route('/').post(isAuthenticated_1.isAuthenticated, multer_1.default.single("image"), menu_Controller_1.addMenu);
router.route('/:id').put(isAuthenticated_1.isAuthenticated, multer_1.default.single("image"), menu_Controller_1.editMenu);
router.route('/:id').delete(isAuthenticated_1.isAuthenticated, menu_Controller_1.deleteMenu);
exports.default = router;
