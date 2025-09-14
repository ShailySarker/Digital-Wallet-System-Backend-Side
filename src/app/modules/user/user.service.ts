/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import {
  IAgentFilters,
  IsActive,
  IsApproved,
  IUser,
  IUserFilters,
  Role,
} from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { allUserSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "../wallet/wallet.model";
import { Wallet_Status } from "../wallet/wallet.interface";

const createUser = async (
  payload: Partial<IUser>
): Promise<{ user: IUser }> => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { email, phone, role, password, nidNumber, ...rest } = payload;

    // Validation checks
    if (!email || !phone || !role || !password || !nidNumber) {
      throw new AppError(status.BAD_REQUEST, "Missing required fields");
    }

    if (role !== Role.USER && role !== Role.AGENT) {
      throw new AppError(
        status.BAD_REQUEST,
        "Only user and agent can create their own account. Only admin have the access to make anyone as ADMIN"
      );
    }

    // Check for existing records
    const [existingEmail, existingPhone, existingNid] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ phone }),
      User.findOne({ nidNumber }),
    ]);

    if (existingEmail) {
      throw new AppError(status.BAD_REQUEST, "Email is already used");
    }
    if (existingPhone) {
      throw new AppError(status.BAD_REQUEST, "Phone number is already used");
    }
    if (existingNid) {
      throw new AppError(status.BAD_REQUEST, "NID number is already used");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(
      password,
      Number(envVars.BCRYPT.BCRYPT_SALT_ROUND)
    );

    // Create user
    const userData = {
      email,
      phone,
      role,
      nidNumber,
      password: hashedPassword,
      // isApproved: role === Role.AGENT ? IsApproved.PENDING : undefined,
      // commissionRate:
      //   role === Role.AGENT && Number(envVars.WALLET.COMMISSION_RATE),
      // isActive: role === Role.USER && IsActive.UNBLOCK,
      // isApproved: role === Role.AGENT && IsApproved.PENDING,
      commissionRate:
        role === Role.AGENT
          ? Number(envVars.WALLET.COMMISSION_RATE)
          : undefined,
      isActive: role === Role.USER ? IsActive.UNBLOCK : undefined,
      isApproved: role === Role.AGENT ? IsApproved.PENDING : undefined,
      ...rest,
    };

    const user = await User.create([userData], { session });
    if (!user || user.length === 0) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "User creation failed");
    }

    // Create wallet
    const wallet = await Wallet.create(
      [
        {
          user: user[0]._id,
          balance: Number(envVars.WALLET.INITIAL_BALANCE),
          role: role,
        },
      ],
      { session }
    );

    // Update user with wallet reference
    const updatedUser = await User.findByIdAndUpdate(
      user[0]._id,
      { wallet: wallet[0]._id },
      { new: true, session }
    );

    if (!updatedUser) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to update user with wallet"
      );
    }

    await session.commitTransaction();
    session.endSession();

    return { user: updatedUser };
    // return { user: updatedUser.toObject() };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMyProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const getAllCategoryUser = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(allUserSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

// const getAllUsers = async (query: Record<string, string>) => {
//   const queryBuilder = new QueryBuilder(
//     User.find({ role: "USER" }).select("-password"),
//     query
//   );
//   const usersData = queryBuilder
//     .filter()
//     .search(userSearchableFields)
//     .sort()
//     .fields()
//     .paginate();

//   const [data, meta] = await Promise.all([
//     usersData.build(),
//     queryBuilder.getMeta(),
//   ]);

//   return {
//     data,
//     meta,
//   };
// };

// const getAllUsers = async (query: IUserFilters) => {
//   const {
//     search,
//     page = "1",
//     limit = "10",
//     role,
//     isActive,
//     isApproved,
//     isVerified,
//     isDeleted,
//     ...otherFilters
//   } = query;

//   // Build search condition
//   const searchCondition: any = {};

//   if (search) {
//     searchCondition.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { email: { $regex: search, $options: "i" } },
//       { phone: { $regex: search, $options: "i" } },
//       { nidNumber: { $regex: search, $options: "i" } },
//     ];
//   }

