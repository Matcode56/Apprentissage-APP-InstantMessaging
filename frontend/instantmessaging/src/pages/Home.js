import React, { useState } from "react";
import SocketClient from "socket.io-client";



const Home=() =>{

  const [inputMsg, setInputMsg]= useState()

  const SERVER = "http://localhost:5000";
  let socket= SocketClient(SERVER)
  socket.on('connection', () => {
    console.log(`I'm connected with the back-end`);
  });


  function sendMessage(){
    socket.emit('chat', inputMsg)
  }
 
  return(
    <div>
      <input onChange={(e)=> setInputMsg(e.target.value)}></input>
      <button onClick={()=> sendMessage()}>Envoyer</button>
    </div>
  )
}

export default Home