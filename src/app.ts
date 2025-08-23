import express, { Request, Response } from "express";
import cors from "cors";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { envVars } from "./app/config/env";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: envVars.FRONTEND.FRONTEND_URL,
    credentials: true
}));


// routes
app.use("/api/v1/", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Digital Wallet System!"
    })
});

// global error handler
app.use(globalErrorHandler);

// not found route
app.use(notFound);

export default app;