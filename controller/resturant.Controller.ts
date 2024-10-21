import { Resturant } from './../models/resturantModel';
import { Request, Response } from "express";
import { Resturant } from "../models/resturantModel";
import { Multer } from "multer";
import uploadImageOnCloudinary from "../utils/imageUpload";

export const createResturant = async (req:Request, res: Response): Promise<void> => {
    try {
        const { resturantName, city, country, price, deliveryTime, cuisines } = req.body;
        const file = req.file;
        const resturant = await Resturant.findOne({ user:req?.id });

        if (!resturant) {
            res.status(400).json({
                success: false,
                message: "Resturant already exixts for this user"
            });
            return;
        }
        if (!file) {
            res.status(400).json({
                success: false,
                message: "Image required"
            });
            return;
        }

        const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
        await Resturant.create({
            user: req.id,
            resturantName,
            city,
            country,
            deliveryTime,
            cuisines: JSON.parse(cuisines),
            imageUrl
        });

        res.status(201).json({
            success: true,
            message: "Resturant has been added"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const getResturant = async (req:Request, res: Response) => {
    try {
        const resturant = await Resturant.find({user: req.id});
        if (!resturant) {
            res.status(400).json({
                success: false,
                message: "Resturant not found"
            });
            return;
        }
        return res.status(200).json({
            success: true,
            resturant
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
};

export const updateesturant = async (req:Request, res: Response) => {
    try {
        const { resturantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;
        const resturant = await Resturant.findOne({ user: req.id });
        if (!resturant) {
            res.status(400).json({
                success: false,
                message: "Resturant not found"
            });
            return;
        };
        resturant.resturantName = resturantName;
        resturant.city = city;
        resturant.country = country;
        resturant.deliveryTime = deliveryTime;
        resturant.cuisines = JSON.parse(cuisines);
        
        if (file) {
            const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
            resturant.imageUrl = imageUrl;
        }
        await resturant.save();
        res.status(200).json({
            success: true,
            message: "Resturant updated",
            resturant
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}