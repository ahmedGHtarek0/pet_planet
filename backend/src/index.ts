import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Auth from './Routes/Auth'
import { createClient } from 'redis';
import { UserModel } from './Database/Auth';
import cors from 'cors'
import AdminRoutes from './Routes/AdminRoutes';
import { v2 as cloudinary } from 'cloudinary'
import userroutes from './Routes/userroutes';
import OrderRoutes from './Routes/OrderRoutes';
dotenv.config()
const app = express()
const port=3001
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173'
}))
//MongoDb connection 
try{
mongoose.connect(process.env.mongodblocalhostlink??'')
.then(()=>console.log('the pet_planet database connetced'))
.catch((err)=>console.log('there error in db '+err))
}catch(err){
console.log('erro in connected with Db  '+err)
}
//redis connection
export let client:any
const redis= async()=>{
 client = createClient({
    username: process.env.REdisusername ?? '',
    password:  process.env.redispassword ?? '',
    socket: {
        host: process.env.redishost ?? '',
        port: 11428
    }
});

client.on('error', (err: Error) => {
    console.log('Redis Client Error', err)
})

await client.connect();
}
redis()


//cloudinary connection


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    api_key: process.env.CLOUDINARY_API_KEY ?? '',
    api_secret: process.env.CLOUDINARY_API_SECRET ?? ''
})

export default cloudinary

app.use('/Auth',Auth)
app.use('/Admin',AdminRoutes)
app.use('/User',userroutes)
app.use('/User',OrderRoutes)
app.listen(port,()=>{
    console.log(`the serevr is connect to the localhost http://loaclhost:${port}`)
})