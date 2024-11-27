"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_Contoller_1 = require("../controller/user.Contoller");
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const router = express_1.default.Router();
router.route("/check-auth").get(isAuthenticated_1.isAuthenticated, user_Contoller_1.checkAuth);
router.route("/signup").post(user_Contoller_1.signup);
router.route("/login").post(user_Contoller_1.Login);
router.route("/logout").post(user_Contoller_1.logout);
router.route("/verify-email").post(user_Contoller_1.verifyEmail);
router.route("/forgot-password").post(user_Contoller_1.forgotPassword);
router.route("/reset-password/:token").post(user_Contoller_1.resetPassword);
router.route("/profile/update").put(isAuthenticated_1.isAuthenticated, user_Contoller_1.updateProfile);
exports.default = router;
