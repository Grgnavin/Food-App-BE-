import { NextFunction, Request, Response } from "express";
import { User } from "../models/userModel";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import cloudinary from "../utils/cloudinary";
import { generateVerificationCode } from "../utils/generateVerificationcode";
import { generateToken } from "../utils/generateToken";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email";

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullname, email, password, contact } = req.body;

        let user =await User.findOne({ email });

        if (user) {
            res.status(400).json({
                success: false,
                message: "User already exist with this email"
            });
            return;
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const verificationToken = generateVerificationCode();

        user = await User.create({
            fullname,
            email,
            password: hashedPass,
            contact: Number(contact),
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24*60*60*1000,
        })

        generateToken(res, user);
        const userWithoutPass = await User.findById( user._id ).select("-password");

        await sendVerificationEmail(email, verificationToken);

        res.status(200).json({
            success: true,
            message: "Account created Successfully",
            user: userWithoutPass
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}


export const Login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400).json({
                success: false,
                message: "Incorrect Password"
            });
            return;
        }

        generateToken(res, user);
        user.lastLogin = new Date();
        await user.save();

        //send user without password
        const userWithoutPass = await User.findById(user._id).select("-password");
        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.fullname}! You've sucessfully logged in.`,
            user: userWithoutPass 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export const verifyEmail = async (req:Request, res: Response):  Promise<void> => {
    try {
        const { verificationCode } = req.body;
        
        const user = await User.findOne({ 
            verificationToken: verificationCode, verificationTokenExpiresAt: { $gt: Date.now() 
            } }).select("-password");
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
        await user.save();
        
        //send welcome email
        await sendWelcomeEmail(user.email, user.fullname);

        res.status(200).json({
            success: true,
            message: "Email has been verified successfully",
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export const logout = async (  _: Request, res:Response): Promise<void> => {
    try {
        res.clearCookie("token").status(200).json({
            success: false,
            message: "Logout Successfully!"
        });
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const forgotPassword = async (req: Request, res:Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "User doesn't exists"
            });
            return;
        }

        const resetToken = crypto.randomBytes(30).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now()+ 1*60*60+1000); 

        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt= resetTokenExpiresAt;
        await user.save();

        //send email
        await sendPasswordResetEmail(user.email, `${process.env.FRONTEND_URL}/${resetToken}`)

        res.status(200).json({
            succes: true,
            message: "Passowrd reset link sent to your email"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const resetPassword = async (req:Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({ resetPasswordToken: token, resetPasswordTokenExpiresAt: { $gt: Date.now() } });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
            return;
        }

        //update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt= undefined;
        await user.save();

        //send reset mail to user 
        await sendResetSuccessEmail(user.email);

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export const checkAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.id;

        const user = await User.findById(userId).select("-password");
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
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export const updateProfile = async (req:Request, res: Response): Promise<void> => {
    try {
        const userId = req.id;
        const { fullname, email, address, city, country, profilePicture } = req.body;
        
        //upload image on cloudinary
        let cloudResponse:any;
        
        cloudResponse = await cloudinary.uploader.upload(profilePicture);
        const updatedData = { fullname, email, address, city, country, profilePicture };

        const user = await User.findByIdAndUpdate(userId, updatedData, { 
            new: true
        }).select("-password");

        res.status(200).json({
            success: true,
            user,
            message: "Profile updated successfully"
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

