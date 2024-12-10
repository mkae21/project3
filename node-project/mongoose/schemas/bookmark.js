const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    회사명: { type: String, required: true , unique: true},
})

module.exports = mongoose.model('bookmark', bookmarkSchema);