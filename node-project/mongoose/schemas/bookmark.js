const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    회사명: { type: String, required: true , trim:true ,unique: true},
})

bookmarkSchema.index({회사명: 1});

module.exports = mongoose.model('bookmark', bookmarkSchema);