import express from 'express';
import { checkAuth, forgotPassword, Login, logout, resetPassword, signup, updateProfile, verifyEmail } from '../controller/user.Contoller';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

router.route("/check-auth").get(isAuthenticated, checkAuth);
router.route("/signup").post(signup);
router.route("/login").post(Login);
router.route("/logout").post(logout);
router.route("/verify-email").post(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/peofile/update").put(isAuthenticated ,updateProfile);

export default router;

