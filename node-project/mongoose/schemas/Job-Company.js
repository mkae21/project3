const mongoose = require('mongoose');

const JobWithCompanySchema = new mongoose.Schema({
    회사명: { type: String, required: true, trim: true, index: true },
    제목: { type: String, required: true, trim: true },
    링크: { type: String, required: true, unique: true, trim: true },
    마감일: { type: String, required: true, trim: true },
    지역: { type: String, trim: true },
    경력: { type: String, trim: true },
    학력: { type: String, trim: true },
    고용형태: { type: String, trim: true },
    직무분야: { type: String, trim: true },
    연봉정보: { type: String, trim: true },
    조회수: { type: Number, default: 0 },
    회사정보: { // 중복된 회사 정보 저장
        링크: { type: String, required: true, trim: true },
        지역: { type: String, trim: true },
        직무분야: { type: String, trim: true },
        연봉정보: { type: String, trim: true },
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('JobWithCompany', JobWithCompanySchema);
