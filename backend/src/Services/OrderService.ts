import { OrderModel } from '../Database/Order'
import { Product } from '../Database/PerUnite'
import mongoose from 'mongoose'

interface CreateOrderData {
    userId: string
    items: Array<{
        productId: string
        quantity: number
        weight: number | undefined
    }>
    paymentMethod: 'instapay' | 'vodafonecash'
    paymentScreenshot: string | undefined
    phone: string
    address: string
    notes: string | undefined
}

const createOrder = async (data: CreateOrderData) => {
    try {
        if (!data.items || data.items.length === 0) {
            return {
                data: 'At least one item is required',
                status: 400
            }
        }

        if (!data.paymentMethod) {
            return {
                data: 'Payment method is required',
                status: 400
            }
        }

        if (!data.phone) {
            return {
                data: 'Phone number is required',
                status: 400
            }
        }

        if (!data.address) {
            return {
                data: 'Address is required',
                status: 400
            }
        }

        const orderItems: any[] = []
        let totalPrice = 0

        for (const item of data.items) {
            const product = await Product.findById(item.productId)

            if (!product) {
                return {
                    data: `Product not found: ${item.productId}`,
                    status: 404
                }
            }

            if (!product.inStock) {
                return {
                    data: `Product out of stock: ${product.productName}`,
                    status: 400
                }
            }

            if (product.soldBy === 'weight') {
                if (!item.weight) {
                    return {
                        data: `Weight is required for: ${product.productName}`,
                        status: 400
                    }
                }

                if (product.minWeight && item.weight < product.minWeight) {
                    return {
                        data: `Minimum weight for ${product.productName} is ${product.minWeight}kg`,
                        status: 400
                    }
                }

                if (product.maxWeight && item.weight > product.maxWeight) {
                    return {
                        data: `Maximum weight for ${product.productName} is ${product.maxWeight}kg`,
                        status: 400
                    }
                }

                const itemTotal = product.price * item.weight
                totalPrice += itemTotal

                orderItems.push({
                    productId: product._id,
                    productName: product.productName,
                    price: product.price,
                    quantity: item.quantity,
                    soldBy: product.soldBy,
                    weight: item.weight
                })
            } else {
                const itemTotal = product.price * item.quantity
                totalPrice += itemTotal

                orderItems.push({
                    productId: product._id,
                    productName: product.productName,
                    price: product.price,
                    quantity: item.quantity,
                    soldBy: product.soldBy
                })
            }
        }

        const order = await OrderModel.create({
            userId: data.userId,
            items: orderItems,
            totalPrice,
            status: 'pending',
            paymentMethod: data.paymentMethod,
            ...(data.paymentScreenshot !== undefined ? { paymentScreenshot: data.paymentScreenshot } : {}),
            phone: data.phone,
            address: data.address,
            ...(data.notes !== undefined ? { notes: data.notes } : {})
        })

        for (const item of data.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { numberOfBuying: item.quantity }
            })
        }

        return {
            data: {
                message: 'Order created successfully',
                order
            },
            status: 201
        }
    } catch (err) {
        return {
            data: err,
            status: 500
        }
    }
}

const cancelOrder = async (orderId: string, userId: string, cancelReason: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return {
                data: 'Invalid order ID',
                status: 400
            }
        }

        const order = await OrderModel.findById(orderId)

        if (!order) {
            return {
                data: 'Order not found',
                status: 404
            }
        }

        if (order.userId !== userId) {
            return {
                data: 'You can only cancel your own orders',
                status: 403
            }
        }

        if (order.status === 'shipped' || order.status === 'delivered') {
            return {
                data: 'Cannot cancel order after it has been shipped or delivered',
                status: 400
            }
        }

        if (order.status === 'cancelled' || order.status === 'rejected') {
            return {
                data: 'Order is already cancelled or rejected',
                status: 400
            }
        }

        order.status = 'cancelled'
        order.cancelledBy = 'user'
        order.cancelReason = cancelReason
        await order.save()

        return {
            data: {
                message: 'Order cancelled successfully',
                order
            },
            status: 200
        }
    } catch (err) {
        return {
            data: err,
            status: 500
        }
    }
}

const getMyOrders = async (userId: string, status?: string) => {
    try {
        const filter: any = { userId }

        if (status) {
            filter.status = status
        }

        const orders = await OrderModel
            .find(filter)
            .sort({ createdAt: -1 })
            .lean()

        return {
            data: {
                message: 'Orders retrieved successfully',
                count: orders.length,
                orders
            },
            status: 200
        }
    } catch (err) {
        return {
            data: err,
            status: 500
        }
    }
}

const getMyOrderById = async (orderId: string, userId: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return {
                data: 'Invalid order ID',
                status: 400
            }
        }

        const order = await OrderModel
            .findById(orderId)
            .lean()

        if (!order) {
            return {
                data: 'Order not found',
                status: 404
            }
        }

        if (order.userId !== userId) {
            return {
                data: 'You can only view your own orders',
                status: 403
            }
        }

        return {
            data: {
                message: 'Order retrieved successfully',
                order
            },
            status: 200
        }
    } catch (err) {
        return {
            data: err,
            status: 500
        }
    }
}

export { createOrder, cancelOrder, getMyOrders, getMyOrderById }
