const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/user", (req, res, next) => {
  console.log("POST");
  res.send("<h1> POST: " + req.body.username + "</h1>");
});

app.get("/", (req, res, next) => {
  console.log("GET");
  res.send(
    '<form action="/user" method="POST"><input type="text" name="username"/><button type="submit">submit</button></form>'
  );
});

// 미들웨어
// app.use((req, res, next) => {
//   let body = "";
//   req.on("end", () => {
//     const userName = body.split("=")[1];
//     if (userName) {
//       req.body = { name: userName };
//     }
//     next();
//   });
//   req.on("data", (chunk) => {
//     body += chunk;
//   });
// });

// app.use((req, res, next) => {
//   if (req.body) {
//     return res.send("<h1>" + req.body.name + "</h1>");
//   }
//   res.send(
//     '<form method="POST"><input type="text" name="username"/><button type="submit">submit</button></form>'
//   );
// });

app.listen(5001);
