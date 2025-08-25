const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    const message = errorMessages
      .map((err) => `${err.field}: ${err.message}`)
      .join(", ");
    return next(new ApiError(422, message));
  }

  next();
};

module.exports = validate;
