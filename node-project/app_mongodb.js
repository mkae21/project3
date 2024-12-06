const express = require('express')
const mogodb = require('./mongoose/index')
const Project3 = require('./mongoose/schemas/project3')

const app = express()

const PORT = process.env.PORT || 443;

mogodb.connect() // db연결

app.listen(PORT,()=>
    console.log("Server started. port 443.")
)

app.get('/project3s', async (req,res)=>{
    await Project3.create({
        name:"temp",
        email:"example@naver.com",
        phone:"0000-0000-0000",
        address:"aa"
    })

    const findPerson = await Project3.find({name:'이성주'})
    console.log(findPerson)
})