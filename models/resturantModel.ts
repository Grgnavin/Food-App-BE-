import mongoose, { Document } from "mongoose";

export interface IResturant{
    user: mongoose.Schema.Types.ObjectId,
    resturantName: string,
    city: string,
    country: string,
    deliveryTime: number,
    cuisines: string[],
    imageUrl: string,
    menus: mongoose.Schema.Types.ObjectId[],
}

export interface IResturantDocument extends IResturant, Document {
    createdAt: Date,
    updatedAt: Date,
}

const resturantSchema = new mongoose.Schema<IResturantDocument>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    resturantName: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    deliveryTime: {
        type: Number,
        required: true
    },
    cuisines: [{
        type: String,
        required: true
    }],
    imageUrl: {
        type: String,
        required: true
    },
    menus: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu"
    }]
}, {
    timestamps: true
});

export const Resturant = mongoose.model("Resturant", resturantSchema);