import express from 'express'
import { UserValidator } from '../Database/Auth'
import { Login } from '../Services/Auth'

const Router=express.Router()

/// login for user or admin too 
Router.post('/login',async(req,res)=>{
    try{
const Data=UserValidator.safeParse(req.body)
if(!Data.success){
     res.status(401).json('there is an error here in data.success')
     return 
}
const {IdForLogin}=Data.data
if(!IdForLogin){
    res.status(401).json('the IdForLogin is not found while extract the Data.data') 
    return 
}
const {data,status}=await Login({IdForLogin})
if(!data||!status){
    res.status(401).json('the data or status are not found bro ') 
    return  
}
res.cookie("refresh", (data as { refresh: string }).refresh, {
    httpOnly: true,// for production use true with HTTPS
    secure: false,// for production use true with HTTPS
    sameSite: "lax",// for production use "strict" or "none" with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000
});


res.status(status).json(data)
    }catch(err){
        res.status(401).json('error bro '+err)
        return 
    }
})

export default Router