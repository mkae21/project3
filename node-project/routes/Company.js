const express = require('express');
const router = express.Router();
const Company = require('../mongoose/schemas/Company'); // Company 스키마

// 1. 회사 목록 조회 (GET /companies)
router.get('/', async (req, res) => {
    const { 지역, 직무분야, 회사명 } = req.query;

    try {
        const filter = {};
        if (지역) filter.지역 = 지역;
        if (직무분야) filter.직무분야 = 직무분야;
        if (회사명) filter.회사명 = new RegExp(회사명, 'i'); // 회사명을 부분 검색

        // 회사 목록 조회
        const companies = await Company.find(filter);
        res.json({
            status: 'success',
            data: companies,
        });
    } catch (err) {
        console.error('회사 목록 조회 오류:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

// 2. 회사 상세 조회 (GET /companies/:id)
router.get('/:id', async (req, res) => {
    const companyId = req.params.id;

    try {
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ status: 'error', message: '회사를 찾을 수 없습니다.' });
        }

        res.json({
            status: 'success',
            data: company,
        });
    } catch (err) {
        console.error('회사 상세 조회 오류:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

// 3. 회사 추가 (POST /companies)
router.post('/', async (req, res) => {
    const { 회사명, 링크, 지역, 직무분야, 연봉정보 } = req.body;

    if (!회사명 || !링크) {
        return res.status(400).json({ status: 'error', message: '회사명과 링크는 필수 입력값입니다.' });
    }

    try {
        // 새로운 회사 추가
        const newCompany = new Company({
            회사명,
            링크,
            지역,
            직무분야,
            연봉정보,
        });

        await newCompany.save();
        res.status(201).json({
            status: 'success',
            message: '새로운 회사가 추가되었습니다.',
            data: newCompany,
        });
    } catch (err) {
        console.error('회사 추가 오류:', err.message);

        if (err.code === 11000) {
            // 중복 키 에러 처리
            return res.status(400).json({ status: 'error', message: '해당 회사명과 링크 조합은 이미 존재합니다.' });
        }

        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

// 4. 회사 정보 수정 (PUT /companies/:id)
router.put('/:id', async (req, res) => {
    const companyId = req.params.id;
    const { 회사명, 링크, 지역, 직무분야, 연봉정보 } = req.body;

    try {
        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { 회사명, 링크, 지역, 직무분야, 연봉정보 },
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ status: 'error', message: '회사를 찾을 수 없습니다.' });
        }

        res.json({
            status: 'success',
            message: '회사 정보가 수정되었습니다.',
            data: updatedCompany,
        });
    } catch (err) {
        console.error('회사 정보 수정 오류:', err.message);

        if (err.code === 11000) {
            // 중복 키 에러 처리
            return res.status(400).json({ status: 'error', message: '해당 회사명과 링크 조합은 이미 존재합니다.' });
        }

        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

// 5. 회사 삭제 (DELETE /companies/:id)
router.delete('/:id', async (req, res) => {
    const companyId = req.params.id;

    try {
        const deletedCompany = await Company.findByIdAndDelete(companyId);

        if (!deletedCompany) {
            return res.status(404).json({ status: 'error', message: '회사를 찾을 수 없습니다.' });
        }

        res.json({
            status: 'success',
            message: '회사가 삭제되었습니다.',
            data: deletedCompany,
        });
    } catch (err) {
        console.error('회사 삭제 오류:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});

module.exports = router;
