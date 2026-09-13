import express from 'express'
import { adminmilldelwares } from '../middlewares/Admin'
import { UserModel, UserValidator } from '../Database/Auth'
import { PetModel, PetValidator } from '../Database/User'
import mongoose from 'mongoose'
import TreatmentModel, { TreatmentValidator } from '../Database/TreatmentHistory'
import VitalModel, { VitalValidator } from '../Database/VitalThings'
import ExcelJS from 'exceljs'
import PetImageModel from '../Database/Images'
import { uploadImages } from '../middlewares/UploadMiddleware'
import { uploadToCloudinary } from '../middlewares/UploadToCloudinary'
import cloudinary from '..'
import { safeParse } from 'zod'
import { Category, CategorySchemaZod } from '../Database/category'
import { addnewcategory, deletecategory, updatethecategory } from '../Services/AdminE-commrce'
import { upload } from '../middlewares/imageforitems'
import { Product } from '../Database/PerUnite'
import { OrderModel, OrderStatusValidator } from '../Database/Order'
import { AdminPaymentModel, AdminPaymentValidator } from '../Database/AdminPayment'
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


router.post('/getbackup',adminmilldelwares, async (req: any, res) => {

    try {

        // ==========================================
        // Get all data from database
        // ==========================================

        const users = await UserModel.find().lean()

        const pets = await PetModel.find().lean()

        const treatments = await TreatmentModel
            .find()
            .populate('petId')
            .lean()

        const vitals = await VitalModel
            .find()
            .populate('petId')
            .lean()


        // ==========================================
        // Create Excel workbook
        // ==========================================

        const workbook = new ExcelJS.Workbook()

        workbook.creator = 'Pet Management System'
        workbook.created = new Date()
        workbook.modified = new Date()


        // ==========================================
        // SUMMARY SHEET
        // ==========================================

        const summarySheet = workbook.addWorksheet('Summary')

        summarySheet.columns = [
            {
                header: 'Information',
                key: 'information',
                width: 30
            },
            {
                header: 'Value',
                key: 'value',
                width: 30
            }
        ]

        summarySheet.addRows([
            {
                information: 'Backup System',
                value: 'Pet Management System'
            },
            {
                information: 'Backup Date',
                value: new Date().toLocaleString()
            },
            {
                information: 'Total Users',
                value: users.length
            },
            {
                information: 'Total Pets',
                value: pets.length
            },
            {
                information: 'Total Treatments',
                value: treatments.length
            },
            {
                information: 'Total Vital Records',
                value: vitals.length
            }
        ])


        // ==========================================
        // USERS SHEET
        // ==========================================

        const usersSheet = workbook.addWorksheet('Users')

        usersSheet.columns = [
            {
                header: 'User ID',
                key: 'id',
                width: 28
            },
            {
                header: 'Login ID',
                key: 'loginId',
                width: 25
            },
            {
                header: 'Role',
                key: 'role',
                width: 15
            },
            {
                header: 'Created At',
                key: 'createdAt',
                width: 25
            }
        ]

        users.forEach((user: any) => {

            usersSheet.addRow({
                id: user._id?.toString(),
                loginId: user.IdForLogin,
                role: user.role,
                createdAt: user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : ''
            })

        })


        // ==========================================
        // PETS SHEET
        // ==========================================

        const petsSheet = workbook.addWorksheet('Pets')

        petsSheet.columns = [
            {
                header: 'Pet ID',
                key: 'id',
                width: 28
            },
            {
                header: 'Owner ID',
                key: 'ownerId',
                width: 25
            },
            {
                header: 'Owner Name',
                key: 'ownerName',
                width: 25
            },
            {
                header: 'Phone',
                key: 'phone',
                width: 18
            },
            {
                header: 'Species',
                key: 'species',
                width: 15
            },
            {
                header: 'Sex',
                key: 'sex',
                width: 12
            },
            {
                header: 'Age',
                key: 'age',
                width: 10
            },
            {
                header: 'Weight',
                key: 'weight',
                width: 12
            },
            {
                header: 'Category',
                key: 'category',
                width: 20
            },
            {
                header: 'Type',
                key: 'type',
                width: 30
            },
            {
                header: 'Sub Type',
                key: 'subType',
                width: 30
            },
            {
                header: 'Status',
                key: 'status',
                width: 15
            }
        ]

        pets.forEach((pet: any) => {

            petsSheet.addRow({
                id: pet._id?.toString(),
                ownerId: pet.ownerId,
                ownerName: pet.ownerName,
                phone: pet.phone,
                species: pet.species,
                sex: pet.sex,
                age: pet.age,
                weight: pet.weight,
                category: pet.category,
                type: Array.isArray(pet.type)
                    ? pet.type.join(', ')
                    : '',
                subType: Array.isArray(pet.subType)
                    ? pet.subType.join(', ')
                    : '',
                status: pet.status
            })

        })


        // ==========================================
        // TREATMENTS SHEET
        // ==========================================

        const treatmentsSheet = workbook.addWorksheet('Treatments')

        treatmentsSheet.columns = [
            {
                header: 'Treatment ID',
                key: 'id',
                width: 28
            },
            {
                header: 'Pet ID',
                key: 'petId',
                width: 28
            },
            {
                header: 'Owner Name',
                key: 'ownerName',
                width: 25
            },
            {
                header: 'Species',
                key: 'species',
                width: 15
            },
            {
                header: 'Date',
                key: 'date',
                width: 15
            },
            {
                header: 'Staff',
                key: 'staff',
                width: 25
            },
            {
                header: 'Drugs',
                key: 'drugs',
                width: 35
            },
            {
                header: 'Time',
                key: 'time',
                width: 25
            },
            {
                header: 'Notes',
                key: 'notes',
                width: 40
            }
        ]

        treatments.forEach((treatment: any) => {

            const pet = treatment.petId

            treatmentsSheet.addRow({
                id: treatment._id?.toString(),

                petId: pet?._id
                    ? pet._id.toString()
                    : treatment.petId?.toString(),

                ownerName: pet?.ownerName || '',

                species: pet?.species || '',

                date: treatment.date
                    ? new Date(treatment.date).toLocaleDateString()
                    : '',

                staff: treatment.staff,

                drugs: Array.isArray(treatment.drugs)
                    ? treatment.drugs.join(', ')
                    : '',

                time: Array.isArray(treatment.time)
                    ? treatment.time.join(', ')
                    : '',

                notes: treatment.notes || ''
            })

        })


        // ==========================================
        // VITALS SHEET
        // ==========================================

        const vitalsSheet = workbook.addWorksheet('Vitals')

        vitalsSheet.columns = [
            {
                header: 'Vital ID',
                key: 'id',
                width: 28
            },
            {
                header: 'Pet ID',
                key: 'petId',
                width: 28
            },
            {
                header: 'Owner Name',
                key: 'ownerName',
                width: 25
            },
            {
                header: 'Species',
                key: 'species',
                width: 15
            },
            {
                header: 'Date',
                key: 'date',
                width: 15
            },
            {
                header: 'Time',
                key: 'time',
                width: 15
            },
            {
                header: 'Temperature °C',
                key: 'temperature',
                width: 18
            },
            {
                header: 'Food',
                key: 'food',
                width: 15
            },
            {
                header: 'Drink',
                key: 'drink',
                width: 15
            },
            {
                header: 'Urine',
                key: 'urine',
                width: 15
            },
            {
                header: 'Stool',
                key: 'stool',
                width: 15
            },
            {
                header: 'Notes',
                key: 'notes',
                width: 40
            }
        ]

        vitals.forEach((vital: any) => {

            const pet = vital.petId

            vitalsSheet.addRow({
                id: vital._id?.toString(),

                petId: pet?._id
                    ? pet._id.toString()
                    : vital.petId?.toString(),

                ownerName: pet?.ownerName || '',

                species: pet?.species || '',

                date: vital.date
                    ? new Date(vital.date).toLocaleDateString()
                    : '',

                time: vital.time,

                temperature: vital.temperature,

                food: vital.food,

                drink: vital.drink,

                urine: vital.urine,

                stool: vital.stool,

                notes: vital.notes || ''
            })

        })


        // ==========================================
        // STYLE ALL SHEETS
        // ==========================================

        workbook.worksheets.forEach((sheet) => {

            // Header style
            const headerRow = sheet.getRow(1)

            headerRow.font = {
                bold: true,
                size: 12
            }

            headerRow.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            }

            headerRow.height = 25

            // Borders + alignment
            sheet.eachRow((row) => {

                row.eachCell((cell) => {

                    cell.alignment = {
                        vertical: 'middle',
                        wrapText: true
                    }

                    cell.border = {
                        top: {
                            style: 'thin'
                        },
                        left: {
                            style: 'thin'
                        },
                        bottom: {
                            style: 'thin'
                        },
                        right: {
                            style: 'thin'
                        }
                    }

                })

            })

            // Freeze first row
            sheet.views = [
                {
                    state: 'frozen',
                    ySplit: 1
                }
            ]

            // Filter
            if (sheet.rowCount > 1) {
                sheet.autoFilter = {
                    from: 'A1',
                    to: `${sheet.getColumn(sheet.columnCount).letter}1`
                }
            }

        })


        // ==========================================
        // CREATE EXCEL FILE
        // ==========================================

        const buffer = await workbook.xlsx.writeBuffer()


        // ==========================================
        // SEND EXCEL FILE TO ADMIN
        // ==========================================

        const fileName =
            `pet-management-backup-${new Date()
                .toISOString()
                .split('T')[0]}.xlsx`

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        )

        res.status(200).send(buffer)

    } catch (err) {

        console.error(err)

        res.status(500).json({
            message: 'There is an error while creating the backup',
            error: err
        })

    }

})



