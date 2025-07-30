/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import { envVars } from "./app/config/env";
import app from "./app";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
let server: Server;


const startServer = async () => {

    try {
        await mongoose.connect(envVars.MONGODB_URL as string);
        console.log("Connected with Digital Wallet Database!");

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is listening on port ${envVars.PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};


(async () => {
    await startServer();
})();