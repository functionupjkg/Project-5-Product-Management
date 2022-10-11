const { default: mongoose } = require("mongoose")
const userModel = require("../Models/userModel")



const updateUser = async function(req,res){

    try{
          let userId = req.params.userId

        //   if(!mongoose.Schema.Types.ObjectId(userId)){
        //     return res.status(400).send({status : false , msg : "userId is Invalid"})
        //   }
        console.log(Object.keys(req.body) == 0)

          if(Object.keys(req.body) == 0){ 
            return res.status(200).send({status : true,msg : "No any field Updated By user"})
          }
          console.log("gaiutak")
          const {fname , lname ,email , profileImage ,phone , password ,address , billing} = req.body

          const updFiled = {}

          const userUpdate = await userModel.findByIdAndUpdate({})


    }catch(err){

    }
}


module.exports.updateUser = updateUser