require('dotenv').config()

const express = require('express')
const morgan = require('morgan')

const app = express()

const listedNfts = []
// Settings
app.set('views', './static/views')
app.set('view engine', 'ejs')
app.set('appName', process.env.APP_NAME)
app.set('port', process.env.PORT)
app.set('listedNfts', listedNfts)

// MiddleWares
app.use(express.json())
app.use(express.static('static'))
app.use(morgan('dev'))

// Routes
const routes = require('./routes/auction.routes')

app.use(routes)

app.use((req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.render('pages/index', { url: req.url })
    }
})

app.listen(3000, () => {
    console.log(
        `${app.get('appName')} application running on port ${app.get('port')}`
    )
})
