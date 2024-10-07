const config = require('dotenv')
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        next();
    } catch (error) {
        if(error.name === 'TokenExpiredError')
            return res.status(401).send('This token is no longer valid')
        else if(error.name === "JsonWebTokenError")
            return res.status(401).send('Invalid token');
        else
            return res.status(401).send('unauthorized entry');
    }
}