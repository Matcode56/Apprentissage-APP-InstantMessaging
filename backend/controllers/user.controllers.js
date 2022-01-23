const pool= require('../config/db')
const fs= require('fs')

module.exports.getAllUser= (req, res)=>{
    pool.query('SELECT * FROM users', (err, docs)=>{
        if(res) return res.send(docs.rows)
        else console.log(err)
    })
}

module.exports.getUser= (req, res)=>{
    const request='SELECT * FROM users WHERe id=$1'
    const value= [req.params.id]
    pool.query(request, value, (err, docs)=>{
        if(res) return res.send(docs.rows[0])
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

module.exports.changePhotoProfil= (req,res)=>{

    let PhotoToSendToDB;

    //cherche la photo la plus récente 
    const files= fs.readdirSync(__dirname+'/../../frontend/instantmessaging/public/upload/PhotoProfil');
    
    const photoUser= files.filter(e=> e.includes(req.params.id))

  

    if(photoUser.length>1) searchMostRecentPhoto(photoUser);


    function searchMostRecentPhoto(arrayPhotos){
        const datesStringPhoto= arrayPhotos.map(e=> e.substring(0, e.indexOf('-User')));
        const datesNumberPhoto= datesStringPhoto.map(e=> parseInt(e));

        const mostRecentDate= datesNumberPhoto.filter(e => e==Math.max(...datesNumberPhoto))

        PhotoToSendToDB= arrayPhotos.filter(e=> e.includes(mostRecentDate.toString()))

        return sendToDB(PhotoToSendToDB)
    }
    
    function sendToDB(photo){
        const request= "UPDATE users SET profilphoto= $1 WHERE id=$2";
        const values=[photo, req.params.id];

        pool.query(request, values, 
            (err, docs)=>{
            if(docs) res.send("Photo changed")
            else console.log(err)
        })
    }   
}

module.exports.sendRequestFriend= async (req,res)=>{
    
    const id= req.params.id;
    const requestSend= await getRequestSend();

    async function getRequestSend(){
        
        const request= "SELECT requestsend FROM friends WHERE userId=$1"
        const value=[id]
        try{
            const data= await pool.query(request,value)
            return data.rows[0].requestsend
        }
        catch (err) {
            res.status(400).send(err)
        }
    }

    console.log(requestSend)

    if(requestSend){
        const currentDate = new Date();
        const date= currentDate.toLocaleString('fr-Fr')
        console.log(date)
        const request= "update friends set requestsend= $1 where userId=$2"
        const value=[{"userId": 1, "timeStamp": date} ,id]
        try{
            const data= await pool.query(request,value)
            res.send(data.rows)
        }
        catch{
        }
    }
    else{
        const request="INSERT "
    }

}