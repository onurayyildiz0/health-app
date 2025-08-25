class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data) {
      this.data = data;
    }
  }
}

module.exports = ApiResponse;
