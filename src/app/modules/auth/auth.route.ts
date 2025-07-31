import express from "express";


const router = express.Router();

// router.post("/login", AuthControllers.credentialsLogin);
// router.post("/refresh-token", AuthControllers.getNewAccessToken);
// router.post("/logout", AuthControllers.logout);
// router.post("/change-password", checkAuth(...Object.values(Role)), AuthControllers.changePassword);
// router.post("/set-password", checkAuth(...Object.values(Role)), AuthControllers.setPassword);
// router.post("/forgot-password", AuthControllers.forgotPassword);
// router.post("/reset-password", checkAuth(...Object.values(Role)), AuthControllers.resetPassword);

export const AuthRoutes = router;