const express = require('express');
const app = express();
const mongodb = require('./mongoose/index');
const PORT = 443;
const Jobs = require('./mongoose/schemas/Job');
const mongoose = require('mongoose');


// 채용 공고 조회 API
app.get('/jobs', async (req, res) => {
    try {
        const { search, location, experience, sort, page = 1, limit = 10 } = req.query;

        // 필터링 조건 설정
        const query = {};
        if (search) query['제목'] = { $regex: search, $options: 'i' };
        if (location) query['지역'] = location;
        if (experience) query['경력'] = experience;

        // 페이지네이션
        const skip = (page - 1) * limit;

        // 정렬 조건
        const sortOptions = {};
        if (sort) sortOptions[sort] = 1; // 예: '마감일' 기준 정렬

        // 데이터 조회
        const jobs = await Jobs.find(query).sort(sortOptions).skip(skip).limit(parseInt(limit));
        const totalItems = await Jobs.countDocuments(query);

        res.json({
            status: 'success',
            data: jobs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
            },
        });
    } catch (error) {
        console.error('채용 공고 조회 에러:', error.message);
        res.status(500).json({ status: 'error', message: '채용 공고 조회 중 에러가 발생했습니다.' });
    }
});

listen(PORT, () => {
    console.log(`REST API 서버가 ${PORT} 포트에서 시작되었습니다.`);
})