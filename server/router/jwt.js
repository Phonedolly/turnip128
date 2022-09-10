const jwt = require('jsonwebtoken');
const secretKey = process.env.ACCESS_TOKEN_SECRET;


exports.verifyToken = (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredErro') {
            return res.status(419).json({
                code: 419,
                mesasge: '토큰이 만료되었습니다'
            })
        }
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.'
        })
    }
}