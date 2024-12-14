const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth'); // 인증 미들웨어
const Application = require('../mongoose/schemas/Application');  // Application 모델


// 지원 내역 조회
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id; // 인증된 사용자 ID 가져오기
    const { 상태, 정렬 = 'desc' } = req.query; // 상태와 정렬 파라미터

    try {
        // 필터 조건 생성
        const filter = { userId }; // 사용자별 필터
        if (상태) {
            filter.상태 = 상태; // 상태별 필터 추가
        }

        // 지원 목록 조회
        const applications = await Application.find(filter)
            .sort({ 지원시간: 정렬 === 'asc' ? 1 : -1 }); // 날짜 정렬 (기본: 최신순)

        res.json({
            status: 'success',
            data: applications,
        });
    } catch (err) {
        console.error('지원 내역 조회 오류:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});


router.post('/', authMiddleware, async (req, res) => {
    console.log('Headers:', req.headers);   // 요청 헤더 출력
    console.log('Raw Body:', req.body);    // 요청 본문 출력

    const { 회사명, 링크 } = req.body;
    const userId = req.user.id;

    if (!회사명 || !링크) {
        return res.status(400).json({ status: 'error', message: '회사명과 링크는 필수 입력값입니다.' });
    }

    try {
        const existingApplication = await Application.findOne({ userId, 링크 });
        if (existingApplication) {
            return res.status(400).json({ status: 'error', message: '이미 해당 링크로 지원하셨습니다.' });
        }

        const newApplication = new Application({ userId, 회사명, 링크 });
        await newApplication.save();

        res.status(201).json({
            status: 'success',
            message: '지원 정보가 성공적으로 저장되었습니다.',
            data: newApplication
        });
    } catch (err) {
        console.error('지원하기 오류:', err.message);
        if (err.code === 11000) {
            return res.status(400).json({ status: 'error', message: '해당 링크는 이미 사용 중입니다.' });
        }
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});


// 지원 취소
router.delete('/', authMiddleware, async (req, res) => {
    const { 회사명 } = req.body; // 요청 본문에서 회사명 가져오기
    const userId = req.user.id; // 인증된 사용자 ID

    try {
        // 지원 정보 조회
        const application = await Application.findOne({ userId, 회사명 });

        if (!application) {
            return res.status(404).json({ status: 'error', message: '지원 정보를 찾을 수 없습니다.' });
        }

        // 상태 확인 (이미 취소된 경우)
        if (application.상태 === '취소') {
            return res.status(400).json({ status: 'error', message: '이미 취소된 지원입니다.' });
        }

        // 상태 업데이트
        application.상태 = '취소';
        await application.save();

        res.json({
            status: 'success',
            message: '지원이 취소되었습니다.',
            data: application
        });
    } catch (err) {
        console.error('지원 취소 오류:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});



module.exports = router;
