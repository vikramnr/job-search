const express = require('express')
const axios = require('axios')
const expressip = require('express-ip')
const handlebars = require('express-handlebars')

const sanitizeJobs = require('./santize-job');
const app = express()
const PORT = process.env.PORT || 5000
const path = require('path')
var convert = require('xml-js')
let soJobs = []

app.engine('.hbs', handlebars({ extname: '.hbs' }))
app.set('PORT', PORT)

app.use(express.static(path.join(__dirname, 'assets')))
app.use(expressip().getIpInfoMiddleware)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', '.hbs')

app.get('/so', async (req, res) => {
  if (soJobs.length <= 0) {
    let response = await axios.get(`https://stackoverflow.com/jobs/feed`)
    var jsonC = convert.xml2js(response.data, { compact: true, spaces: 4 })
    soJobs.push(...jsonC.rss.channel.item)
  }

  let jobs = soJobs.slice(0, 9)
  jobs = sanitizeJobs(jobs)
  res.render('sosearch', {
    title: 'Search Jobs',
    jobs: jobs,
    layout: false,
  })
})

app.get('/', async (req, res) => {
  res.render('main', { title: 'Search Jobs', layout: false })
})

app.get('/search', async (req, res) => {
  let query = req.query
  let ipInfo = req.ipInfo
  let url = `https://indreed.herokuapp.com/api/jobs`
  if (ipInfo.country) {
    url = `https://indreed.herokuapp.com/api/jobs?country=${ipInfo.country}`
  }

  if (query) {
    try {
      let response = await axios.get(url, { params: query })
      let jobs = response.data
      res.render('search', {
        layout: false,
        jobs: jobs,
        title: 'Search Jobs',
        countryCode: ipInfo.countryCode,
      })
    } catch (e) {
      console.log(e, 'an error occured')
    }
  } else {
    res.render('search', {
      title: 'Search Jobs',
      countryCode: ipInfo.countryCode,
    })
  }
})

app.listen(app.get('PORT'), () => {
  console.log(`app started at`, PORT)
})
