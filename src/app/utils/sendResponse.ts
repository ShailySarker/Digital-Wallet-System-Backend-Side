import { Response } from "express";

interface TMeta {
  page: number;
  limit: number;
  totalPage?: number;
  total: number;
  // page: number;
  //   limit: number;
  //   total: number;/
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  counts?: {
    active?: number;
    verified?: number;
    blocked?: number;
    deleted?: number;
    total?: number;
  };
}

interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
}

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    statusCode: data.statusCode,
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};
