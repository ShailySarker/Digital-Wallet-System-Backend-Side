import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { Transaction } from "./transaction.model";
import { Wallet } from "../wallet/wallet.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { myTransactionsSearchableFields } from "./transaction.constant";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

// ========================================================================
const getAllTransactions = async (query: Record<string, string>) => {
  // Build the base filter for database-level filtering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbFilter: any = {};

  // Apply filters that can be handled at the database level
  if (query.type) dbFilter.type = query.type;
  if (query.status) dbFilter.status = query.status;

  // Handle search term at database level
  if (query.searchTerm) {
    dbFilter.$or = [
      { type: { $regex: query.searchTerm, $options: "i" } },
      { status: { $regex: query.searchTerm, $options: "i" } },
    ];
  }

  // Build sort option
  const sortParam = query.sort || "-createdAt";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortOption: any = {};

  switch (sortParam) {
    case "amount":
      sortOption.amount = 1;
      break;
    case "-amount":
      sortOption.amount = -1;
      break;
    case "commission":
      sortOption.commission = 1;
      break;
    case "-commission":
      sortOption.commission = -1;
      break;
    case "createdAt":
      sortOption.createdAt = 1;
      break;
    case "-createdAt":
    default:
      sortOption.createdAt = -1;
      break;
  }

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // First, get ALL transactions that match the database-level filters
  const allTransactions = await Transaction.find(dbFilter)
    .sort(sortOption)
    .populate([
      {
        path: "fromWallet",
        populate: { path: "user", select: "name phone role" },
      },
      {
        path: "toWallet",
        populate: { path: "user", select: "name phone role" },
      },
      { path: "initiatedBy", select: "phone role" },
    ]);

  // Then transform the data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = allTransactions.map((transaction: any) => {
    const transformed = transaction.toObject();

    // Extract and flatten fromWallet data
    if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
      transformed.fromWallet = transaction.fromWallet._id;
      if (transaction.fromWallet.user) {
        transformed.fromWalletSender = transaction.fromWallet.user.name;
        transformed.fromWalletPhone = transaction.fromWallet.user.phone;
        transformed.fromWalletRole = transaction.fromWallet.user.role;
      }
      delete transformed.fromWallet;
    }

    // Extract and flatten toWallet data
    if (transaction.toWallet && typeof transaction.toWallet === "object") {
      transformed.toWallet = transaction.toWallet._id;
      if (transaction.toWallet.user) {
        transformed.toWalletReceiver = transaction.toWallet.user.name;
        transformed.toWalletPhone = transaction.toWallet.user.phone;
        transformed.toWalletRole = transaction.toWallet.user.role;
      }
      delete transformed.toWallet;
    }

    // Extract initiatedBy data if needed
    if (
      transaction.initiatedBy &&
      typeof transaction.initiatedBy === "object"
    ) {
      transformed.initiatedBy = transaction.initiatedBy._id;
      transformed.initiatedByPhone = transaction.initiatedBy.phone;
      transformed.initiatedByRole = transaction.initiatedBy.role;
    }

    return transformed;
  });

  // Apply additional filtering on the FULL transformed dataset
  let filteredData = transformedData;

  if (query.fromWalletSender) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletSender &&
        item.fromWalletSender.includes(query.fromWalletSender as string)
    );
  }

  if (query.fromWalletPhone) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletPhone &&
        item.fromWalletPhone.includes(query.fromWalletPhone as string)
    );
  }

  if (query.toWalletReceiver) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletReceiver &&
        item.toWalletReceiver.includes(query.toWalletReceiver as string)
    );
  }

  if (query.toWalletPhone) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletPhone &&
        item.toWalletPhone.includes(query.toWalletPhone as string)
    );
  }

  if (query.fromWalletRole) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletRole &&
        item.fromWalletRole.includes(query.fromWalletRole as string)
    );
  }

  if (query.toWalletRole) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletRole &&
        item.toWalletRole.includes(query.toWalletRole as string)
    );
  }

  // Apply pagination AFTER all filtering is done
  const total = filteredData.length;
  const totalPage = Math.ceil(total / limit);
  const startIndex = skip;
  const endIndex = Math.min(startIndex + limit, total);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    meta: { page, limit, total, totalPage },
  };
};
// ========================================================================
// const getMyTransactionsHistory = async (userId: string) => {
//   const wallet = await Wallet.findOne({ user: userId });
//   // console.log(wallet);
//   if (!wallet) {
//     throw new AppError(status.NOT_FOUND, "No wallet is found");
//   }