// Crud operation on the images for the pet 
router.post(
    '/addpetimages',
    adminmilldelwares,
    uploadImages,
    async (req: any, res) => {

        try {

            const { petId } = req.body

            if (!petId) {
                res.status(400).json({
                    message: 'Pet ID is required'
                })
                return
            }

            if (!mongoose.Types.ObjectId.isValid(petId)) {
                res.status(400).json({
                    message: 'Invalid Pet ID'
                })
                return
            }

            const files = req.files as Express.Multer.File[]

            if (!files || files.length === 0) {
                res.status(400).json({
                    message: 'At least one image is required'
                })
                return
            }

            if (files.length > 3) {
                res.status(400).json({
                    message: 'Maximum 3 images are allowed'
                })
                return
            }

            // Check if pet exists
            const pet = await PetModel.findById(petId)

            if (!pet) {
                res.status(404).json({
                    message: 'Pet not found'
                })
                return
            }

            // Check if images already exist
            const existingImages = await PetImageModel.findOne({
                petId
            })

            if (existingImages) {
                res.status(400).json({
                    message: 'Images already exist for this pet. Use update instead.'
                })
                return
            }

            // Upload images
            const images = await Promise.all(
                files.map(async (file) => {

                    const result = await uploadToCloudinary(
                        file.buffer
                    )

                    return {
                        url: result.secure_url,
                        publicId: result.public_id
                    }
                })
            )

            // Save to MongoDB
            const petImages = await PetImageModel.create({
                petId,
                images
            })

            res.status(201).json({
                message: 'Pet images added successfully',
                data: petImages
            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error adding pet images',
                error: err
            })
        }
    }
)




