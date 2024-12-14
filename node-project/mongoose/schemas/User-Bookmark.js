const mongoose = require('mongoose');

const BookmarkWithUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    회사명: { type: String, required: true, trim: true },
    링크: { type: String, required: true, trim: true },
    사용자정보: { // 중복된 사용자 정보 저장
        이메일: { type: String, required: true },
        이름: { type: String, required: true },
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('BookmarkWithUser', BookmarkWithUserSchema);
