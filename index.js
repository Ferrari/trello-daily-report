'use strict'

const _ = require('lodash')
const got = require('got')
const FormData = require('form-data')
const config = require('./auth.json')
const TRELLO = 'https://api.trello.com/1'
const SLACK_UPLOADFILE = 'https://slack.com/api/files.upload'

const ONEDAY = new Date(new Date().getTime() - 86400000)

function generateReport (data) {
  let report = {}

  data.forEach((action) => {
    if (_.has(action, 'data.card.name') && _.has(action, 'data.card.shortLink')) {
      let id = `${action.data.card.shortLink}:${action.data.card.name}`
      let message = (_.has(action, 'data.text'))
        ? `* ${action.type} - ${action.data.text}`
        : `* ${action.type}`

      if (!_.has(report, id)) {
        let data = []
        data.push(message)
        report[id] = data
      } else {
        let data = report[id]
        data.push(message)
        report[id] = data
      }
    }
  })

  return report
}

function parseReportToContent (report) {
  let content = []

  _.forEach(report, (val, key) => {
    let title = key.split(':')
    if (title.length === 2 && Array.isArray(val)) {
      content.push(`### [${title[1]}](https://trello.com/c/${title[0]})`)
      content = _.concat(content, val)
    } else {
      console.error(`ERROR report: ${key}`)
    }
  })

  return content.join('\n')
}

function submitReport (report) {
  const form = new FormData()
  form.append('content', report)
  form.append('filetype', 'post')
  form.append('filename', `${ONEDAY.getTime()}_Report.md`)
  form.append('title', `${ONEDAY} Report`)
  form.append('channels', config.SLACK.CHANNEL)
  form.append('token', config.SLACK.TOKEN)
  console.log(form)

  return got.post(SLACK_UPLOADFILE, {
    headers: form.getHeaders(),
    body: form,
    json: true
  })
}

got.get(`${TRELLO}/members/me/actions?key=${config.TRELLO.KEY}&token=${config.TRELLO.TOKEN}`, {
  json: true
}).then((resp) => {
  if (Array.isArray(resp.body)) {
    let dailyData = []
    for (let i in resp.body) {
      let item = resp.body[i]
      if (new Date(item.date) > ONEDAY) {
        dailyData.push(item)
      } else {
        break
      }
    }

    let report = generateReport(dailyData)
    let content = parseReportToContent(report)
    submitReport(content).then((resp) => {
      console.log(resp.body)
      console.log(`Create ${ONEDAY} Daily Report`)
    }).catch((err) => {
      console.error(err)
    })
  } else {
    console.error('Error Trello Format')
  }
}).catch((err) => {
  console.error(err)
})
