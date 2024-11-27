"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resturant = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const resturantSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Menu"
        }]
}, {
    timestamps: true
});
exports.Resturant = mongoose_1.default.model("Resturant", resturantSchema);
