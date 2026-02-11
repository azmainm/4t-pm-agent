"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
function successResponse(data, requestId) {
    return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId,
    };
}
function errorResponse(error, requestId) {
    return {
        success: false,
        error,
        timestamp: new Date().toISOString(),
        requestId,
    };
}
//# sourceMappingURL=api-response.dto.js.map