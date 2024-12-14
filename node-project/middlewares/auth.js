const jwt = require('jsonwebtoken');
const User = require('../mongoose/schemas/User'); // User 스키마 가져오기

module.exports = async (req, res, next) => {
    // Authorization 헤더 확인
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader); // 디버깅용 로그

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Authorization 헤더가 유효하지 않음');
        return res.status(401).json({ status: 'error', message: '유효한 인증 헤더가 필요합니다.' });
    }

    // Bearer 토큰 분리
    const token = authHeader.replace('Bearer ', '').trim();
    console.log('Extracted Token:', token); // 디버깅용 로그

    try {
        // JWT 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded); // 디코딩된 토큰 정보

        // 데이터베이스에서 사용자 정보 조회
        const user = await User.findById(decoded.id).select('-비밀번호'); // 비밀번호 제외
        if (!user) {
            console.error('사용자를 찾을 수 없음');
            return res.status(404).json({ status: 'error', message: '사용자를 찾을 수 없습니다.' });
        }

        // 요청 객체에 사용자 정보 추가
        req.user = {
            id: user._id,
            이메일: user.이메일,
            이름: user.이름,
        };

        next(); // 다음 미들웨어로 전달
    } catch (err) {
        // JWT 검증 실패 시 에러 처리
        console.error('JWT 검증 실패:', err.message); // 에러 로그 출력

        let message = '유효하지 않은 토큰입니다.';
        if (err.name === 'TokenExpiredError') {
            message = '토큰이 만료되었습니다.';
        } else if (err.name === 'JsonWebTokenError') {
            message = '잘못된 토큰 형식입니다.';
        } else if (err.name === 'NotBeforeError') {
            message = '토큰 사용이 허용되지 않았습니다.';
        }

        res.status(401).json({ status: 'error', message });
    }
};
