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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetSuccessEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendVerificationEmail = void 0;
const emailHTML_1 = require("./emailHTML");
const mailTrap_1 = require("./mailTrap");
const sendVerificationEmail = (email, verificationToken) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    try {
        const res = yield mailTrap_1.client.send({
            from: mailTrap_1.sender,
            to: recipient,
            subject: "Verify your email",
            html: emailHTML_1.htmlContent.replace("{verificationToken}", verificationToken),
            category: "Email Verification",
        });
    }
    catch (error) {
        console.log(error);
        throw new Error("Failed to send email verification");
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendWelcomeEmail = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    const htmlContent = (0, emailHTML_1.generateWelcomeEmailHtml)(name);
    try {
        const res = yield mailTrap_1.client.send({
            from: mailTrap_1.sender,
            to: recipient,
            subject: "Welcome to MelodyEats",
            html: htmlContent,
            category: "Welcome Email",
            template_variables: {
                company_info_name: "MelodyEats",
                name: name
            }
        });
    }
    catch (error) {
        console.log(error);
        throw new Error("Failed to send welcome email");
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = (email, resetUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    const htmlContent = (0, emailHTML_1.generatePasswordResetEmailHtml)(resetUrl);
    try {
        const res = yield mailTrap_1.client.send({
            from: mailTrap_1.sender,
            to: recipient,
            subject: "Reset your password",
            html: htmlContent,
            category: "Reset Password",
        });
    }
    catch (error) {
        console.log(error);
        throw new Error("Failed to send passwordreset email");
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendResetSuccessEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    const htmlContent = (0, emailHTML_1.generateResetSuccessEmailHtml)();
    try {
        const res = yield mailTrap_1.client.send({
            from: mailTrap_1.sender,
            to: recipient,
            subject: "Password Reset successfully",
            html: htmlContent,
            category: "Password Reset",
        });
    }
    catch (error) {
        console.log(error);
        throw new Error("Failed to send password reset success email");
    }
});
exports.sendResetSuccessEmail = sendResetSuccessEmail;