const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    이름:{
        type:String,
        required:true,
        trim:true,
    },
    이메일:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    },
    비밀번호:{
        type:String,
        required:true,
        trim:true,
    }
})

module.exports = mongoose.model('User',CompanySchema);