router.put(
    '/updatepetimages/:petId',
    adminmilldelwares,
    uploadImages,
    async (req: any, res) => {

        try {

            const { petId } = req.params

            if (!mongoose.Types.ObjectId.isValid(petId)) {
                res.status(400).json({
                    message: 'Invalid Pet ID'
                })
                return
            }

            const files = req.files as Express.Multer.File[]

            if (!files || files.length === 0) {
                res.status(400).json({
                    message: 'At least one new image is required'
                })
                return
            }

            if (files.length > 3) {
                res.status(400).json({
                    message: 'Maximum 3 images are allowed'
                })
                return
            }

            // Find old images
            const petImages = await PetImageModel.findOne({
                petId
            })

            if (!petImages) {
                res.status(404).json({
                    message: 'Pet images not found'
                })
                return
            }

            // Delete old images from Cloudinary
            await Promise.all(
                petImages.images.map(async (image) => {

                    await cloudinary.uploader.destroy(
                        image.publicId
                    )

                })
            )

            // Upload new images
            const newImages = await Promise.all(
                files.map(async (file) => {

                    const result = await uploadToCloudinary(
                        file.buffer
                        
                    )

                    return {
                        url: result.secure_url,
                        publicId: result.public_id
                    }
                })
            )

            // Update MongoDB
            petImages.images = newImages

            await petImages.save()

            res.status(200).json({
                message: 'Pet images updated successfully',
                data: petImages
            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error updating pet images',
                error: err
            })
        }
    }
)





router.delete(
    '/deletepetimages/:petId',
    adminmilldelwares,
    async (req: any, res) => {

        try {

            const { petId } = req.params

            if (!mongoose.Types.ObjectId.isValid(petId)) {
                res.status(400).json({
                    message: 'Invalid Pet ID'
                })
                return
            }

            const petImages = await PetImageModel.findOne({
                petId
            })

            if (!petImages) {
                res.status(404).json({
                    message: 'Pet images not found'
                })
                return
            }

            // Delete from Cloudinary
            await Promise.all(
                petImages.images.map(async (image) => {

                    await cloudinary.uploader.destroy(
                        image.publicId
                    )

                })
            )

            // Delete from MongoDB
            await PetImageModel.findOneAndDelete({
                petId
            })

            res.status(200).json({
                message: 'Pet images deleted successfully'
            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error deleting pet images',
                error: err
            })
        }
    }
)


router.get(
    '/users',
    adminmilldelwares,
    async (req: any, res) => {

        try {

            const users = await UserModel.find().lean()

            res.status(200).json({
                message: 'Users retrieved successfully',
                count: users.length,
                users
            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error getting users',
                error: err
            })

        }
    }
)











router.get(
    '/users/count',
    adminmilldelwares,
    async (req: any, res) => {

        try {

            const totalUsers = await UserModel.countDocuments()

            res.status(200).json({
                message: 'Users count retrieved successfully',
                totalUsers
            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error getting users count',
                error: err
            })

        }
    }
)


router.get(
    '/users/:id',
    adminmilldelwares,
    async (req: any, res) => {

        try {

            const { id } = req.params

            const user = await UserModel
                .findOne({
                    IdForLogin: id
                })
                .lean()

            if (!user) {
                res.status(404).json({
                    message: 'User not found'
                })
                return
            }

            const pets = await PetModel
                .find({
                    ownerId: user.IdForLogin
                })
                .lean()

            res.status(200).json({
                message: 'User retrieved successfully',

                user: {
                    ...user,
                    pets
                }
            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error getting user',
                error: err
            })

        }
    }
)



