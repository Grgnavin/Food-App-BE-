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
exports.updateProfile = exports.checkAuth = exports.resetPassword = exports.forgotPassword = exports.logout = exports.verifyEmail = exports.Login = exports.signup = void 0;
const userModel_1 = require("../models/userModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const generateVerificationcode_1 = require("../utils/generateVerificationcode");
const generateToken_1 = require("../utils/generateToken");
const email_1 = require("../mailtrap/email");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, email, password, contact } = req.body;
        let user = yield userModel_1.User.findOne({ email });
        if (user) {
            res.status(400).json({
                success: false,
                message: "User already exist with this email"
            });
            return;
        }
        const hashedPass = yield bcryptjs_1.default.hash(password, 10);
        const verificationToken = (0, generateVerificationcode_1.generateVerificationCode)();
        user = yield userModel_1.User.create({
            fullname,
            email,
            password: hashedPass,
            contact: Number(contact),
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });
        (0, generateToken_1.generateToken)(res, user);
        const userWithoutPass = yield userModel_1.User.findById(user._id).select("-password");
        yield (0, email_1.sendVerificationEmail)(email, verificationToken);
        res.status(200).json({
            success: true,
            message: "Account created Successfully",
            user: userWithoutPass
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
exports.signup = signup;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield userModel_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
            return;
        }
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400).json({
                success: false,
                message: "Incorrect Password"
            });
            return;
        }
        (0, generateToken_1.generateToken)(res, user);
        user.lastLogin = new Date();
        yield user.save();
        //send user without password
        const userWithoutPass = yield userModel_1.User.findById(user._id).select("-password");
        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.fullname}! You've sucessfully logged in.`,
            user: userWithoutPass
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
exports.Login = Login;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { verificationCode } = req.body;
        const user = yield userModel_1.User.findOne({
            verificationToken: verificationCode, verificationTokenExpiresAt: { $gt: Date.now()
            }
        }).select("-password");
        if (!user) {
            res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            });
            return;
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        yield user.save();
        //send welcome email
        yield (0, email_1.sendWelcomeEmail)(user.email, user.fullname);
        res.status(200).json({
            success: true,
            message: "Email has been verified successfully",
            user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
exports.verifyEmail = verifyEmail;
const logout = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token").status(200).json({
            success: false,
            message: "Logout Successfully!"
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
exports.logout = logout;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield userModel_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "User doesn't exists"
            });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(30).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 + 1000);
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt = resetTokenExpiresAt;
        yield user.save();
        //send email
        yield (0, email_1.sendPasswordResetEmail)(user.email, `${process.env.FRONTEND_URL}/${resetToken}`);
        res.status(200).json({
            succes: true,
            message: "Passowrd reset link sent to your email"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const user = yield userModel_1.User.findOne({ resetPasswordToken: token, resetPasswordTokenExpiresAt: { $gt: Date.now() } });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
            return;
        }
        //update password
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;
        yield user.save();
        //send reset mail to user 
        yield (0, email_1.sendResetSuccessEmail)(user.email);
        res.status(200).json({
            success: true,
            message: "Password has been reset successfully"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
exports.resetPassword = resetPassword;
const checkAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const user = yield userModel_1.User.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
exports.checkAuth = checkAuth;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const { fullname, email, address, city, country, profilePicture } = req.body;
        //upload image on cloudinary
        let cloudResponse;
        cloudResponse = yield cloudinary_1.default.uploader.upload(profilePicture);
        const updatedData = { fullname, email, address, city, country, profilePicture };
        const user = yield userModel_1.User.findByIdAndUpdate(userId, updatedData, {
            new: true
        }).select("-password");
        res.status(200).json({
            success: true,
            user,
            message: "Profile updated successfully"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.updateProfile = updateProfile;
