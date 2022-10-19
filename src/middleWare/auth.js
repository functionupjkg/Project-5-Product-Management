const jwt = require("jsonwebtoken");



const auth = async function (req, res, next) {

    try {

        let token = req.headers["authorization"]

        if (!token) {
            return res.status(404).send({ status: false, msg: "token must be present" });
        }
        token = token.slice(7) // bearer Token = Token 
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


module.exports = { auth }