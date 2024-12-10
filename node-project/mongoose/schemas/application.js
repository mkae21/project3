const mongoose = require('mongoose');

const applySchema = new mongoose.Schema({
    회사명: { type: String, required: true , unique: true},
    마감일: { type: String, required: true }
})

module.exports = mongoose.model('application', applySchema);