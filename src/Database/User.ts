import mongoose, { Schema, Document } from 'mongoose'
import zod from 'zod'

interface IPet extends Document {
    ownerName: string
    phone: string
    ownerId: string
    species: 'Dog' | 'Cat' | 'Bird' | 'Other'
    sex: 'Male' | 'Female'
    age: number
    weight: number
    category: string
    type: string[]
    subType: string[]
    status: 'stable' | 'critical' | 'improving' | 'Euthanized'
}

const schema = new Schema<IPet>({
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },
    ownerId: { type: String, required: true },

    species: {
        type: String,
        enum: ['Dog', 'Cat', 'Bird', 'Other'],
        required: true
    },

    sex: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },

    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: [String], required: true },
    subType: { type: [String], required: true },

    status: {
        type: String,
        enum: ['stable', 'critical', 'improving', 'Euthanized'],
        required: true
    }
})

const PetModel = mongoose.model<IPet>('Pet', schema)

const PetValidator = zod.object({
    ownerName: zod.string('Owner name should be a string'),
    phone: zod.string('Phone should be a string'),
    ownerId: zod.string('Owner ID should be a string'),

    species: zod.enum(['Dog', 'Cat', 'Bird', 'Other']),
    sex: zod.enum(['Male', 'Female']),

    age: zod.number('Age should be a number'),
    weight: zod.number('Weight should be a number'),

    category: zod.string('Category should be a string'),

    type: zod.array(
        zod.string('Type should contain strings')
    ),

    subType: zod.array(
        zod.string('Sub-type should contain strings')
    ),

    status: zod.enum([
        'stable',
        'critical',
        'improving',
        'Euthanized'
    ])
})

export { PetModel, PetValidator }