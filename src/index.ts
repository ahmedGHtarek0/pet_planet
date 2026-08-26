import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
const app = express()
const port=3001
app.use(express.json())

try{
mongoose.connect(process.env.mongodblocalhostlink??'')
.then(()=>console.log('the pet_planet database connetced'))
.catch((err)=>console.log('there error in db '+err))
}catch(err){
console.log('erro in connected with Db  '+err)
}

app.listen(port,()=>{
    console.log(`the serevr is connect to the localhost http://loaclhost:${port}`)
})