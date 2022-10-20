const userModel = require("../Models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { isValid, isValidstring, isValidemail, isValidphone, isValidpassword, isValidpin, isValidObjectId, uploadFile, isValidfile } = require("../validations/validator")

// check thorougly in addresss cide testCase

const createUser = async (req, res) => {

    try {

        let data = JSON.parse(JSON.stringify(req.body))

        let { fname, lname, email, phone, password, address , profileImage } = data
        let files = req.files

        if (Object.keys(data) == 0 && (!files || files.length == 0)) {
            return res.status(400).send({ status: false, message: "Body is Empty" })
        }
        if (profileImage || typeof profileImage == "string"){
            return res.status(400).send({status : false , msg : "profileImage containing only file"})
        }
        if (!(fname)) {
            return res.status(400).send({ status: false, message: "fname is mandatory" })
        }
        if (!isValidstring(fname)) {
            return res.status(400).send({ status: false, message: "Enter Valid fname , it contain character only with no space" })
        }

        if (!lname) {
            return res.status(400).send({ status: false, message: "lname is mandatory" })
        }
        if (!isValidstring(lname)) {
            return res.status(400).send({ status: false, message: "Enter Valid lname, it contain character only with no space" })
        }

        if (!email) {
            return res.status(400).send({ status: false, message: "Email is mandatory" })
        }
        if (!isValidemail(email)) {
            return res.status(400).send({ status: false, message: "Enter Valid Email" })
        }

        if (!phone) {
            return res.status(400).send({ status: false, message: "Phone is mandatory" })
        }

        if (!isValidphone(phone)) {
            return res.status(400).send({ status: false, message: "Enter Valid Phone No. only 10 digits." })
        }

        let checkiSAlready = await userModel.findOne({$or : [{ email: email, isDeleted: false },{ phone: phone, isDeleted: false }]})

        if (checkiSAlready) {
            if(checkiSAlready.email == email) return res.status(409).send({ status: false, message: `This ${email} already registered, try another.` })
            else if(checkiSAlready.phone == phone) return res.status(409).send({status : false , msg : `This ${phone} already registered, try another`})
        }

        if (files.length === 0) {
            return res.status(400).send({ status: false, message: "ProfileImage is required." });
        }

        if (!isValidfile(files[0].originalname)) {
            return res.status(400).send({ status: false, message: "ProfileImage is Invalid." });
        }
        if (!password) {
            return res.status(400).send({ status: false, message: "Password is mandatory" })
        }
        if (!isValidpassword(password)) {
            return res.status(400).send({ status: false, message: "Password Should be Min-8 & Max-15, it contain atleast -> 1 Uppercase , 1 Lowercase , 1 Number , 1 Special Character  Ex- Abcd@123" })
        }
        if (!address) {
            return res.status(400).send({ status: false, msg: "Please enter address for shipping and billing purpose." })
        }
        //-----------------------Address Validation ---------- //

        let { shipping, billing } = address

        if (!shipping) {
            return res.status(400).send({ status: false, msg: "Please enter shipping address." });
        }
        if (!isValid(shipping.street)) {
            return res.status(400).send({ status: false, message: "Shipping street is required" })
        }

        address.shipping.street = (address.shipping.street).split(" ").filter((x)=>x).join(" ")

        if (!isValid(shipping.city)) {
            return res.status(400).send({ status: false, message: "Shipping city is required" })
        }

        address.shipping.city = (address.shipping.city).split(" ").filter((x)=>x).join(" ")
        console.log(address.shipping.city)


        if (!shipping.pincode) {
            return res.status(400).send({ status: false, message: "Shipping pincode is required" })
        }
        if (!isValidpin(shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Shipping pincode is Invalid" })
        }

        if (!billing) {
            return res.status(400).send({ status: false, msg: "Please enter billing address." });
        }
        if (!isValid(billing.street)) {
            return res.status(400).send({ status: false, message: "Billing street is required" })

        }

        address.billing.street = (address.billing.street).split(" ").filter((x)=>x).join(" ")

        if (!isValid(billing.city)) {
            return res.status(400).send({ status: false, message: "Billing city is required" })
        }

        address.billing.city = (address.billing.city).split(" ").filter((x)=>x).join(" ")


        if (!billing.pincode) {
            return res.status(400).send({ status: false, message: "Billing pincode is required" })
        }
        if (!isValidpin(billing.pincode)) {
            return res.status(400).send({ status: false, message: "Billing pincode is Invalid" })
        }
        
        console.log(data)
        let profilePic = await uploadFile(files[0])
        data.profileImage = profilePic

        let hash = bcrypt.hashSync(password, 10)  // 10 is a saltrounds
        data.password = hash

        let saveUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User Register Successfully", data: saveUser })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }


}


const loginUser = async function (req, res) {

    try {

        const email = req.body.email;
        const password = req.body.password;

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Please provide some detail" })
        }

        if (!email) {
            return res.status(400).send({ status: false, message: "Please provide EmailId" })
        }
        if (!isValidemail(email)) {
            return res.status(400).send({ status: false, msg: "Email is Invalid" })
        }
        if (!(password)) {
            return res.status(400).send({ status: false, message: "Please provide Password" })
        }
        if (!isValidpassword(password)) {
            return res.status(400).send({ status: false, message: "Password Should be Min-8 & Max-15, it contain atleast -> 1 Uppercase , 1 Lowercase , 1 Number , 1 Special Character  Ex- Abcd@123" })
        }

        const user = await userModel.findOne({ email: email, isDeleted: false })
        if (!user) { return res.status(400).send({ status: false, message: "Please provide correct email" }) }

        const isMatch = await bcrypt.compare(password, user.password) // compare logIN and DB password , return boolean value
        if (!isMatch) { return res.status(400).send({ Status: false, msg: "incorrect credential" }) }

        const token = jwt.sign({
            user: user._id.toString(),
            expiresIn: "24h"
        },
            "Project5"
        )

        return res.status(200).send({ status: true, msg: "User login successfull", data: { user: user._id, token: token } })

    }
    catch (err) {
        return res.status(500).send({ msg: "server error", error: err.message })
    }

}


const getUserById = async function (req, res) {

    try {


        const userSaveId = req.loggedInUser.user
        const userLoggedIn = req.params.userId

        if (userLoggedIn) {

            if (!isValidObjectId(userLoggedIn)) { return res.status(400).send({ msg: "userId is InValid", status: false }) }
            
            if (userSaveId !== userLoggedIn.toString()) { return res.status(403).send({status: false , msg: "user is not Authorised for this operation"}) }

            const userData = await userModel.findOne({ _id: userLoggedIn, isDeleted: false })

            if (!userData) {
                return res.status(404).send({ status: false, msg: "No user register" })
            }
            
            return res.status(200).send({ status: true, message: "User profile details", data: userData })


        } else {

            return res.status(400).send({ status: false, msg: "Please provide userId" })
        }

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })

    }

}

