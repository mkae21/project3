const express = require('express');
const router = express.Router();
const Job = require('../mongoose/schemas/Job');


router.get('/', async (req, res) => {0
    const { page = 1, limit = 20 } = req.query; // 페이지와 페이지 크기(default 설정)

    try {
        // MongoDB에서 데이터를 가져오되, 페이지네이션 적용
        const jobs = await Job.find()
            .skip((page - 1) * limit) // 해당 페이지의 시작점 건너뛰기
            .limit(parseInt(limit)); // 페이지 크기만큼만 데이터 가져오기

        // 전체 데이터 개수를 계산하여 페이지네이션 정보 포함
        const total = await Job.countDocuments();

        // 결과 반환
        res.json({
            status: 'success',
            data: jobs,
            pagination: {
                currentPage: parseInt(page), // 현재 페이지
                totalPages: Math.ceil(total / limit), // 총 페이지 수
                totalItems: total, // 전체 데이터 개수
            },
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
});