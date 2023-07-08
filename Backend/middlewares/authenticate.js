const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
exports.isAuthenticatedUser = async(req, res, next)=>{
    // const {token} = req.cookies;
    // if(!token){
       
    // }

    // const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    // req.user = await User.findById(decoded.id)
    // next();

    let token;

    if(req.headers){
        try {
            token = req.headers.authorization.split(" ")[1];
            const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
            req.user = await User.findById(decode.id).select("_id name email")
            next()
        } catch (error) {
            console.log(error)
            return res.status(400).json({message:"Invalid Authorization"})
        }
    }
    if(!token){
        return res.status(400).json({message:"Access Denied"})
    }
}

exports.authorizeRoles = (...roles) => {
    return  (req, res, next) => {
         if(!roles.includes(req.user.role)){
             return next(new ErrorHandler(`Role ${req.user.role} is not allowed`, 401))
         }
         next()
     }
 }   