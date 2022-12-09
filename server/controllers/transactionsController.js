const { Op } = require('sequelize')
const { Transaction } = require('../lib/db/models')
const {
  transactionsService: {
    readTransactionsFile, // uncomment this if you can't access to the api
    fetchTransactions,
    mapTransactions,
    rawTransactions,
    transactionsTotalsPerYear,
    transactionsMapByYear
  }
} = require('../utils')

/**
 * Test endpoint.
 *
 * @param {Object} req
 * @param {Object} res
 * @return {{
 *    message: String
 * }} Just a test message
 */
exports.test = (req, res) => {
  const message = {
    message: 'its working!'
  }
  return res.json(message)
}

/**
 * Fetches the data from external API, if the data base is empty, if not, just return the raw data from database
 *
 * @param {Object} req
 * @param {String} req.headers.authorization // bearer token required
 * @param {Object} res
 * @return {{
 *    totalCount: Number
 *    transactions:
 *        Array<{
 *          id: Number
 *          provider: String
 *          receiver: String
 *          transactionDate: Date
 *          transactionYear: String
 *          value: Number
 *          createdAt: Date
 *          updatedAt: Date
 *    }>
 * }}
 */
exports.getData = async (req, res) => {
  const transactionsFromDB = await Transaction.findAll()
  if (!transactionsFromDB.length) {
    return fetchTransactions()
      .then(async (response) => {
        if (!response || !response.length) {
          const transactions = mapTransactions(readTransactionsFile())
          const transactionsCreated = await Transaction.bulkCreate(transactions.transactions)

          return res.json({
            transactionsCount: transactionsCreated.length,
            transactions: transactionsCreated
          })
        }

        const transactions = mapTransactions(response)
        const transactionsCreated = await Transaction.bulkCreate(transactions.transactions)

        return res.json({
          transactionsCount: transactionsCreated.length,
          transactions: transactionsCreated
        })
      })
      .catch((err) => console.log(err))
  }
  return res.json({
    transactionsCount: transactionsFromDB.length,
    transactions: transactionsFromDB
  })
}

/**
 * Return transactions from db, grouping them from year, and the rawTransactions
 *
 * @param {Object} req
 * @param {String} req.headers.authorization // bearer token required
 * @param {?String} req.query.from year
 * @param {?String} req.query.to year
 * @param {?String} req.query.sort ASC | DESC
 * @param {Object} res
 * @return {{
 *    totalCount: Number
 *    countryCode: String
 *    transactionTotalsPerYear: {
 *        [yearNumber]: {
 *            [transactionProvider]: [Number]
 *        }
 *    }
 *    transactionsList:
 *        Array<{
 *          transactionYear: String
 *          [transactionProvider]: [Number]
 *    }>
 * }}
 */
exports.play = async (req, res) => {
  const where = {}
  const toFrom = []
  let sort = 'ASC'

  // build query filter
  if (req.query.from) toFrom.push(req.query.from)
  if (req.query.to) toFrom.push(req.query.to)
  if (toFrom.length > 1) {
    where.transactionYear = { [Op.between]: toFrom }
  }
  if (toFrom.length === 1) {
    where.transactionYear = toFrom
  }
  if (req.query.sort) {
    sort = req.query.sort
  }

  try {
    // get transactions from db
    const transactions = await Transaction.findAll({
      where,
      order: [
        ['transactionYear', sort]
      ],
      attributes: [
        'countryCode',
        'transactionYear',
        'provider',
        'value'
      ],
      // logging: console.log
    })

    const transactionsCount = transactions.length
    const totalsPerYear = transactionsTotalsPerYear({ sort, transactions })
    const transactionsList = rawTransactions(transactions)
    console.log(transactionsMapByYear(transactions))

    return res.json({
      transactionsCount,
      countryCode: totalsPerYear.countryCode,
      totalsPerYear: totalsPerYear.transactions,
      transactionsList
    })
  } catch (err) {
    console.log(err)
  }
}
