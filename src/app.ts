import express, { Request, Response } from "express";
import cors from "cors";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1/", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Digital Wallet System!"
    })
});

// not found route
app.use(notFound);

export default app;