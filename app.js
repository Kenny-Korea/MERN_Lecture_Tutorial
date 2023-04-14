const express = require("express");
// TODO. req.body를 쉽게 parsing 할 수 있는 미들웨어를 제공하는 라이브러리
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

// TODO. 특정 경로로 요청이 올 때만 해당 route를 사용할 수 있도록 지정
// app.use(placesRoutes); // 왼쪽과 같이 지정하면 모든 경로에 대해 해당 route를 사용하게 됨
app.use("/api/places", placesRoutes); // => /api/places...
app.use("/api/users", usersRoutes);

// TODO. 유효하지 않은 route로 접근했을 때 404 에러 반환하도록 지정
// parameter로 url을 입력하지 않으면 됨
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// TODO. 인자가 4개인 미들웨어 함수는 Express가 오류 처리 미들웨어 함수라고 인식함
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

app.listen(5001);
