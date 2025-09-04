import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionServices } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { JwtPayload } from "jsonwebtoken";

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await TransactionServices.getAllTransactions(
    query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All transactions retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// const getMyTransactionsHistory = catchAsync(
//   async (req: Request, res: Response) => {
//     const user = req.user as JwtPayload;
//     const result = await TransactionServices.getMyTransactionsHistory(
//       user.userId
//     );
//     sendResponse(res, {
//       statusCode: status.OK,
//       success: true,
//       message: "My transactions retrieved successfully",
//       data: result,
//     });
//   }
// );
const getMyTransactionsHistory = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const user = req.user as JwtPayload;
    const result = await TransactionServices.getMyTransactionsHistory(
      user.userId,
      query as Record<string, string>
    );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "My transactions retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAgentCommissionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const agentId = req.user.userId;
    const query = req.query as Record<string, string>;

    const result = await TransactionServices.getAgentCommissionHistory(
      agentId,
      query
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Commission history retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

// const getAgentCommissionHistory = catchAsync(
//   async (req: Request, res: Response) => {
//     const agentId = req.user.userId;
//     const result = await TransactionServices.getAgentCommissionHistory(agentId);
//     sendResponse(res, {
//       statusCode: status.OK,
//       success: true,
//       message: "Wallet retrieved successfully",
//       data: result,
//     });
//   }
// );

const getSingleTransaction = catchAsync(async (req: Request, res: Response) => {
  const transactionId = req.params.id;
  const result = await TransactionServices.getSingleTransaction(transactionId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Transactions retrieved successfully",
    data: result,
  });
});

const getAgentStats = catchAsync(async (req: Request, res: Response) => {
  const agent = req.user;
  const result = await TransactionServices.getAgentStats(agent.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Agent stats fetched successfully",
    data: result,
  });
});

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const result = await TransactionServices.getAdminStats();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin stats fetched successfully",
    data: result,
  });
});

export const TransactionControllers = {
  getAllTransactions,
  getMyTransactionsHistory,
  getAgentCommissionHistory,
  getSingleTransaction,
  getAgentStats,
  getAdminStats
};