// // Build filter conditions
// const filterConditions: any = { role: "USER", isDeleted: false };

//   if (role) filterConditions.role = role;
//   if (isActive) filterConditions.isActive = isActive;
//   if (isApproved) filterConditions.isApproved = isApproved;
//   if (isVerified) filterConditions.isVarified = isVerified;
//   if (isDeleted) filterConditions.isDeleted = isDeleted;

//   // Combine all conditions
//   const whereConditions = {
//     ...filterConditions,
//     ...searchCondition,
//     ...otherFilters,
//   };

//   // Pagination setup
//   const pageNumber = parseInt(page);
//   const limitNumber = parseInt(limit);
//   const skip = (pageNumber - 1) * limitNumber;

//   // Execute query with pagination
//   const users = await User.find(whereConditions)
//     .select("-password")
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limitNumber);

//   // Get total count for pagination metadata
//   const total = await User.countDocuments(whereConditions);

//   // Calculate pagination metadata
//   const totalPages = Math.ceil(total / limitNumber);
//   const hasNext = pageNumber < totalPages;
//   const hasPrev = pageNumber > 1;

//   return {
//     data: users,
//     meta: {
//       page: pageNumber,
//       limit: limitNumber,
//       total,
//       totalPages,
//       hasNext,
//       hasPrev,
//     },
//   };
// };
// user.service.ts
const getAllUsers = async (query: IUserFilters) => {
  const {
    search,
    page = "1",
    limit = "10",
    role,
    isActive,
    isApproved,
    isVerified,
    isDeleted,
    sortBy = "createdAt",
    sortOrder = "desc",
    ...otherFilters
  } = query;

  // Build search condition
  const searchCondition: any = {};

  if (search) {
    searchCondition.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { nidNumber: { $regex: search, $options: "i" } },
    ];
  }

  // Build filter conditions
  const filterConditions: any = { role: "USER" };

  if (role) filterConditions.role = role;
  if (isActive) filterConditions.isActive = isActive;
  if (isApproved) filterConditions.isApproved = isApproved;

  // Handle boolean filters
  if (isVerified !== undefined) {
    filterConditions.isVerified = isVerified === "true";
  }
  if (isDeleted !== undefined) {
    filterConditions.isDeleted = isDeleted === "true";
  }

  // Combine all conditions
  const whereConditions = {
    ...filterConditions,
    ...searchCondition,
    ...otherFilters,
  };

  // Pagination setup
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // Sort setup
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query with pagination and sorting
  const users = await User.find(whereConditions)
    .select("-password")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNumber);
  // .populate("wallet");

  // Get total count for pagination metadata
  const total = await User.countDocuments(whereConditions);

  // Get counts for different statuses
  const activeCount = await User.find({ role: "USER" }).countDocuments({
    ...whereConditions,
    isActive: IsActive.UNBLOCK,
  });
  const blockCount = await User.find({ role: "USER" }).countDocuments({
    ...whereConditions,
    isActive: IsActive.BLOCK,
  });
  const verifiedCount = await User.find({ role: "USER" }).countDocuments({
    ...whereConditions,
    isVerified: true,
  });
  const deletedCount = await User.find({ role: "USER" }).countDocuments({
    ...whereConditions,
    isDeleted: true,
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: users,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
      hasNext: pageNumber < totalPages,
      hasPrev: pageNumber > 1,
      counts: {
        active: activeCount,
        verified: verifiedCount,
        blocked: blockCount,
        deleted: deletedCount,
        total: total,
      },
    },
  };
};

