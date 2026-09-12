import mongoose, { Schema, Document } from 'mongoose'
import { z } from 'zod'

interface IOrderItem {
    productId: mongoose.Types.ObjectId
    productName: string
    price: number
    quantity: number
    soldBy: 'unit' | 'weight'
    weight?: number
}

interface IOrder extends Document {
    userId: string
    items: IOrderItem[]
    totalPrice: number
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'rejected'
    paymentMethod: 'instapay' | 'vodafonecash'
    paymentScreenshot?: string
    phone: string
    address: string
    notes?: string
    cancelledBy?: 'user' | 'admin'
    cancelReason?: string
}

const OrderSchema = new Schema<IOrder>(
    {
        userId: {
            type: String,
            required: true
        },

        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                productName: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                soldBy: {
                    type: String,
                    enum: ['unit', 'weight'],
                    required: true
                },
                weight: {
                    type: Number
                }
            }
        ],

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'rejected'],
            default: 'pending',
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ['instapay', 'vodafonecash'],
            required: true
        },

        paymentScreenshot: {
            type: String
        },

        phone: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        notes: {
            type: String
        },

        cancelledBy: {
            type: String,
            enum: ['user', 'admin']
        },

        cancelReason: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const OrderModel = mongoose.model<IOrder>('Order', OrderSchema)

const OrderValidator = z.object({
    items: z.array(z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        weight: z.number().optional()
    })).min(1, 'At least one item is required'),

    paymentMethod: z.enum(['instapay', 'vodafonecash']),

    paymentScreenshot: z.string().optional(),

    phone: z.string().min(1, 'Phone number is required'),

    address: z.string().min(1, 'Address is required'),

    notes: z.string().optional()
})

const OrderStatusValidator = z.object({
    status: z.enum(['confirmed', 'shipped', 'delivered', 'rejected'])
})

const OrderCancelValidator = z.object({
    cancelReason: z.string().min(1, 'Cancel reason is required')
})

export { OrderModel, OrderValidator, OrderStatusValidator, OrderCancelValidator }
