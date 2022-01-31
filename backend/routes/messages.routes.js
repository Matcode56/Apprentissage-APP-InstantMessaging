const router= require('express').Router();
const upload= require('../config/uploadImg')

const messagesMiddlewares= require('../middlewares/messages.midllewares')
const messagesController= require('../controllers/messages.controllers')

router.put('/sendMessage', upload.single('messageImg'), messagesMiddlewares.checkBeforeSendMessage);

module.exports = router;