"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleResturant = exports.searchResturant = exports.updateOrderStatus = exports.getResturantOrder = exports.updateResturant = exports.getResturant = exports.createResturant = void 0;
const resturantModel_1 = require("../models/resturantModel");
const imageUpload_1 = __importDefault(require("../utils/imageUpload"));
const orderModel_1 = require("../models/orderModel");
const createResturant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resturantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;
        const resturant = yield resturantModel_1.Resturant.findOne({ user: req === null || req === void 0 ? void 0 : req.id });
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
        const imageUrl = yield (0, imageUpload_1.default)(file);
        yield resturantModel_1.Resturant.create({
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
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.createResturant = createResturant;
const getResturant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resturant = yield resturantModel_1.Resturant.findOne({ user: req.id }).populate('menus');
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.getResturant = getResturant;
const updateResturant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resturantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;
        const resturant = yield resturantModel_1.Resturant.findOne({ user: req.id });
        if (!resturant) {
            res.status(400).json({
                success: false,
                message: "Resturant not found"
            });
            return;
        }
        ;
        resturant.resturantName = resturantName;
        resturant.city = city;
        resturant.country = country;
        resturant.deliveryTime = deliveryTime;
        resturant.cuisines = JSON.parse(cuisines);
        if (file) {
            const imageUrl = yield (0, imageUpload_1.default)(file);
            resturant.imageUrl = imageUrl;
        }
        yield resturant.save();
        res.status(200).json({
            success: true,
            message: "Resturant updated",
            resturant
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.updateResturant = updateResturant;
const getResturantOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resturant = yield resturantModel_1.Resturant.findOne({ user: req.id });
        if (!resturant) {
            res.status(400).json({
                success: false,
                message: "Resturant not found"
            });
            return;
        }
        ;
        const orders = yield orderModel_1.Order.find({ resturant: resturant._id }).populate('resturant').populate('user');
        res.status(200).json({
            success: true,
            orders
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.getResturantOrder = getResturantOrder;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = yield orderModel_1.Order.findById(orderId);
        if (!order) {
            res.status(400).json({
                success: false,
                message: "Order Not found"
            });
            return;
        }
        order.status = status;
        yield order.save();
        res.status(200).json({
            success: true,
            status: order.status,
            message: "Status Updated"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Utility function to escape special characters in a regular expression
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
const searchResturant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchText = req.params.searchText || "";
        const searchQuery = req.query.searchQuery || "";
        const selectedCuisines = (req.query.searchQuery || "").split(",").filter(x => x);
        const query = {};
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
            ];
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
            ];
        }
        if (selectedCuisines.length > 0) {
            query.cuisines = { $in: selectedCuisines };
        }
        const resturants = yield resturantModel_1.Resturant.find(query);
        res.status(200).json({
            success: true,
            resturants,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.searchResturant = searchResturant;
const getSingleResturant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resturantId = req.params.id;
        const resturant = yield resturantModel_1.Resturant.findById(resturantId).populate({
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
            success: true,
            message: "Here is the resturant details"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.getSingleResturant = getSingleResturant;
