const express = require('express');
const router = express.Router();

//app.js에서 기본 경로에 /customer를 사용하기 때문에 /customer가 기본 경로임

//고객 정보를 위한 라우트
router.get('/',function(req,res){
    res.send('customer 라우트 루트')
})


router.post('/insert',function(req,res){
    res.send('/customer/insert 라우트');
})

router.put('/update',function(req,res){
    res.send('/customer/update 라우트');
})

router.delete('/delete',function(req,res){
    res.send('/customer/delete 라우트');
})

module.exports = router