import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDb";
import userRoute from "./routes/user.route";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors"; 

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

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

//api
app.use("/api/v1/user", userRoute);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server listen at port ${PORT}`);
})