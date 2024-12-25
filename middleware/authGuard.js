const jwt =require('jsonwebtoken')
const authGuard =(req,res,next) =>{
    //#checking incomming data
    console.log(req.headers);
    //1.get aut headers(content type,authorization...)
    //2.get 'suthorization'
    const authHeader = req.headers.authorization;
    //3.if not found stop the procresss(res)
    if(!authHeader){
        return res.status(400).json({
            success :false,
            message : 'Authorizaton header not found!'
        })
    }
    //4.authorization format :"bearer tokensdfgdfgfj0"
    //5.get only token by splitting by space(0-bearer,1-token)
    const token =authHeader.split(' ')[1]
    //6. if token is token not found or mistmatch (stop the process,res)
    if(!token || token ===''){
        return res.status(400).json({
            success :false,
            message : ' Token not found!'
        })
    }
    //7.verify the token
    //8.if verified,next
    //9.not :not authenticated
    try{

        //verify the token and get user information
        const decodedUser = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decodedUser;
        next()

    }catch(error){
        console.log(error)
        res.status(400).json({
            success:false,
            message:"Not Authenticated!"
        })
    }
     
}

//admin guard
const adminGuard =(req,res,next) =>{
    //#checking incomming data
    console.log("admin guard headers: ",req.headers);
    //1.get aut headers(content type,authorization...)
    //2.get 'suthorization'
    console.log("authorization: ",req.headers.authorization);
    const authHeader = req.headers.authorization;
    //3.if not found stop the procresss(res)
    if(!authHeader){
        return res.status(400).json({
            success :false,
            message : 'Authorizaton header not found!'
        })
    }
    //4.authorization format :"bearer tokensdfgdfgfj0"
    //5.get only token by splitting by space(0-bearer,1-token)
    const token =authHeader.split(' ')[1]
    //6. if token is token not found or mistmatch (stop the process,res)
    if(!token || token ===''){
        return res.status(400).json({
            success :false,
            message : ' Token not found!'
        })
    }
    //7.verify the token
    //8.if verified,next
    //9.not :not authenticated
    try{

        //verify the token and get user information
        const decodedUser = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decodedUser;
        console.log("decoded user: ",decodedUser);
        //check if user is admin or not
        if(!req.user.is_admin){
            return res.status(400).json({
                success:false,
                message:"Permission Denied!"
            })
        }
        next()

    }catch(error){
        console.log(error)
        res.status(400).json({
            success:false,
            message:"Not Authenticated!"
        })
    }
     
}
module.exports={
    authGuard,
    adminGuard
}