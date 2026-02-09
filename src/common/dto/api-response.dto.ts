import type { ApiResponse } from '../interfaces/index.js';

export function successResponse<T>(data: T, requestId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId,
  };
}

export function errorResponse(
  error: string,
  requestId?: string,
): ApiResponse<never> {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    requestId,
  };
}