const getAllAgents = async (query: IAgentFilters) => {
  const {
    search,
    page = "1",
    limit = "10",
    role,
    isApproved,
    isVerified,
    isDeleted,
    sortBy = "createdAt",
    sortOrder = "desc",
    ...otherFilters
  } = query;

  // Build search condition
  const searchCondition: any = {};

  if (search) {
    searchCondition.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { nidNumber: { $regex: search, $options: "i" } },
    ];
  }

  // Build filter conditions
  const filterConditions: any = { role: "AGENT" };

  if (role) filterConditions.role = role;
  if (isApproved) filterConditions.isApproved = isApproved;

  // Handle boolean filters
  if (isVerified !== undefined) {
    filterConditions.isVerified = isVerified === "true";
  }
  if (isDeleted !== undefined) {
    filterConditions.isDeleted = isDeleted === "true";
  }

  // Combine all conditions
  const whereConditions = {
    ...filterConditions,
    ...searchCondition,
    ...otherFilters,
  };

  // Pagination setup
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // Sort setup
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query with pagination and sorting
  const users = await User.find(whereConditions)
    .select("-password")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNumber);
  // .populate("wallet");

  // Get total count for pagination metadata
  const total = await User.countDocuments(whereConditions);

  // Get counts for different statuses
  const approvedCount = await User.find({ role: "AGENT" }).countDocuments({
    ...whereConditions,
    isApproved: IsApproved.APPROVE,
  });
  const suspendedCount = await User.find({ role: "AGENT" }).countDocuments({
    ...whereConditions,
    isApproved: IsApproved.SUSPEND,
  });
  const verifiedCount = await User.find({ role: "AGENT" }).countDocuments({
    ...whereConditions,
    isVerified: true,
  });
  const deletedCount = await User.find({ role: "AGENT" }).countDocuments({
    ...whereConditions,
    isDeleted: true,
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: users,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
      hasNext: pageNumber < totalPages,
      hasPrev: pageNumber > 1,
      counts: {
        approved: approvedCount,
        verified: verifiedCount,
        suspended: suspendedCount,
        deleted: deletedCount,
        total: total,
      },
    },
  };
};

