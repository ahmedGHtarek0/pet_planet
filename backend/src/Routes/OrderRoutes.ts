import express from 'express'
import { OrderValidator, OrderCancelValidator, OrderModel } from '../Database/Order'
import { AdminPaymentModel } from '../Database/AdminPayment'
import { usermiddelwares } from '../middlewares/User'
import { createOrder, cancelOrder, getMyOrders, getMyOrderById } from '../Services/OrderService'

const router = express.Router()


// ==========================================
// GET - Get admin payment numbers (for user to see where to pay)
// ==========================================
router.get('/payment-info', usermiddelwares, async (req: any, res) => {
    try {
        const paymentInfo = await AdminPaymentModel
            .findOne({ isActive: true })
            .lean()

        if (!paymentInfo) {
            res.status(404).json({
                message: 'Payment information not available'
            })
            return
        }

        res.status(200).json({
            message: 'Payment info retrieved successfully',
            payment: {
                instapayNumber: paymentInfo.instapayNumber,
                instapayName: paymentInfo.instapayName,
                vodafoneCashNumber: paymentInfo.vodafoneCashNumber,
                vodafoneCashName: paymentInfo.vodafoneCashName
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting payment info',
            error: err
        })
    }
})


// ==========================================
// POST - Create new order
// ==========================================
router.post('/create-order', usermiddelwares, async (req: any, res) => {
    try {
        const { IdForLogin } = req.user

        const result = OrderValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        const { data, status } = await createOrder({
            userId: IdForLogin,
            items: result.data.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                weight: item.weight ?? undefined
            })),
            paymentMethod: result.data.paymentMethod,
            paymentScreenshot: result.data.paymentScreenshot ?? undefined,
            phone: result.data.phone,
            address: result.data.address,
            notes: result.data.notes ?? undefined
        })

        res.status(status).json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error creating order',
            error: err
        })
    }
})


// ==========================================
// GET - Get my orders
// ==========================================
router.get('/my-orders', usermiddelwares, async (req: any, res) => {
    try {
        const { IdForLogin } = req.user
        const { status } = req.query

        const { data, status: statusCode } = await getMyOrders(IdForLogin, status as string)

        res.status(statusCode).json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting orders',
            error: err
        })
    }
})


// ==========================================
// GET - Get single order by ID
// ==========================================
router.get('/my-orders/:id', usermiddelwares, async (req: any, res) => {
    try {
        const { IdForLogin } = req.user
        const { id } = req.params

        const { data, status } = await getMyOrderById(id, IdForLogin)

        res.status(status).json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error getting order',
            error: err
        })
    }
})


// ==========================================
// PUT - Cancel order (only allowed if status is pending or confirmed)
// ==========================================
router.put('/cancel-order/:id', usermiddelwares, async (req: any, res) => {
    try {
        const { IdForLogin } = req.user
        const { id } = req.params

        const result = OrderCancelValidator.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid data',
                errors: result.error
            })
            return
        }

        const { data, status } = await cancelOrder(
            id,
            IdForLogin,
            result.data.cancelReason
        )

        res.status(status).json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: 'Error cancelling order',
            error: err
        })
    }
})


///opencode
export default router
