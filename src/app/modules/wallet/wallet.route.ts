import express from "express";
import { Role } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";
import { checkAuth } from "../../middlewares/checkAuth";


const router = express.Router();

router.get("/:id", checkAuth(...Object.values(Role)), WalletControllers.getSingleWallet);
router.get("/my-wallet", checkAuth((Role.USER, Role.AGENT)), WalletControllers.getMyWallet);

router.get("/all-wallets", checkAuth(Role.ADMIN), WalletControllers.getAllWallets);
router.patch("/block/:id", checkAuth(Role.ADMIN), WalletControllers.blockWallet);

router.post("/deposit", checkAuth(Role.USER), WalletControllers.depositMoney);
router.post("/withdraw", checkAuth(Role.USER), WalletControllers.withdrawMoney);
router.post("/send-money", checkAuth(Role.USER), WalletControllers.sendMoney);

router.post("/cash-in", checkAuth(Role.AGENT), WalletControllers.cashIn);
router.post("/cash-out", checkAuth(Role.AGENT), WalletControllers.cashOut);

export const WalletRoutes = router;