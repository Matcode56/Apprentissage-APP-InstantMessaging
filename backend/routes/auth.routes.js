// Importation router
const router= require('express').Router();
const authControllers= require('../controllers/auth.controllers');
const authMiddlewares= require('../middlewares/auth.middlewares')

router.post('/register', authMiddlewares.checkEmailAndPswRegister, authMiddlewares.checkAgeAndEmail ,authControllers.register)
router.post('/login', authControllers.login);
router.get("/logout", authControllers.logout)

module.exports = router;