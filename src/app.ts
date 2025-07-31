import express, { Request, Response } from "express";
import cors from "cors";
import notFound from "./app/middlewares/notFound";

const app = express();

app.use(express.json());
app.use(cors());


app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Digital Wallet System!"
    })
});

// not found route
app.use(notFound);

export default app;