router.get(
    '/pets/statistics',
    adminmilldelwares,
    async (req: any, res) => {

        try {

            const totalPets = await PetModel.countDocuments()

            const stable = await PetModel.countDocuments({
                status: 'stable'
            })

            const critical = await PetModel.countDocuments({
                status: 'critical'
            })

            const improving = await PetModel.countDocuments({
                status: 'improving'
            })

            const Euthanized = await PetModel.countDocuments({
                status: 'Euthanized'
            })

            res.status(200).json({

                message: 'Pet statistics retrieved successfully',

                totalPets,

                status: {
                    stable,
                    critical,
                    improving,
                    Euthanized
                }

            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error getting pet statistics',
                error: err
            })

        }
    }
)




router.get(
    '/pets/filter',
    adminmilldelwares,
    async (req: any, res) => {

        try {

            const {
                status,
                species,
                sex,
                category
            } = req.query

            const filter: any = {}

            if (status) {
                filter.status = status
            }

            if (species) {
                filter.species = species
            }

            if (sex) {
                filter.sex = sex
            }

            if (category) {
                filter.category = category
            }

            const pets = await PetModel
                .find(filter)
                .lean()

            res.status(200).json({

                message: 'Pets filtered successfully',

                count: pets.length,

                filters: {
                    status: status || null,
                    species: species || null,
                    sex: sex || null,
                    category: category || null
                },

                pets

            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error filtering pets',
                error: err
            })

        }
    }
)




router.get(
    '/pets/:petId',
    adminmilldelwares,
    async (req: any, res) => {

        try {

            const { petId } = req.params

            if (!mongoose.Types.ObjectId.isValid(petId)) {
                res.status(400).json({
                    message: 'Invalid pet ID'
                })
                return
            }

            // Get pet
            const pet = await PetModel
                .findById(petId)
                .lean()

            if (!pet) {
                res.status(404).json({
                    message: 'Pet not found'
                })
                return
            }

            // Get vitals
            const vitals = await VitalModel
                .find({ petId })
                .sort({ date: -1 })
                .lean()

            // Get treatments
            const treatments = await TreatmentModel
                .find({ petId })
                .sort({ date: -1 })
                .lean()

            // Get images
            const petImages = await PetImageModel
                .findOne({ petId })
                .lean()

            res.status(200).json({

                message: 'Pet data retrieved successfully',

                pet,

                vitals,

                treatments,

                images: petImages?.images || []

            })

        } catch (err) {

            console.error(err)

            res.status(500).json({
                message: 'Error getting pet data',
                error: err
            })

        }
    }
)
//Add All E-commerce Routes
//Add Catgeory 
router.post('/addcategory',adminmilldelwares,async (req,res)=>{
    try{
    const Data=CategorySchemaZod.safeParse(req.body)
    if(!Data.success){
        res.status(400).json({
            message: 'Invalid category data',
            error: Data.error
        })
        return
    }
    const {name}=Data.data
    if(!name){
        res.status(400).json({message:'the name is  not exsists'})
        return 
    }
    const {data,status}=await addnewcategory({name})
    if(!data||!status){
        res.status(400).json({message:'the data and the status  is requried bro '})
    }
    res.status(status).json({data})
}catch(err){
    console.error(err)

            res.status(500).json({
                message: 'Error  add a new category',
                error: err
            })
}
})

//update the category 

router.post('/updatecategory/:iD', adminmilldelwares, async (req, res) => {
    try {
        const { iD } = req.params

        if (!iD) {
            res.status(400).json({
                message: 'The ID is required'
            })
            return
        }

       

        const id = new mongoose.Types.ObjectId(iD)

        const Data = CategorySchemaZod.safeParse(req.body)

        if (!Data.success) {
            res.status(400).json({
                message: 'Invalid category data',
                error: Data.error
            })
            return
        }

        const { name } = Data.data

        if (!name) {
            res.status(400).json({
                message: 'The name is required'
            })
            return
        }

        const { data, status } = await updatethecategory({
            name,
            id
        })

        if (!data || !status) {
            res.status(400).json({
                message: 'The data and status are required'
            })
            return
        }

        res.status(status).json({
            data
        })

    } catch (err) {
        console.error(err)

        res.status(500).json({
            message: 'Error update  category',
            error: err
        })
    }
})

