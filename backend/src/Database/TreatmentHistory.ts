import mongoose, { Schema, Document } from 'mongoose'

interface ITreatment extends Document {
    petId: mongoose.Types.ObjectId
    date: Date
    staff: string
    drugs: string[]
    time: string[]
    notes?: string
}

const TreatmentSchema = new Schema<ITreatment>(
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

        staff: {
            type: String,
            required: true,
            trim: true
        },

        drugs: {
            type: [String],
            required: true
        },

        time: {
            type: [String],
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

const TreatmentModel = mongoose.model<ITreatment>(
    'Treatment',
    TreatmentSchema
)

import { z } from 'zod'

export const TreatmentValidator = z.object({
    petId: z.string().min(1, 'Pet ID is required'),

    date: z.coerce.date({
        error: 'Invalid date'
    }),

    staff: z.string()
        .min(1, 'Staff name is required')
        .trim(),

    drugs: z.array(
        z.string().min(1, 'Drug name cannot be empty').trim()
    ).min(1, 'At least one drug is required'),

    time: z.array(
        z.string().min(1, 'Time cannot be empty').trim()
    ).min(1, 'At least one time is required'),

    notes: z.string()
        .trim()
        .optional()
})
export default TreatmentModel