const { isValidObjectId } = require("../validations/validator")
const productModel = require("../Models/productModel")



const getProduct = async function (req, res) {

    try {
        const productDetail = { isDeleted: false }  // {isDeleted : false , name : substring ,size : [] , price : {$gt : 50 , $lt : 100}}.sort(price : 1 || - 1)
        const sorting = {}

        const { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query

        if (size) {

            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)) { return res.status(400).send({ status: false, msg: "" }) }
            productDetail.availableSizes = size
        }
        if (name) {

            const product = productModel.findOne({ title: { $regex: name, $options: "i" } })
            if (!product) { return res.status(404).send({ status: false, msg: "" }) }
            console.log(product)
            productDetail.title = { $regex: name, $options: "i" }

        }
        if (priceGreaterThan) {
            if (!/^(\d*\.)?\d+$/.test(priceGreaterThan)) { return res.status(400).send({}) }
            productDetail.price = { $gt: Number(priceGreaterThan) }
        }
        if (priceLessThan) {
            if (!/^(\d*\.)?\d+$/.test(priceLessThan)) { return res.status(400).send({}) }
            if (!productDetail.price) {
                productDetail.price = { $lt: Number(priceGreaterThan) }
            }
            productDetail.price.$lt = Number(priceLessThan)

        }
        if (priceSort) {
            if (priceSort != 1 && priceSort != -1) { return res.status(400).send({}) }
            sorting.price = Number(priceSort)
        }

        console.log(productDetail)
        const productGet = await productModel.find(productDetail).sort(sorting)

        if (productGet.length == 0) {
            return res.status(404).send({ status: false, msg: "No product found" })
        }

        return res.status(200).send({ status: true, data: productGet })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const getDetailsFromParam = async function (req, res) {

    try {
        let productId = req.params.productId

        if (!productId) return res.status(400).send({ status: false, message: "No parameter found" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid ProductID" })

        const ProductByProductId = await productModel.findById({ _id: productId, isDeleted: false })
        if (!ProductByProductId) return res.status(404).send({ staus: false, message: "No such product exist with this Id" })

        return res.status(200).send({ status: true, message: "success", data: ProductByProductId })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const deleteById = async function (req, res) {

    try {
        let productId = req.params.productId

        if (!isValidObjectId(productId)) {

            return res.status(400).send({ status: false, message: "Invalid ProductId " })
        }
        let Product = await productModel.findOneAndUpdate({ _id: productId , isDeleted:false,},{$set:{isDeleted:true,deletedAt:Date.now()}},{new:true})

        if (!Product) {
            return res.status(404).send({ status: false, message: "No product found by given ProductId" })
        }
        return res.status(200).send({ status: true,message:"Product Deleted Succesfully", data:Product })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }
}





module.exports.getProduct = getProduct
module.exports.getDetailsFromParam = getDetailsFromParam
module.exports.deleteById=deleteById


