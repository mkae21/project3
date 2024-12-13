const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Authorization 헤더 확인
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader); // 디버깅용 로그

    // Authorization 헤더가 존재하고 Bearer로 시작하는지 확인
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

        // 요청 객체에 사용자 정보 추가
        req.user = decoded;
        next();
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
