const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    회사명: { type: String, required: true },
    설립일: { type: String },
    설립자: { type: String },
    업종: { type: String },
    재정정보: { type: String },
    회사주소: { type: String, required: true, unique: true }, // 회사주소를 고유 식별자로 설정
});

module.exports = mongoose.model('Company', CompanySchema);
