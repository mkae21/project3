const express = require('express');
const customerRoute = require('./routes/customers');
const productRoute = require('./routes/product');
const app = express()

app.use(express.json({
    limit:'50mb'
}));// 클라이언트 요청 body를 json으로 파싱 처리

app.listen(3000,()=>{
    console.log('Server started. port 3000.')
})

app.use('/customer',customerRoute); //cutomer 라우트를 추가하고 기본경로 /customer로 설정
app.use('/product',productRoute);// product 라우트 추가 및 기본경로 /product로 설정