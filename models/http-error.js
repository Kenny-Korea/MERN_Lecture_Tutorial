// TODO. Model은 데이터 객체 정의를 담당

class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Add a "message" property
    this.code = errorCode; // Adds a "code" property
  }
}

module.exports = HttpError;
