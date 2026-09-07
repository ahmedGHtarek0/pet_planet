import { client } from ".."
import { UserModel } from "../Database/Auth"
import jwt from 'jsonwebtoken'
interface Auth{
    IdForLogin:string
    role?:'admin'|'user'
}
const Login=async({IdForLogin}:Auth)=>{
    try{
const SearchAboutId= await UserModel.findOne({IdForLogin})
if(!SearchAboutId){
    return{data:'the id is not exsist ',status:401}
}
let access,refresh
const {role}=SearchAboutId
if(role==='admin'){
 access=makeAccessTokenForAdmin({IdForLogin,role})
 refresh=makeResfreshTokenForAdmin({IdForLogin,role})
const savetokeninredis= await client.set(refresh, JSON.stringify({ IdForLogin, role }))
    }
    else{
 access=makeAccessTokenForUser({IdForLogin,role})
 refresh=makeResfreshTokenForuser({IdForLogin,role})
const savetokeninredis= await client.set(refresh, JSON.stringify({ IdForLogin, role }))
    }
return {data:{access,refresh,IdForLogin,role},status:201}
    }catch(err){
        return{data:err,status:401}
    }
}
const makeAccessTokenForAdmin = (data: Auth) => {
    return jwt.sign(
        {
            IdForLogin: data.IdForLogin,
            role: data.role
        },
        process.env.JWT_SECRETForaAdmin ?? '',
        {
            expiresIn: '3h'
        }
    )
}
const makeResfreshTokenForAdmin = (data: Auth) => {
    return jwt.sign(
        {
            IdForLogin: data.IdForLogin,
            role: data.role
        },
        process.env.JWT_SECRETForaAdmin ?? '',
        {
            expiresIn: '7d'
        }
    )
}
const makeAccessTokenForUser = (data: Auth) => {
    return jwt.sign(
        {
            IdForLogin: data.IdForLogin,
            role: data.role
        },
        process.env.JWT_SECRETForaUser ?? '',
        {
            expiresIn: '3h'
        }
    )
}
const makeResfreshTokenForuser = (data: Auth) => {
    return jwt.sign(
        {
            IdForLogin: data.IdForLogin,
            role: data.role
        },
        process.env.JWT_SECRETForaUser ?? '',
        {
            expiresIn: '7d'
        }
    )
}
export {Login}