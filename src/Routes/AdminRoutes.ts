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

export default router