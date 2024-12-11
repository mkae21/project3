const express = require('express');
const router = express.Router();
const Job = require('../mongoose/schemas/Job');

router.get('/', async (req, res) => {
    const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt', // 정렬 기준 변경 (default: createdAt)
        order = 'desc', // 정렬 순서
        지역, // 지역별 필터링
        경력, // 경력별 필터링
        minSalary,
        maxSalary,
        직무분야, // 기술 스택
        keyword, // 키워드 검색
        회사명, // 회사명 검색
        제목, // 제목 검색
    } = req.query;

    try {
        // 필터링 조건
        const query = {};

        if (지역) query.지역 = { $regex: 지역, $options: 'i' }; // 지역 필터링
        if (경력) query.경력 = { $regex: 경력, $options: 'i' }; // 경력 필터링

        if (minSalary || maxSalary) {
            query.연봉정보 = {};
            if (minSalary) query.연봉정보.$gte = parseInt(minSalary);
            if (maxSalary) query.연봉정보.$lte = parseInt(maxSalary);
        }

        if (직무분야) query.직무분야 = { $in: 직무분야.split(',') }; // 직무분야 필터링

        if (keyword) {
            query.$or = [
                { 직무분야: { $regex: keyword, $options: 'i' } }, // 직무분야에서 검색
                { 회사명: { $regex: keyword, $options: 'i' } }, // 회사명에서 검색
            ];
        }

        if (회사명) query.회사명 = { $regex: 회사명, $options: 'i' }; // 회사명 필터링
        if (제목) query.제목 = { $regex: 제목, $options: 'i' }; // 제목 필터링
        // MongoDB 쿼리 실행 (페이지네이션, 정렬)
        const jobs = await Job.find(query)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 }) // 정렬
            .skip((page - 1) * limit) // 페이지 건너뛰기
            .limit(parseInt(limit)); // 페이지 크기

        // 총 문서 수 계산
        const total = await Job.countDocuments(query);

        // 결과 반환
        res.json({
            status: 'success',
            data: jobs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
            },
        });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. 상세 정보 제공
        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({ status: 'error', message: '공고를 찾을 수 없습니다.' });
        }

        // 2. 조회수 증가
        await Job.findByIdAndUpdate(id, { $inc: { views: 1 } });

        // 3. 관련 공고 추천
        const relatedJobs = await Job.find({
            _id: { $ne: id }, // 현재 공고 제외
            $or: [
                { 직무분야: job.직무분야 }, // 동일 직무분야
                { 지역: job.지역 }, // 동일 지역
                { 회사명: job.회사명 }, // 동일 회사
            ],
        })
            .limit(5); // 관련 공고 최대 5개

        // 결과 반환
        res.json({
            status: 'success',
            data: {
                job, // 상세 공고 정보
                relatedJobs, // 관련 공고 추천
            },
        });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

module.exports = router;
