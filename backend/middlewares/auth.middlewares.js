//Importation module passwordValidator et emailValidator afin de checker l'email et le password
const passwordValidator= require('password-validator')
const emailValidator= require('email-validator');
const pool = require('../config/db');
const passwordSchema= new passwordValidator();

passwordSchema
.is().min(6)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase(1)                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(1)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

module.exports.checkEmailAndPswRegister=(req,res, next)=>{

    if(emailValidator.validate(req.body.email)){
        if(passwordSchema.validate(req.body.password)){
            next()
        }
        else{
            return res.status(400).send(`Le mot de passe n'est pas assez fort ${passwordSchema.validate('req.body.password', { list: true })}`)
        }
    }
    else{
        return res.status(400).send("email invalide")
    }
    
}

module.exports.checkToken= (req, res, next)=>{
    const token= req.cookie.jwt;

    if(token){
        jwt.verify(token, process.env.TOKEN_SECRET, async(err, decodedToken)=>{
            if(err){
                res.cookie('jwt', '', {maxAge:1})
                
                next();
            }
            else{
                console.log(decodedToken)
                //let user= await UserModel.findById(decodedToken.userId);
                //res.locals.user= user
                next();
            }
        })
      }
      else{
          res.locals.user=null;
          next();
      }
}

module.exports.checkEmailLogin= async (req,res,next)=>{
    const email= req.body.email;
    console.log(email)
    const query='SELECT * FROM users WHERE email= $1';
    const value=[email]
    const checkEmail= await pool.query(query, value)
    
    if (checkEmail.rows.length>0) res.send(checkEmail.rows)
    else res.status(400).send("Email inccorect")
}