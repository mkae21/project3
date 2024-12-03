const mongoose = require('mongoose');

const connect = async () => {
    if (process.env.NODE_ENV !== 'production') {
        mongoose.set('debug', true); // 개발 환경에서 디버그 모드 활성화
    }

    try {
        await mongoose.connect('mongodb://root:1234@localhost:27017/admin', {
            dbName: 'dev', // 사용할 데이터베이스 이름
        });
        console.log("MongoDB 연결 성공: localhost:27017/admin");
    } catch (error) {
        console.error("MongoDB 연결 에러:", error);
    }
};

// MongoDB 연결 이벤트 처리
mongoose.connection.on('error', (error) => {
    console.error("MongoDB 연결 에러:", error);
});

mongoose.connection.on('disconnected', () => {
    console.error("MongoDB 연결이 종료되었습니다. 연결을 재시도합니다.");
    connect(); // 연결 재시도
});

module.exports = { connect };