//   const myTransaction = Transaction.find({
//     $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
//   })
//     .sort({ createdAt: -1 })
//     .populate("initiatedBy", "phone role");

//   return myTransaction;
// };

// const getMyTransactionsHistory = async (
//   userId: string,
//   query: Record<string, string>
// ) => {
//   const wallet = await Wallet.findOne({ user: userId });
//   // console.log(wallet);
//   if (!wallet) {
//     throw new AppError(status.NOT_FOUND, "No wallet is found");
//   }
//   const myTransaction = Transaction.find({
//     $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
//   })
//     .sort({ createdAt: -1 })
//     .populate([
//       { path: "fromWallet", populate: { path: "user", select: "name phone role" } },
//       { path: "toWallet", populate: { path: "user", select: "name phone role" } },
//       { path: "initiatedBy", select: "phone role" },
//     ]);
//   console.log(myTransaction);
//   const queryBuilder = new QueryBuilder(myTransaction, query);
//   const myTransactionData = queryBuilder
//     .filter()
//     .search(myTransactionsSearchableFields)
//     .sort()
//     .fields()
//     .paginate();
//   const [data, meta] = await Promise.all([
//     myTransactionData.build(),
//     queryBuilder.getMeta(),
//   ]);
//   return {
//     data,
//     meta,
//   };
// };

// const getAllTransactions = async (query: Record<string, string>) => {
//   let filter: any = {};

//   // Apply specific filters
//   if (query.type) filter.type = query.type;
//   if (query.status) filter.status = query.status;
//   if (query.fromWalletSender) filter.fromWalletSender = { $regex: query.fromWalletSender, $options: "i" };
//   if (query.fromWalletPhone) filter.fromWalletPhone = { $regex: query.fromWalletPhone, $options: "i" };
//   if (query.toWalletReceiver) filter.toWalletReceiver = { $regex: query.toWalletReceiver, $options: "i" };
//   if (query.toWalletPhone) filter.toWalletPhone = { $regex: query.toWalletPhone, $options: "i" };
//   if (query.fromWalletRole) filter.fromWalletRole = { $regex: query.fromWalletRole, $options: "i" };
//   if (query.toWalletRole) filter.toWalletRole = { $regex: query.toWalletRole, $options: "i" };

//   // Handle search term
//   if (query.searchTerm) {
//     filter.$or = [
//       { type: { $regex: query.searchTerm, $options: "i" } },
//       { status: { $regex: query.searchTerm, $options: "i" } },
//       { fromWalletSender: { $regex: query.searchTerm, $options: "i" } },
//       { fromWalletPhone: { $regex: query.searchTerm, $options: "i" } },
//       { toWalletReceiver: { $regex: query.searchTerm, $options: "i" } },
//       { toWalletPhone: { $regex: query.searchTerm, $options: "i" } },
//       { fromWalletRole: { $regex: query.searchTerm, $options: "i" } },
//       { toWalletRole: { $regex: query.searchTerm, $options: "i" } },
//     ];
//   }

//   // Determine sort
//   let sort: any = {};
//   const sortParam = query.sort || "-createdAt";

//   if (sortParam === "amount" || sortParam === "-amount") {
//     sort.amount = sortParam.startsWith("-") ? -1 : 1;
//   } else if (sortParam === "commission" || sortParam === "-commission") {
//     sort.commission = sortParam.startsWith("-") ? -1 : 1;
//   } else {
//     sort.createdAt = sortParam.startsWith("-") ? -1 : 1;
//   }

//   // Pagination
//   const page = Number(query.page) || 1;
//   const limit = Number(query.limit) || 10;
//   const skip = (page - 1) * limit;

//   const [data, total] = await Promise.all([
//     Transaction.find(filter)
//       .sort(sort)
//       .skip(skip)
//       .limit(limit)
//       .populate([
//         { path: "fromWallet", populate: { path: "user", select: "name phone role" } },
//         { path: "toWallet", populate: { path: "user", select: "name phone role" } },
//         { path: "initiatedBy", select: "phone role" },
//       ]),
//     Transaction.countDocuments(filter)
//   ]);

//   const totalPage = Math.ceil(total / limit);

//   // Transform data
//   const transformedData = data.map((transaction: any) => {
//     const transformed = transaction.toObject();

//     // Extract and flatten fromWallet data
//     if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
//       transformed.fromWallet = transaction.fromWallet._id;
//       if (transaction.fromWallet.user) {
//         transformed.fromWalletSender = transaction.fromWallet.user.name;
//         transformed.fromWalletPhone = transaction.fromWallet.user.phone;
//         transformed.fromWalletRole = transaction.fromWallet.user.role;
//       }
//       delete transformed.fromWallet;
//     }

