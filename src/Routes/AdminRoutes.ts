import express from 'express'
import { adminmilldelwares } from '../middlewares/Admin'
import { UserModel, UserValidator } from '../Database/Auth'
import { PetModel, PetValidator } from '../Database/User'
import mongoose from 'mongoose'
import TreatmentModel, { TreatmentValidator } from '../Database/TreatmentHistory'
import VitalModel, { VitalValidator } from '../Database/VitalThings'
const router =express.Router()
//update the    IdForLogin for admin broo 
router.put('/updateIdForLogin',adminmilldelwares,async(req:any,res)=>{
    try{
const {_id}=req.admin

const Data=UserValidator.safeParse(req.body)
if(!Data.success){
    res.status(401).json('there is an error in the Data.success bro ')
    return 
}
const {IdForLogin}=Data.data
if(!_id){
    res.status(401).json('there is an error in the _id bro ')
    return 
}
const updatetheidforlogin= await UserModel.findByIdAndUpdate({_id},{IdForLogin},{new:true})
if(!updatetheidforlogin){
    res.status(401).json('there is an error in the updatetheidforlogin bro ')
    return 
}
res.status(200).json(updatetheidforlogin)
}catch(err){
    res.status(401).json('there is an error in the _id bro '+err)
    return 
}
})

//add new use by admin and his pet
router.post('/addnewuser', adminmilldelwares, async (req: any, res) => {
    try {
        const result = PetValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            IdForLogin: result.data.ownerId
        })

        if (existingUser) {
            res.status(404).json({
                message: 'User with this ownerId is already exsits'
            })
            return
        }

        // Create pet
        const newPet = await PetModel.create(result.data)
        newPet.save()
        const adduser= await UserModel.create({IdForLogin:result.data.ownerId,role:'user'})
        adduser.save()

        res.status(201).json({
            message: 'User added successfully',
            pet: newPet,
            user:adduser
        })
        return

    } catch (err) {
        res.status(500).json({
            message: 'There is an error in addnewuser',
            error: err
        })
        return
    }
})
// update the user pet data
router.put('/updatepet/:id', adminmilldelwares, async (req: any, res) => {
    try {
        const { id } = req.params

        const result = PetValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        const updatedPet = await PetModel.findByIdAndUpdate(
            id,
            result.data,
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedPet) {
            res.status(404).json({
                message: 'Pet not found'
            })
            return
        }

        res.status(200).json({
            message: 'Pet updated successfully',
            pet: updatedPet
        })

    } catch (err) {
        res.status(500).json({
            message: 'There is an error in updatepet',
            error: err
        })
    }
})

//delete the user pet data and his data too
router.delete('/deletepetanduser/:id', adminmilldelwares, async (req: any, res) => {
    try {
        const { id } = req.params
        const GetUserid= UserModel.findOneAndDelete({IdForLogin:req.body.IdForLogin})
        const deletedPet = await PetModel.findByIdAndDelete(id)

        if (!deletedPet) {
            res.status(404).json({
                message: 'Pet not found'
            })
            return
        }

        res.status(200).json({
            message: 'Pet deleted successfully and the user too',
            pet: deletedPet
        })

    } catch (err) {
        res.status(500).json({
            message: 'There is an error in deletepet',
            error: err
        })
    }
})
router.delete('/deletepet/:id', adminmilldelwares, async (req: any, res) => {
    try {
        const { id } = req.params

        const deletedPet = await PetModel.findByIdAndDelete(id)

        if (!deletedPet) {
            res.status(404).json({
                message: 'Pet not found'
            })
            return
        }

        res.status(200).json({
            message: 'Pet deleted successfully',
            pet: deletedPet
        })

    } catch (err) {
        res.status(500).json({
            message: 'There is an error in deletepet',
            error: err
        })
    }
})
//add a new pet for the same user by admin
router.post('/addnewpet', adminmilldelwares, async (req: any, res) => {
    try {

        const result = PetValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

      
        const user = await UserModel.findOne({
            IdForLogin: result.data.ownerId
        })

        if (!user) {
            res.status(404).json({
                message: 'User not found'
            })
            return
        }

        
        const newPet = await PetModel.create(result.data)

        res.status(201).json({
            message: 'New pet added successfully',
            pet: newPet
        })

    } catch (err) {

        res.status(500).json({
            message: 'There is an error in addnewpet',
            error: err
        })
    }
})




// ==========================================
// CREATE - Add new treatment to a pet
// ==========================================

