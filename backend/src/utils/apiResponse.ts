import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 400,
  error?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error || message,
  });
};

export const sendPagination = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Fetched successfully'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    },
  });
};
