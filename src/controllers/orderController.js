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

const updateOrder=async function(req,res){

    try {
        
        let userId=req.params.userId
        let tokenUserId=req.loggedInUser.user
        let data=req.body
        const {orderId,status}=data
        if(userId){

            if(!isValidObjectId(userId)){return res.status(400).send({status:false,message:"Invalid UserId"})}
            
            
            const checkUser=await userModel.findById(userId)
            
            if(!checkUser)
            {return res.status(404).send({status:false,message:"User not found with given UserId"})}
           
            if(userId!==tokenUserId.toString()){return res.status(403).send({status:false,message:"user is not Authorised for this operation"})}
            
            if(Object.keys(data).length==0)
            {return res.status(400).send({status:false,message:"Body should not be empty"})}
            
            if(!orderId){return res.status(400).send({status:false,message:"OrderId is required"})}

            if(!isValidObjectId(orderId)){return res.status(400).send({status:false,message:"Invalid orderId"})}

            if(!status){return res.status(400).send({status:false,message:"Status is required"})}


            let statusArr=[ "completed", "cancelled"]
            
            // if(status=="pending"){return res.status(400).send({status:false,message:"Status pending is not allowed"})}
              
            if(!statusArr.includes(status))
            {return res.status(400).send({status:false,message:"Status should only Completed or cancelled"})}
            
            const checkStatus=await orderModel.findById(orderId)
            console.log(checkStatus)
            
            if(checkStatus.status=="completed"&&[status=="cancelled" || status=="completed"]){
                
                return res.status(400).send({status:false,message:"Invalid Status ,Order is already completed "})
            }
            if(checkStatus.status=="cancelled"&&[status=="completed"||status=="cancelled"]){

                return res.status(400).send({status:false,message:"Invalid Status ,Order is already cancelled "})
            }
            
            if (checkStatus.cancellable==false){
                return res.status(400).send({status:false,message:"Sorryyy ! This Order is not Cancellable "})
            
            }

            const update=await orderModel.findOneAndUpdate({_id:orderId,cancellable:true},{$set:{status:status}},{new:true}).populate("items.productId",["title", "price", "productImage"])
            
            
            if(!update){return res.status(404).send({status:false,message:"Order not found With given OrderId"})}

            return res.status(200).send({status:true ,message:"Status Updated Succesfully",data:update})

        }else{
            return res.status(400).send({status:false,message:"Please Provide a UserId"})
        }
        
    } catch (error) {
        
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={updateOrder}

module.exports = { createOrder }