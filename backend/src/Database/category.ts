import mongoose,{Schema,Document} from "mongoose";
import zod from 'zod'
interface ICategory extends Document{
    name:string;
    Number:number;
}
const CategorySchema: Schema = new Schema({
    name: { type: String, required: true ,unique:true},
    Number: { type: Number, required: false,default:0 },
});
const Category = mongoose.model<ICategory>('Category', CategorySchema);
const CategorySchemaZod = zod.object({
    name: zod.string().min(3, "Name is required"),
});
export { Category, CategorySchemaZod };
