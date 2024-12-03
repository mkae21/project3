const express = require('express')
const mogodb = require('./mongoose/index')
const Project3 = require('./mongoose/schemas/project3')

const app = express()

mogodb.connect() // db연결

app.listen(3000,()=>
    console.log("Server started. port 3000.")
)

app.get('/project3s', async (req,res)=>{
    await Project3.deleteOne({name:"이성주"})
    const findPerson = await Project3.find({name:'이성주'})
    console.log(findPerson)
})