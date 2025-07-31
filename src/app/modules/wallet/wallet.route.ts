import express from "express";


const router = express.Router();

// router.get("/all-wallets", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers);
// router.get("/my-wallet", checkAuth((Role.USER, Role.AGENT)), UserControllers.getMyWallet);
// router.get("/:id", checkAuth(...Object.values(Role)), UserControllers.getSingleWallet);

export const WalletRoutes = router;