const userModel = require("../Models/userModel")
const productModel = require("../Models/productModel")
const cartModel = require("../Models/cartModel")
const { isValid } = require("../validations/validator")
const { isValidObjectId } = require("mongoose")



const createCart = async (req, res) => {

    try {

        const userSaveId = req.loggedInUser.user
        const userId = req.params.userId

        if (userId) {

            if (!isValidObjectId(userId)) { return res.status(400).send({ msg: "userId is InValid", status: false }) }

            const userData = await userModel.findOne({ _id: userId, isDeleted: false })

            if (!userData) {
                return res.status(404).send({ status: false, msg: "No user register" })
            }

            if (userSaveId !== userId.toString()) { return res.status(403).send({ msg: "user is not Authorised for this operation", status: false }) }

            if (Object.keys(req.body) == 0) {
                return res.status(400).send({ status: false, msg: "" })
            }

            let { productId, quantity, cartId } = req.body

            if (!isValid(productId)) {
                return res.status(400).send({ status: false, msg: "please provide productId" })
            }
            if (!isValidObjectId(productId)) {
                return res.status(400).send({ status: false, msg: "Invalid productId" })
            }

            quantity = quantity || 1

            if (isNaN(quantity)) {
                return res.status(400).send({ status: false, msg: "quntity should be number" })
            }
            if (typeof quantity !== "number") {
                return res.status(400).send({ status: false, msg: "quntity should be number type" })
            }

            const productExist = await productModel.findOne({ _id: productId, isDeleted: false })

            if (!productExist) {
                return res.status(404).send({ status: false, msg: "Product not found" })
            }

            // check cart already exist or not

            const cartExist = await cartModel.findOne({ userId }).lean()

            console.log(cartExist)

            console.log(cartExist)

            if (cartExist) {

                if (!isValid(cartId)) { return res.status(400).send({ status: false, msg: "please provide productId" }) }

                if (!isValidObjectId(cartId)) { return res.status(400).send({ status: false, msg: "Invalid cartId" }) }

                console.log(cartExist._id)
                if (cartExist._id.toString() !== cartId) {
                    return res.status(400).send({ status: false, msg: "cardId doesn't belong to the user" })
                }

                console.log(cartExist)

                for (let i = 0; i < (cartExist.items).length; i++) {
                    if (cartExist.items[i].productId == productId) {
                        cartExist.items[i].quantity = cartExist.items[i].quantity + quantity
                        cartExist.totalPrice = Math.round(cartExist.totalPrice + ((quantity) * (productExist.price)))


                        const updateCart = await cartModel.findOneAndUpdate({ _id: cartId }, cartExist, { new: true }).populate("items.productId", ["title", "price", "productImage"])

                        return res.status(201).send({ status: true, msg: "Item added successfully and Cart updated!", data: updateCart })
                    }
                }

                cartExist.items.push({ productId: productId, quantity: quantity })
                cartExist.totalItems = cartExist.totalItems + 1

                cartExist.totalPrice = Math.round(cartExist.totalPrice + ((quantity) * (productExist.price)))
                console.log(cartExist)

                const addProduct = await cartModel.findOneAndUpdate({ _id: cartId }, cartExist, { new: true }).populate("items.productId", ["title", "price", "productImage"])

                return res.status(201).send({ status: true, msg: "Item added successfully and Cart updated!", data: addProduct })



            }

            let totalPrice = Math.round(quantity * productExist.price)

            let obj = {
                userId,
                items: [{ productId: productId, quantity: quantity }],
                totalPrice,
                totalItems: 1
            }
            console.log(obj)
            const newCart = await cartModel.create(obj)

            const getCart = await cartModel.findOne({ _id: newCart._id }).populate("items.productId", ["title", "price", "productImage"])


            return res.status(201).send({ status: true, msg: "cart create succefully", data: getCart })



        } else {
            return res.status(500).send({ status: false, msg: "Please provide userId" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}


const getCart = async (req, res) => {
    try {

        const userSaveId = req.loggedInUser.user
        const userId = req.params.userId

        if (userId) {

            if (!isValidObjectId(userId)) { return res.status(400).send({ msg: "userId is InValid", status: false }) }

            const userData = await userModel.findOne({ _id: userId, isDeleted: false })

            if (!userData) {
                return res.status(404).send({ status: false, msg: "No user register" })
            }

            if (userSaveId !== userId.toString()) { return res.status(403).send({ msg: "user is not Authorised for this operation", status: false }) }


            const cartData = await cartModel.findOne({ userId: userId, isDeleted: false }).populate("items.productId", ["title", "price", "productImage"])

            if (!cartData) {

                return res.status(400).send({ status: false, message: `cartData  doesn't exist or cartData is deleted` });

            };


            return res.status(200).send({ status: true, data: cartData });
        } else {
            return res.status.send({ status: false, msg: "provide userId" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}




const deleteCart = async function (req, res) {

    try {

        const userSaveId = req.loggedInUser.user
        const userId = req.params.userId

        if (userId) {

            if (!isValidObjectId(userId)) { return res.status(400).send({ msg: "userId is InValid", status: false }) }

            const userData = await userModel.findOne({ _id: userId, isDeleted: false })

            if (!userData) {
                return res.status(404).send({ status: false, msg: "No user register" })
            }

            if (userSaveId !== userId.toString()) { return res.status(403).send({ msg: "user is not Authorised for this operation", status: false }) }

            const checkCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } })

            if (checkCart && checkCart.totalItems == 0) {
                return res.status(400).send({ status: false, message: "Cart is already empty" })
            }
            if (!checkCart) { return res.status(404).send({ status: true, message: 'Cart Not Found' }) }

            return res.status(200).send({ status: true, message: "Cart Deleted successfully" })


        } else {
            return res.status(400).send({ status: false, msg: "provide UserId" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}





module.exports.createCart = createCart
module.exports.getCart = getCart
module.exports.deleteCart = deleteCart