const getAllUserAndAgent = async (query: Record<string, string>) => {
  const { searchTerm } = query;

  // Build the base query for USER and AGENT roles
  const baseQuery: any = {
    role: { $in: [Role.USER, Role.AGENT] },
    $or: [{ isActive: IsActive.UNBLOCK }, { isApproved: IsApproved.APPROVE }],
    isVerified: true,
    isDeleted: false,
  };

  if (searchTerm && searchTerm.trim().length >= 3) {
    const searchRegex = new RegExp(searchTerm.trim(), "i");
    baseQuery.$or = [
      { phone: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
    ];
  }

  // Execute the query
  const result = await User.find(baseQuery)
    .select("-password")
    .sort({ createdAt: -1 });
  // .limit(10); // Limit results for better performance

  return result;
};

// const getAllAgents = async (query: Record<string, string>) => {
//   const queryBuilder = new QueryBuilder(
//     User.find({ role: "AGENT" }).select("-password"),
//     query
//   );
//   const usersData = queryBuilder
//     .filter()
//     .search(userSearchableFields)
//     .sort()
//     .fields()
//     .paginate();

//   const [data, meta] = await Promise.all([
//     usersData.build(),
//     queryBuilder.getMeta(),
//   ]);

//   return {
//     data,
//     meta,
//   };
// };

const getSpecificUser = async (phone: string) => {
  const user = await User.findOne({ phone }).select("-password");

  if (!user) {
    throw new AppError(status.NOT_FOUND, "Account not found");
  }
  if (user.role !== Role.USER) {
    throw new AppError(status.NOT_FOUND, "This is not an user account");
  }

  // if (user.isActive !== IsActive.BLOCK) {
  //   throw new AppError(status.NOT_FOUND, "The account is blocked!");
  // }
  // if (user.isActive !== IsActive.ACTIVE) {
  //   throw new AppError(status.NOT_FOUND, "The account is not active!");
  // }
  // if (!user.isVerified) {
  //   throw new AppError(status.NOT_FOUND, "The account is not verified!");
  // }

  return {
    data: user,
  };
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  // console.log("payload------", payload);
  // console.log("decodedToken------", decodedToken);

  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }

  if (
    payload.isActive ||
    payload.isDeleted ||
    payload.isApproved ||
    payload.commissionRate
  ) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(
        status.FORBIDDEN,
        `${decodedToken.role} are not authorized for updating - isActive | isApproved | isDeleted | commissionRate`
      );
    }
  }

  if (
    payload.name ||
    payload.email ||
    payload.phone ||
    payload.nidNumber ||
    payload.password
  ) {
    if (
      decodedToken.role === Role.ADMIN &&
      !(isUserExist.id === decodedToken.userId.toString())
    ) {
      throw new AppError(
        status.FORBIDDEN,
        `${decodedToken.role} are not authorized for updating USER or AGENT - name | email | phone | password | nidNumber`
      );
    }
  }

  if (payload.email && isUserExist.email !== payload.email) {
    const existingEmailAddress = await User.findOne({ email: payload.email });
    if (existingEmailAddress) {
      throw new AppError(status.FORBIDDEN, "Email address is already exists");
    }
    isUserExist.email = payload.email;
  }
  if (payload.phone && isUserExist.phone !== payload.phone) {
    const existingEmailAddress = await User.findOne({ phone: payload.phone });
    if (existingEmailAddress) {
      throw new AppError(status.FORBIDDEN, "Phone number is already exists");
    }
    isUserExist.phone = payload.phone;
  }
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      Number(envVars.BCRYPT.BCRYPT_SALT_ROUND)
    );
  }

  // if(payload.role === Role.USER && !(payload.isActive === IsActive.BLOCK || IsActive.UNBLOCK)){
  //  add field payload.isActive =IsActive.UNBLOCK
  //  delete field payload.isApproved , payload.commissionRate
  // }
  // if(payload.role === Role.AGENT && !(payload.isApproved === IsApproved.PENDING || IsApproved.APPROVE || IsApproved.SUSPEND) && !payload.commissionRate){
  //   add field payload.isApproved == IsApproved.PENDING, payload.commissionRate == Number(envVars.WALLET.COMMISSION_RATE)
  //   delete field payload.isActive =IsActive.UNBLOCK
  // }
  if (
    payload.role === Role.USER &&
    !(
      payload.isActive === IsActive.BLOCK ||
      payload.isActive === IsActive.UNBLOCK
    )
  ) {
    payload.isActive = IsActive.UNBLOCK;

    // remove irrelevant fields
    delete payload.isApproved;
    delete payload.commissionRate;
  }

  if (
    payload.role === Role.AGENT &&
    !(
      payload.isApproved === IsApproved.PENDING ||
      payload.isApproved === IsApproved.APPROVE ||
      payload.isApproved === IsApproved.SUSPEND
    ) &&
    !payload.commissionRate
  ) {
    payload.isApproved = IsApproved.PENDING;
    payload.commissionRate = Number(envVars.WALLET.COMMISSION_RATE);

    // remove irrelevant fields
    delete payload.isActive;
  }

  const findWallet = await Wallet.findOne({ user: userId });

  if (!findWallet && isUserExist.role !== Role.ADMIN) {
    throw new AppError(status.NOT_FOUND, "Wallet is not found");
  }

  // Only proceed if wallet exists
  if (findWallet) {
    if (
      payload.isApproved === IsApproved.SUSPEND ||
      payload.isActive === IsActive.BLOCK
    ) {
      await Wallet.findByIdAndUpdate(
        findWallet._id,
        { status: Wallet_Status.BLOCK },
        { new: true, runValidators: true }
      );
    } else if (
      payload.isApproved === IsApproved.APPROVE ||
      payload.isActive === IsActive.UNBLOCK
    ) {
      await Wallet.findByIdAndUpdate(
        findWallet._id,
        { status: Wallet_Status.UNBLOCK },
        { new: true, runValidators: true }
      );
    } else {
      await Wallet.findByIdAndUpdate(
        findWallet._id,
        { status: Wallet_Status.UNBLOCK },
        { new: true, runValidators: true }
      );
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

export const UserServices = {
  createUser,
  getMyProfile,
  getAllCategoryUser,
  getAllUsers,
  getAllAgents,
  getAllUserAndAgent,
  getSpecificUser,
  getSingleUser,
  updateUser,
};
