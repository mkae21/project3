const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 사용자 ID
    회사명: { type: String, required: true, trim: true },                        // 회사명
    링크: { type: String, required: true, trim: true },                          // 링크
});

// 복합 인덱스: userId와 링크가 고유하도록 설정
bookmarkSchema.index({ userId: 1, 링크: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
