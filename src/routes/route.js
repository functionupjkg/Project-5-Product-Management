const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const orderController = require("../controllers/orderController")
const {auth} = require("../middleWare/auth")



//----------------------------------  User API   -----------------------------------

router.post("/register",userController.createUser)

router.post("/login" , userController.loginUser)

router.get("/user/:userId/profile" , auth, userController.getUserById)

router.put("/user/:userId/profile", auth, userController.updateUser)

//--------------------------- Product API ----------------------------------------

router.post("/products" , productController.createProduct)

router.get("/products" , productController.getProduct)

router.get("/products/:productId" , productController.getDetailsFromParam)

router.put("/products/:productId" , productController.updateProduct)

router.delete("/products/:productId", productController.deleteById)

//--------------------------  Cart API   ----------------------------------------

router.post("/users/:userId/cart", auth , cartController.createCart )

router.get("/users/:userId/cart", auth , cartController.getCart )

router.put("/users/:userId/cart", auth , cartController.updateCart )

router.delete("/users/:userId/cart", auth , cartController.deleteCart )


//-------------------------- Order API ----------------------------------------

router.post("/users/:userId/orders", auth, orderController.createOrder )
router.put("/users/:userId/orders", auth ,orderController.updateOrder)









//API for wrong route-of-API
router.all("/*", function (req, res) {
    res.status(400).send({
        status: false,
        message: "Path Not Found"
    })
})








module.exports = router


