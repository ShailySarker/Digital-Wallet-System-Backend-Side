/* eslint-disable no-console */
import { envVars } from "../config/env";
import { IsApproved, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";


export const seedAdmin = async () => {

    try {

        const isAdminExist = await User.findOne({ email: envVars.ADMIN.ADMIN_EMAIL });

        if (isAdminExist) {
            console.log("Admin Already Exists!");
            return;
        }

       const hashedPassword = await bcryptjs.hash(envVars.ADMIN.ADMIN_PASSWORD, Number(envVars.BCRYPT.BCRYPT_SALT_ROUND));

        const payload: IUser = {
            name: "Admin",
            role: Role.ADMIN,
            phone: envVars.ADMIN.ADMIN_PHONE,
            nidNumber: envVars.ADMIN.ADMIN_NID_NUMBER,
            email: envVars.ADMIN.ADMIN_EMAIL,
            password: hashedPassword,
            isApproved: IsApproved.APPROVE,
            isVerified: true
        };

        const Admin = await User.create(payload);
        console.log("Admin created successfully", Admin);

    } catch (error) {
        console.log(error);
    }
};