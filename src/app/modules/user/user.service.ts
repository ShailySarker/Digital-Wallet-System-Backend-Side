import status from "http-status";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "../wallet/wallet.model";

const createUser = async (payload: Partial<IUser>): Promise<{ user: IUser }> => {
    const session = await User.startSession();
    session.startTransaction();

    try {
        // console.log("payload...........", payload);
        const { email, phone, role, password, nidNumber, ...rest } = payload;

        // Validation checks
        if (!email || !phone || !role || !password || !nidNumber) {
            throw new AppError(status.BAD_REQUEST, 'Missing required fields');
        }

        if (role !== Role.USER && role !== Role.AGENT) {
            throw new AppError(status.BAD_REQUEST, 'Only user and agent can create their account');
        }

        // Check for existing records
        const [existingEmail, existingPhone, existingNid] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ phone }),
            User.findOne({ nidNumber })
        ]);

        if (existingEmail) {
            throw new AppError(status.BAD_REQUEST, 'Email is already used');
        }
        if (existingPhone) {
            throw new AppError(status.BAD_REQUEST, 'Phone number is already used');
        }
        if (existingNid) {
            throw new AppError(status.BAD_REQUEST, 'NID number is already used');
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, Number(envVars.BCRYPT.BCRYPT_SALT_ROUND));

        // Create user
        const userData = {
            email,
            phone,
            role,
            nidNumber,
            password: hashedPassword,
            //   isApproved: role === Role.AGENT ? IsApproved.PENDING : undefined,
            commissionRate: role === Role.AGENT ? Number(envVars.WALLET.COMMISSION_RATE) : undefined,
            isDeleted: false,
            ...rest
        };

        const user = await User.create([userData], { session });
        if (!user || user.length === 0) {
            throw new AppError(status.INTERNAL_SERVER_ERROR, 'User creation failed');
        }

        // Create wallet
        const wallet = await Wallet.create([{
            user: user[0]._id,
            balance: Number(envVars.WALLET.INITIAL_BALANCE),
            role: role
        }], { session });

        // Update user with wallet reference
        const updatedUser = await User.findByIdAndUpdate(
            user[0]._id,
            { wallet: wallet[0]._id },
            { new: true, session }
        );

        if (!updatedUser) {
            throw new AppError(status.INTERNAL_SERVER_ERROR, 'Failed to update user with wallet');
        }

        await session.commitTransaction();
        session.endSession();

        return { user: updatedUser.toObject() };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
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
    getSingleUser,
    updateUser
};