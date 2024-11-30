const express = require("express");
const app = express();
const port = 3000;

//get방식으로 /로 요청이 오면 응답함
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//port에 대한 요청 기다림
app.listen(port, () => {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
});
