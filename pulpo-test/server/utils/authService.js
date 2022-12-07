const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { User } = require('../lib/db/models')

/**
 * Encrypt the raw string for password
 *
 * @param {String} passwordWithoutEncrypt
 * @returns {String} Encrypted password
 */
async function generatePassword (passwordWithoutEncrypt) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(passwordWithoutEncrypt, salt)
}

/**
 * Compare entered password with password in db
 *
 * @param {String} enteredPassword
 * @param {String} existingPassword
 * @returns {Boolean}
 */
async function matchPassword (enteredPassword, existingPassword) {
  return await bcrypt.compare(enteredPassword, existingPassword)
}

/**
 * Generate jwt token
 *
 * @param {Number} userId
 * @returns {String}
 */
function genToken (userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  )
}

/**
 * Middleware to protect routes, to give or not the access to the route
 *
 * @param {Object} req
 * @param {Object} res
 * @param {} next
 */
async function protectRoutes (req, res, next) {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findOne({ where: { id: decoded.userId } })
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized to use this route' })
  }
}

module.exports = {
  generatePassword,
  matchPassword,
  genToken,
  protectRoutes
}