//     // Extract and flatten toWallet data
//     if (transaction.toWallet && typeof transaction.toWallet === "object") {
//       transformed.toWallet = transaction.toWallet._id;
//       if (transaction.toWallet.user) {
//         transformed.toWalletReceiver = transaction.toWallet.user.name;
//         transformed.toWalletPhone = transaction.toWallet.user.phone;
//         transformed.toWalletRole = transaction.toWallet.user.role;
//       }
//       delete transformed.toWallet;
//     }

//     // Extract initiatedBy data if needed
//     if (transaction.initiatedBy && typeof transaction.initiatedBy === "object") {
//       transformed.initiatedBy = transaction.initiatedBy._id;
//       transformed.initiatedByPhone = transaction.initiatedBy.phone;
//       transformed.initiatedByRole = transaction.initiatedBy.role;
//     }

//     return transformed;
//   });

//   return {
//     data: transformedData,
//     meta: { page, limit, total, totalPage }
//   };
// };
// --------------------------------------------------------------------------------------

// const getMyTransactionsHistory = async (
//   userId: string,
//   query: Record<string, string> = {}
// ) => {
//   const wallet = await Wallet.findOne({ user: userId });

//   if (!wallet) {
//     throw new AppError(status.NOT_FOUND, "No wallet is found");
//   }

//   let dbFilter: any = {};

//   // Apply filters
//   if (query.type) dbFilter.type = query.type;
//   if (query.status) dbFilter.status = query.status;

//   // Search term
//   if (query.searchTerm) {
//     dbFilter.$or = [
//       { type: { $regex: query.searchTerm, $options: "i" } },
//       { status: { $regex: query.searchTerm, $options: "i" } },
//     ];
//   }

//   // Sorting
//   const sortParam = query.sort || "-createdAt";
//   let sortOption: any = {};

//   switch (sortParam) {
//     case "amount":
//       sortOption.amount = 1;
//       break;
//     case "-amount":
//       sortOption.amount = -1;
//       break;
//     case "commission":
//       sortOption.commission = 1;
//       break;
//     case "-commission":
//       sortOption.commission = -1;
//       break;
//     case "createdAt":
//       sortOption.createdAt = 1;
//       break;
//     case "-createdAt":
//     default:
//       sortOption.createdAt = -1;
//       break;
//   }

//   // Pagination
//   const page = Number(query.page) || 1;
//   const limit = Number(query.limit) || 10;
//   const skip = (page - 1) * limit;

//   // Fetch data (wallet-based filter + other filters merged)
//   const allTransactions = await Transaction.find({
//     ...dbFilter,
//     $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
//   })
//     .sort(sortOption)
//     .populate([
//       {
//         path: "fromWallet",
//         populate: { path: "user", select: "name phone role" },
//       },
//       {
//         path: "toWallet",
//         populate: { path: "user", select: "name phone role" },
//       },
//       { path: "initiatedBy", select: "phone role" },
//     ]);

//   // Transform
//   const transformedData = allTransactions.map((transaction: any) => {
//     const transformed = transaction.toObject();

//     if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
//       transformed.fromWalletId = transaction.fromWallet._id;
//       if (transaction.fromWallet.user) {
//         transformed.fromWalletSender = transaction.fromWallet.user.name;
//         transformed.fromWalletPhone = transaction.fromWallet.user.phone;
//         transformed.fromWalletRole = transaction.fromWallet.user.role;
//       }
//       delete transformed.fromWallet;
//     }

//     if (transaction.toWallet && typeof transaction.toWallet === "object") {
//       transformed.toWalletId = transaction.toWallet._id;
//       if (transaction.toWallet.user) {
//         transformed.toWalletReceiver = transaction.toWallet.user.name;
//         transformed.toWalletPhone = transaction.toWallet.user.phone;
//         transformed.toWalletRole = transaction.toWallet.user.role;
//       }
//       delete transformed.toWallet;
//     }

//     if (transaction.initiatedBy && typeof transaction.initiatedBy === "object") {
//       transformed.initiatedById = transaction.initiatedBy._id;
//       transformed.initiatedByPhone = transaction.initiatedBy.phone;
//       transformed.initiatedByRole = transaction.initiatedBy.role;
//     }

//     return transformed;
//   });

//   // Paginate results in memory
//   const total = transformedData.length;
//   const totalPage = Math.ceil(total / limit);
//   const paginatedData = transformedData.slice(skip, skip + limit);

//   return {
//     data: paginatedData,
//     meta: { page, limit, total, totalPage },
//   };
// };

