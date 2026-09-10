import mongoose, { Schema, Document } from 'mongoose'

interface IPetImage extends Document {
    petId: mongoose.Types.ObjectId
    images: {
        url: string
        publicId: string
    }[]
}

const PetImageSchema = new Schema<IPetImage>(
    {
        petId: {
            type: Schema.Types.ObjectId,
            ref: 'Pet',
            required: true,
            unique: true
        },

        images: {
            type: [
                {
                    url: {
                        type: String,
                        required: true
                    },

                    publicId: {
                        type: String,
                        required: true
                    }
                }
            ],
            validate: {
                validator: (images: any[]) =>
                    images.length >= 1 && images.length <= 3,

                message: 'A pet must have between 1 and 3 images'
            }
        }
    },
    {
        timestamps: true
    }
)

const PetImageModel = mongoose.model<IPetImage>(
    'PetImage',
    PetImageSchema
)

export default PetImageModel