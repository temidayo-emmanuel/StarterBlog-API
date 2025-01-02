const {Router} = require('express')

const {forgotPassword, resetPassword} = require('../controllers/passwordControllers')


const router = Router()


router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)


module.exports = router