import express from "express";
import { Role } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { cashInValidation, cashOutValidation, depositMoneyValidation, sendMoneyValidation, walletBlockingOrUnblockingValidation, withdrawMoneyValidation } from "./wallet.validation";
import { validatedRequest } from "../../middlewares/validatedRequest";


const router = express.Router();

router.get("/my-wallet", checkAuth(...Object.values(Role)), WalletControllers.getMyWallet);

router.post("/deposit", validatedRequest(depositMoneyValidation), checkAuth(Role.USER), WalletControllers.depositMoney);
router.post("/withdraw", validatedRequest(withdrawMoneyValidation), checkAuth(Role.USER), WalletControllers.withdrawMoney);
router.post("/send-money", validatedRequest(sendMoneyValidation), checkAuth(Role.USER), WalletControllers.sendMoney);

router.post("/cash-in", validatedRequest(cashInValidation), checkAuth(Role.AGENT), WalletControllers.cashIn);
router.post("/cash-out", validatedRequest(cashOutValidation), checkAuth(Role.AGENT), WalletControllers.cashOut);

router.get("/all-wallets", checkAuth(Role.ADMIN), WalletControllers.getAllWallets);
router.patch("/update-status/:id", validatedRequest(walletBlockingOrUnblockingValidation), checkAuth(Role.ADMIN), WalletControllers.walletBlockingOrUnblocking);

router.get("/:id", checkAuth(...Object.values(Role)), WalletControllers.getSingleWallet);

export const WalletRoutes = router;