//delete the category
router.delete( '/deletecategory/:iD', adminmilldelwares, async (req, res) => { 
    try { const { iD } = req.params;
     if (!iD) { 
        res.status(400).json({ message: 'The ID is required' });
         return; 
        } if (!mongoose.Types.ObjectId.isValid(iD)) 
            { res.status(400).json({ message: 'Invalid category ID' });
             return; 
            } 
            const id = new mongoose.Types.ObjectId(iD); 
            const { data, status } = await deletecategory({ id });
             if (!data || !status) {
                 res.status(400).json({ message: 'The data and status are required' });
                  return;
                 } res.status(status).json({ data }); 
                } catch (err) { console.error(err); 
                    res.status(500).json({ message: 'Error deleting category', error: err });
                 } 
                } 
            );

//send all filter 
router.get('/getallcategory', adminmilldelwares, async (req, res) => {
    try {
        const allcategory = await Category.find();
        res.status(200).json({ data: allcategory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching categories', error: err });
    }
})
//get the filter on sort from  big to small 
router.get('/getcatgeorysort', adminmilldelwares, async (req, res) => {
    try {
        const allcategory = await Category
            .find()
            .sort({ Number: -1 });

        res.status(200).json({
            data: allcategory
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: 'Error sorting categories',
            error: err
        });
    }
});
//crud operations on items 
router.post(
    '/additem',
    adminmilldelwares,
    upload.array('photos', 3),
    async (req, res) => {
        try {

            // =========================
            // 1. Get photos
            // =========================

            const files = req.files as Express.Multer.File[];

            if (!files || files.length < 1) {
                res.status(400).json({
                    message: 'At least one photo is required'
                });
                return;
            }

            if (files.length > 3) {
                res.status(400).json({
                    message: 'You can upload maximum 3 photos'
                });
                return;
            }


            // =========================
            // 2. Get body data
            // =========================

            const {
                productName,
                description,
                soldBy,
                price,
                category,
                minWeight,
                maxWeight
            } = req.body;


            // =========================
            // 3. Check required fields
            // =========================

            if (!productName) {
                res.status(400).json({
                    message: 'Product name is required'
                });
                return;
            }

            if (!description) {
                res.status(400).json({
                    message: 'Description is required'
                });
                return;
            }

            if (!soldBy) {
                res.status(400).json({
                    message: 'soldBy is required'
                });
                return;
            }

            if (soldBy !== 'unit' && soldBy !== 'weight') {
                res.status(400).json({
                    message: 'soldBy must be unit or weight'
                });
                return;
            }

            if (!price) {
                res.status(400).json({
                    message: 'Price is required'
                });
                return;
            }

            if (!category) {
                res.status(400).json({
                    message: 'Category is required'
                });
                return;
            }




            // =========================
            // 5. Check category exists
            // =========================

            const categoryExists = await Category.findOne({ name: category });

            if (!categoryExists) {
                res.status(404).json({
                    message: 'Category does not exist'
                });
                return;
            }


            // =========================
            // 6. Weight validation
            // =========================

            if (soldBy === 'weight') {

                if (!minWeight || !maxWeight) {
                    res.status(400).json({
                        message: 'minWeight and maxWeight are required for weight products'
                    });
                    return;
                }

                const minimum = Number(minWeight);
                const maximum = Number(maxWeight);

                if (minimum < 0.5) {
                    res.status(400).json({
                        message: 'Minimum weight must be at least 0.5 kg'
                    });
                    return;
                }

                if (maximum > 100) {
                    res.status(400).json({
                        message: 'Maximum weight cannot exceed 100 kg'
                    });
                    return;
                }

                if (minimum > maximum) {
                    res.status(400).json({
                        message: 'minWeight cannot be greater than maxWeight'
                    });
                    return;
                }

                if (minimum % 0.5 !== 0 || maximum % 0.5 !== 0) {
                    res.status(400).json({
                        message: 'Weight must be in increments of 0.5 kg'
                    });
                    return;
                }
            }


            // =========================
            // 7. Upload photos
            // =========================

            const photoUrls: string[] = [];

            for (const file of files) {

                const result = await new Promise<any>((resolve, reject) => {

                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'pet_planet'
                        },
                        (error, result) => {

                            if (error) {
                                reject(error);
                                return;
                            }

                            resolve(result);
                        }
                    );

                    stream.end(file.buffer);
                });

                photoUrls.push(result.secure_url);
            }


            // =========================
            // 8. Create product
            // =========================

            const productData: any = {
                productName,
                description,
                soldBy,
                price: Number(price),
                photos: photoUrls,
                category: new mongoose.Types.ObjectId(category),
                inStock: true,
                numberOfBuying: 0
            };


            // Only add weight fields
            // if product is sold by weight

            if (soldBy === 'weight') {
                productData.minWeight = Number(minWeight);
                productData.maxWeight = Number(maxWeight);
            }


            // =========================
            // 9. Save product
            // =========================

            const newProduct = await Product.create(productData);
            newProduct.save();
            const getall= await Product.find()

            // =========================
            // 10. Response
            // =========================

            res.status(201).json({
                message: 'Product added successfully',
                data: newProduct,
                all: getall
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Error adding product',
                error: err
            });
        }
    }
);
router.delete(
    '/deleteitem/:id',
    adminmilldelwares,
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    message: 'Product ID is required'
                });
                return;
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    message: 'Invalid product ID'
                });
                return;
            }

            const product = await Product.findByIdAndDelete(id);
            const getall= await Product.find()

            if (!product) {
                res.status(404).json({
                    message: 'Product does not exist'
                });
                return;
            }

            res.status(200).json({
                message: 'Product deleted successfully',
                data: product,
                all: getall
            });

        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: 'Error deleting product',
                error: err
            });
        }
    }
);



