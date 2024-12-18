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

        // 조회된 문서들의 ID 목록 추출
        const jobIds = jobs.map(job => job._id);

        // 조회수 증가 (viewCount + 1)
        if (jobIds.length > 0) {
            await Job.updateMany(
                { _id: { $in: jobIds } }, // 검색된 문서들
                { $inc: { 조회수: 1 } } // 조회수 증가
            );
        }

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

//공고 추가
router.post('/', async (req, res) => {
    console.log(req.body); // 요청 데이터를 출력
    const { 제목,회사명,지역,경력,직무분야,연봉정보,조회수,마감일,링크 } = req.body;

    try {
        //추가
        const existingJob = await Job.findOne({ 링크: req.body.링크 });
        if (existingJob) {
            return res.status(400).json({ status: 'error', message: '링크가 이미 존재합니다.' });
        }

        const newJob = new Job({제목,회사명,지역,경력,직무분야,연봉정보,조회수,마감일,링크});
        await newJob.save();
        res.status(201).json({ status: 'success', data: newJob });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
});

//공고 수정
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedJob = await Job.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedJob) {
            return res.status(404).json({ status: 'error', message: '공고를 찾을 수 없습니다.' });
        }

        res.json({ status: 'success', data: updatedJob });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
});

//공고 삭제
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedJob = await Job.findByIdAndDelete(id);

        if (!deletedJob) {
            return res.status(404).json({ status: 'error', message: '공고를 찾을 수 없습니다.' });
        }

        res.json({ status: 'success', message: '공고가 삭제되었습니다.' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
});


module.exports = router;
