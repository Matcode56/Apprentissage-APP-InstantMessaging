const pool= require('../config/db')
const jwt= require('jsonwebtoken');
const bcrypt= require("bcrypt")

module.exports.register= async (req,res)=>{
    const nom= req.body.nom;
    const prenom= req.body.prenom;
    const email= req.body.email;
    const age= req.body.age;
    const password= await cryptagePassword();

    async function cryptagePassword(){
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(req.body.password, salt);
    }
 
    //Envoie à la base de donnée
    const request="INSERT INTO users (nom, prenom, age, email, profilphoto, password) VALUES ($1, $2, $3, $4 , $5, $6)"
    const values=[nom,prenom, age, email, '', password]

    pool.query(request, values, 
        (err, docs)=>{
        if(docs) res.send("Utilisateurs créé")
        else console.log(err)
    })

}

module.exports.login= async (req,res)=>{
    const email= req.body.email;
    const password= req.body.password;

    if(!email || !password) res.status(400).send("erreur requete")  
    else checkEmail()

    async function checkEmail(){
        
        try{
            const query='SELECT * FROM users WHERE email= $1';
            const value=[email]
            const checkEmail= await pool.query(query, value);

            if (checkEmail.rows.length>0) checkPassword(checkEmail.rows[0].password, checkEmail.rows[0].id);
            else res.status(400).send("Email inccorect")
        }
        catch{
            res.status(500)
        }
    }

    async function checkPassword(passwordCrypter, userId){

        const id= userId

        try{
            const checkPassword= await bcrypt.compare(password, passwordCrypter);
            if(checkPassword) sendCookie(id);
            else res.status(401).send("Mot de passe incorrect");
            
        }
        
        catch{
            res.status(500)
        }
        
    }

    async function sendCookie(userId){
        console.log(userId)
        try{
            const maxAge= 6000000000000000000;
            const token= jwt.sign({userId}, process.env.TOKEN, {expiresIn: maxAge});
            res.cookie('jwt', token, 
            {    
                httpOnly: true, 
                maxAge
            });
            res.status(200).send('Authentification réussi')
        }
        catch(err){
            res.status(401).send("erreur lors de l'envoie du token"+ err)
        }
    }
}

module.exports.logout= (req, res)=>{
    res.cookie('jwt', '', {maxAge:1});
    res.redirect('/');
}

