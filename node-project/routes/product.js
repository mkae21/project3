const express = require('express');
const router = express.Router();


//app.js에서 /product로 기본 경로 설정 상황

router.get('/',function(req,res){
    res.send('product 라우트 루트');
})

router.post('/insert',function(req,res){
    res.send('/product/insert 라우트');
})

router.put('/update',function(req,res){
    res.send('/product/update 라우트');
})

router.delete('/delete',function(req,res){
    res.send('/product/delete 라우트')
})