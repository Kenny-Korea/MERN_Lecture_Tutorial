const fs = require("fs");

const name = "Kenny";

// TODO. 내장 FileSystem 객체 사용 예시 - writeFile 메소드
// (생성할 파일, 데이터, callback)
// fs.writeFile("user-data.txt", "Name: " + name, (err) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log("Wrote File");
// });

// TODO. 서버 생성하는 법
const http = require("http");
const server = http.createServer((req, res) => {
  console.log("incoming request");
  console.log(req.method);
  console.log(req.url);

  if (req.method === "POST") {
    let body = "";
    req.on("end", () => {
      console.log(body);
      res.end("<h1>Got the POST request</h1>");
    });

    req.on("data", (chunk) => {
      body += chunk;
    });
  }

  // 아래의 string을 html 태그가 아닌 일반 텍스트로 인식하게 하기 위함
  // text/plain or text/html 가능
  res.setHeader("Content-Type", "text/html");
  // res.end("<h1>Success</h1>");
  res.end(
    '<form method="POST"><input type="text" name="username"/><button type="submit"/></form>'
  );
});
server.listen(5001);
