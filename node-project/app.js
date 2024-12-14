const express = require('express');
const app = express();
const mongodb = require('./mongoose/index');
require('dotenv').config(); // .env 파일 로드 -> jwt 인증 환경 변수

// MongoDB 연결
mongodb.connect();
app.use(express.json()); // JSON 요청 데이터 처리

// 채용 공고 관련 API
app.use('/jobs', require('./routes/Jobs'));
//회원 정보 관련 API
app.use('/auth',require('./routes/Auth'))
//지원 정보 관련 API
app.use('/applications',require('./routes/Application'))
//Bookmark 관련 API
app.use('/bookmarks',require('./routes/Bookmark'))
//Company 관련 API
app.use('/companies',require('./routes/Company'))
// 서버 실행
const PORT = 443;


app.listen(PORT, () => {
    console.log(`REST API 서버가 ${PORT} 포트에서 시작되었습니다.`);
});
