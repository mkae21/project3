const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    회사명: { type: String, required: true },
    링크: { type: String, required: true, unique: true }, // 회사주소를 고유 식별자로 설정
    지역: { type: String },
    직무분야: { type: String },
    연봉정보: { type: String },
});

module.exports = mongoose.model('Company', CompanySchema);
