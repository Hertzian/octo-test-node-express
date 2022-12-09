const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
dotenv.config()
const { sequelize } = require('./server/lib/db/models')
const app = express()

app.use(express.json())

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// static public folder
app.use(express.static(path.join(__dirname, 'server', 'public')))

// routes
app.use('/api', require('./server/routes/routes'))

app.listen(
  process.env.PORT,
  async () => {
    console.log(`Server running on http://localhost:${process.env.PORT}, in ${process.env.NODE_ENV} mode`)
    await sequelize.authenticate()
    console.log('Database connected!')
  }
)
