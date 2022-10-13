const { isValidObjectId, uploadFile } = require("../validations/validator")
const productModel = require("../Models/productModel")
let { isValidfile, isValid, isValidPrice, isValidintall } = require("../validations/validator")


const createProduct = async function (req, res) {
    try {

        let data = JSON.parse(JSON.stringify(req.body))

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data
        let files = req.files

        
        if (Object.keys(data) == 0) {
            return res.status(400).send({ status: false, message: "Data is required for create product" })
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Product title is required or should be valid" })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "Product Description is required or should be valid" })
        }
        if (!isValidPrice(price)) {
            return res.status(400).send({ status: false, message: "Product price is required or should be valid (Ex- Number/Desimal) " })
        }
        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "CurrencyId is Required or should be valid" })
        }
        if (currencyId !== "INR") {
            return res.status(400).send({ status: false, message: " CurrencyId, Only INR is accepted" })
        }
        if (!isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "CurrencyFormat is Required or should be valid" })
        }
        if (currencyFormat !== "₹") {
            return res.status(400).send({ status: false, message: "Currency Format Only ₹ is accepted" })
        }
        if (isFreeShipping) {
           
            if (isFreeShipping != "true" && isFreeShipping != "false"){
                return res.status(400).send({ status: false, message: "isFreeShipping should be boolean value" })
            }
        }

        if (files.length === 0) {
            return res.status(400).send({ status: false, message: "ProfileImage is required." });
        }

        if (!isValidfile(files[0].originalname)) {
            return res.status(400).send({ status: false, message: "ProfileImage extension should be [ jpg|JPG|gif|GIF|webp|tiff?|bmp|png|PNG|pdf|jpeg|JPEG ]" });
        }

        if (style || typeof style == "string") {
           
            if (!isValid(style)) {
                return res.status(400).send({ status: false, message: "Style is required or should be valid" })
            }
        }
        
        if (availableSizes && typeof availableSizes == "string" ) {
           
            if (!isValid(availableSizes)) {
                return res.status(400).send({ status: false, message: "AvailableSizes is Required" })
            }

            availableSizes = availableSizes.split(",").map((x) => x.trim().toUpperCase())
            if (availableSizes.length == 0) {
                return res.status(400).send({ status: false, message: 'Please put product availablesizes' })
            }

            let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            for (let i = 0; i < availableSizes.length; i++) {
                if (sizes.includes(availableSizes[i]) == false) {
                    return res.status(400).send({ status: false, message: "Available sizes shoule be [S, XS, M, X, L, XXL, XL]" })
                }

            }
           
            data.availableSizes = availableSizes
           obj.availableSizes = availableSizes
        }
  
        if (installments) {
            if (!isValidintall(installments)) {
                return res.status(400).send({ status: false, message: "Installment should be number." })
            }
        }

        let titleExist = await productModel.findOne({title });
        if (titleExist) {
            return res.status(400).send({ status: false, message: "Product title already present in DB" })
        }

        let profilePic = await uploadFile(files[0])
        data.productImage = profilePic

        let saveProduct = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Product Created Successfully", data: saveProduct })
    }

    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



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

            const product = productModel.findOne({ title: { $regex: name, $options: "i" }, isDeleted: false })
            if (!product) { return res.status(404).send({ status: false, msg: "" }) }

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

        const ProductByProductId = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!ProductByProductId) return res.status(404).send({ staus: false, message: "No such product exist with this Id" })

        return res.status(200).send({ status: true, message: "success", data: ProductByProductId })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const updateProduct = async function (req, res) {

    try {

        const productId = req.params.productId

        if (!productId) {
            return res.status(400).send({status : false , msg : "No parameter found,please provide Id"})
        }
        if (!isValidObjectId(productId)) { return res.status(400).send({status : false , msg : "Invalid ProductId"}) }

        const productExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExist) {
            return res.status(404).send({status : false , msg : "No prodoct Found"})
        }

        let data = JSON.parse(JSON.stringify(req.body))
        let updProduct = {}
        let updArray = {}
        let file = req.files

         console.log(file)
         console.log(data)
         
        if ((Object.keys(data).length == 0)  &&  (!file || file.length ==0)) { return res.status(400).send({ status: false, msg: "No data for updation , plz provide data" }) }
        // if((Object.values(data).join("").length == 0) && (!file || file.length ==0) ) {return res.status(400).send({status : false , msg : "provide valid values"})}

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments , productImage } = data
        

        if(typeof productImage == "string" ){
            return res.status(400).send({status : false , msg : "profileImage is not in textFormat"})
        }
        if (title || typeof title == "string") {
            if (!isValid(title)) { return res.status(400).send({status : false , msg : "Product title should be valid" }) }

            const isAlready = await productModel.findOne({ title: title, isDeleted: false })

            if (isAlready) { return res.status(409).send({status : false , msg : "title us already present , plz provide other name"}) }

            updProduct.title = title
        }
        if (description || typeof description == "string") {
            if (!isValid(description)) { return res.status(400).send({status : false , msg : "Product description should be valid"}) }
            updProduct.description = description
        }
        if (price || typeof price == "string") {
            if (!isValidPrice(price)) { return res.status(400).send({status : false , msg : "Product price should be valid (Ex- Number/Desimal)" })}
            updProduct.price = price
        }
        if (currencyId || typeof currencyId == "string") {
            if (!isValid(currencyId)) { return res.status(400).send({status : false , msg : "currencyId should be valid"}) }
            if (currencyId !== "INR") { return res.status(400).send({ status: false, message: " CurrencyId, Only INR is accepted" }) }

            // updProduct.currencyId = currencyId
        }
        if (currencyFormat || typeof currencyFormat == "string") {
            if (!isValid(currencyFormat)) { return res.status(400).send({ status: false, message: "CurrencyFormat should be valid" }) }
            if (currencyFormat !== "₹") { return res.status(400).send({ status: false, message: "Currency Format Only ₹ is accepted" }) }

            // updProduct.currencyFormat = currencyFormat
        }
        if (isFreeShipping || typeof isFreeShipping == "string") {
            console.log(typeof isFreeShipping , isFreeShipping)
            if (isFreeShipping != "true" && isFreeShipping != "false") { return res.status(400).send({status : false , msg : "isFreeShipping should be Boolean Value"})}

            updProduct.isFreeShipping = isFreeShipping
        }
        if (file.length !== 0) {

            if (!isValidfile(file[0].originalname)) { return res.status(400).send({status : false , msg : "ProductImage should be valid extention"}) }

            const uploadAws = await uploadFile(file[0])

            updProduct.productImage = uploadAws

        }
        if (style || typeof style == "string") {
            if (!isValid(style)) { return res.status(400).send({status : false , msg : "style should be valid"}) }

            updProduct.style = style

        }
        if (availableSizes || typeof availableSizes == "string") {
             if(availableSizes.trim().length == 0){
                return res.status(400).send({status : false , msg : "Provide size"})
             }
            availableSizes = availableSizes.split(",").map(x => x.trim().toUpperCase())  //["XL", "M"]
             console.log(availableSizes)
            let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]  //  [ "XS", "M"] , ["L","XS","M"] // s , xl ,m ,xxl

            for (let i = 0; i < availableSizes.length; i++) {
                if (!sizes.includes(availableSizes[i])) {
                    return res.status(400).send({ status: false, msg: `${availableSizes[i]} is Not category "S", "XS", "M", "X", "L", "XXL", "XL"` })
                }
            }

            updArray.availableSizes = {}  // {availab : {}}
            updArray.availableSizes.$each = availableSizes // {availab : {$each : ["m","xl"]}}

        }
        if (installments || typeof installments == "string") {
            if (!isValidintall(installments)) { return res.status(400).send({status : false , msg : "Installment should be number , min->1 ,max->99 installment"}) }

            updProduct.installments = installments
        }

        const dataUpadate = await productModel.findByIdAndUpdate({ _id: productId, isDeleted: false }, { $set: updProduct, $addToSet: updArray }, { new: true })

        return res.status(200).send({ status: true, msg: "Product is successfully updated", data: dataUpadate })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const deleteById = async function (req, res) {

    try {
        let productId = req.params.productId

        if (!isValidObjectId(productId)) {

            return res.status(400).send({ status: false, message: "Invalid ProductId " })
        }
        let productDel = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false, }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

        console.log(productDel)
        if (!productDel) {
            return res.status(404).send({ status: false, message: "No product found by given ProductId" })
        }
        return res.status(200).send({ status: true, message: "Product Deleted Succesfully"})

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }
}





module.exports.createProduct = createProduct
module.exports.getProduct = getProduct
module.exports.getDetailsFromParam = getDetailsFromParam
module.exports.updateProduct = updateProduct
module.exports.deleteById = deleteById


