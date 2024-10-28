import express  from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import upload from "../middleware/multer";
import { addMenu, deleteMenu, editMenu } from "../controller/menu.Controller";
const router = express.Router();

router.route('/').post(isAuthenticated, upload.single("image"), addMenu);
router.route('/:id').put(isAuthenticated, upload.single("image"), editMenu);
router.route('/:id').delete(isAuthenticated, deleteMenu);


export default router;