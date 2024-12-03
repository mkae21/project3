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


const Project3 = mongoose.model('Project3',project3Schema)

module.exports = Project3