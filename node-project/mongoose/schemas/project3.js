const mongoose = require('mongoose')
const {Schema} = mongoose

const project3Schema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    address:{
        type:String,
    }
})


const project3 = mongoose.model('project3',project3Schema)

module.exports = project3