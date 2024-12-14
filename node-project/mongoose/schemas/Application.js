const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 지원자 ID
    회사명: { type: String, required: true, trim: true },                         // 회사명
    링크: { type: String, required: true, trim: true, unique: true },             // 지원 링크 (고유)
    지원시간: { type: Date, default: Date.now }                                   // 지원 시간
});

module.exports = mongoose.model('Application', ApplicationSchema);
