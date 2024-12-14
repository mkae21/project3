const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi'); // 검증 라이브러리

const User = require('../mongoose/schemas/User');
const authMiddleware = require('../middlewares/auth');

// Joi를 사용한 요청 데이터 검증 스키마
const registerSchema = Joi.object({
    이메일: Joi.string().email().required(),
    비밀번호: Joi.string().min(4).required(),
    비밀번호확인: Joi.string().min(4).required(),
    이름: Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
    이메일: Joi.string().email().required(),
    비밀번호: Joi.string().required(),
});

// 회원 가입
router.post('/register', async (req, res) => {
    const { error } = registerSchema.validate(req.body); // 요청 데이터 검증
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    const { 이메일, 비밀번호, 비밀번호확인, 이름 } = req.body;

    // 비밀번호 확인
    if (비밀번호 !== 비밀번호확인) {
        return res.status(400).json({ status: 'error', message: '비밀번호가 일치하지 않습니다.' });
    }

    try {
        // 중복 회원 검사 (대소문자 구분 제거)
        const existingUser = await User.findOne({ 이메일: { $regex: `^${이메일}$`, $options: 'i' } });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: '이미 사용 중인 이메일입니다.' });
        }

        // 비밀번호 암호화
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(비밀번호, salt);
        console.log("암호화된 비밀번호:", hashedPassword); // 디버깅용 로그

        // 사용자 저장
        const newUser = new User({ 이메일, 비밀번호: hashedPassword, 이름 });
        await newUser.save();

        res.status(201).json({ status: 'success', message: '회원 가입 성공' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    // 요청 데이터 검증
    const { error } = loginSchema.validate(req.body); 
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    const { 이메일, 비밀번호 } = req.body;

    try {
        // 사용자 인증: 이메일로 사용자 검색 (대소문자 구분 없이)
        const user = await User.findOne({ 이메일: { $regex: `^${이메일}$`, $options: 'i' } });
        if (!user) {
            return res.status(400).json({ status: 'error', message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 비밀번호 확인
        const isMatch = await bcrypt.compare(비밀번호, user.비밀번호);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: '비밀번호가 올바르지 않습니다.' });
        }

        // JWT 발급
        const accessToken = jwt.sign(
            { id: user._id },                  // Payload에 사용자 ID 포함
            process.env.JWT_SECRET,           // 비밀키
            { expiresIn: '1h' }               // Access Token 만료 시간
        );

        const refreshToken = jwt.sign(
            { id: user._id },                  // Payload에 사용자 ID 포함
            process.env.JWT_SECRET,           // 비밀키
            { expiresIn: '7d' }               // Refresh Token 만료 시간
        );

        // 사용자 정보 업데이트: Refresh Token과 마지막 로그인 시간 저장
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();          // 현재 시간 저장
        await user.save();                    // 데이터베이스에 저장

        // 성공 응답
        res.json({
            status: 'success',
            accessToken,                       // 새로 발급된 Access Token
            refreshToken,                      // 새로 발급된 Refresh Token
        });
    } catch (err) {
        console.error('Error:', err.message);  // 오류 로그 출력
        res.status(500).json({ status: 'error', message: '서버 오류 발생' }); // 서버 오류 응답
    }
});


// 토큰 갱신
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ status: 'error', message: 'Refresh 토큰이 필요합니다.' });
    }

    try {
        // Refresh 토큰 검증
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ status: 'error', message: '유효하지 않은 토큰입니다.' });
        }

        // 새로운 Access 토큰 발급
        const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            status: 'success',
            accessToken: newAccessToken,
        });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 'error', message: 'Refresh 토큰이 만료되었습니다.' });
        }
        console.error('Error:', err.message);
        res.status(401).json({ status: 'error', message: '유효하지 않은 토큰입니다.' });
    }
});

// 프로필 수정 (인증 필요)
router.put('/profile', authMiddleware, async (req, res) => {
    const { 이름, 비밀번호 } = req.body;
    const userId = req.user.id; // JWT 인증에서 사용자 ID 가져오기

    try {
        const updates = {};
        if (이름) updates.이름 = 이름;
        if (비밀번호) {
            const salt = await bcrypt.genSalt(10);
            updates.비밀번호 = await bcrypt.hash(비밀번호, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-비밀번호');
        res.json({ status: 'success', data: updatedUser });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});


// 회원 정보 조회 (인증 필요)
router.get('/profile', authMiddleware, async (req, res) => {
    const userId = req.user.id; // JWT 인증에서 사용자 ID 가져오기

    try {
        const user = await User.findById(userId).select('-비밀번호 -refreshToken'); // 비밀번호 및 Refresh Token 제외
        if (!user) {
            return res.status(404).json({ status: 'error', message: '사용자를 찾을 수 없습니다.' });
        }

        res.json({ status: 'success', data: user });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

// 회원 탈퇴 (인증 필요)
router.delete('/profile', authMiddleware, async (req, res) => {
    const userId = req.user.id; // JWT 인증에서 사용자 ID 가져오기

    try {
        const user = await User.findByIdAndDelete(userId); // 사용자 삭제
        if (!user) {
            return res.status(404).json({ status: 'error', message: '사용자를 찾을 수 없습니다.' });
        }

        res.json({ status: 'success', message: '회원 탈퇴가 완료되었습니다.' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});


module.exports = router;
