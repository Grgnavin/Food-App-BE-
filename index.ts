import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDb";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors"; 
import userRoute from "./routes/user.route";
import resturantRoute from "./routes/resturant.route";
import menuRoute from "./routes/menu.route";
import orderRoute from "./routes/order.route";
import path from "path";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

const DIRNAME= path.resolve();

//default middlewares for project
app.use(bodyParser.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true, limit:"10mb" }));
app.use(express.json());
app.use(cookieParser());

const CorsOptions = {
    origin: "http://localhost:5173",
    credentials: true
};
app.use(cors(CorsOptions));

//apis
app.use("/api/v1/user", userRoute);
app.use("/api/v1/resturant", resturantRoute);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/order", orderRoute);

app.use(express.static(path.join(DIRNAME, "/client/dist")));
app.use("*", (_,res) => {
    res.sendFile(path.resolve(DIRNAME, "client", "dist", "index.html"));
});

app.listen(PORT, () => {
    connectDB();
    console.log(`Server listening at port ${PORT}`);
})