//Importation Framework Express
const express= require('express');
const app= express();


const userRoutes= require('./routes/users.routes');
const authRoutes= require('./routes/auth.routes')



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




app.listen(process.env.PORT, ()=>{
    console.log(`Listening on port ${process.env.PORT}`)
})

module.export= app;