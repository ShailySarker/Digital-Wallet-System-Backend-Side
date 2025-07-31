import express from "express";


const router = express.Router();

// router.get("/all-transactions", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllTransactions);
// router.get("/my-transactions", checkAuth((Role.USER, Role.AGENT)), UserControllers.getMyTransactions);
// router.get("/commissions", checkAuth(Role.AGENT), UserControllers.getAgentCommissionHistory);
// router.get("/:id", checkAuth(...Object.values(Role)), UserControllers.getSingleTransaction);

export const TransactionRoutes = router;