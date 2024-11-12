import { Request, Response } from "express";
import { Resturant } from "../models/resturantModel";
import { Order } from "../models/orderModel";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CheckoutSessionRequest = {
    cartItems: {
        menuId: string,
        name: string,
        image: string,
        price: number,
        quantity: number
    }[],
    deliveryDetails: {
        name: string,
        email: string,
        address: string,
        city: string,
    },
    resturantId: string
}

type MenuItems= {
    menuId: string,
    name: string,
    image: string,
    price: number,
    quantity: number
}

export const createLineItems = (checkOutSessionRequest: CheckoutSessionRequest, menuItems: any) => {
    if (!Array.isArray(checkOutSessionRequest.cartItems)) {
        throw new Error("Cartitems is not an array")
    }
    //create lineitems
    const lineitems = checkOutSessionRequest.cartItems.map((x) => {
        const menuItem = menuItems.find((y:any) => y._id.toString() === x.menuId);
        if (!menuItem) throw new Error('Menu item with id not found');
        return {
            price_data : {
                currency: 'npr',
                product_data: {
                    name: menuItem.name,
                    images: [menuItem.image],
                },
                unit_amount: menuItem.price * 100
            },
            quantity: x.quantity
        }
    })
    return lineitems;
};

export const createCheckoutSession = async (req:Request, res: Response): Promise<any> => {
    try {
        const checkOutSessionRequest: CheckoutSessionRequest = req.body;
        const resturant= await Resturant.findById(checkOutSessionRequest.resturantId).populate('menus');
        if (!resturant) {
            res.status(400).json({
                message: "Resturant not found"
            });
            return;
        }
        const order: any = new Order({
            resturant: resturant._id,
            user: req.id,
            deliveryDetails: checkOutSessionRequest.deliveryDetails,
            cartItems: checkOutSessionRequest.cartItems,
            status: "pending"
        });

        //line items
        const menuitems = resturant.menus;
        const lineitems = createLineItems(checkOutSessionRequest, menuitems);
        const orderID = order._id.toString();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['GB','US', 'CA']
            },
            line_items: lineitems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/order/status`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            metadata: {
                orderId: orderID,
                image: JSON.stringify(menuitems.map((x:any) => x.image)) 
            }
        })

        if (!session.url) {
            res.status(400).json({
                success: false,
                messsage: "Error while creating session"
            });
            return;
        }
        await order.save();
        res.status(200).json({
            session,
            
            success: true
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const getOrders = async (req:Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({user: req.id}).populate('user').populate('resturant');
        res.status(200).json({
            success: true,
            orders
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}