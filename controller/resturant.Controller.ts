import { Request, Response } from "express";
import { Resturant } from "../models/resturantModel";
import { Multer } from "multer";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { Order } from "../models/orderModel";

export const createResturant = async (req:Request, res: Response): Promise<void> => {
    try {
        const { resturantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;
        const resturant = await Resturant.findOne({ user:req?.id });
        
        if (resturant) {
            res.status(400).json({
                success: false,
                message: "Resturant already exixts for this user"
            });
            return;
        }
        if (!file) {
            res.status(400).json({
                success: false,
                message: "Image is required"
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



export const getResturant = async (req:Request, res: Response): Promise<void> => {
    try {
        const resturant = await Resturant.findOne({user: req.id}).populate('menus');
        if (!resturant) {
            res.status(400).json({
                success: false,
                resturant: [],
                message: "Resturant not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            resturant
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
};

export const updateResturant = async (req:Request, res: Response) => {
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
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const getResturantOrder = async (req:Request, res: Response): Promise<void> => {
    try {
        const resturant = await Resturant.findOne({ user: req.id });
        if (!resturant) {
            res.status(400).json({
                success: false,
                message: "Resturant not found"
            });
            return;
        };
        const orders = await Order.find({ resturant: resturant._id }).populate('resturant').populate('user');
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const updateOrderStatus = async (req:Request, res: Response):Promise<void> => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            res.status(400).json({
                success: false,
                message: "Order Not found"
            });
            return;
        }
        order.status = status;
        await order.save();
        res.status(200).json({
            success: true,
            message: "Status Updated"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}


export const searchResturant = async (req:Request, res: Response): Promise<void> => {
    try {
        const searchText = req.params.searchText || "";
        const searchQuery = req.query.searchQuery as string || "";
        const selectedCuisines = (req.query.searchQuery as string || "").split(",").filter(x=>x);
        const query: any = {}; 
        //basic search based on searchText
        if (searchText) {
            query.$or = [
                {
                    resturantName: { $regex: searchText, $options: "i" },
                },
                {
                    city: { $regex: searchText, $options: "i" },
                },
                {
                    country: { $regex: searchText, $options: "i" }
                }
            ]
        }
        //filter on the basis of searchQuery
        if (searchQuery) {
            query.$or = [
                {
                    resturantName: { $regex: searchQuery, $options: "i" },
                },
                {
                    cuisines: { $regex: searchQuery, $options: "i" }
                }
            ]
        }
        // console.log(query);
        if (selectedCuisines.length>0) {
            query.cuisines = { $in: selectedCuisines }
        }
        const resturants = await Resturant.find(query);
        res.status(200).json({
            success: false,
            resturants
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export const getSingleResturant = async (req:Request, res: Response): Promise<void> => {
    try {
        const resturantId  = req.params.id;
        const resturant = await Resturant.findById(resturantId).populate({
            path: 'menus',
            options: { createdAt: -1 }
        });
        if (!resturant) {
            res.status(404).json({
                success: false,
                message: "Resturant not found"
            });
            return;
        }

        res.status(200).json({
            resturant,
            message: "Here is the resturant details"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}