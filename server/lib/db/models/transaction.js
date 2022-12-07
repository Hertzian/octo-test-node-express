'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate (models) { }
  }
  Transaction.init({
    countryCode: DataTypes.STRING,
    provider: DataTypes.STRING,
    receiver: DataTypes.STRING,
    transactionDate: DataTypes.DATE,
    transactionYear: DataTypes.STRING,
    value: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Transaction'
  })
  return Transaction
}
