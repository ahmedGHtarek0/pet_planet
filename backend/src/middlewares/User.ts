import { NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { UserModel } from "../Database/Auth";
import  dotenv from 'dotenv'
dotenv.config()

 const usermiddelwares=(req:any,res:any,next:NextFunction)=>{
    try{
const auth= req.get('authorization')
if(!auth){
    res.send('where is the authorization')
    return
}
const token=auth.split(' ')[1]
if(!token){
    res.send('where is the token')
    return
}
jwt.verify(token,process.env.JWT_SECRETForaUser ?? '',async(err:any,payload:any)=>{
    if(err){
        res.send('the token is erro or expires')
        return
    }
    if(!payload){
        res.send('there is an eror i the payload')
        return
    }
    const user= await UserModel.findOne({IdForLogin:payload.IdForLogin,role:'user'})
    req.user=user
    next()
})
    }
    catch{
        console.log('erro in midlewares user')
        
    }
}

export {usermiddelwares}