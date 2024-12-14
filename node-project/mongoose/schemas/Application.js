const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 지원자 ID
    회사명: { type: String, required: true, trim: true },                         // 회사명
    링크: { type: String, required: true, trim: true},   // 지원 링크
    지원시간: { type: Date, default: Date.now }                                   // 지원 시간
});

//복합 인덱스 설정
ApplicationSchema.index({ userId: 1, 회사명: 1, 링크: 1 }, { unique: true });


module.exports = mongoose.model('Application', ApplicationSchema);