// const getMyTransactionsHistory = async (
//   userId: string,
//   query: Record<string, string> = {}
// ) => {
//   const wallet = await Wallet.findOne({ user: userId });

//   if (!wallet) {
//     throw new AppError(status.NOT_FOUND, "No wallet is found");
//   }

//   // Build the base filter
//   let dbFilter: any = {
//     $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
//   };

//   // Apply additional filters
//   if (query.type) dbFilter.type = query.type;
//   if (query.status) dbFilter.status = query.status;

//   // Build sort option
//   const sortParam = query.sort || "-createdAt";
//   let sortOption: any = {};

//   switch (sortParam) {
//     case "amount":
//       sortOption.amount = 1;
//       break;
//     case "-amount":
//       sortOption.amount = -1;
//       break;
//     case "commission":
//       sortOption.commission = 1;
//       break;
//     case "-commission":
//       sortOption.commission = -1;
//       break;
//     case "createdAt":
//       sortOption.createdAt = 1;
//       break;
//     case "-createdAt":
//     default:
//       sortOption.createdAt = -1;
//       break;
//   }

//   // Pagination
//   const page = Number(query.page) || 1;
//   const limit = Number(query.limit) || 10;
//   const skip = (page - 1) * limit;

//   // Get total count
//   const total = await Transaction.countDocuments(dbFilter);

//   // Get transactions with pagination
//   const transactions = await Transaction.find(dbFilter)
//     .sort(sortOption)
//     .skip(skip)
//     .limit(limit)
//     .populate([
//       {
//         path: "fromWallet",
//         populate: { path: "user", select: "name phone role" },
//       },
//       {
//         path: "toWallet",
//         populate: { path: "user", select: "name phone role" },
//       },
//       { path: "initiatedBy", select: "phone role" },
//     ]);

//   // Transform the data
//   const transformedData = transactions.map((transaction: any) => {
//     const transformed = transaction.toObject();

//     // Extract and flatten fromWallet data
//     if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
//       transformed.fromWalletId = transaction.fromWallet._id;
//       if (transaction.fromWallet.user) {
//         transformed.fromWalletSender = transaction.fromWallet.user.name;
//         transformed.fromWalletPhone = transaction.fromWallet.user.phone;
//         transformed.fromWalletRole = transaction.fromWallet.user.role;
//       }
//       delete transformed.fromWallet;
//     }

//     // Extract and flatten toWallet data
//     if (transaction.toWallet && typeof transaction.toWallet === "object") {
//       transformed.toWalletId = transaction.toWallet._id;
//       if (transaction.toWallet.user) {
//         transformed.toWalletReceiver = transaction.toWallet.user.name;
//         transformed.toWalletPhone = transaction.toWallet.user.phone;
//         transformed.toWalletRole = transaction.toWallet.user.role;
//       }
//       delete transformed.toWallet;
//     }

//     // Extract initiatedBy data if needed
//     if (transaction.initiatedBy && typeof transaction.initiatedBy === "object") {
//       transformed.initiatedById = transaction.initiatedBy._id;
//       transformed.initiatedByPhone = transaction.initiatedBy.phone;
//       transformed.initiatedByRole = transaction.initiatedBy.role;
//     }

//     return transformed;
//   });

//   // Apply search filtering AFTER transformation (client-side)
//   let filteredData = transformedData;
//   if (query.searchTerm) {
//     const searchTerm = query.searchTerm.toLowerCase();
//     filteredData = transformedData.filter((item) => {
//       return (
//         item.type?.toLowerCase().includes(searchTerm) ||
//         item.status?.toLowerCase().includes(searchTerm) ||
//         item.fromWalletSender?.toLowerCase().includes(searchTerm) ||
//         item.fromWalletPhone?.toLowerCase().includes(searchTerm) ||
//         item.toWalletReceiver?.toLowerCase().includes(searchTerm) ||
//         item.toWalletPhone?.toLowerCase().includes(searchTerm) ||
//         item.fromWalletRole?.toLowerCase().includes(searchTerm) ||
//         item.toWalletRole?.toLowerCase().includes(searchTerm) ||
//         item.initiatedByPhone?.toLowerCase().includes(searchTerm) ||
//         item.initiatedByRole?.toLowerCase().includes(searchTerm)
//       );
//     });
//   }

//   // For client-side search, we need to recalculate pagination
//   const finalData = query.searchTerm 
//     ? filteredData.slice(0, limit) // Only return first page for client-side search
//     : filteredData;

//   const finalTotal = query.searchTerm ? filteredData.length : total;
//   const totalPage = Math.ceil(finalTotal / limit);

