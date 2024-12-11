const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    회사명: { 
        type: String,
        required: true,
        trim: true,
        index: true, // 빠른 탐색을 위한 인덱스 설정
    },
    제목: { 
        type: String, 
        required: true,
        trim: true,
    },
    링크: { 
        type: String, 
        required: true, 
        unique: true, // 중복 방지
        trim: true,
        validate: {
            validator: function (v) {
                return /^https?:\/\/[^\s]+$/i.test(v); // 유효한 URL 형식 검증
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    마감일: { 
        type: String, 
        required: true, 
        trim: true,
    },
    지역: { 
        type: String, 
        trim: true,
        index: true, // 지역 기반 빠른 검색
    },
    경력: { 
        type: String, 
        trim: true,
    },
    학력: { 
        type: String, 
        trim: true,
    },
    고용형태: { 
        type: String, 
        trim: true,
    },
    직무분야: { 
        type: String, 
        trim: true,
        index: true, // 직무분야 검색 최적화
    },
    연봉정보: { 
        type: String, 
        trim: true,
    },
    조회수:{
        type: Number,
        trim: true,
    }
}, {
    timestamps: true, // 생성일(createdAt)과 수정일(updatedAt) 자동 추가
});

// 복합 인덱스 설정 (회사명 + 제목 조합으로 검색 최적화)
JobSchema.index({ 회사명: 1, 직무분야: 1 },{unique:true});

JobSchema.pre('remove', async function (next) {
    console.log(`Job 문서가 삭제됩니다: ${this._id}`);
    next();
});

module.exports = mongoose.model('Job', JobSchema);