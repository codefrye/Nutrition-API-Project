const jwt= require('jsonwebtoken')


function verifytoken(req, res, next) {
    let token = req.headers.authorization.split(' ')[1]
    if (token !== undefined) {
        jwt.verify(token, "nutritionapp", (err, data) => {
            if (err) {
                res.status(401).send({ message: "invalid token" })
            } else {
                console.log(data);
                next();
            }
        })
    } else {
        res.status(405).send({ message: "the token is missing" })
    }
}
module.exports = verifytoken;  