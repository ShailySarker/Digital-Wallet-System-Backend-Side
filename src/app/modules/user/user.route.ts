import express from "express";
import { validatedRequest } from "../../middlewares/validatedRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = express.Router();

router.post("/register", validatedRequest(createUserZodSchema), UserControllers.createUser);
router.get("/my-profile", checkAuth(...Object.values(Role)), UserControllers.getMyProfile);
router.get("/all-users", checkAuth(Role.ADMIN), UserControllers.getAllUsers);
router.get("/all-agents", checkAuth(Role.ADMIN), UserControllers.getAllAgents);
router.get("/:id", checkAuth(...Object.values(Role)), UserControllers.getSingleUser);
router.patch("/:id", validatedRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser);//Approve/suspend agent(admin only)

export const UserRoutes = router;