const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    회사명: { type: String, required: true,trim: true, index: true }, // 회사명을 인덱스로 설정
    링크: { type: String, required: true,index:true ,trim: true }, // 회사주소를 고유 식별자로 설정
    지역: { type: String ,trim: true},
    직무분야: { type: String ,trim: true},
    연봉정보: { type: String ,trim: true},
});


CompanySchema.index({회사명: 1, 링크:1},{unique:true}); // 회사명을 인덱스로 설정

module.exports = mongoose.model('Company', CompanySchema);
