const multer= require('multer');

    const storage= multer.diskStorage({
        destination: (req, file, cb)=>{
          
            if(file.fieldname=== 'profilPhoto') {
                cb(null,`${__dirname}/../../frontend/instantmessaging/public/upload/photoProfil`)
            }
            if(file.fieldname === 'messageImg'){
                cb(null,`${__dirname}/../../frontend/instantmessaging/public/upload/messageImg`)
            }
        }, 
        filename: (req, file, cb)=>{
            
            let mimetype= file.mimetype;
            
            let suffix= mimetype.replace('image/', '')
            
            if(file.fieldname === 'profilPhoto'){
                cb(null, Date.now()+'-User-'+ req.params.id+ '.'+ suffix)
            }
            
            // A MODIFIER!!
            if(file.fieldname === 'messageImg'){
                cb(null, Date.now()+'-User-'+ req.body.messageId+ '.'+ suffix)
            }
        }   
    }) 
    
    const upload = multer({storage: storage, fileFilter: (req, file, cb)=> {
         if(
             file.mimetype !== "image/jpg" 
         &&  file.mimetype !== "image/png" 
         &&  file.mimetype !== "image/jpeg" 
         ){
             throw Error ('invalid file')
         } 
         else {
           cb(null, true);   
         }},
         limits:{fileSize:2000000},
       });

    module.exports= upload
   
