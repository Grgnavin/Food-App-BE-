import mongoose, { Document, mongo } from "mongoose";

type DeliveryDetails = {
    email: string,
    name: string,
    address: string,
    city: string
}

type CartItems = {
    menuId: string,
    name: string,
    image: string,
    price: number,
    quantity: number
}

export interface IOrder extends Document {
    user: mongoose.Schema.Types.ObjectId,
    resturant: mongoose.Schema.Types.ObjectId,
    deliveryDetails: DeliveryDetails,
    cartItems: CartItems[],
    totalAmount: number,
    status: "pending" | "confirmed" | "preparing" | "outfordelivery" | "delivered" 
}

const orderSchema = new mongoose.Schema<IOrder>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        res: "User",
        required: true
    },
    resturant: {
        type: mongoose.Schema.Types.ObjectId,
        res: "User",
        required: true
    },
    deliveryDetails: {
        email: { type: String, required: true },
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
    },
    cartItems: [{
        menuId: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
    }],
    totalAmount: {
        type: Number
    },
    status: {
        type: String,
        enum: ["pending" , "confirmed" , "preparing" , "outfordelivery" , "delivered"], 
        required: true
    }
}, {
    timestamps: true
});

export const Order = mongoose.model("Order", orderSchema);