/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

import { ContactServices } from "./contact.service";

const contactUs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const messageInfo = await ContactServices.constactUs(body);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Message send successfully",
      data: messageInfo
    });
  }
);

const getAllContactMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ContactServices.getAllContactMessage();

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "All contact message info retrieved successfully",
      data: result
    });
  }
);


const updateContactMessageStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { isIssueSolved } = req.body;

    const result = await ContactServices.updateContactMessageStatus(
      id,
      isIssueSolved
    );

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Contact message status updated successfully",
      data: result,
    });
  }
);

export const ContactControllers = {
  contactUs,
  getAllContactMessage,
  updateContactMessageStatus,
};
