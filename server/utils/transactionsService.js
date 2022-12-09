const fs = require('fs')
const path = require('path')
const axios = require('axios')
const planBRrawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../rawData.json'), 'utf-8')) // 1000 entries

/**
 * I you can't access to the api this file contains a response from this url:
 * https://api.iatistandard.org/datastore/transaction/select?q=recipient_country_code:SD,transaction_value,transaction_value_value_date,transaction_provider_org_narrative,transaction_receiver_org_narrative&rows=1000
 *
 * @returns Well, return the entire response from the file, there are a lot, really a lot of keys
 * yeah, I'm just too lazy to write all properties here...
 */
function readTransactionsFile () {
  return planBRrawData.response.docs
}

/**
 * Fetch the data from the api
 *
 * @param {String} param.country
 * @param {String} param.rows
 * @returns Well, same as above, return the entire response from the file, there are a lot, really a lot of keys
 * yeah, I'm just too lazy to write all properties here...
 */
async function fetchTransactions ({ country = 'SD', rows = 1000 } = {}) {
  const requestParams = [
    `recipient_country_code:${country}`,
    'transaction_value',
    'transaction_value_value_date',
    'transaction_provider_org_narrative',
    `transaction_receiver_org_narrative&rows=${rows}`
  ]
  const url = process.env.API_URL + requestParams.join(',')
  const response = await axios.get(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.API_KEY_FIRST || process.env.API_KEY_SECOND,
      Accept: 'application/json',
      'Accept-Encoding': 'identity'
    },
    decompress: false
  })

  return await response.data.response.docs
}

/**
 * Maps the raw transactions from the api or the raw file
 *
 * @param {{}} transactions the param here is the raw response from api OR the raw file, and yeah, a lot of entries...
 * @returns {{
 *    transactionsCount: Number
 *    transactions:
 *       Array<{
 *           id: Number
 *           countryCode: String
 *           provider: String
 *           receiver: String
 *           transactionDate: String
 *           transactionYear: String
 *           value: Number
 *           createdAt: Date
 *           updatedAt: Date
 *       }>
 *    }}
 */
function mapTransactions (transactions) {
  const mappedTransactions = []
  const transactionsCount = transactions.length
  for (const transaction of transactions) {
    const mappedTransaction = {
      countryCode: transaction.recipient_country_code[0],
      provider: (transaction.transaction_provider_org_narrative && transaction.transaction_provider_org_narrative[0]) || null,
      receiver: (transaction.transaction_receiver_org_narrative && transaction.transaction_receiver_org_narrative[0]) || null,
      transactionDate: transaction.transaction_value_value_date[0],
      transactionYear: transaction.transaction_value_value_date[0].split('-')[0],
      value: transaction.transaction_value.reduce((a, b) => a + b)
    }
    mappedTransactions.push(mappedTransaction)
  }

  return {
    transactionsCount,
    transactions: mappedTransactions
  }
}

/**
 * Get Raw transactions, with transaction year, transaction provider and the amount
 *
 * @param {{
 *    transactions:
 *       Array<{
 *           id: Number
 *           countryCode: String
 *           provider: String
 *           receiver: String
 *           transactionDate: String
 *           transactionYear: String
 *           value: Number
 *           createdAt: Date
 *           updatedAt: Date
 *       }>
 * }} transactions
 * @returns {
 *    Array<{
 *        transactionYear: String
 *        [transactionProvider]: Number
 *    }>
 * }
 */
function rawTransactions (transactions) {
  const transactionsList = []
  for (const { provider, value, transactionYear } of transactions) {
    const transactionList = {
      transactionYear,
      [provider]: value
    }
    transactionsList.push(transactionList)
  }

  return transactionsList
}

/**
 * Sort the transactions ASC or DESC by year.
 *
 * @param {String} param.sort
 * @param {{
 *    Array<{
 *       transactionYear: String
 *       [transactionProvider]: Number
 *    }>
 * }} param.transactions
 * @returns {{
 *    Array<{
 *        [year]: {
 *            [[transactionProvider]: Number]
 *        }
 *    }>
 * }}
 */
function sortTransactions ({ sort, transactions }) {
  sort = sort.toLowerCase()
  const sortedTransactions = []
  for (const [year, transaction] of Object.entries(transactions)) {
    const totalPerYear = { [year]: transaction }
    sortedTransactions.push(totalPerYear)
  }
  if (sort === 'desc') return sortedTransactions.reverse()

  return sortedTransactions
}

/**
 * Group all the transactions providers with the sum of all transactions, grouped by year ASC or DEC
 *
 * @param {String} param.sort
 * @param {{
 *    Array<{
 *       transactionYear: String
 *       [transactionProvider]: Number
 *    }>
 * }} param.transactions
 * @returns {{
 *    countryCode: String
 *    Array<{{
 *        [year]: {
 *            [[transactionProvider]: Number]
 *        }
 *    }}>
 * }}
 */
function transactionsTotalsPerYear ({ sort = 'ASC', transactions } = {}) {
  const transactionsTotalsPerYear = {}
  let countryCode = ''
  for (const { provider, value, transactionYear, countryCode: country } of transactions) {
    if (countryCode === '') {
      countryCode = country
    }
    if (!Object.prototype.hasOwnProperty.call(transactionsTotalsPerYear, transactionYear)) {
      transactionsTotalsPerYear[transactionYear] = {}
    }
    if (!Object.prototype.hasOwnProperty.call(transactionsTotalsPerYear[transactionYear], provider)) {
      transactionsTotalsPerYear[transactionYear][provider] = 0
    }
    transactionsTotalsPerYear[transactionYear][provider] += value
  }

  return {
    countryCode,
    transactions: sortTransactions({ sort, transactions: transactionsTotalsPerYear })
  }
}

/**
 * This function is not implemented anywhere because I find a little bit cumbersome to parse into a json object.
 * Return a map grouping total transactions per provider and per year.
 *
 * @param {
 *    transactions:
 *       Array<{
 *           id: Number
 *           countryCode: String
 *           provider: String
 *           receiver: String
 *           transactionDate: String
 *           transactionYear: String
 *           value: Number
 *           createdAt: Date
 *           updatedAt: Date
 *       }>
 * } transactions
 * @returns {
 *    Map<{
 *       [year] => providers:
 *           Array<{
 *               [transactionProvider]: Number
 *           }>
 *    }>
 * }
 */
function transactionsMapByYear (transactions) {
  const mappedTransactions = new Map()
  for (const { value, transactionYear, provider } of transactions) {
    const providerValue = { [provider]: value }

    if (mappedTransactions.has(transactionYear)) {
      mappedTransactions.get(transactionYear).providers.push(providerValue)
    } else {
      mappedTransactions.set(transactionYear, { providers: [providerValue] })
    }
  }

  return mappedTransactions
}

module.exports = {
  readTransactionsFile,
  fetchTransactions,
  mapTransactions,
  transactionsTotalsPerYear,
  rawTransactions,
  transactionsMapByYear
}
