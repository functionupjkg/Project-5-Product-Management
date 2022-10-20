const { isValidObjectId, uploadFile } = require("../validations/validator")
const productModel = require("../Models/productModel")
let { isValidfile, isValid, isValidPrice, isValidintall } = require("../validations/validator")


//================================================ [ Create Product API ] =============================================
const createProduct = async function (req, res) {
    try {

        let data = JSON.parse(JSON.stringify(req.body))

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments,productImage } = data
        let files = req.files


        if (Object.keys(data) == 0 && (!files || files.length == 0)) {
            return res.status(400).send({ status: false, message: "Data is required for create product" })
        }
        if (productImage || typeof productImage == "string"){
            return res.status(400).send({status : false , message : "profileImage containing only file"})
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Product title is required or should be valid" })
        }

        data.title = title.split(" ").filter((x)=>x).join(" ") // "Nut      sh   " = ["N","u","t","","" ,"s" ,"h"] =>["N","u","t","s","h"] => Nut sh

        let titleExist = await productModel.findOne({ title });
        if (titleExist) {
            return res.status(400).send({ status: false, message: "Product title already present in DB" })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "Product Description is required or should be valid" })
        }

        data.description = description.split(" ").filter((x)=>x).join(" ")

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
        if (isFreeShipping || typeof isFreeShipping == "string" ) { 
                
            isFreeShipping = isFreeShipping.trim().toLowerCase()

            if (isFreeShipping != "true" && isFreeShipping != "false") {
                return res.status(400).send({ status: false, message: "isFreeShipping should be boolean value" })
            }
            
            data.isFreeShipping = isFreeShipping  

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

            data.style = style.split(" ").filter((x)=>x).join(" ")

        }

        if (!isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "AvailableSizes is Required" })
        }

        availableSizes = availableSizes.split(",").map((x) => x.trim().toUpperCase()) // split(",") => seperated the character from (,)

        let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        for (let i = 0; i < availableSizes.length; i++) {
            if (sizes.includes(availableSizes[i]) == false) {
                return res.status(400).send({ status: false, message: "Available sizes shoule be [S, XS, M, X, L, XXL, XL]" })
            }

            data.availableSizes = availableSizes
        }

        if (installments || typeof installments == "string") {
            if (!isValidintall(installments)) {
                return res.status(400).send({ status: false, message: "Installment should be number and is 1-99" })
            }
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


//================================================ [ Get Product API ] =============================================
const getProduct = async function (req, res) {

    try {

        const productDetail = { isDeleted: false }  // {isDeleted : false , name : substring ,size : [] , price : {$gt : 50 , $lt : 100}}.sort(price : 1 || - 1)
        const sorting = {}

        let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query

        if (size || typeof size == "string") { 
                
            size = size.trim().toUpperCase()
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)) { return res.status(400).send({ status: false, message: "plz provide size for filter product" }) }
            productDetail.availableSizes = size
        }
        if (name || typeof name == "string") { 

            if (!isValid(name)) { return res.status(400).send({ status: false, message: "Plz provide valid name" }) }

            productDetail.title = { $regex: name, $options: "i" }  

        }
        if (priceGreaterThan || typeof priceGreaterThan == "string") {
            if (!/^(\d*\.)?\d+$/.test(priceGreaterThan)) { return res.status(400).send({status : false , message : "provide valid price to filter"}) }
            productDetail.price = { $gt: Number(priceGreaterThan) } // findOne({price :{$gt : 100}})
        }
        if (priceLessThan || typeof priceLessThan == "string") {
            if (!/^(\d*\.)?\d+$/.test(priceLessThan)) { return res.status(400).send({status : false , message : "provide valid price for filter"}) }
            if (!productDetail.price) {
                productDetail.price = { $lt: Number(priceGreaterThan) } //findOne({price :{$lt : 100}})
            }
            productDetail.price.$lt = Number(priceLessThan)  // findOne({price :{$gt : 100 , $lt : 500}})

        }
        if (priceSort || typeof priceSort == "string") {
            if (priceSort != 1 && priceSort != -1) { return res.status(400).send({status : false , message : "the value should be 1 or -1"}) }
            sorting.price = Number(priceSort)
        }

        console.log(productDetail)
        const productGet = await productModel.find(productDetail).sort(sorting)

        if (productGet.length == 0) {
            return res.status(404).send({ status: false, message: "No product found" })
        }

        return res.status(200).send({ status: true, data: productGet })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//================================================ [ Get Product by  Params API ] =============================================
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

//================================================ [ Update Product API ] =============================================
const updateProduct = async function (req, res) {

    try {

        const productId = req.params.productId

        if (!productId) {
            return res.status(400).send({ status: false, message: "No parameter found,please provide Id" })
        }
        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Invalid ProductId" }) }

        const productExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExist) {
            return res.status(404).send({ status: false, message: "No prodoct Found" })
        }

        let data = JSON.parse(JSON.stringify(req.body))
        let updProduct = {}
        let updArray = {}
        let file = req.files

        console.log(file)
        console.log(data)

        if ((Object.keys(data).length == 0) && (!file || file.length == 0)) { return res.status(400).send({ status: false, message: "No data for updation , plz provide data" }) }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = data


        if (typeof productImage == "string") {
            return res.status(400).send({ status: false, message: "profileImage is not in textFormat" })
        }

        if (title || typeof title == "string") {

            if (!isValid(title)) { return res.status(400).send({ status: false, message: "Product title should be valid" }) }

            title = title.split(" ").filter((x)=>x).join(" ")

            const isAlready = await productModel.findOne({ title: title, isDeleted: false })

            if (isAlready) { return res.status(409).send({ status: false, message: "title us already present , plz provide other name" }) }

            updProduct.title = title
        }
        if (description || typeof description == "string") {

            if (!isValid(description)) { return res.status(400).send({ status: false, message: "Product description should be valid" }) }

            description = description.split(" ").filter((x)=>x).join(" ")

            updProduct.description = description
        }
        if (price || typeof price == "string") { 

            if (!isValidPrice(price)) { return res.status(400).send({ status: false, message: "Product price should be valid (Ex- Number/Desimal)" }) }
            updProduct.price = Number(price)
        }
        if (currencyId || typeof currencyId == "string") {

            if (!isValid(currencyId)) { return res.status(400).send({ status: false, message: "currencyId should be valid" }) }
            if (currencyId !== "INR") { return res.status(400).send({ status: false, message: " CurrencyId, Only INR is accepted" }) }

        }
        if (currencyFormat || typeof currencyFormat == "string") {

            if (!isValid(currencyFormat)) { return res.status(400).send({ status: false, message: "CurrencyFormat should be valid" }) }
            if (currencyFormat !== "₹") { return res.status(400).send({ status: false, message: "Currency Format Only ₹ is accepted" }) }

        }
        if (isFreeShipping || typeof isFreeShipping == "string") { 

            isFreeShipping = isFreeShipping.trim().toLowerCase()

            if (isFreeShipping != "true" && isFreeShipping != "false") {
                return res.status(400).send({ status: false, message: "isFreeShipping should be boolean value" })
            }
            
            updProduct.isFreeShipping = isFreeShipping
        }
        if (file.length !== 0) {

            if (!isValidfile(file[0].originalname)) { return res.status(400).send({ status: false, message: "ProductImage should be valid extention" }) }

            const uploadAws = await uploadFile(file[0])

            updProduct.productImage = uploadAws

        }
        if (style || typeof style == "string") {

            if (!isValid(style)) { return res.status(400).send({ status: false, message: "style should be valid" }) }

            style = style.split(" ").filter((x)=>x).join(" ")
            updProduct.style = style

        }
        if (availableSizes || typeof availableSizes == "string") {

            if (availableSizes.trim().length == 0) {
                return res.status(400).send({ status: false, message: "Provide size" })
            }

            availableSizes = availableSizes.split(",").map(x => x.trim().toUpperCase())  //["XL", "M"]            let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]  //  [ "XS", "M"] , ["L","XS","M"] // s , xl ,m ,xxl

            for (let i = 0; i < availableSizes.length; i++) {
                if (!availableSizes.includes(availableSizes[i])) {
                    return res.status(400).send({ status: false, message: `${availableSizes[i]} is Not category "S", "XS", "M", "X", "L", "XXL", "XL"` })
                }
            }

            updArray.availableSizes = {}  // {availab : {}}
            updArray.availableSizes.$each = availableSizes // {availab : {$each : ["m","xl"]}}

        }
        if (installments || typeof installments == "string") {

            if (!isValidintall(installments)) { return res.status(400).send({ status: false, message: "Installment should be number , min->1 ,max->99 installment" }) }

            updProduct.installments = installments
        }

        const dataUpadate = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: updProduct, $addToSet: updArray }, { new: true })

        return res.status(200).send({ status: true, message: "Product is successfully updated", data: dataUpadate })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//================================================ [ Delete added Product API ] =============================================
const deleteById = async function (req, res) {

    try {
        let productId = req.params.productId

        if (!productId) { return res.status(400).send({ status: false, message: "plz provide productId" }) }

        if (!isValidObjectId(productId)) {

            return res.status(400).send({ status: false, message: "Invalid ProductId " })
        }
        let productDel = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false, }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

        if (!productDel) {
            return res.status(404).send({ status: false, message: "No product found by given ProductId" })
        }
        return res.status(200).send({ status: true, message: "Product Deleted Succesfully" })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })

    }
}





module.exports.createProduct = createProduct
module.exports.getProduct = getProduct
module.exports.getDetailsFromParam = getDetailsFromParam
module.exports.updateProduct = updateProduct
module.exports.deleteById = deleteById


