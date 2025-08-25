import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IContact } from "./contact.interface";
import { Contact } from "./contact.model";

const constactUs = async (payload: Partial<IContact>) => {
  const { name, email, phone, subject, message } = payload;
  if (!name || !email || !phone || !subject || !message) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "All fields are required");
  }

  const newMessageInfo = {
    name,
    email,
    phone,
    subject,
    message,
    isIssueSolved: false,
  };

  const newMessageCreate = await Contact.create(newMessageInfo);
  return newMessageCreate;
};

const getAllContactMessage = async () => {
  const allContactMessage = await Contact.find();

  if (allContactMessage.length === 0) {
    throw new AppError(status.NOT_FOUND, "No contact message is available now");
  }
  return allContactMessage;
};

const updateContactMessageStatus = async (
  id: string,
  isIssueSolved: boolean
) => {
  const isMessageAvailable = await Contact.findById(id);

  if (!isMessageAvailable) {
    throw new AppError(status.NOT_FOUND, "Message is not found");
  }

  if (isMessageAvailable.isIssueSolved === isIssueSolved) {
    throw new AppError(status.FORBIDDEN, "Message status is same as before");
  }

  const updatedMessage = await Contact.findByIdAndUpdate(
    id,
    { isIssueSolved: isIssueSolved },
    { new: true, runValidators: true }
  );

  return updatedMessage;
};

export const ContactServices = {
  constactUs,
  getAllContactMessage,
  updateContactMessageStatus,
};
