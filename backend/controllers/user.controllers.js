const pool= require('../config/db')
const fs= require('fs')



module.exports.getAllUser= (req, res)=>{
    pool.query('SELECT * FROM users', (err, docs)=>{
        if(res) return res.send(docs.rows)
        else res.status(400).send("error")
    })
}

module.exports.getUser= (req, res)=>{
    const request='SELECT * FROM users WHERe id=$1'
    const value= [req.params.id]
    pool.query(request, value, (err, docs)=>{
        if(res) return res.send(docs.rows[0])
        else res.status(400).send("error")
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
            else res.status(400).send("error")
        })
    }   
}

module.exports.sendRequestFriend= async (req,res)=>{

    // Récupération des données avant update
    const id= req.params.id;
    const idToSendRequest= req.body.idToSendRequest;

    const currentDate = new Date();
    const timeStamp= currentDate.toLocaleString('fr-Fr')

    const requestSend= res.locals.requestSend;
    const requestWaiting= res.locals.requestWaiting;

    //Update "En Chaine"
    updateRequestSend();

    function updateRequestSend(){
        if(requestSend.length<1){
            const jsonUpdateRequestSend= JSON.stringify([{"userId": idToSendRequest, 'timeStamp': timeStamp}])
            const request=`update friends set requestsend= '${jsonUpdateRequestSend}' where userId=${id} RETURNING *`

            pool.query(request, (err, docs)=>{
                if(docs) updateRequestWaiting();
                else res.status(400).send("error")
            })
        }
    
        else{
            requestSend.push({"userId": idToSendRequest, 'timeStamp': timeStamp})
            const jsonRequestSend= JSON.stringify(requestSend);
    
            const request=`update friends set requestsend= '${jsonRequestSend}' where userId=$1 RETURNING *`
            const value=[id];
            pool.query(request, value, (err, docs)=>{
                if(docs) updateRequestWaiting();
                else res.status(400).send("error")
            })
        }   
    }

    function updateRequestWaiting(){
        if(requestWaiting.length<1){
            const jsonUpdateRequestWaiting= JSON.stringify([{"userId": id, 'timeStamp': timeStamp}])
            const request= `update friends set requestfriendswaiting= '${jsonUpdateRequestWaiting}' where userId=${idToSendRequest} RETURNING *`
            pool.query(request,(err, docs)=>{
                if(docs) res.status(200).send("Demande d'amis réalisé avec succès")
                else res.status(400).send("error")
            })
        }
    
        else{
            requestWaiting.push({"userId": id, 'timeStamp': timeStamp});
            const jsonRequestWaiting= JSON.stringify(requestWaiting)
            const request= `update friends set requestfriendswaiting= '${jsonRequestWaiting}' where userId=${idToSendRequest} RETURNING *`

            pool.query(request, (err,docs)=>{
                if(docs) res.status(200).send("Demande d'amis réalisé avec succès")
                else res.status(400).send("error")
            })
        
        }
    }
}

