const express = require("express")
const route = require("./routes/route")
const mongoose = require("mongoose")
const app = express()

app.use(express.json())

mongoose.connect("mongodb+srv://Ranamahato:*****@rana.1qocv4g.mongodb.net/Group-5-DB",
   {useNewUrlParser : true}
)
.then(()=>console.log("mongoDB Is connected"))
.catch((err)=>console.log(err))

app.use("/",route)

app.listen(process.env.Port || 3000 ,()=>{
    console.log("Express app running on Port",(process.env.Port || 3000) )
})