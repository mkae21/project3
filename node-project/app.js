const express = require('express');
const app = express();
const mongodb = require('./mongoose/index');
const mongoose = require('mongoose');

// MongoDB 연결
mongodb.connect();
app.use(express.json()); // JSON 요청 데이터 처리

// 채용 공고 관련 API
app.use('/jobs', require('./routes/Jobs'));
app.use('/auth',require('./routes/Auth'))

// 서버 실행
const PORT = 443;
app.listen(PORT, () => {
    console.log(`REST API 서버가 ${PORT} 포트에서 시작되었습니다.`);
});
