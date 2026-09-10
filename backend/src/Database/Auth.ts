import mongoose,{Schema,Document} from 'mongoose'
import zod from 'zod'
interface IAUth extends Document{
    IdForLogin:string
    role:'admin'|'user'
}
const schema = new Schema<IAUth>({
    IdForLogin:{type:String,required:true},
    role:{type:String,enum:['admin','user'],required:true,default:'user'}
})
const UserModel=mongoose.model<IAUth>('User',schema)
const UserValidator=zod.object({
    IdForLogin:zod.string('the id shloud be string')
}) 
export {UserModel ,UserValidator}