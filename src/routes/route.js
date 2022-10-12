const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const {authentic , authorize} = require("../middleWare/auth")


router.post("/test-me", (req,res)=>{
    console.log(req.files)
    console.log(req.body)
    res.send({msg : "ok All Fine"})
})

router.post("/register",userController.createUser)

router.post("/login" , userController.loginUser)

router.get("/user/:userId/profile" , authentic , userController.getUserById)

router.put("/user/:userId/profile", authentic, authorize, userController.updateUser)



module.exports = router