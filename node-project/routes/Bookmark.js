const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Bookmark = require('../mongoose/schemas/User-Bookmark');

// 북마크 추가/제거
router.post('/', authMiddleware, async (req, res) => {
    const { 회사명, 링크 } = req.body;
    const { id: userId, 이름, 이메일 } = req.user; // 인증된 사용자 정보

    if (!회사명 || !링크) {
        return res.status(400).json({ status: 'error', message: '회사명과 링크는 필수 입력값입니다.' });
    }

    try {
        const existingBookmark = await Bookmark.findOne({ userId, 링크 });

        if (existingBookmark) {
            // 북마크 제거
            await Bookmark.deleteOne({ userId, 링크 });
            return res.json({ status: 'success', message: '북마크가 제거되었습니다.' });
        } else {
            // 북마크 추가
            const newBookmark = new Bookmark({
                userId,
                회사명,
                링크,
                사용자정보: { 이름, 이메일 }, // 사용자 정보 추가
            });

            await newBookmark.save();
            return res.json({ status: 'success', message: '북마크가 추가되었습니다.', data: newBookmark });
        }
    } catch (err) {
        console.error('북마크 추가/제거 오류:', err.message);

        if (err.code === 11000) {
            return res.status(400).json({ status: 'error', message: '이미 북마크에 추가된 링크입니다.' });
        }

        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});


// 북마크 목록 조회
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id; // 인증된 사용자 ID
    const { page = 1, limit = 10 } = req.query; // 페이지네이션 파라미터 (기본값: 페이지 1, 10개씩)

    try {
        const skip = (page - 1) * limit; // 스킵할 문서 수 계산

        // 북마크 조회
        const bookmarks = await Bookmark.find({ userId })
            .sort({ _id: -1 }) // 최신순 정렬
            .skip(parseInt(skip)) // 페이지네이션: 스킵
            .limit(parseInt(limit)); // 페이지네이션: 제한

        // 총 북마크 개수
        const totalBookmarks = await Bookmark.countDocuments({ userId });

        res.json({
            status: 'success',
            data: bookmarks,
            total: totalBookmarks,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (err) {
        console.error('북마크 목록 조회 오류:', err.message);
        res.status(500).json({ status: 'error', message: '서버 오류 발생' });
    }
});


module.exports = router;
