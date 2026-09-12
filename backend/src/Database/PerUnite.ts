
import mongoose, { Document, Schema } from 'mongoose';

interface IProduct extends Document {
    productName: string;
    description: string;

    soldBy: 'unit' | 'weight';

  
    price: number;


    photos: string[];

    category: string;

    inStock: boolean;

    numberOfBuying: number;

    // Used only when soldBy === 'weight'
    minWeight?: number;
    maxWeight?: number;

}

const ProductSchema = new Schema<IProduct>(
    {
        productName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        soldBy: {
            type: String,
            enum: ['unit', 'weight'],
            required: true
        },

        price: {
            type: Number,
            required: false,
            min: 0
        },


        photos: {
            type: [String],
            required: true,
            validate: {
                validator: (value: string[]) =>
                    value.length >= 1 && value.length <= 3,
                message: 'Product must have between 1 and 3 photos'
            }
        },

        category: {
            type: String,
            ref: 'Category',
            required: true
        },

        inStock: {
            type: Boolean,
            default: true
        },

        numberOfBuying: {
            type: Number,
            default: 0,
            min: 0
        },

        minWeight: {
            type: Number,
            
        },

        maxWeight: {
            type: Number,
         
        }
    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model<IProduct>(
    'Product',
    ProductSchema
);