//   return {
//     data: finalData,
//     meta: { page, limit, total: finalTotal, totalPage },
//   };
// };

const getMyTransactionsHistory = async (
  userId: string,
  query: Record<string, string> = {}
) => {
const wallet = await Wallet.findOne({ user: userId });

if (!wallet) {
  throw new AppError(status.NOT_FOUND, "No wallet is found");
}

// Create the initial filter
const initialFilter = {
  $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
};

// Create base query with initial filter
const myTransaction = Transaction.find(initialFilter)
  .sort({ createdAt: -1 })
  .populate([
    {
      path: "fromWallet",
      populate: { path: "user", select: "name phone role" },
    },
    {
      path: "toWallet",
      populate: { path: "user", select: "name phone role" },
    },
    { path: "initiatedBy", select: "phone role" },
  ]);

  const queryBuilder = new QueryBuilder(myTransaction, query);
  const myTransactionData = queryBuilder
    .filter()
    .search(myTransactionsSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    myTransactionData.build(),
    queryBuilder.getMeta(),
  ]);

  // Transform the data to the desired format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = data.map((transaction: any) => {
    const transformed = transaction.toObject();

    // Extract and flatten fromWallet data
    if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
      transformed.fromWallet = transaction.fromWallet._id;
      if (transaction.fromWallet.user) {
        transformed.fromWalletSender = transaction.fromWallet.user.name;
        transformed.fromWalletPhone = transaction.fromWallet.user.phone;
        transformed.fromWalletRole = transaction.fromWallet.user.role;
      }
      // Remove the nested object
      delete transformed.fromWallet;
    }

    // Extract and flatten toWallet data
    if (transaction.toWallet && typeof transaction.toWallet === "object") {
      transformed.toWallet = transaction.toWallet._id;
      if (transaction.toWallet.user) {
        transformed.toWalletReceiver = transaction.toWallet.user.name;
        transformed.toWalletPhone = transaction.toWallet.user.phone;
        transformed.toWalletRole = transaction.toWallet.user.role;
      }
      // Remove the nested object
      delete transformed.toWallet;
    }

    // Extract initiatedBy data if needed
    if (
      transaction.initiatedBy &&
      typeof transaction.initiatedBy === "object"
    ) {
      transformed.initiatedBy = transaction.initiatedBy._id;
      transformed.initiatedByPhone = transaction.initiatedBy.phone;
      transformed.initiatedByRole = transaction.initiatedBy.role;
    }

    return transformed;
  });

  return {
    data: transformedData,
    meta,
  };
};

// --------------------------------------------------------------------------------------

const getAgentCommissionHistory = async (agentId: string) => {
  const transactions = await Transaction.find({
    initiatedBy: agentId,
    commission: { $gt: 0 },
  }).sort({ createdAt: -1 });

  if (!transactions) {
    throw new AppError(status.NOT_FOUND, "Transactions are not found");
  }

  return transactions;
};

const getSingleTransaction = async (transactionId: string) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new AppError(status.NOT_FOUND, "Transaction is not found");
  }

  return transaction;
};

const getAgentStats = async (agent: JwtPayload) => {
  const receiverId = new mongoose.Types.ObjectId(String(agent.userId));
  const senderId = new mongoose.Types.ObjectId(String(agent.userId));
  const userBalance = await Wallet.findOne({ user: agent.userId });
  if (!userBalance) {
    throw new AppError(status.NOT_FOUND, "Wallet is not found");
  }
  const totalCashIn = await Transaction.aggregate([
    {
      $match: {
        $or: [{ receiver: receiverId }, { sender: senderId }],
        type: "cash-in",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);
  const totalCashOut = await Transaction.aggregate([
    {
      $match: {
        $or: [{ receiver: receiverId }, { sender: senderId }],
        type: "cash-out",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);
  const totalCommission = await Transaction.aggregate([
    {
      $match: {
        $or: [{ receiver: receiverId }, { sender: senderId }],
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$commission" },
      },
    },
  ]);
  const recentTransactions = await Transaction.find({
    $or: [{ receiver: receiverId }, { sender: senderId }],
  })
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    balance: userBalance.balance,
    totalCashIn: totalCashIn[0]?.total || 0,
    totalCashOut: totalCashOut[0]?.total || 0,
    totalCommission: totalCommission[0]?.total || 0,
    recentTransactions,
  };
};

export const TransactionServices = {
  getAllTransactions,
  getMyTransactionsHistory,
  getAgentCommissionHistory,
  getSingleTransaction,
  getAgentStats,
};
