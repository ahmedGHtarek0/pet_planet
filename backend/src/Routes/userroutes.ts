import express from 'express'
import PetImageModel from '../Database/Images'
import TreatmentModel from '../Database/TreatmentHistory'
import { PetModel } from '../Database/User'
import VitalModel from '../Database/VitalThings'
import { Product } from '../Database/PerUnite'
import { Category } from '../Database/category'
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


// ==========================================
// USER - PRODUCT FILTERS & LISTING
// ==========================================

router.get('/products', usermiddelwares, async (req: any, res) => {
    try {
        const {
            category,
            soldBy,
            minPrice,
            maxPrice,
            inStock,
            search,
            sortBy
        } = req.query

        const filter: any = {}

        if (category) {
            filter.category = category
        }

        if (soldBy) {
            filter.soldBy = soldBy
        }

        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = Number(minPrice)
            if (maxPrice) filter.price.$lte = Number(maxPrice)
        }

        if (inStock !== undefined) {
            filter.inStock = inStock === 'true'
        }

        if (search) {
            filter.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        let sortOption: any = { createdAt: -1 }

        if (sortBy === 'price-asc') {
            sortOption = { price: 1 }
        } else if (sortBy === 'price-desc') {
            sortOption = { price: -1 }
        } else if (sortBy === 'name') {
            sortOption = { productName: 1 }
        } else if (sortBy === 'popular') {
            sortOption = { numberOfBuying: -1 }
        }

        const products = await Product
            .find(filter)
            .sort(sortOption)
            .lean()

        res.status(200).json({
            message: 'Products retrieved successfully',
            count: products.length,
            filters: {
                category: category || null,
                soldBy: soldBy || null,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                inStock: inStock || null,
                search: search || null,
                sortBy: sortBy || null
            },
            products
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting products',
            error: err
        })
    }
})

router.get('/products/per-shop', usermiddelwares, async (req: any, res) => {
    try {
        const productsByCategory = await Product.aggregate([
            {
                $match: { inStock: true }
            },
            {
                $group: {
                    _id: '$category',
                    totalProducts: { $sum: 1 },
                    products: {
                        $push: {
                            _id: '$_id',
                            productName: '$productName',
                            price: '$price',
                            soldBy: '$soldBy',
                            photos: '$photos',
                            description: '$description',
                            numberOfBuying: '$numberOfBuying'
                        }
                    }
                }
            },
            {
                $sort: { totalProducts: -1 }
            }
        ])

        res.status(200).json({
            message: 'Products per shop retrieved successfully',
            count: productsByCategory.length,
            shops: productsByCategory
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting products per shop',
            error: err
        })
    }
})

router.get('/products/categories', usermiddelwares, async (req: any, res) => {
    try {
        const categories = await Category.find().lean()

        res.status(200).json({
            message: 'Categories retrieved successfully',
            categories
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting categories',
            error: err
        })
    }
})

router.get('/products/:id', usermiddelwares, async (req: any, res) => {
    try {
        const { id } = req.params

        const product = await Product.findById(id).lean()

        if (!product) {
            res.status(404).json({
                message: 'Product not found'
            })
            return
        }

        res.status(200).json({
            message: 'Product retrieved successfully',
            product
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting product',
            error: err
        })
    }
})


///opencode 
export default  router  