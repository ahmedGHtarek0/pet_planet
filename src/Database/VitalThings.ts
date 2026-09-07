import mongoose, { Schema, Document } from 'mongoose'

interface IVital extends Document {
    petId: mongoose.Types.ObjectId
    date: Date
    time: string
    temperature: number
    food: 'low' | 'medium' | 'good'
    drink: 'low' | 'medium' | 'good'
    urine: 'low' | 'medium' | 'good'
    stool: 'low' | 'medium' | 'good'
    notes?: string
}

const VitalSchema = new Schema<IVital>(
    {
        petId: {
            type: Schema.Types.ObjectId,
            ref: 'Pet',
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        time: {
            type: String,
            required: true
        },

        temperature: {
            type: Number,
            required: true
        },

        food: {
            type: String,
            enum: ['low', 'medium', 'good'],
            required: true
        },

        drink: {
            type: String,
            enum: ['low', 'medium', 'good'],
            required: true
        },

        urine: {
            type: String,
            enum: ['low', 'medium', 'good'],
            required: true
        },

        stool: {
            type: String,
            enum: ['low', 'medium', 'good'],
            required: true
        },

        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
)

const VitalModel = mongoose.model<IVital>('Vital', VitalSchema)
import { z } from 'zod'

export const VitalValidator = z.object({
    petId: z.string()
        .min(1, 'Pet ID is required'),

    date: z.coerce.date({
        error: 'Invalid date'
    }),

    time: z.string()
        .min(1, 'Time is required')
        .trim(),

    temperature: z.number({
        error: 'Temperature must be a number'
    }),

    food: z.enum(['low', 'medium', 'good']),

    drink: z.enum(['low', 'medium', 'good']),

    urine: z.enum(['low', 'medium', 'good']),

    stool: z.enum(['low', 'medium', 'good']),

    notes: z.string()
        .trim()
        .optional()
})

export default VitalModel