router.post('/addtreatment', adminmilldelwares, async (req: any, res) => {
    try {

        const result = TreatmentValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        // Check if pet exists
        const pet = await PetModel.findById(result.data.petId)

        if (!pet) {
            res.status(404).json({
                message: 'Pet not found'
            })
            return
        }
        const { petId, date, staff, drugs, time, notes } = result.data
        if(!petId||!date||!staff||!drugs||!time){
            res.status(400).json({
                message: 'Missing required fields'
            })
            return
        }   
        const treatment = await TreatmentModel.create({
            petId,
            date,
            staff,
            drugs,
            time,
           ...(notes !== undefined && { notes })
        })

        res.status(201).json({
            message: 'Treatment added successfully',
            treatment
        })

    } catch (err) {

        res.status(500).json({
            message: 'There is an error in addtreatment',
            error: err
        })
    }
})







// ==========================================
// UPDATE - Update treatment
// ==========================================

router.put('/updatetreatment/:id', adminmilldelwares, async (req: any, res) => {
    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: 'Invalid treatment ID'
            })
            return
        }

        const result = TreatmentValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        const treatment = await TreatmentModel.findById(id)

        if (!treatment) {
            res.status(404).json({
                message: 'Treatment not found'
            })
            return
        }

        // If petId is changed, make sure the new pet exists
        const pet = await PetModel.findById(result.data.petId)

        if (!pet) {
            res.status(404).json({
                message: 'Pet not found'
            })
            return
        }

        const updatedTreatment = await TreatmentModel.findByIdAndUpdate(
            id,
            result.data,
            {
                new: true,
                runValidators: true
            }
        )

        res.status(200).json({
            message: 'Treatment updated successfully',
            treatment: updatedTreatment
        })

    } catch (err) {

        res.status(500).json({
            message: 'There is an error in updatetreatment',
            error: err
        })
    }
})


// ==========================================
// DELETE - Delete treatment
// ==========================================

router.delete('/deletetreatment/:id', adminmilldelwares, async (req: any, res) => {
    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: 'Invalid treatment ID'
            })
            return
        }

        const treatment = await TreatmentModel.findByIdAndDelete(id)

        if (!treatment) {
            res.status(404).json({
                message: 'Treatment not found'
            })
            return
        }

        res.status(200).json({
            message: 'Treatment deleted successfully',
            treatment
        })

    } catch (err) {

        res.status(500).json({
            message: 'There is an error in deletetreatment',
            error: err
        })
    }
})







// ==========================================
// CREATE - Add new vital
// ==========================================

router.post('/addvital', adminmilldelwares, async (req: any, res) => {
    try {

        const result = VitalValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        const {
            petId,
            date,
            time,
            temperature,
            food,
            drink,
            urine,
            stool,
            notes
        } = result.data

        // Check if pet exists
        const pet = await PetModel.findById(petId)

        if (!pet) {
            res.status(404).json({
                message: 'Pet not found'
            })
            return
        }

        const vital = await VitalModel.create({
            petId,
            date,
            time,
            temperature,
            food,
            drink,
            urine,
            stool,
            ...(notes !== undefined && { notes })
        })

        res.status(201).json({
            message: 'Vital added successfully',
            vital
        })
        return

    } catch (err) {

        res.status(500).json({
            message: 'There is an error in addvital',
            error: err
        })
        return
    }
})


// ==========================================
// UPDATE - Update vital
// ==========================================

router.put('/updatevital/:id', adminmilldelwares, async (req: any, res) => {
    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: 'Invalid vital ID'
            })
            return
        }

        const result = VitalValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        const existingVital = await VitalModel.findById(id)

        if (!existingVital) {
            res.status(404).json({
                message: 'Vital not found'
            })
            return
        }

        const {
            petId,
            date,
            time,
            temperature,
            food,
            drink,
            urine,
            stool,
            notes
        } = result.data

        // Check if pet exists
        const pet = await PetModel.findById(petId)

        if (!pet) {
            res.status(404).json({
                message: 'Pet not found'
            })
            return
        }

        const updatedVital = await VitalModel.findByIdAndUpdate(
            id,
            {
                petId,
                date,
                time,
                temperature,
                food,
                drink,
                urine,
                stool,
                ...(notes !== undefined && { notes })
            },
            {
                new: true,
                runValidators: true
            }
        )

        res.status(200).json({
            message: 'Vital updated successfully',
            vital: updatedVital
        })
        return

    } catch (err) {

        res.status(500).json({
            message: 'There is an error in updatevital',
            error: err
        })
        return
    }
})


// ==========================================
// DELETE - Delete vital
// ==========================================

router.delete('/deletevital/:id', adminmilldelwares, async (req: any, res) => {
    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: 'Invalid vital ID'
            })
            return
        }

        const deletedVital = await VitalModel.findByIdAndDelete(id)

        if (!deletedVital) {
            res.status(404).json({
                message: 'Vital not found'
            })
            return
        }

        res.status(200).json({
            message: 'Vital deleted successfully',
            vital: deletedVital
        })
        return

    } catch (err) {

        res.status(500).json({
            message: 'There is an error in deletevital',
            error: err
        })
        return
    }
})



export default router