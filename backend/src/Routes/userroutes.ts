 import express from 'express'
import PetImageModel from '../Database/Images'
import TreatmentModel from '../Database/TreatmentHistory'
import { PetModel } from '../Database/User'
import VitalModel from '../Database/VitalThings'
import { usermiddelwares } from '../middlewares/User'

 const router = express.Router()


router.get(
    '/my-pets',
    usermiddelwares,
    async (req: any, res) => {

        try {

            const { IdForLogin } = req.user

            const pets = await PetModel
                .find({
                    ownerId: IdForLogin
                })
                .lean()

            const petsWithData = await Promise.all(

                pets.map(async (pet) => {

                    const vitals = await VitalModel
                        .find({ petId: pet._id })
                        .sort({ date: -1 })
                        .lean()

                    const treatments = await TreatmentModel
                        .find({ petId: pet._id })
                        .sort({ date: -1 })
                        .lean()

                    const petImages = await PetImageModel
                        .findOne({ petId: pet._id })
                        .lean()

                    return {
                        ...pet,

                        vitals,

                        treatments,

                        images: petImages?.images || []
                    }
                })
            )

            res.status(200).json({

                message: 'User pets data retrieved successfully',

                count: petsWithData.length,

                pets: petsWithData

            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error getting user pets data',
                error: err
            })

        }
    }
)


export default  router  