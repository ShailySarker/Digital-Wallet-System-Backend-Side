import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { Transaction } from "./transaction.model";
import { Wallet } from "../wallet/wallet.model";
import { QueryOptions } from "mongoose";
import { User } from "../user/user.model";

const getAllTransactions = async (query: Record<string, string>) => {
  // Build the base filter for database-level filtering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbFilter: any = {};

  // Apply filters that can be handled at the database level
  if (query.type) dbFilter.type = query.type;
  if (query.status) dbFilter.status = query.status;

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
        populate: { path: "user", select: "name phone email role" },
      },
      {
        path: "toWallet",
        populate: { path: "user", select: "name phone email role" },
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
        transformed.fromWalletEmail = transaction.fromWallet.user.email;
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
        transformed.toWalletEmail = transaction.toWallet.user.email;
        transformed.toWalletRole = transaction.toWallet.user.role;
      }
      delete transformed.toWallet;
    }

    // Extract initiatedBy data if needed
    if (transaction.initiatedBy && typeof transaction.initiatedBy === "object") {
      transformed.initiatedBy = transaction.initiatedBy._id;
      transformed.initiatedByPhone = transaction.initiatedBy.phone;
      transformed.initiatedByRole = transaction.initiatedBy.role;
    }

    return transformed;
  });

  // Apply search filtering on the FULL transformed dataset
  let filteredData = transformedData;

  // Single search term that searches across all fields
  if (query.searchTerm) {
    const searchTermLower = query.searchTerm.toLowerCase();
    filteredData = filteredData.filter((item) => {
      return (
        // Transaction fields
        (item.type && item.type.toLowerCase().includes(searchTermLower)) ||
        (item.status && item.status.toLowerCase().includes(searchTermLower)) ||
        (item.amount && item.amount.toString().includes(searchTermLower)) ||
        (item.commission && item.commission.toString().includes(searchTermLower)) ||
        
        // Sender fields
        (item.fromWalletSender && item.fromWalletSender.toLowerCase().includes(searchTermLower)) ||
        (item.fromWalletPhone && item.fromWalletPhone.includes(searchTermLower)) ||
        (item.fromWalletEmail && item.fromWalletEmail.toLowerCase().includes(searchTermLower)) ||
        (item.fromWalletRole && item.fromWalletRole.toLowerCase().includes(searchTermLower)) ||
        
        // Receiver fields
        (item.toWalletReceiver && item.toWalletReceiver.toLowerCase().includes(searchTermLower)) ||
        (item.toWalletPhone && item.toWalletPhone.includes(searchTermLower)) ||
        (item.toWalletEmail && item.toWalletEmail.toLowerCase().includes(searchTermLower)) ||
        (item.toWalletRole && item.toWalletRole.toLowerCase().includes(searchTermLower)) ||
        
        // Date field (format: MM/DD/YYYY or other formats)
        (item.createdAt && new Date(item.createdAt).toLocaleDateString().includes(searchTermLower))
      );
    });
  }

  // Individual filter fields (for backward compatibility)
  if (query.fromWalletSender) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletSender &&
        item.fromWalletSender.toLowerCase().includes(query.fromWalletSender.toLowerCase())
    );
  }

  if (query.fromWalletPhone) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletPhone &&
        item.fromWalletPhone.includes(query.fromWalletPhone)
    );
  }

  if (query.fromWalletEmail) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletEmail &&
        item.fromWalletEmail.toLowerCase().includes(query.fromWalletEmail.toLowerCase())
    );
  }

  if (query.fromWalletRole) {
    filteredData = filteredData.filter(
      (item) =>
        item.fromWalletRole &&
        item.fromWalletRole.toLowerCase().includes(query.fromWalletRole.toLowerCase())
    );
  }

  if (query.toWalletReceiver) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletReceiver &&
        item.toWalletReceiver.toLowerCase().includes(query.toWalletReceiver.toLowerCase())
    );
  }

  if (query.toWalletPhone) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletPhone &&
        item.toWalletPhone.includes(query.toWalletPhone)
    );
  }

  if (query.toWalletEmail) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletEmail &&
        item.toWalletEmail.toLowerCase().includes(query.toWalletEmail.toLowerCase())
    );
  }

  if (query.toWalletRole) {
    filteredData = filteredData.filter(
      (item) =>
        item.toWalletRole &&
        item.toWalletRole.toLowerCase().includes(query.toWalletRole.toLowerCase())
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

const getMyTransactionsHistory = async (
  userId: string,
  options: Record<string, string | number>
) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  // Sorting
  const sortBy = ["createdAt", "amount", "commission"].includes(
    options.sortBy as string
  )
    ? options.sortBy
    : "createdAt";

  const sortOrder = options.sortOrder === "asc" ? "asc" : "desc";

  // Filtering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  // Type filter
  if (options.type && options.type !== "all") {
    filter.type = options.type;
  }

  // Status filter
  if (options.status && options.status !== "all") {
    filter.status = options.status;
  }

  const skip = (page - 1) * limit;

  // Build sort object
  const sortOptions: Record<string, 1 | -1> = {
    [sortBy as string]: sortOrder === "asc" ? 1 : -1,
  };

  // Find user's wallet
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new AppError(status.NOT_FOUND, "No wallet is found");
  }

  // Add wallet filter
  filter.$or = [{ fromWallet: wallet._id }, { toWallet: wallet._id }];

  const transactions = await Transaction.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
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

  const total = await Transaction.countDocuments(filter);

  // Transform data for better frontend consumption
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = transactions.map((transaction: any) => {
    const transformed = transaction.toObject();

    // Determine if user is sender or receiver
    // const isReceiver =
    //   transaction.toWallet?._id?.toString() === wallet._id.toString();
    // transformed.direction = isReceiver ? "incoming" : "outgoing";

    // const isSender =
    // transaction.fromWallet?._id?.toString() === wallet._id.toString();
    // transformed.direction = isSender ? "outgoing" : "incoming";
    // console.log(isSender)

    // self transaction
    const isItSelfTransaction =
      transaction.fromWallet?._id?.toString() === wallet._id.toString() &&
      transaction.toWallet?._id?.toString() === wallet._id.toString();
    const isSender =
      transaction.fromWallet?._id?.toString() === wallet._id.toString() &&
      transaction.toWallet?._id?.toString() !== wallet._id.toString();

    if (isItSelfTransaction) {
      transformed.direction = "self";
    } else if (isSender) {
      transformed.direction = "outgoing";
    } else {
      transformed.direction = "incoming";
    }

    // Flatten fromWallet data
    if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
      transformed.fromWalletId = transaction.fromWallet._id;
      if (transaction.fromWallet.user) {
        transformed.senderName = transaction.fromWallet.user.name;
        transformed.senderPhone = transaction.fromWallet.user.phone;
        transformed.senderRole = transaction.fromWallet.user.role;
      }
    }

    // Flatten toWallet data
    if (transaction.toWallet && typeof transaction.toWallet === "object") {
      transformed.toWalletId = transaction.toWallet._id;
      if (transaction.toWallet.user) {
        transformed.receiverName = transaction.toWallet.user.name;
        transformed.receiverPhone = transaction.toWallet.user.phone;
        transformed.receiverRole = transaction.toWallet.user.role;
      }
    }

    // Flatten initiatedBy
    if (
      transaction.initiatedBy &&
      typeof transaction.initiatedBy === "object"
    ) {
      transformed.initiatedById = transaction.initiatedBy._id;
      transformed.initiatedByPhone = transaction.initiatedBy.phone;
      transformed.initiatedByRole = transaction.initiatedBy.role;
    }

    return transformed;
  });
  // console.log(transformedData);

  return {
    data: transformedData,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getAgentCommissionHistory = async (
  agentId: string,
  options: QueryOptions = {}
) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  // Allow sorting by createdAt, amount, or commission
  const sortBy = ["createdAt", "amount", "commission"].includes(
    options.sortBy as string
  )
    ? options.sortBy
    : "createdAt";

  const sortOrder = options.sortOrder === "asc" ? "asc" : "desc";

  const skip = (page - 1) * limit;

  // Build sort object dynamically
  const sortOptions: Record<string, 1 | -1> = {
    [sortBy as string]: sortOrder === "asc" ? 1 : -1,
  };

  // Add commission filter to only show transactions with commission
  const query = {
    initiatedBy: agentId,
    commission: { $gt: 0 },
  };

  const myCommissions = await Transaction.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
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

  const total = await Transaction.countDocuments(query);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedData = myCommissions.map((transaction: any) => {
    const transformed = transaction.toObject();

    // Flatten fromWallet
    if (transaction.fromWallet && typeof transaction.fromWallet === "object") {
      transformed.fromWalletId = transaction.fromWallet._id;
      if (transaction.fromWallet.user) {
        transformed.fromWalletSender = transaction.fromWallet.user.name;
        transformed.fromWalletPhone = transaction.fromWallet.user.phone;
        transformed.fromWalletRole = transaction.fromWallet.user.role;
      }
    }

    // Flatten toWallet
    if (transaction.toWallet && typeof transaction.toWallet === "object") {
      transformed.toWalletId = transaction.toWallet._id;
      if (transaction.toWallet.user) {
        transformed.toWalletReceiver = transaction.toWallet.user.name;
        transformed.toWalletPhone = transaction.toWallet.user.phone;
        transformed.toWalletRole = transaction.toWallet.user.role;
      }
    }

    // Flatten initiatedBy
    if (
      transaction.initiatedBy &&
      typeof transaction.initiatedBy === "object"
    ) {
      transformed.initiatedById = transaction.initiatedBy._id;
      transformed.initiatedByPhone = transaction.initiatedBy.phone;
      transformed.initiatedByRole = transaction.initiatedBy.role;
    }

    return transformed;
  });

  return {
    data: transformedData,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getSingleTransaction = async (transactionId: string) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new AppError(status.NOT_FOUND, "Transaction is not found");
  }

  return transaction;
};

