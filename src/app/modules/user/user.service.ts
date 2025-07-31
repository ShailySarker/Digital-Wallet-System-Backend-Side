import { envVars } from "../../config/env";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";


const createUser = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isUserExist = await User.findOne({ email });

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT.BCRYPT_SALT_ROUND));

    const user = await User.create({
        email,
        password: hashedPassword,
        ...rest
    });

    return user;
};
const getMyProfile = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isUserExist = await User.findOne({ email });

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT.BCRYPT_SALT_ROUND));

    const user = await User.create({
        email,
        password: hashedPassword,
        ...rest
    });

    return user;
};
const getAllUsers = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isUserExist = await User.findOne({ email });

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT.BCRYPT_SALT_ROUND));

    const user = await User.create({
        email,
        password: hashedPassword,
        ...rest
    });

    return user;
};
const getAllAgents = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isUserExist = await User.findOne({ email });

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT.BCRYPT_SALT_ROUND));

    const user = await User.create({
        email,
        password: hashedPassword,
        ...rest
    });

    return user;
};
const getSingleUser = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isUserExist = await User.findOne({ email });

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT.BCRYPT_SALT_ROUND));

    const user = await User.create({
        email,
        password: hashedPassword,
        ...rest
    });

    return user;
};
const updateUser = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isUserExist = await User.findOne({ email });

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT.BCRYPT_SALT_ROUND));

    const user = await User.create({
        email,
        password: hashedPassword,
        ...rest
    });

    return user;
};


export const UserServices = {
    createUser,
    getMyProfile,
    getAllUsers,
    getAllAgents,
    getSingleUser,
    updateUser
};