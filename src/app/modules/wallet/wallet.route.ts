import express from "express";
import { Role } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { blockWalletValidation, cashInValidation, cashOutValidation, depositMoneyValidation, sendMoneyValidation, withdrawMoneyValidation } from "./wallet.validation";
import { validatedRequest } from "../../middlewares/validatedRequest";


const router = express.Router();


router.get("/:id", checkAuth(...Object.values(Role)), WalletControllers.getSingleWallet);
router.get("/my-wallet", checkAuth((Role.USER, Role.AGENT)), WalletControllers.getMyWallet);

router.get("/all-wallets", checkAuth(Role.ADMIN), WalletControllers.getAllWallets);
router.patch("/block/:id", validatedRequest(blockWalletValidation), checkAuth(Role.ADMIN), WalletControllers.blockWallet);

router.post("/deposit", validatedRequest(depositMoneyValidation), checkAuth(Role.USER), WalletControllers.depositMoney);
router.post("/withdraw", validatedRequest(withdrawMoneyValidation), checkAuth(Role.USER), WalletControllers.withdrawMoney);
router.post("/send-money", validatedRequest(sendMoneyValidation), checkAuth(Role.USER), WalletControllers.sendMoney);

router.post("/cash-in", validatedRequest(cashInValidation), checkAuth(Role.AGENT), WalletControllers.cashIn);
router.post("/cash-out", validatedRequest(cashOutValidation), checkAuth(Role.AGENT), WalletControllers.cashOut);


export const WalletRoutes = router;