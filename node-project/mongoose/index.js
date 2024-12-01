const mongoose = require('mongoose')

const connect = ()=>{
    if(process.env.NODE_ENV !== 'production'){ //운영 환경이 아닌 개발 환경일 때만
        mongoose.set('debug',true)// 콘솔에서 쿼리 내용을 확인 할 수 있도록 디버그 모드 활성화
    }
}

mongoose.connect('mongodb://root:1234@localhost:27017/admin',{
    dbName: 'project3',
},(error)=>{
    if(error){
        console.log("MongoDB 연결 에러",error)
    }else{
        console.log("MongoDB 연결 성공",'localhost:27017/admin')
    }
})

mongoose.connection.on('error',(error) => {
    console.log("MongoDB 연결 에러",error)
})

mongoose.connection.on('disconnected',()=>{
    console.error('MongoDB 연결이 종료되어 연결을 재시도합니다.')
    connect();
})

module.exports = {
    connect
}