module.exports.acceptFriend= async (req, res)=>{
    
    //Récupération des données avant update 
    const currentDate = new Date();
    const timeStamp= currentDate.toLocaleString('fr-Fr')

    const requestSend= res.locals.requestSend;
    const requestWaiting= res.locals.requestWaiting;
    let yourFriends= await getYourFriends();
    let friendsOfTheAnotherUser= await getFriendsOfAnother();


    async function getYourFriends(){
        const request= `SELECT friends FROM friends WHERE userId=${req.params.id}`
        
            try{
                const data= await pool.query(request)
                return data.rows[0].friends
            }
            catch (err) {
                res.status(400).send('Erreur connexion Serveur ou Id Inconnu')
            }
        
    }

    async function getFriendsOfAnother(){
       const  request= `SELECT friends FROM friends WHERE userId=${req.body.idUserToAcceptOrRefuse}`
        
            try{
                const data= await pool.query(request)
                return data.rows[0].friends
            }
            catch (err) {
                res.status(400).send('Erreur connexion Serveur ou Id Inconnu')
            }
            
    }

    // Update en "chaine"
    updateRequestSend()
    function updateRequestSend(){
        const requestSendUpdate= requestSend.filter(e=> { return e.userId != req.params.id});
        const jsonRequest= JSON.stringify(requestSendUpdate)

        const request=`update friends set requestsend= '${jsonRequest}' where userId=${req.body.idUserToAcceptOrRefuse} RETURNING *`
        pool.query(request, (err, docs)=>{
            if(docs) updateRequestWaiting();
            else    res.status(400).send("error")
        })
    }

    function updateRequestWaiting(){
        const updateRequestWaiting= requestWaiting.filter(e=> { return e.userId != req.body.idUserToAcceptOrRefuse})
        const jsonUpdateRequestWaiting= JSON.stringify(updateRequestWaiting)
            
        const request= `update friends set requestfriendswaiting= '${jsonUpdateRequestWaiting}' where userId=${req.params.id} RETURNING *`
        
        pool.query(request,(err, docs)=>{
                if(docs) updateYourFriends();
                else res.status(400).send("error")
            })
        }

  
    function updateYourFriends(){
        
       if(yourFriends === null) yourFriends= [];
       
        
        yourFriends.push({'userId': req.body.idUserToAcceptOrRefuse, 'timeStamp': timeStamp})
        const jsonFriends= JSON.stringify(yourFriends);

        const request=`update friends set friends= '${jsonFriends}' where userId=${req.params.id} RETURNING *`
        pool.query(request, (err, docs)=>{
            if(docs) updateFriendsOfTheAnotherUser();
            if(err) res.send("erreur lors de l'ajout d'amis")
        })
    }

    function updateFriendsOfTheAnotherUser(){
   
        if(friendsOfTheAnotherUser === null) friendsOfTheAnotherUser=[];
        friendsOfTheAnotherUser.push({'userId': req.params.id, 'timeStamp': timeStamp});

        const jsonFriends= JSON.stringify(friendsOfTheAnotherUser);

        const request= `update friends set friends= '${jsonFriends}' where userId=${req.body.idUserToAcceptOrRefuse} RETURNING *`

        pool.query(request, (err, docs)=>{
            if(docs) res.status(200).send("Ajout d'amis réussi")
            if(err) res.send("erreur lors de l'ajout d'amis")
        })
    } 
}

module.exports.refuseFriends=(req,res)=>{

    const requestSend= res.locals.requestSend;
    const requestWaiting= res.locals.requestWaiting;

    updateRequestSend()

    function updateRequestSend(){
        const requestSendUpdate= requestSend.filter(e=> { return e.userId != req.params.id});
        const jsonRequest= JSON.stringify(requestSendUpdate)

        const request=`update friends set requestsend= '${jsonRequest}' where userId=${req.body.idUserToAcceptOrRefuse} RETURNING *`
        pool.query(request, (err, docs)=>{
            if(docs) updateRequestWaiting();
            else res.status(400).send("error")
        })
    }

    function updateRequestWaiting(){
            const updateRequestWaiting= requestWaiting.filter(e=> { return e.userId != req.body.idUserToAcceptOrRefuse})
            const jsonUpdateRequestWaiting= JSON.stringify(updateRequestWaiting)
            const request= `update friends set requestfriendswaiting= '${jsonUpdateRequestWaiting}' where userId=${req.params.id} RETURNING *`
            pool.query(request,(err, docs)=>{
                if(docs) res.status(200).send("Demande d'amis refusé avec succès")
                else res.status(400).send("error")
            })
        }
}


module.exports.deleteFriend=(req,res,next)=>{
    let yourFriends=res.locals.yourFriends
    let friendsOfTheAnotherUser= res.locals.friendsOfTheAnotherUser;

    updateYourFriends()

    function updateYourFriends(){
        
        yourFriends= yourFriends.filter(e =>{e.userId != req.body.idFriendToDelete})
        
        const jsonFriends= JSON.stringify(yourFriends);

        const request=`update friends set friends= '${jsonFriends}' where userId=${req.params.id} RETURNING *`
        pool.query(request, (err, docs)=>{
            if(docs) updateFriendsOfTheAnotherUser();
            if(err) res.send("erreur lors de l'ajout d'amis")
        })
    }

    function updateFriendsOfTheAnotherUser(){
        
        friendsOfTheAnotherUser= friendsOfTheAnotherUser.filter(e=>{e.userId != req.params.id})

        const jsonFriends= JSON.stringify(friendsOfTheAnotherUser);

        const request= `update friends set friends= '${jsonFriends}' where userId=${req.body.idFriendToDelete} RETURNING *`

        pool.query(request, (err, docs)=>{
            if(docs) res.send("Suppresion réalisé avec succès")
            if(err) res.send("erreur lors de l'ajout d'amis")
        })
    }

}