const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

// 404 Handler
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Endpoint bulunamadı - ${req.originalUrl}`);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Geçersiz ID formatı";
    error = new ApiError(400, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Bu bilgiler zaten kayıtlı";
    error = new ApiError(400, message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ApiError(400, message);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Geçersiz token";
    error = new ApiError(401, message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token süresi dolmuş";
    error = new ApiError(401, message);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Sunucu hatası";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
