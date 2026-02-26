// Standardized API response formatter
export const formatResponse = (success, message, data = null, statusCode = 200) => {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString()
    };

    if (data !== null) {
        response.data = data;
    }

    return response;
};

export const sendSuccess = (res, message, data = null, statusCode = 200) => {
    const response = formatResponse(true, message, data, statusCode);
    return res.status(statusCode).json(response);
};

export const sendError = (res, message, statusCode = 500, errors = null) => {
    const response = formatResponse(false, message, null, statusCode);
    
    if (errors) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

export const sendValidationError = (res, message, errors) => {
    return sendError(res, message, 400, errors);
};

export const sendUnauthorizedError = (res, message = 'Unauthorized') => {
    return sendError(res, message, 401);
};

export const sendForbiddenError = (res, message = 'Forbidden') => {
    return sendError(res, message, 403);
};

export const sendNotFoundError = (res, message = 'Resource not found') => {
    return sendError(res, message, 404);
};

export const sendConflictError = (res, message = 'Resource already exists') => {
    return sendError(res, message, 409);
};

export const sendInternalServerError = (res, message = 'Internal server error') => {
    return sendError(res, message, 500);
};