router.put(
    '/updateitem/:iD',
    adminmilldelwares,
    upload.array('photos', 3),
    async (req, res) => {
        try {
            const { iD } :any= req.params;

            if (!iD) {
                res.status(400).json({
                    message: 'Product ID is required'
                });
                return;
            }

           
const id= new mongoose.Types.ObjectId(iD);
            const product = await Product.findById(id);

            if (!product) {
                res.status(404).json({
                    message: 'Product does not exist'
                });
                return;
            }
            

            const {
                productName,
                description,
                soldBy,
                price,
                category,
                inStock,
                minWeight,
                maxWeight
            } = req.body;

            // =========================
            // Validate soldBy
            // =========================

            if (
                soldBy &&
                soldBy !== 'unit' &&
                soldBy !== 'weight'
        ) {
                res.status(400).json({
                    message: 'soldBy must be unit or weight'
                });
                return;
            }

            // =========================
            // Validate category
            // =========================

          
            if(!category){
                res.status(400).json({
                    message: 'Category is required'
                });
                return;
            }
                const categoryExists = await Category.findOne({name:category});

                if (!categoryExists) {
                    res.status(404).json({
                        message: 'Category does not exist'
                    });
                    return;
                }
        

            // =========================
            // Determine selling type
            // =========================

            const currentSoldBy  = soldBy || product.soldBy;

            // =========================
            // Weight validation
            // =========================

            if (currentSoldBy === 'weight') {

                const minimum =
                    minWeight !== undefined
                        ? Number(minWeight)
                        : product.minWeight;

                const maximum =
                    maxWeight !== undefined
                        ? Number(maxWeight)
                        : product.maxWeight;

                if (minimum === undefined || maximum === undefined) {
                    res.status(400).json({
                        message:
                            'minWeight and maxWeight are required for weight products'
                    });
                    return;
                }

                if (minimum < 0.5) {
                    res.status(400).json({
                        message:
                            'Minimum weight must be at least 0.5 kg'
                    });
                    return;
                }

                if (maximum > 100) {
                    res.status(400).json({
                        message:
                            'Maximum weight cannot exceed 100 kg'
                    });
                    return;
                }

                if (minimum > maximum) {
                    res.status(400).json({
                        message:
                            'minWeight cannot be greater than maxWeight'
                    });
                    return;
                }

                if (
                    minimum % 0.5 !== 0 ||
                    maximum % 0.5 !== 0
                ) {
                    res.status(400).json({
                        message:
                            'Weight must be in increments of 0.5 kg'
                    });
                    return;
                }
            }

            // =========================
            // Prepare update
            // =========================

            const updateData: any = {};

            if (productName !== undefined)
                updateData.productName = productName;

            if (description !== undefined)
                updateData.description = description;

            if (soldBy !== undefined)
                updateData.soldBy = soldBy;

            if (price !== undefined)
                updateData.price = Number(price);

            if (category !== undefined)
                updateData.category = category;

            if (inStock !== undefined)
                updateData.inStock =
                    inStock === true || inStock === 'true';

            // =========================
            // Weight fields
            // =========================

            if (currentSoldBy === 'weight') {

                if (minWeight !== undefined)
                    updateData.minWeight = Number(minWeight);

                if (maxWeight !== undefined)
                    updateData.maxWeight = Number(maxWeight);

            } else {

                // If changed from weight → unit
                updateData.minWeight = undefined;
                updateData.maxWeight = undefined;
            }

            // =========================
            // Photos
            // =========================

            const files = req.files as Express.Multer.File[];

            if (files && files.length > 0) {

                if (files.length > 3) {
                    res.status(400).json({
                        message:
                            'You can upload maximum 3 photos'
                    });
                    return;
                }

                const photoUrls: string[] = [];

                for (const file of files) {

                    const result = await new Promise<any>(
                        (resolve, reject) => {

                            const stream =
                                cloudinary.uploader.upload_stream(
                                    {
                                        folder: 'products'
                                    },
                                    (error, result) => {

                                        if (error) {
                                            reject(error);
                                            return;
                                        }

                                        resolve(result);
                                    }
                                );

                            stream.end(file.buffer);
                        }
                    );

                    photoUrls.push(result.secure_url);
                }

                updateData.photos = photoUrls;
            }

            // =========================
            // Update product
            // =========================

            const updatedProduct =
                await Product.findByIdAndUpdate(
                    id,
                    updateData,
                    {
                        new: true,
                        runValidators: true
                    }
                );
                const getall= await Product.find()

            res.status(200).json({
                message: 'Product updated successfully',
                data: updatedProduct,
                all:getall
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Error updating product',
                error: err
            });
        }
    }
);




