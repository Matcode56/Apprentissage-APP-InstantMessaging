const e = require('express');
const { request } = require('express');
const pool = require('../config/db');


module.exports.checkIdUser= async (req, res, next)=>{
    const id= req.params.id;

    const query= 'SELECT * FROM users WHERE id=$1';
    const value=[id];

    const checkId= await pool.query(query, value);

    if (checkId.rows.length>0) next();
    else res.status(400).send("id introuvable")
}


module.exports.checkRequestFriends= async (req,res,next)=>{

    let requestSend= await getRequestSend()
    let requestWaiting= await getRequestWaiting();
    let friends= await getFriends();

    async function getFriends(){
        const request= `SELECT friends FROM friends WHERE userId=${req.params.id}`
        
            try{
                const data= await pool.query(request)
                return data.rows[0].friends
            }
            catch (err) {
                res.status(400).send('Erreur connexion Serveur ou Id Inconnu')
            }
        
    }

    async function getRequestSend(){
        
        const request= `SELECT requestsend FROM friends WHERE userId=${req.params.id}`
        
        try{
            const data= await pool.query(request)
            return data.rows[0].requestsend
        }
        catch (err) {
            res.status(400).send('Erreur connexion Serveur ou Id Inconnu')
        }
    }

    async function getRequestWaiting(){
        const request= `SELECT requestfriendswaiting FROM friends WHERE userId=${req.body.idToSendRequest}`

        try{
            const data= await pool.query(request)
            return data.rows[0].requestfriendswaiting
        }
        catch (err) {
            res.status(400).send('Erreur connexion Serveur ou Id Inconnu')
        }
    }


    if(requestSend === null) requestSend= []
    if(requestWaiting === null) requestWaiting= [];
    if(friends === null ) friends= [];

    checkIdUsersInArray()
    function checkIdUsersInArray(){
        let checkRequestsSend;
        let checkRequestsWaiting;
        let checkFriends;

        if(requestSend.length == 0){
            checkRequestsSend=true
        }
        else{
            requestSend.forEach(e=>{ 
                if(e.userId != req.params.id) return checkRequestsSend= true;
           })
        }
        
        if(requestWaiting.length == 0 ){
            console.log("hey")
            checkRequestsWaiting= true;
        }
        else{
            requestWaiting.forEach(e=>{
                if(e.userId != req.body.idUserToAccept) return checkRequestsWaiting= true
            })
        }
        

        if(friends.length == 0){
            checkFriends= true;
        }
        else{
            friends.forEach(e=>{
                if(e.userId != req.body.idToSendRequest) return checkFriends= true
            })
        }

        if(!checkRequestsSend && !checkRequestsSend && !checkFriends){
            res.status(400).send("Vous avez déja fait une demande d'ajout ou vous avez déja cette personne en amis")
        } 
        else{
            res.locals.requestSend= requestSend
            res.locals.requestWaiting= requestWaiting
            next();
        }
    }
        
        
         

       
 
 
   
    //next();
}

module.exports.checkAcceptRefuseFriend= async(req,res,next)=>{

    
    const requestSend= await getRequestSend()
    const requestWaiting= await getRequestWaiting();
    

    async function getRequestSend(){
        const request= `SELECT requestsend FROM friends WHERE userId=${req.body.idUserToAccept}`
        try{
            const data= await pool.query(request)
            
            return data.rows[0].requestsend
        }
        catch (err) {
            res.status(400).send('Erreur connexion Serveur ou Id Inconnu')
        }
    }   

    async function getRequestWaiting(){
        const request= `SELECT requestfriendswaiting FROM friends WHERE userId=${req.params.id}`
        
        try{
            const data= await pool.query(request)
            return data.rows[0].requestfriendswaiting
        }
        catch (err) {
            res.status(400).send('Erreur connexion Serveur ou Id Inconnu')
        }
     }
    
     if(requestSend.length>0 && requestWaiting.length>0) checkIdUsersInArray();
     else res.status(400).send('Erreur de demande')

     function checkIdUsersInArray(){
        let checkRequestSend;
        let checkRequestWaiting;
         requestSend.forEach(e=>{ 
             if(e.userId == req.params.id) return checkRequestSend= true;
        })

        requestWaiting.forEach(e=>{
            if(e.userId == req.body.idUserToAccept) return checkRequestWaiting= true
        })

        console.log(checkRequestWaiting)
        
        res.locals.requestSend= requestSend
        res.locals.requestWaiting= requestWaiting

        if(checkRequestSend && checkRequestWaiting) next();
        else res.status(400).send('erreur')
     }
}

