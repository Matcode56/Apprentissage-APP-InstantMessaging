const pool= require('../config/db')
const jwt= require('jsonwebtoken');

module.exports.register= (req,res)=>{
    const nom= req.body.nom;
    const prenom= req.body.prenom;
    const email= req.body.email;
    const age= req.body.age;
    const password= req.body.password;

    console.log(nom)
    const request="INSERT INTO users (nom, prenom, age, email, profilphoto, password) VALUES ($1, $2, $3, $4 , $5, $6)"
    const values=[nom,prenom, age, email, '', password]

    pool.query(request, values, 
        (err, docs)=>{
        if(docs) res.send(docs.rows)
        else console.log(err)
    })

}

module.exports.login= async (req,res)=>{
    
    const infosUser= await pool.query('SELECT * FROM users')

    res.send(infosUser)


    console.log(infosUser)
}