const express = require("express");
const app = express();

app.use(
  express.json({
    limit: "50mb",
  })
);

app.get("/", function (req, res) {
  res.send("get으로 /요청에대한 답장");
});

app.post("/customer", (req, res) => {
  res.send(req.body.param);
  console.log("post으로 /customer에 요청에 대한 답장");
});

app.listen(3000,()=>{
    console.log("서버 실행")
})