import status from "http-status";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";


const createUser = async (payload: Partial<IUser>) => {

    const { email, phone, role, password, ...rest } = payload;

    const availableEmail = await User.findOne({ email });
    if (availableEmail) {
        throw new AppError(status.BAD_REQUEST, "Email is already used");
    }

    const availablePhoneNumber = await User.findOne({ phone });
    if (availablePhoneNumber) {
        throw new AppError(status.BAD_REQUEST, "Phone number is already used");
    }

    if (role !== (Role.USER || Role.AGENT)) {
        throw new AppError(status.BAD_REQUEST, "Only user and agent can create their account");
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT.BCRYPT_SALT_ROUND));

    if (role === Role.USER) {
        // wallet create 
        const user = await User.create({
            email, phone, role,
            password: hashedPassword,
            ...rest
        });
        return user;
    }
    else if (role === Role.AGENT) {
        // commission rate set
        const user = await User.create({
            email, phone, role,
            password: hashedPassword,
            ...rest
        });
        return user;
    }
    else {
        throw new AppError(status.BAD_REQUEST, "Why are you here?");

    }

};
const getMyProfile = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    };
};
const getAllCategoryUser = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    }
};
const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find({ role: Role.USER }), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    }
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
const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user
    }
};
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const isUserExist = await User.findById(userId);

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User Not Found")
    }

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(status.FORBIDDEN, "You are not authorized");
        }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified || payload.isApproved || payload.commissionRate || payload.wallet) {

        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(status.FORBIDDEN, "You are not authorized");
        }
    }

    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT.BCRYPT_SALT_ROUND);
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

    return newUpdatedUser;
};


export const UserServices = {
    createUser,
    getMyProfile,
    getAllCategoryUser,
    getAllUsers,
    getAllAgents,
    getSingleUser,
    updateUser
};