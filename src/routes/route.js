const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const {auth} = require("../middleWare/auth")


router.post("/test-me", (req,res)=>{
    console.log(req.files)
    console.log(req.body)
    res.send({msg : "ok All Fine"})
})

//----------------------------------userController-----------------------------------

router.post("/register",userController.createUser)

router.post("/login" , userController.loginUser)

router.get("/user/:userId/profile" , auth, userController.getUserById)

router.put("/user/:userId/profile", auth, userController.updateUser)

//--------------------------- productController----------------------------------------

router.post("/products" , productController.createProduct)

router.get("/products" , productController.getProduct)

router.get("/products/:productId" , productController.getDetailsFromParam)

router.put("/products/:productId" , productController.updateProduct)

router.delete("/products/:productId", productController.deleteById)

//--------------------------cartController----------------------------------------

router.post("/users/:userId/cart", auth , cartController.createCart )

router.get("/users/:userId/cart", auth , cartController.getCart )

router.put("/users/:userId/cart", auth , cartController.updateCart )

router.delete("/users/:userId/cart", auth , cartController.deleteCart )

module.exports = router


