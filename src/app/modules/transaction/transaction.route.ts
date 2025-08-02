import express from "express";
import { TransactionControllers } from "./transaction.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";


const router = express.Router();

router.get("/my-transactions", checkAuth(Role.USER, Role.AGENT), TransactionControllers.getMyTransactionsHistory);
router.get("/all-transactions", checkAuth(Role.ADMIN), TransactionControllers.getAllTransactions);
router.get("/commissions", checkAuth(Role.AGENT), TransactionControllers.getAgentCommissionHistory);
router.get("/:id", checkAuth(...Object.values(Role)), TransactionControllers.getSingleTransaction);

export const TransactionRoutes = router;