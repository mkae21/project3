const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi'); // 검증 라이브러리

const User = require('../mongoose/schemas/User');
const authMiddleware = require('../middlewares/auth');


// Joi를 사용한 요청 데이터 검증 스키마
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().min(8).required(),
    name: Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// 회원 가입
router.post('/register', async (req, res) => {
    const { error } = registerSchema.validate(req.body); // 요청 데이터 검증
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    const { email, password, confirmPassword, name } = req.body;

    // 비밀번호 확인
    if (password !== confirmPassword) {
        return res.status(400).json({ status: 'error', message: '비밀번호가 일치하지 않습니다.' });
    }

    try {
        // 중복 회원 검사
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: '이미 존재하는 이메일입니다.' });
        }

        // 비밀번호 암호화
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 사용자 저장
        const newUser = new User({ email, password: hashedPassword, name });
        await newUser.save();

        res.status(201).json({ status: 'success', message: '회원 가입 성공' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    const { error } = loginSchema.validate(req.body); // 요청 데이터 검증
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        // 사용자 인증
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 'error', message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 비밀번호 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // JWT 발급
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Refresh 토큰 저장
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            status: 'success',
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
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
            return res.status(401).json({ status: 'error', message: '토큰이 만료되었습니다.' });
        }
        console.error('Error:', err.message);
        res.status(401).json({ status: 'error', message: '유효하지 않은 토큰입니다.' });
    }
});

// 프로필 수정 (인증 필요)
router.put('/profile', authMiddleware, async (req, res) => {
    const { name, password } = req.body;
    const userId = req.user.id; // JWT 인증에서 사용자 ID 가져오기

    try {
        const updates = {};
        if (name) updates.name = name;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        res.json({ status: 'success', data: updatedUser });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

module.exports = router;
