const { default: mongoose } = require("mongoose")
const userModel = require("../Models/userModel")
const bcrypt = require("bcrypt")
const aws = require("aws-sdk")
const jwt = require("jsonwebtoken")
const { isValid, isValidstring, isValidemail, isValidphone, isValidpassword, isValidpin, isValidObjectId, uploadFile, isValidfile } = require("../validations/validator")


const createUser = async (req, res) => {

    try {

        let data = JSON.parse(JSON.stringify(req.body))

        let { fname, lname, email, phone, password, address } = data
        let files = req.files


        if (Object.keys(data) == 0) {
            return res.status(400).send({ status: false, message: "Body is Empty" })
        }
        if (!fname) {
            return res.status(400).send({ status: false, message: "fname is mandatory" })
        }
        if (!isValidstring(fname)) {
            return res.status(400).send({ status: false, message: "Enter Valid fname" })
        }

        if (!lname) {
            return res.status(400).send({ status: false, message: "lname is mandatory" })
        }
        if (!isValidstring(lname)) {
            return res.status(400).send({ status: false, message: "Enter Valid lname" })
        }

        if (!email) {
            return res.status(400).send({ status: false, message: "Email is mandatory" })
        }
        if (!isValidemail(email)) {
            return res.status(400).send({ status: false, message: "Enter Valid Email" })
        }
        let checkMail = await userModel.findOne({ email })
        if (checkMail) {
            return res.status(400).send({ status: false, message: `This ${email} already registered, try another.` })
        }

        if ( files.length === 0) {
            return res.status(400).send({ status: false, message: "ProfileImage is required." });
        }

        if (!isValidfile(files[0].originalname)) {
            return res.status(400).send({ status: false, message: "ProfileImage is Invalid." });
        }

        if (!phone) {
            return res.status(400).send({ status: false, message: "Phone is mandatory" })
        }

        if (!isValidphone(phone)) {
            return res.status(400).send({ status: false, message: "Enter Valid Phone No. only 10 digits." })
        }
        let checkPhone = await userModel.findOne({ phone })
        if (checkPhone) {
            return res.status(400).send({ status: false, message: `This ${phone} already registered, try another.` })
        }

        if (!password) {
            return res.status(400).send({ status: false, message: "Password is mandatory" })
        }
        if (!isValidpassword(password)) {
            return res.status(400).send({ status: false, message: "Password Should be Min-8 & Max-15, it contain atleast -> 1 Uppercase , 1 Lowercase , 1 Number , 1 Special Character  Ex- Abcd@123" })
        }

        // let salt = await bcrypt.genSalt(10);
        // data.password = await bcrypt.hash(password, salt);
        // console.log(data)

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
        //   if (!isValidstring(shipping.street)) {
        //       return res.status(400).send({ status: false, message: "Shipping street should be string" })
        //   }

        if (!isValid(shipping.city)) {
            return res.status(400).send({ status: false, message: "Shipping city is required" })
        }
        //   if (!isValidstring(shipping.city)) {
        //       return res.status(400).send({ status: false, message: "Shipping city should be string" })
        //   }

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
        //   if (!isValidstring(billing.street)) {
        //       return res.status(400).send({ status: false, message: "Billing street should be string" })

        //   }
        if (!isValid(billing.city)) {
            return res.status(400).send({ status: false, message: "Billing city is required" })
        }

        //   if (!isValidstring(billing.city)) {
        //       return res.status(400).send({ status: false, message: "Billing city should be string" })
        //   }

        if (!billing.pincode) {
            return res.status(400).send({ status: false, message: "Billing pincode is required" })
        }
        if (!isValidpin(billing.pincode)) {
            return res.status(400).send({ status: false, message: "Billing pincode is Invalid" })
        }

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
            return res.send.status(400).send({ status: false, message: "Please provide Password" })
        }
        if (!isValidpassword(password)) {
            return res.status(400).send({ status: false, message: "Password Should be Min-8 & Max-15, it contain atleast -> 1 Uppercase , 1 Lowercase , 1 Number , 1 Special Character  Ex- Abcd@123" })
        }

        const user = await userModel.findOne({ email: email })
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

        let userId = req.params.userId

        let validId = isValidObjectId(userId)

        if (!validId) { return res.status(400).send({ status: false, message: "invalid userId" }) }

        let getUser = await userModel.findById({ _id: userId })
        if (!getUser) {

            return res.status(404).send({ status: false, message: "No User found With given Id " })
        }

        return res.status(200).send({ status: true, message: "User profile details", data: getUser })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })

    }

}

