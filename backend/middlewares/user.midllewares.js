const pool = require('../config/db');


module.exports.checkIdUser= async (req, res, next)=>{
    const id= req.params.id;

    const query= 'SELECT * FROM users WHERE id=$1';
    const value=[id];

    const checkId= await pool.query(query, value);

    if (checkId.rows.length>0) next();
    else res.status(400).send("id introuvable")
}