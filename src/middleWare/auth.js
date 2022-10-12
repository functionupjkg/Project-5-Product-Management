const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const userModel = require("../Models/userModel");

const authentic = async function (req, res, next) {

    try {
        let token = req.headers["authorization"]
        
        if (!token) {
            return res.status(404).send({ status: false, msg: "token must be present" });
        }
        token = token.slice(7)
        jwt.verify(token, "Project5", (err, decodedToken) => {

            if (err) {

                let message = err.message = "jwt expiry" ? "token is expired , please login again" : "invalid token"
                return res.status(401).send({ status: false, msg: message })
            }

            req.loggedInUser = decodedToken;
            next()

        });
    
    } catch (err) {
        return res.status(500).send({ msg: "server error", error: err });
    }
};

const authorize = async function (req, res, next) {

    try {


        const userSaveId = req.loggedInUser.user
        const userLoggedIn = req.params.userId

        if (userLoggedIn) {

            if (!isValidObjectId(userLoggedIn)) { return res.status(400).send({ msg: "userId is InValid", status: false }) }

            const userData = await userModel.findById(userLoggedIn)

            if (!userData) {
                return res.status(404).send({ status: false, msg: "No user register" })
            }

            if (userSaveId !== userLoggedIn.toString()) { return res.status(403).send({ msg: "user is not Authorised for this operation", status: false }) }
            next()


        } else {

            return res.status(400).send({ status: false, msg: "Please provide userId" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }


}

module.exports = { authentic , authorize }