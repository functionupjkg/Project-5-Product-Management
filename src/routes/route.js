const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const {authentic , authorize} = require("../middleWare/auth")


router.post("/test-me", (req,res)=>{
    console.log(req.files)
    console.log(req.body)
    res.send({msg : "ok All Fine"})
})

//----------------------------------userController-----------------------------------

router.post("/register",userController.createUser)

router.post("/login" , userController.loginUser)

router.get("/user/:userId/profile" , authentic , authorize,  userController.getUserById)

router.put("/user/:userId/profile", authentic, authorize, userController.updateUser)

//--------------------------- productController----------------------------------------



module.exports = router