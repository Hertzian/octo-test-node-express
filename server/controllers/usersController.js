const { authService: { genToken, matchPassword } } = require('../utils')
const { User } = require('../lib/db/models')

/**
 * Login endpoint.
 *
 * @param {String} req.body.user
 * @param {String} req.body.password
 * @param {Object} res
 * @return {{
 *    token: String
 * }} Bearer token used in authorization
 */
exports.login = async (req, res) => {
  const { name, password } = req.body
  try {
    const user = await User.findOne({ where: { name } })
    const isMatch = await matchPassword(password, user.password)
    if (user && isMatch) {
      return res.json({ token: genToken(user.id) })
    }
  } catch (err) {
    console.log(err)
    return res.status(401).json(err)
  }
}
