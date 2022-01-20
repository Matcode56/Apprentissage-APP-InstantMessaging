// Importation router
const router= require('express').Router();
const authControllers= require('../controllers/auth.controllers');
const authMiddlewares= require('../middlewares/auth.middlewares')

router.post('/register', authMiddlewares.checkEmailAndPswRegister ,authControllers.register)
router.get('/login', authMiddlewares.checkEmailLogin ,authControllers.login)

module.exports = router;