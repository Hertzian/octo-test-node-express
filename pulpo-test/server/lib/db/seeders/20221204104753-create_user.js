'use strict'

const { authService: { generatePassword } } = require('../../../utils')
const date = new Date()
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      'Users',
      [{
        name: process.env.USER_NAME,
        password: await generatePassword(process.env.USER_PASSWORD),
        createdAt: date,
        updatedAt: date
      }],
      {}
    )
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null)
  }
}
