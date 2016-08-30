'use strict'

const _ = require('lodash')
const got = require('got')
const config = require('./auth.json')
const TRELLO = 'https://api.trello.com/1'
const SLACK = 'https://slack.com/api/files,upload'

const TRELLO_BOARD = process.env.BOARD || config.TRELLO.BOARD
const ONEDAY  = new Date(new Date().getTime() - 86400000)

function generateReport(data) {
  let report = {}

  data.forEach((action) => {
    if (_.has(action, 'data.board.id') && _.has(action, 'data.card.id')) {
      let id = `${action.data.board.id}:${action.data.card.id}`
      let message = (_.has(action, 'data.text'))
        ? `${action.type} - ${action.data.text}`
        : `${action.type}`

      if (!_.has(report, id)) {
        let data = []
        data.push(message)
        console.log('add', data)
        report[id] = data
      } else {
        let data = report[id]
        data.push(message)
        report[id] = data
      }
    }
  })

  console.log(report)
  return report
}

function submitReport() {

}

got.get(`${TRELLO}/members/me/actions?key=${config.TRELLO.KEY}&token=${config.TRELLO.TOKEN}`, {
  json: true
}).then((resp) => {
  if (Array.isArray(resp.body)) {
    let dailyData = []
    for (let i in resp.body) {
      let item = resp.body[i]
      if (new Date(item.date) > ONEDAY) {
        console.log(item.data)
        dailyData.push(item)
      } else {
        break
      }
    }

    let content = generateReport(dailyData)
    // console.log(dailyData)
  } else {
    console.error('Error Trello Format')
  }
}).catch((err) => {
  console.error(err)
})
