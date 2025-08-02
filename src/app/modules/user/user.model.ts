import { model, Schema } from "mongoose";
import { IsActive, IsApproved, IUser, Role } from "./user.interface";

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        nidNumber: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(Role),
            default: Role.USER
        },
        isActive: {
            type: String,
            enum: Object.values(IsActive),
            default: IsActive.ACTIVE
        },
        // isVerified: {
        //     type: Boolean,
        //     default: false
        // },
        isApproved: {
            type: String,
            enum: Object.values(IsApproved),
            default: IsApproved.PENDING
        },
        wallet: {
            type: Schema.Types.ObjectId,
            ref: "Wallet",
        },
        commissionRate: {
            type: Number
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const User = model<IUser>("User", userSchema);