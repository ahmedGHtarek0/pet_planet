import { Category } from "../Database/category";
import mongoose from 'mongoose'
interface Icat{
    name?:string;
    Number?:number;
    id?:mongoose.Types.ObjectId
}
const addnewcategory = async ({ name }: Icat) => {
    try{
        if(!name){
            return {
                data: "The category name is required",
                status: 400
            };
        }
    const searchaboutname = await Category.findOne({ name });

    if (searchaboutname) {
        return {
            data: "The category already exists",
            status: 400
        };
    }

    const newCategory = await Category.create({ name });

    const findall = await Category.find();

    return {
        data: {
            message: "The category was added successfully",
            categoryres: findall
        },
        status: 200
    };
}catch(err){
    return {data:err,status:500}
}
};
const updatethecategory=async({name,id}:Icat)=>{
    if(!name || !id){
            return {
                data: "The category name  or id is required",
                status: 400
            };
        }
    const searchaboutname = await Category.findById( id );
    if(!searchaboutname){
        return {
            data: "The category does not exist",
            status: 400
        };
    }
    const updatetheitem= await Category.findByIdAndUpdate(id,{name},{new:true})
    const findall = await Category.find();
    return {
        data: {
            message: "The category was updated successfully",
            categoryres: findall
        },
        status: 200
    };
}
const deletecategory = async ({ id }: Icat) => {
    try {
        if (!id) {
            return {
                data: "The category ID is required",
                status: 400
            };
        }

        const searchaboutname = await Category.findById(id);

        if (!searchaboutname) {
            return {
                data: "The category does not exist",
                status: 404
            };
        }

        await Category.findByIdAndDelete(id);

        const findall = await Category.find();

        return {
            data: {
                message: "The category was deleted successfully",
                categoryres: findall
            },
            status: 200
        };

    } catch (err) {
        return {
            data: err,
            status: 500
        };
    }
};


export { addnewcategory,updatethecategory,deletecategory};