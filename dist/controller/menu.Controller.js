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
exports.deleteMenu = exports.editMenu = exports.addMenu = void 0;
const imageUpload_1 = __importDefault(require("../utils/imageUpload"));
const menuModel_1 = require("../models/menuModel");
const resturantModel_1 = require("../models/resturantModel");
const addMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const imageURL = yield (0, imageUpload_1.default)(file);
        const menu = yield menuModel_1.Menu.create({
            name,
            description,
            price,
            image: imageURL
        });
        const resturant = yield resturantModel_1.Resturant.findOne({ user: req.id });
        if (resturant) {
            resturant.menus.push(menu._id);
            yield resturant.save();
        }
        res.status(200).json({
            success: true,
            message: "Menu has been added successfully",
            menu
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.addMenu = addMenu;
const editMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        const file = req.file;
        const menu = yield menuModel_1.Menu.findById(id);
        if (!menu) {
            res.status(400).json({
                success: false,
                message: "Menu not found"
            });
            return;
        }
        if (name)
            menu.name = name;
        if (price)
            menu.price = price;
        if (description)
            menu.description = description;
        if (file) {
            const imageUrl = yield (0, imageUpload_1.default)(file);
            menu.image = imageUrl;
            yield menu.save();
        }
        res.status(200).json({
            success: true,
            messsage: "Menu has been updated successfully",
            menu
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.editMenu = editMenu;
const deleteMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const menu = yield menuModel_1.Menu.findByIdAndDelete(id);
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.deleteMenu = deleteMenu;
