const orderModel = require("../Models/orderModel")
const userModel = require("../Models/userModel")
const cartModel = require("../Models/cartModel")
const { isValid } = require("../validations/validator")
const { isValidObjectId } = require("mongoose")



const createOrder = async function (req, res) {
    try {

        const userSaveId = req.loggedInUser.user
        let userId = req.params.userId
        let data = req.body


        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: `Please Enter valid UserId` })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `Enter Valid UserId` })
        }
        let findUser = await userModel.findOne({ _id: userId })
        console.log(findUser)
        if (!findUser) {
            return res.status(404).send({ status: false, message: `UserId not existed` })
        }

        console.log(userSaveId)
        if (userSaveId !== userId.toString()) {
            return res.status(403).send({ status: false, message: "User is not Authorised for this operation", })
        }
        // validation of cart details
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: `Data is required for Order Placed` })
        }

        let { cartId, cancellable } = data

        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: `Please Enter Valid Cart Id` })
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: `CartId is not Valid` })
        }
        let findCart = await cartModel.findOne({ _id: cartId, userId: userId }).select({ updatedAt: 0, createdAt: 0, __v: 0, _id: 0 })
        if (!findCart) {
            return res.status(400).send({ status: false, message: `CartId not existed belongs to given userId` })
        }

        if (findCart.items.length == 0) {
            return res.status(400).send({ status: false, message: `Cart is empty, Please Add atleast one product to placed order.` })
        }
        if (cancellable) {

            cancellable = cancellable.toLowerCase()
            if (cancellable !== 'true' && cancellable !== 'false') {
                return res.status(400).send({ status: false, Message: "Cancellable Value must be boolean" })
            }

        }
      

        let { items, totalPrice, totalItems } = findCart

        let totalQuantity = 0
        items.forEach(value => totalQuantity += value.quantity)

          

        let orderData = { userId, items, totalPrice, totalItems, totalQuantity, cancellable }
        let placedOrder = await orderModel.create(orderData)
        res.status(201).send({ status: true, message: "Order Created Successfully", data: placedOrder })

        // removed product data in cart after the place oder & user cart will be empty
       await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true });


    }


    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createOrder }