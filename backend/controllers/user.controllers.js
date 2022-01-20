const pool= require('../config/db')

module.exports.getAllUser= (req, res)=>{
    pool.query('SELECT * FROM users', (err, docs)=>{
        if(res) return res.send(docs.rows)
        else console.log(err)
    })
}

module.exports.deleteUser= (req, res)=>{
    const id= req.params.id;
    const query= "DELETE FROM users WHERE id=$1";
    const value=[id];

    pool.query(query, value, (err, docs)=>{
        if(docs) res.status(200).send('Utilisateur supprimé avec succès')
        if(err) res.status(400).send("erreur lors de la suppression de l'utilisateur")
    })    
}