const mongoose = require('mongoose');

const ApplicationWithUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    회사명: { type: String, required: true, trim: true },
    링크: { type: String, required: true, trim: true, unique: true },
    지원시간: { type: Date, default: Date.now },
    지원자정보: { // 중복된 사용자 정보 저장
        이메일: { type: String, required: true },
        이름: { type: String, required: true },
    },
});

module.exports = mongoose.model('ApplicationWithUser', ApplicationWithUserSchema);
