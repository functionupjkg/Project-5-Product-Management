const mongoose = require('mongoose')
const aws = require('aws-sdk')

//<<----------------Validation for ObjectId check in DB ---------------->>
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
};

//<<----------------Validation for String ---------------->>  
const isValidstring = function (pass) {
    return (/^[A-Za-z]+$/).test(pass)
}

//<<----------------Validation for Email ---------------->>  
const isValidemail = function (email) {
    return (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/).test(email);
}

//<<----------------Validation for Mobile No. ---------------->>
const isValidphone = function (phone) {
    return (/^([0|\+[0-9]{1,5})?([6-9][0-9]{9})$/).test(phone);
}

//<<----------------Validation for password ---------------->>  
const isValidpassword = function (pass) {
    return (/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%&])[a-zA-Z0-9@#$%&]{8,15}$/).test(pass);
}

//<<----------------Validation for pincode ---------------->>
const isValidpin = function (pincode) {
    return (/^[1-9][0-9]{5}$/).test(pincode)
    //^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$

};

//<<----------------Validation for filleds ---------------->>
const isValid = function (value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length == 0) return false;
    return true;
  };

//<<----------------Validation for imageExtension ---------------->>
const isValidfile = function (filename) {
    return (/^.*\.(png|jpg|JPG|gif|GIF|webp|tiff?|bmp)$/).test(filename)
};

//---------------------------------------------------------------------------------//

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "jyoti/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            //console.log(data)
           // console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

    })
}




module.exports = {isValidObjectId, isValidstring, isValidemail, isValidphone, isValidpassword, isValidpin, isValid,isValidfile,uploadFile}