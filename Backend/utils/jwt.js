const sendToken = (user, statusCode, res)=>{

    //creating JWT token
    const token = user.getJwtToken();
     
    //setting cookie
    // const options = {
    //     expires :new Date(
    //         Date.now()+process.env.COOKIE_EXPIRES_TIME * 20 * 60 * 60 * 1000
    //     ),
    //     httpOnly:true
    // }

    res.status(statusCode)
    //.cookie('token',token,options)
    .json({
        success: true,
        token,
        user
    })
}
module.exports = sendToken;