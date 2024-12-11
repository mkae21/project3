const mongoose = require('mongoose');

const applySchema = new mongoose.Schema({
    회사명: { type: String, required: true , unique: true ,index: true, trim: true},
    마감일: { type: String, required: true, trim: true},
})

applySchema.index({회사명: 1});

module.exports = mongoose.model('application', applySchema);