const updateUser = async function (req, res) {

    try {

        
        const userSaveId = req.loggedInUser.user
        const userLoggedIn = req.params.userId

        if (userLoggedIn) {

            if (!isValidObjectId(userLoggedIn)) { return res.status(400).send({ msg: "userId is InValid", status: false }) }
            
            if (userSaveId !== userLoggedIn.toString()) { return res.status(403).send({status: false , msg: "user is not Authorised for this operation"}) }

            const userData = await userModel.findOne({ _id: userLoggedIn, isDeleted: false })

            if (!userData) {
                return res.status(404).send({ status: false, msg: "No user register" })
            }
            
            const file = req.files

            if (Object.keys(req.body).length == 0 && (!file || file.length == 0)) {
                
            return res.status(400).send({ status: false, msg: "data required for profile updated" })
        }
           
        let data = JSON.parse(JSON.stringify(req.body))
        const { fname, lname, email, phone, password, address,profileImage} = data

        if (profileImage || typeof profileImage == "string"){
            return res.status(400).send({status : false , msg : "profileImage containing only file"})
        }

        const updFiled = {}

        if (fname || typeof fname == "string") {

            if (!isValidstring(fname)) { return res.status(400).send({ status: false, msg: "Enter valid fname ,fname must be contain character only" }) }

            updFiled.fname = fname
        }
        if (lname ||  typeof lname == "string") {

            if (!isValidstring(lname)) { return res.status(400).send({ status: false, msg: "Enter valid lname ,lname must be contain character only" }) }

            updFiled.lname = lname
        }
        if ((email || typeof email == "string") || (phone || typeof phone == "string")) {

                if(phone || typeof phone == "string"){

                    if (!isValidphone(phone)) { return res.status(400).send({ status: false, msg: "Enter Valid Phone No. only 10 digits in string data." }) }

                }

                if(email || typeof email == "string"){

                    if (!isValidemail(email)) { return res.status(400).send({ status: false, msg: "Email is Invalid , enter email in string data" }) }
        
                }

            const checkiSAlready = await userModel.findOne({$or : [{ email: email, isDeleted: false },{phone: phone, isDeleted: false}]})
             
            if(checkiSAlready){

            if (checkiSAlready.email == email) { return res.status(409).send({ status: false, msg: `${email} already registered, try another.` }) }
            if (checkiSAlready.phone == phone) { return res.status(409).send({ status: false, msg: `${phone} already registered, try another.` }) }
            }

            if(email)  updFiled.email = email
            if(phone)  updFiled.phone = phone
            
        }

        if (file.length !== 0) {

            if (!isValidfile(file[0].originalname)) { return res.status(400).send({ status: false, message: "ProfileImage is Invalid." }); }

            let profilepic = await uploadFile(file[0])
            updFiled.profileImage = profilepic

        }
        if (password || typeof password == "string") {

            if (!isValidpassword(password)) { return res.status(400).send({ status: false, msg: "Enter Valid Password, password should be min 8 and max 15 character , it should cointain atleast 1 upperCase , 1 LowerCase , 1 Number, 1 specialSymbol" }) }

            // (auto-gen a salt and hash)
            const hash = bcrypt.hashSync(password, 10);

            updFiled.password = hash
        }
        if (address) {

            const { shipping, billing } = address


            if (!(shipping)) {
                return res.status(400).send({ status: false, msg: "Please enter shipping address." });
            }
            if (!isValid(shipping.street)) {
                return res.status(400).send({ status: false, message: "Shipping street is required" })
            }

            address.shipping.street = (address.shipping.street).split(" ").filter((x)=>x).join(" ")

            if (!isValid(shipping.city)) {
                return res.status(400).send({ status: false, message: "Shipping city is required" })
            }

            address.shipping.street = (address.shipping.street).split(" ").filter((x)=>x).join(" ")

            if (!shipping.pincode) {
                return res.status(400).send({ status: false, message: "Shipping pincode is required" })
            }
            if (!isValidpin(shipping.pincode)) {
                return res.status(400).send({ status: false, message: "Shipping pincode is Invalid" })
            }
            if (!billing) {
                return res.status(400).send({ status: false, msg: "Please enter billing address." });
            }
            if (!isValid(billing.street)) {
                return res.status(400).send({ status: false, message: "Billing street is required" })

            }

            address.billing.street = (address.billing.street).split(" ").filter((x)=>x).join(" ")

            if (!isValid(billing.city)) {
                return res.status(400).send({ status: false, message: "Billing city is required" })
            }
            
            address.billing.city = (address.billing.city).split(" ").filter((x)=>x).join(" ")

            
            if (!(billing.pincode)) {
                return res.status(400).send({ status: false, message: "Billing pincode is required" })
            }
            if (!isValidpin(billing.pincode)) {
                return res.status(400).send({ status: false, message: "Billing pincode is Invalid" })
            }

            updFiled.address = address

        }
        
        console.log(address)
        const userUpdate = await userModel.findOneAndUpdate({_id:userLoggedIn}, { $set: updFiled }, { new: true })

        return res.status(200).send({ status: true, msg: "Update successfully done", data: userUpdate })
    

        } else {

            return res.status(400).send({ status: false, msg: "Please provide userId" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.getUserById = getUserById
module.exports.updateUser = updateUser
