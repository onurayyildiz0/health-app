class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";

    // Error stack trace'ini koru
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
