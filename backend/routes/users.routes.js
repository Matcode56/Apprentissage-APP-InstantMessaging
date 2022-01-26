// Importation router
const router= require('express').Router();

const userControllers= require('../controllers/user.controllers');
const userMiddleware= require('../middlewares/user.midllewares');
const upload= require('../config/uploadImg')

router.get('/infosAllUser', userControllers.getAllUser);
router.get('/infosUser/:id', userControllers.getUser);

router.put('/changePhotoProfil/:id', userMiddleware.checkIdUser, upload.single('profilPhoto'), userControllers.changePhotoProfil);
router.put('/sendRequestFriend/:id', userMiddleware.checkRequestFriends,userControllers.sendRequestFriend);
router.put('/acceptFriend/:id', userMiddleware.checkAcceptRefuseFriend, userControllers.acceptFriend)
router.put('/refuseFriend/:id')

router.delete('/delete/:id',userMiddleware.checkIdUser,userControllers.deleteUser );

module.exports = router;