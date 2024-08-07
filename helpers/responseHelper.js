module.exports = {
  generateErrorResponse: (statusCode, message) => {
    return {
      ok: false,
      statusCode: statusCode,
      message,
      timestamp: new Date(),
    };
  },

  generateSuccessResponse: (statusCode, message, data) => {
    return {
      ok: true,
      statusCode,
      message,
      data,
      timestamp: new Date(),
    };
  },
};
