const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
dotenv.config()
const { sequelize } = require('./lib/db/models')
const app = express()

app.use(express.json())

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// routes
app.use('/api', require('./routes/routes'))

app.listen(
  process.env.PORT,
  async () => {
    console.log(`Server running on http://localhost:${process.env.PORT}, in ${process.env.NODE_ENV} mode`)
    await sequelize.authenticate()
    console.log('Database connected!')
  }
)
