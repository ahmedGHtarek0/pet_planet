import mongoose, { Schema, Document } from 'mongoose'
import { z } from 'zod'

interface IAdminPayment extends Document {
    instapayNumber: string
    vodafoneCashNumber: string
    instapayName: string
    vodafoneCashName: string
    isActive: boolean
}

const AdminPaymentSchema = new Schema<IAdminPayment>(
    {
        instapayNumber: {
            type: String,
            default: ''
        },
        vodafoneCashNumber: {
            type: String,
            default: ''
        },
        instapayName: {
            type: String,
            default: ''
        },
        vodafoneCashName: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

const AdminPaymentModel = mongoose.model<IAdminPayment>(
    'AdminPayment',
    AdminPaymentSchema
)

const AdminPaymentValidator = z.object({
    instapayNumber: z.string().optional(),
    vodafoneCashNumber: z.string().optional(),
    instapayName: z.string().optional(),
    vodafoneCashName: z.string().optional(),
    isActive: z.boolean().optional()
})

export { AdminPaymentModel, AdminPaymentValidator }
