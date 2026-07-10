const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config();
const SC_Key = process.env.JWT_SECRET;


const middlewareAuth = (req,res,next) =>{
    const autherHeader = req.headers.authorization;
    const token = autherHeader && autherHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({message: "トークンがありません"})
    }

    jwt.verify(token, SC_Key, (err,user) => {
        if(err){
            return res.status(401).json({message: "トークンが無効です"})
        }
        req.user = user;
        next()
    })

}    





module.exports = middlewareAuth;
