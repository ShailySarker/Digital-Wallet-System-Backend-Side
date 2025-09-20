import express from "express";
import { validatedRequest } from "../../middlewares/validatedRequest";
import {
  contactUsZodSchema,
  updateContactMessageStatusZodSchema,
} from "./contact.validation";
import { ContactControllers } from "./contact.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
  "/contact-with-us",
  validatedRequest(contactUsZodSchema),
  ContactControllers.contactUs
);
router.get(
  "/all-contact-message",
  checkAuth(Role.ADMIN),
  ContactControllers.getAllContactMessage
);
router.patch(
  "/contact-message/:id",
  checkAuth(Role.ADMIN),
  validatedRequest(updateContactMessageStatusZodSchema),
  ContactControllers.updateContactMessageStatus
);

export const ContactRoutes = router;