router.get(
    '/getallitems',
    async (req, res) => {
        try {
            const allproducts = await Product.find();

            res.status(200).json({
                message: 'All products fetched successfully',
                data: allproducts
            });

        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: 'Error fetching products',
                error: err
            });
        }
    }
);



router.get(
    '/getitemsbycategory/:category',
    async (req, res) => {
        try {
            const { category } = req.params;

            if (!category) {
                res.status(400).json({
                    message: 'Category is required'
                });
                return;
            }

            const products = await Product.find({
                category: category
            });

            if (products.length === 0) {
                res.status(404).json({
                    message: 'No products found in this category'
                });
                return;
            }

            res.status(200).json({
                message: 'Products fetched successfully',
                data: products
            });

        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: 'Error fetching products by category',
                error: err
            });
        }
    }
);



router.get(
    '/getitemsbysales',
    async (req, res) => {
        try {
            const products = await Product.find()
                .sort({ numberOfBuying: -1 });

            res.status(200).json({
                message: 'Products sorted successfully',
                data: products
            });

        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: 'Error sorting products',
                error: err
            });
        }
    }
);

router.get(
    '/gettotalmoney',
    async (req, res) => {
        try {
            const result = await Product.aggregate([
                {
                    $group: {
                        _id: null,
                        totalMoney: {
                            $sum: '$price'
                        }
                    }
                }
            ]);

            const totalMoney = result.length > 0
                ? result[0].totalMoney
                : 0;

            res.status(200).json({
                message: 'Total money calculated successfully',
                totalMoney
            });

        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: 'Error calculating total money',
                error: err
            });
        }
    }
);



router.get(
    '/getitem/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({
                    message: 'Invalid product ID'
                });
                return;
            }

            const product = await Product.findById(id);

            if (!product) {
                res.status(404).json({
                    message: 'Product does not exist'
                });
                return;
            }

            res.status(200).json({
                message: 'Product fetched successfully',
                data: product
            });

        } catch (err) {
            console.error(err);

            res.status(500).json({
                message: 'Error fetching product',
                error: err
            });
        }
    }
);


router.get('/getallcategory/', async (req, res) => {
    try {
        const categories = await Category.find();

        res.status(200).json({
            message: 'Categories fetched successfully',
            data: categories
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: 'Error fetching categories',
            error: err
        });
    }
});


router.get('/getcategory/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: 'Invalid category ID'
            });
            return;
        }

        const category = await Category.findById(
            new mongoose.Types.ObjectId(id)
        );

        if (!category) {
            res.status(404).json({
                message: 'Category not found'
            });
            return;
        }

        res.status(200).json({
            message: 'Category fetched successfully',
            data: category
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: 'Error fetching category',
            error: err
        });
    }
});


// ==========================================
// ADMIN - ORDER MANAGEMENT
// ==========================================

router.get('/orders', adminmilldelwares, async (req: any, res) => {
    try {
        const { status, paymentMethod, search } = req.query

        const filter: any = {}

        if (status) {
            filter.status = status
        }

        if (paymentMethod) {
            filter.paymentMethod = paymentMethod
        }

        if (search) {
            filter.$or = [
                { userId: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ]
        }

        const orders = await OrderModel
            .find(filter)
            .sort({ createdAt: -1 })
            .lean()

        res.status(200).json({
            message: 'Orders retrieved successfully',
            count: orders.length,
            filters: {
                status: status || null,
                paymentMethod: paymentMethod || null,
                search: search || null
            },
            orders
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting orders',
            error: err
        })
    }
})

router.get('/orders/statistics', adminmilldelwares, async (req: any, res) => {
    try {
        const totalOrders = await OrderModel.countDocuments()
        const pending = await OrderModel.countDocuments({ status: 'pending' })
        const confirmed = await OrderModel.countDocuments({ status: 'confirmed' })
        const shipped = await OrderModel.countDocuments({ status: 'shipped' })
        const delivered = await OrderModel.countDocuments({ status: 'delivered' })
        const cancelled = await OrderModel.countDocuments({ status: 'cancelled' })
        const rejected = await OrderModel.countDocuments({ status: 'rejected' })

        const allOrders = await OrderModel.find().lean()
        const totalRevenue = allOrders
            .filter((o: any) => o.status === 'delivered')
            .reduce((sum: number, o: any) => sum + o.totalPrice, 0)

        res.status(200).json({
            message: 'Order statistics retrieved successfully',
            totalOrders,
            status: {
                pending,
                confirmed,
                shipped,
                delivered,
                cancelled,
                rejected
            },
            totalRevenue
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting order statistics',
            error: err
        })
    }
})

router.get('/orders/:id', adminmilldelwares, async (req: any, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: 'Invalid order ID'
            })
            return
        }

        const order = await OrderModel.findById(id).lean()

        if (!order) {
            res.status(404).json({
                message: 'Order not found'
            })
            return
        }

        res.status(200).json({
            message: 'Order retrieved successfully',
            order
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting order',
            error: err
        })
    }
})

