const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ status: 'error', message: '인증이 필요합니다.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 사용자 정보를 요청 객체에 추가
        next();
    } catch (err) {
        res.status(401).json({ status: 'error', message: '유효하지 않은 토큰입니다.' });
    }
};
