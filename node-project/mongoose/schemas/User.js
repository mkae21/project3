const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    이메일: { type: String, required: true, unique: true }, // 이메일
    비밀번호: { type: String, required: true }, // 비밀번호 (암호화 저장)
    이름: { type: String, required: true }, // 사용자 이름
    createdAt: { type: Date, default: Date.now }, // 가입 날짜
    refreshToken: { type: String }, // Refresh 토큰 (옵션)
    lastLogin:{type: Date}
});


module.exports = mongoose.model('User', UserSchema);
