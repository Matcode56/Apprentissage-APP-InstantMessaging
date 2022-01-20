// Importation router
const router= require('express').Router();
const userControllers= require('../controllers/user.controllers');
const userMiddleware= require('../middlewares/user.midllewares')

router.get('/infosAllUser', userControllers.getAllUser);
router.delete('/delete/:id',userMiddleware.checkIdUser,userControllers.deleteUser )

module.exports = router;