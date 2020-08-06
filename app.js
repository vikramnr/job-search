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
let current = 0

app.engine('.hbs', handlebars({ extname: '.hbs' }))
app.set('PORT', PORT)

app.use(express.static(path.join(__dirname, 'assets')))
app.use(expressip().getIpInfoMiddleware)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', '.hbs')

app.get('/so', async (req, res) => {
  if (soJobs.length <= 0) {
    let response = await axios.get(`https://stackoverflow.com/jobs/feed`)
    let jsonC = convert.xml2js(response.data, { compact: true, spaces: 4 })
    let jobs = sanitizeJobs(jsonC.rss.channel.item)
    soJobs.push(...jobs)
  }

  let jobs = soJobs.slice(0, 6)
  res.render('sosearch', {
    title: 'Search Jobs',
    current:0,
    jobs: jobs,
    layout: false,
  })
})

app.get('/so/next/:id',(req,res) => {
  let currentPage = parseInt(req.params.id+1)*6
  current = parseInt(req.params.id)+1
  let jobs = soJobs.slice(currentPage,currentPage+6)
  res.render('sosearch', {
    title: 'search Jobs',
    jobs: jobs,
    current: current,
    layout: false
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
      console.log(query)
      console.log(jobs)
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
