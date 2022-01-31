//Importation Framework Express
const express= require('express');
const app= express();

const http= require('http')
const server = http.createServer(app);

//Socket
const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

io.on('connection', (socket) => {
    console.log(`Connecté au client ${socket.id}`);
    socket.emit('connection', null);
    socket.on('chat', (msg) => {
      console.log('message: ' + msg);
    });
})



// Routes
const userRoutes= require('./routes/users.routes');
const authRoutes= require('./routes/auth.routes')
const messagesRoutes= require('./routes/messages.routes')



//Importation dotenv pour sécuriser des données sensible
require('dotenv').config({path:'./config/.env'})




// Parser 
app.use(express.json());
const cors = require('cors');
const cookieParser= require('cookie-parser');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//Routes
app.use('/api/user', userRoutes)
app.use('/api/auth/', authRoutes)
app.use('/api/messages', messagesRoutes)




server.listen(process.env.PORT, ()=>{
    console.log(`Listening on port ${process.env.PORT}`)
})

module.export= app;