import { Request, Response } from "express";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { Menu } from "../models/menuModel";
import { Resturant } from "../models/resturantModel";
import mongoose from "mongoose";

export const addMenu = async (req:Request, res: Response): Promise<void> => {
    try {
        const { name, description, price } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                message: "Image is required"
            });
            return;
        }
        const imageURL = await uploadImageOnCloudinary(file as Express.Multer.File);
        const menu = await Menu.create({
            name,
            description,
            price,
            image: imageURL
        });
        const resturant = await Resturant.findOne({ user: req.id });
        if (resturant) {
            (resturant.menus as mongoose.Schema.Types.ObjectId[]).push(menu._id as mongoose.Schema.Types.ObjectId);  
            await resturant.save();
        }
        res.status(200).json({
            success: true,
            message: "Menu has been added successfully",
            menu
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
};

export const editMenu = async (req:Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        const file = req.file;
        const menu = await Menu.findById(id);
        if (!menu) {
            res.status(400).json({
                success: false,
                message: "Menu not found"
            });
            return;
        }
        if(name) menu.name = name;
        if(price) menu.price = price;
        if(description) menu.description = description;

        if(file) {
            const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
            menu.image = imageUrl;
            await menu.save();
        }
        res.status(200).json({
            success: true,
            messsage: "Menu has been updated",
            menu
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}; 

export const deleteMenu = async (req:Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const menu = await Menu.findByIdAndDelete(id);
        if (!menu) {
            res.status(400).json({
                success: false,
                message: "Menu not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Menu has been deleted"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}