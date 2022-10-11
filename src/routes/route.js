const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")


// router.post("/test-me", (req,res)=>{
//     console.log(req.body)
//     res.send({msg : "ok All Fine"})
// })

router.post("/user/:userId/profile",userController.updateUser)


module.exports = router