const updateUser = async function (req, res) {

    try {

        let userId = req.params.userId
        const file = req.files

        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, msg: "invalid userId" }) }

        const userDoc = await userModel.findById({ _id: userId })
        if (!userDoc) { return res.status(400).send({ status: false, msg: `${userId} is not from user Collection` }) }

        console.log(Object.keys(req.body).length) 
        console.log(file.length)
        if (Object.keys(req.body).length == 0 && file.length == 0) {
            return res.status(400).send({ status: false, msg: "data required for profile updated" })
        }

        let data = JSON.parse(JSON.stringify(req.body))
        const { fname, lname, email, phone, password, address } = data


        const updFiled = {}

        if (fname) {

            if (!isValid(fname)) { return res.status(400).send({ status: false, msg: "fname must be string" }) }
            if (!isValidstring(fname)) { return res.status(400).send({ status: false, msg: "Enter valid fname ,fname must be contain character only" }) }

            updFiled.fname = fname
        }
        if (lname) {

            if (!isValid(lname)) { return res.status(400).send({ status: false, msg: "lname must be string" }) }
            if (!isValidstring(lname)) { return res.status(400).send({ status: false, msg: "Enter valid lname ,lname must be contain character only" }) }

            updFiled.lname = lname
        }
        if (email) {

            if (!isValid(email)) { return res.status(400).send({ status: false, msg: "email must be string" }) }
            if (!isValidemail(email)) { return res.status(400).send({ status: false, msg: "Email is Invalid" }) }

            const checkEmail = await userModel.findOne({ email: email })

            if (checkEmail) { return res.status(409).send({ status: false, msg: `${email} already registered, try another.` }) }

            updFiled.email = email
        }
        console.log(file)

        if (file.length !== 0) {
            
            if (!isValidfile(file[0].originalname)) { return res.status(400).send({ status: false, message: "ProfileImage is Invalid." }); }

            let profilepic = await uploadFile(file[0])
            updFiled.profileImage = profilepic

        }
        if (phone) {

            if (!isValid(phone)) { return res.status(400).send({ status: false, msg: "phone must be string" }) }
            if (!isValidphone(phone)) { return res.status(400).send({ status: false, msg: "Enter Valid Phone No. only 10 digits." }) }

            const checkPhone = await userModel.findOne({ phone })

            if (checkPhone) { return res.status(409).send({ status: false, msg: `${phone} already registered, try another.` }) }

            updFiled.phone = phone
        }
        if (password) {

            if (!isValid(password)) { return res.status(400).send({ status: false, msg: "password must be string" }) }
            if (!isValidpassword(password)) { return res.status(400).send({ status: false, msg: "Enter Valid Password, password should be min 8 and max 15 character" }) }

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
            // if (!(shipping.street)) {
            //     return res.status(400).send({ status: false, message: "Shipping street should be string" })
            // }

            if (!isValid(shipping.city)) {
                return res.status(400).send({ status: false, message: "Shipping city is required" })
            }
            // if (!(shipping.city)) {
            //     return res.status(400).send({ status: false, message: "Shipping city should be string" })
            // }

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
            // if (!(billing.street)) {
            //     return res.status(400).send({ status: false, message: "Billing street should be string" })

            // }
            if (!isValid(billing.city)) {
                return res.status(400).send({ status: false, message: "Billing city is required" })
            }

            // if (!(billing.city)) {
            //     return res.status(400).send({ status: false, message: "Billing city should be string" })
            // }

            if (!(billing.pincode)) {
                return res.status(400).send({ status: false, message: "Billing pincode is required" })
            }
            if (!isValidpin(billing.pincode)) {
                return res.status(400).send({ status: false, message: "Billing pincode is Invalid" })
            }

            updFiled.address = address

        }

        const userUpdate = await userModel.findByIdAndUpdate(userId, { $set: updFiled }, { new: true })

        return res.status(200).send({ status: true, msg: "Update successfully done", data: userUpdate })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.getUserById = getUserById
module.exports.updateUser = updateUser
