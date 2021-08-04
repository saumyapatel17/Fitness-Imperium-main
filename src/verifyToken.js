const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({
    path:'./.env'
});


exports.fitToken = (req,res,next) =>{ 
    const token = req.cookies.fitToken;
    if(!token)
    {
        res.render('LoginRegister/Login',{warning: "Unauthorized User"})
    }
    else{
        try {
            const verifyToken = jwt.verify(token,process.env.fitToken);
            req.fit=verifyToken;
            next();
            
        } catch (error) {
            res.render('LoginRegister/Login',{warning: "Unauthorized User"})
        }
        
    }
}

exports.otpToken = (req,res,next) =>{ 
    const token = req.cookies.authToken;
    if(!token)
    {
        //alert 
        res.render('LoginRegister/Login',{danger: "Unauthorized User"})
    }
    else{
        try {
            const verifyToken = jwt.verify(token,process.env.otptoken);
            req.otp=verifyToken;
            next();
            
        } catch (error) {
            res.render('LoginRegister/Login',{danger: "Unauthorized User"})
        }
        
    }
}


