import type { ApiResponse } from '../interfaces/index.js';
export declare function successResponse<T>(data: T, requestId?: string): ApiResponse<T>;
export declare function errorResponse(error: string, requestId?: string): ApiResponse<never>;