const getAgentStats = async (agentId: string) => {
  const wallet = await Wallet.findOne({ user: agentId });
  if (!wallet) {
    throw new AppError(status.NOT_FOUND, "Wallet is not found");
  }

  // Aggregate totals
  const stats = await Transaction.aggregate([
    {
      $match: {
        $or: [{ toWallet: wallet._id }, { fromWallet: wallet._id }],
      },
    },
    {
      $group: {
        _id: "$type", // group by type (CASH_IN / CASH_OUT)
        totalAmount: { $sum: "$amount" },
        totalCommission: { $sum: "$commission" },
      },
    },
  ]);

  // Normalize results
  let totalCashIn = 0;
  let totalCashOut = 0;
  let totalCommission = 0;

  stats.forEach((stat) => {
    if (stat._id === "CASH_IN") {
      totalCashIn = stat.totalAmount;
    } else if (stat._id === "CASH_OUT") {
      totalCashOut = stat.totalAmount;
    }
    totalCommission += stat.totalCommission ?? 0;
  });

  return {
    balance: wallet.balance,
    totalCashIn,
    totalCashOut,
    totalCommission,
  };
};

const getAdminStats = async () => {
  const totalUsers = await User.countDocuments({ role: "USER" });
  const totalAgents = await User.countDocuments({ role: "AGENT" });
  const totalTransactions = await Transaction.countDocuments({});
  const totalTransactionsAmount = await Transaction.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const roleBasedPieChartData = await User.aggregate([
    { $match: { role: { $ne: "admin" } } },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        role: "$_id",
        count: 1,
      },
    },
  ]);

  const transactionTypeBasedBarChartData = await Transaction.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        type: "$_id",
        count: 1,
      },
    },
  ]);

  return {
    totalUsers,
    totalAgents,
    totalTransactions,
    totalTransactionsAmount: totalTransactionsAmount[0]?.total || 0,
    roleBasedPieChartData,
    transactionTypeBasedBarChartData,
  };
};

export const TransactionServices = {
  getAllTransactions,
  getMyTransactionsHistory,
  getAgentCommissionHistory,
  getSingleTransaction,
  getAgentStats,
  getAdminStats,
};
