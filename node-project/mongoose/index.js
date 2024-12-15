require('dotenv').config(); // .env 파일 로드

const mongoose = require('mongoose');

const connect = async () => {
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true);
    }

    const user = process.env.DB_USER;
    const pass = process.env.DB_PASS;
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    const dbName = process.env.DB_NAME;

    const uri = `mongodb://${user}:${pass}@${host}:${port}/admin`; // admin DB 인증
    
    try {
        await mongoose.connect(uri, { dbName });
        console.log(`MongoDB 연결 성공: ${host}:${port}/${dbName}`);
    } catch (error) {
        console.error("MongoDB 연결 에러:", error);
    }
};

mongoose.connection.on('error', (error) => {
    console.error("MongoDB 연결 에러:", error);
});

mongoose.connection.on('disconnected', () => {
    console.error("MongoDB 연결이 종료되었습니다. 연결을 재시도합니다.");
    connect();
});

module.exports = { connect };
