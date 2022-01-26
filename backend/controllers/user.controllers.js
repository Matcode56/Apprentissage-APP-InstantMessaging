const pool= require('../config/db')
const fs= require('fs')
const { CLIENT_RENEG_LIMIT } = require('tls')
const { array } = require('../config/uploadImg')

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
    const idToSendRequest= req.body.idToSendRequest;

    const currentDate = new Date();
    const timeStamp= currentDate.toLocaleString('fr-Fr')

    const requestSend= res.locals.requestSend;
    const requestWaiting= res.locals.requestWaiting;
    updateRequestSend();

    console.log(requestSend)
    console.log(requestWaiting)

    
    function updateRequestSend(){
        if(requestSend.length<1){
            const jsonUpdateRequestSend= JSON.stringify([{"userId": idToSendRequest, 'timeStamp': timeStamp}])
            const request=`update friends set requestsend= '${jsonUpdateRequestSend}' where userId=${id} RETURNING *`

            pool.query(request, (err, docs)=>{
                if(docs) updateRequestWaiting();
                else console.log(err)
            })
        }
    
        else{
            requestSend.push({"userId": idToSendRequest, 'timeStamp': timeStamp})
            const jsonRequestSend= JSON.stringify(requestSend);
    
            const request=`update friends set requestsend= '${jsonRequestSend}' where userId=$1 RETURNING *`
            const value=[id];
            pool.query(request, value, (err, docs)=>{
                if(docs) updateRequestWaiting();
                else console.log(err)
            })
        }   
    }

    function updateRequestWaiting(){
        if(requestWaiting.length<1){
            const jsonUpdateRequestWaiting= JSON.stringify([{"userId": id, 'timeStamp': timeStamp}])
            const request= `update friends set requestfriendswaiting= '${jsonUpdateRequestWaiting}' where userId=${idToSendRequest} RETURNING *`
            pool.query(request,(err, docs)=>{
                if(docs) res.send(docs.rows[0])
                else console.log(err)
            })
        }
    
        else{
            requestWaiting.push({"userId": id, 'timeStamp': timeStamp});
            const jsonRequestWaiting= JSON.stringify(requestWaiting)
            const request= `update friends set requestfriendswaiting= '${jsonRequestWaiting}' where userId=${idToSendRequest} RETURNING *`

            pool.query(request, (err,docs)=>{
                if(docs) res.send(docs.rows[0])
                else console.log(err)
            })
        
        }
    }
}

module.exports.acceptFriend= async (req, res)=>{
    
    const currentDate = new Date();
    const timeStamp= currentDate.toLocaleString('fr-Fr')

    const requestSend= res.locals.requestSend;
    const requestWaiting= res.locals.requestWaiting;
    let yourFriends= await getYourFriends();
    let friendsOfTheAnotherUser= await getFriendsOfAnother();

    updateRequestSend()


    async function getYourFriends(){
        request= `SELECT friends FROM friends WHERE userId=${req.params.id}`
        
            try{
                const data= await pool.query(request)
                return data.rows[0].friends
            }
            catch (err) {
                res.status(400).send('Erreur connexion Serveur ou Id Inconnu')
            }
        
    }

    async function getFriendsOfAnother(){
        request= `SELECT friends FROM friends WHERE userId=${req.body.idUserToAccept}`
        
            try{
                const data= await pool.query(request)
                return data.rows[0].friends
            }
            catch (err) {
                res.status(400).send('Erreur connexion Serveur ou Id Inconnu')
            }
            
    }

    function updateRequestSend(){
       
        const requestSendUpdate= requestSend.filter(e=> { return e.userId != req.params.id});
        
        const jsonRequest= JSON.stringify(requestSendUpdate)

        const request=`update friends set requestsend= '${jsonRequest}' where userId=${req.body.idUserToAccept} RETURNING *`
        pool.query(request, (err, docs)=>{
            if(docs) updateRequestWaiting();
            else console.log(err)
        })
    }

    function updateRequestWaiting(){
            const updateRequestWaiting= requestWaiting.filter(e=> { return e.userId != req.body.idUserToAccept})
            const jsonUpdateRequestWaiting= JSON.stringify(updateRequestWaiting)
            const request= `update friends set requestfriendswaiting= '${jsonUpdateRequestWaiting}' where userId=${req.params.id} RETURNING *`
            pool.query(request,(err, docs)=>{
                if(docs) updateYourFriends();
                else console.log(err)
            })
        }

  
    function updateYourFriends(){
       
        if(yourFriends === null) yourFriends= [];
        yourFriends.push(req.body.idUserToAccept)

        const jsonFriends= JSON.stringify(yourFriends);

        const request=`update friends set friends= '${jsonFriends}' where userId=${req.params.id} RETURNING *`

        pool.query(request, (err, docs)=>{
            if(docs) updateFriendsOfTheAnotherUser();
            if(err) res.send("erreur lors de l'ajout d'amis")
        })
    }

    function updateFriendsOfTheAnotherUser(){
        console.log(friendsOfTheAnotherUser)
        if(friendsOfTheAnotherUser === null) friendsOfTheAnotherUser=[];
        friendsOfTheAnotherUser.push(req.params.id);

        const jsonFriends= JSON.stringify(friendsOfTheAnotherUser);

        const request= `update friends set friends= '${jsonFriends}' where userId=${req.body.idUserToAccept} RETURNING *`

        pool.query(request, (err, docs)=>{
            if(docs) res.send(docs)
            if(err) res.send("erreur lors de l'ajout d'amis")
        })


    } 
}

module.exports.refuseFriends=()=>{
    const currentDate = new Date();
    const timeStamp= currentDate.toLocaleString('fr-Fr')

    const requestSend= res.locals.requestSend;
    const requestWaiting= res.locals.requestWaiting;

    updateRequestSend()

    function updateRequestSend(){
        const requestSendUpdate= requestSend.filter(e=> { return e.userId != req.params.id});
        const jsonRequest= JSON.stringify(requestSendUpdate)

        const request=`update friends set requestsend= '${jsonRequest}' where userId=${req.body.idUserToAccept} RETURNING *`
        pool.query(request, (err, docs)=>{
            if(docs) updateRequestWaiting();
            else console.log(err)
        })
    }

    function updateRequestWaiting(){
            const updateRequestWaiting= requestWaiting.filter(e=> { return e.userId != req.body.idUserToAccept})
            const jsonUpdateRequestWaiting= JSON.stringify(updateRequestWaiting)
            const request= `update friends set requestfriendswaiting= '${jsonUpdateRequestWaiting}' where userId=${req.params.id} RETURNING *`
            pool.query(request,(err, docs)=>{
                if(docs) res.send(docs.rows[0])
                else console.log(err)
            })
        }


}