router.put('/orders/update-status/:id', adminmilldelwares, async (req: any, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: 'Invalid order ID'
            })
            return
        }

        const result = OrderStatusValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        const order = await OrderModel.findById(id)

        if (!order) {
            res.status(404).json({
                message: 'Order not found'
            })
            return
        }

        const validTransitions: Record<string, string[]> = {
            'pending': ['confirmed', 'rejected'],
            'confirmed': ['shipped', 'rejected'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': [],
            'rejected': []
        }

        if (!validTransitions[order.status]?.includes(result.data.status)) {
            res.status(400).json({
                message: `Cannot change order status from '${order.status}' to '${result.data.status}'`
            })
            return
        }

        order.status = result.data.status as any
        await order.save()

        res.status(200).json({
            message: 'Order status updated successfully',
            order
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error updating order status',
            error: err
        })
    }
})

router.put('/orders/cancel/:id', adminmilldelwares, async (req: any, res) => {
    try {
        const { id } = req.params
        const { cancelReason } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: 'Invalid order ID'
            })
            return
        }

        const order = await OrderModel.findById(id)

        if (!order) {
            res.status(404).json({
                message: 'Order not found'
            })
            return
        }

        if (order.status === 'cancelled' || order.status === 'rejected') {
            res.status(400).json({
                message: 'Order is already cancelled or rejected'
            })
            return
        }

        if (order.status === 'delivered') {
            res.status(400).json({
                message: 'Cannot cancel a delivered order'
            })
            return
        }

        order.status = 'cancelled'
        order.cancelledBy = 'admin'
        order.cancelReason = cancelReason || 'Cancelled by admin'
        await order.save()

        res.status(200).json({
            message: 'Order cancelled successfully by admin',
            order
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error cancelling order',
            error: err
        })
    }
})


// ==========================================
// ADMIN - PAYMENT SETTINGS (manually add numbers)
// ==========================================

router.get('/payment-settings', adminmilldelwares, async (req: any, res) => {
    try {
        let paymentSettings = await AdminPaymentModel.findOne().lean()

        if (!paymentSettings) {
            paymentSettings = await AdminPaymentModel.create({
                instapayNumber: '',
                vodafoneCashNumber: '',
                instapayName: '',
                vodafoneCashName: '',
                isActive: true
            })
        }

        res.status(200).json({
            message: 'Payment settings retrieved successfully',
            payment: paymentSettings
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting payment settings',
            error: err
        })
    }
})

router.put('/payment-settings', adminmilldelwares, async (req: any, res) => {
    try {
        const result = AdminPaymentValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        let paymentSettings = await AdminPaymentModel.findOne()

        if (!paymentSettings) {
            const { instapayNumber, vodafoneCashNumber, instapayName, vodafoneCashName, isActive } = result.data
            paymentSettings = await AdminPaymentModel.create({
                instapayNumber: instapayNumber ?? '',
                vodafoneCashNumber: vodafoneCashNumber ?? '',
                instapayName: instapayName ?? '',
                vodafoneCashName: vodafoneCashName ?? '',
                isActive: isActive ?? true
            })
        } else {
            if (result.data.instapayNumber !== undefined) {
                paymentSettings.instapayNumber = result.data.instapayNumber
            }
            if (result.data.vodafoneCashNumber !== undefined) {
                paymentSettings.vodafoneCashNumber = result.data.vodafoneCashNumber
            }
            if (result.data.instapayName !== undefined) {
                paymentSettings.instapayName = result.data.instapayName
            }
            if (result.data.vodafoneCashName !== undefined) {
                paymentSettings.vodafoneCashName = result.data.vodafoneCashName
            }
            if (result.data.isActive !== undefined) {
                paymentSettings.isActive = result.data.isActive
            }
            await paymentSettings.save()
        }

        res.status(200).json({
            message: 'Payment settings updated successfully',
            payment: paymentSettings
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error updating payment settings',
            error: err
        })
    }
})


// ==========================================
// USER - PRODUCT FILTERS (per shop / per category)
// ==========================================

router.get('/products/filter', adminmilldelwares, async (req: any, res) => {
    try {
        const {
            category,
           
            inStock,
           
        } = req.query

        const filter: any = {}

        if (category) {
            filter.category = category
        }



        if (inStock !== undefined) {
            filter.inStock = inStock === 'true'
        }


        const products = await Product
            .find()
            

        res.status(200).json({
            message: 'Products filtered successfully',
            count: products.length,
            filters: {
                category: category || null,
                
                inStock: inStock || null,
               
            },
            products
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error filtering products',
            error: err
        })
    }
})




export default router


