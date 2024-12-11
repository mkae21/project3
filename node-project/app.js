const express = require('express');
const app = express();
const mongodb = require('./mongoose/index');
const mongoose = require('mongoose');

const PORT = 443;

// 채용 공고 관련 API
app.use('/jobs', require('./routes/Jobs'));


listen(PORT, () => {
    console.log(`REST API 서버가 ${PORT} 포트에서 시작되었습니다.`);
})