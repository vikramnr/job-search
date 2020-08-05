const sanitizeHtml = require('sanitize-html')

const jobsSantize = (jobs) => {
  return jobs.map(job => {
    return {
      title: sanitizeHtml(job.title._text, {
        allowedTags: [],
        allowedAttributes: {},
      }),
      description:
        sanitizeHtml(job.description._text, {
          allowedTags: [],
          allowedAttributes: {},
        }).slice(0, 100) + ' ...',
      link: sanitizeHtml(job.link._text, {
        allowedTags: [],
        allowedAttributes: {},
      }),
    }
  })
}

module.exports = jobsSantize
