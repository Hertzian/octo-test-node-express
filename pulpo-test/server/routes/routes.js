const express = require('express')
const router = express.Router()
const { authService: { protectRoutes } } = require('../utils')
const testsController = require('../controllers/transactionsController')
const usersController = require('../controllers/usersController')

router.get('/', testsController.test)
router.get('/login', usersController.login)
router.get('/get-data', protectRoutes, testsController.getData)
router.get('/play', protectRoutes, testsController.play)

module.exports = router
