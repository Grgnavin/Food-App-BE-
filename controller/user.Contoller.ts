import { NextFunction, Request, Response } from "express";
import { User } from "../models/userModel";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const signup = async (req: Request, res: Response) => {
    try {
        const { fullname, email, password, contact } = req.body;

        let user =await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exist with this email"
            })
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const verificationToken = "token" // generateVerification();

        user = await User.create({
            fullname,
            email,
            password: hashedPass,
            contact: Number(contact),
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24*60*60*1000,
        })

        // generateToken(req, user);
        const userWithoutPass = await User.findById( user._id ).select("-password");
        // await sendVerificationEmail(email, verificationToken);
        return res.status(200).json({
            success: true,
            message: "Account created Successfully",
            user: userWithoutPass
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const Login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invcorrect Password"
            });
        }

        // generateToken(res, user);
        user.lastLogin = new Date();
        await user.save();

        //send user without password
        const userWithoutPass = await User.findById(user._id).select("-password");
        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.fullname}! You've sucessfully logged in.`,
            user: userWithoutPass 
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const verifyEmail = async (req:Request, res: Response) => {
    try {
        const { verificationCode } = req.body;
        const user = await User.findOne({ 
            verificationToken: verificationCode, verificationTokenExpiresAt: { $gt: Date.now() 
            } }).select("-password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        
        //send welcome email

        return res.status(200).json({
            success: false,
            message: "Email has been verified successfully",
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export const logout = async (  _: Request, res:Response) => {
    try {
        return res.clearCookie("token").status(200).json({
            success: false,
            message: "Logout Successfully!"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const forgotPassword = async (req: Request, res:Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        const resetToken = crypto.randomBytes(30).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now()+ 1*60*60+1000); 

        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt= resetTokenExpiresAt;
        await user.save();

        //send email
        //await sendPasswordResetEmail(user.email, `process,env.frontendurl`)

        return res.status(200).json({
            succes: true,
            message: "Passowrd reset link sent to your email"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
} 
