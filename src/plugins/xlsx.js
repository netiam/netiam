import _ from 'lodash'
import XLSX from 'xlsx'

class Workbook {
  constructor(sheetNames = [], sheets = {}) {
    this.SheetNames = sheetNames
    this.Sheets = sheets
  }
}

function formatDate(value) {
  const epoch = Date.parse(value)
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)
}

function sheet(documents) {
  const ws = {}
  const cols = Object.keys(documents[0])
  const maxX = cols.length
  const maxY = documents.length
  const range = {
    s: {
      c: 10000000,
      r: 10000000
    },
    e: {
      c: 0,
      r: 0
    }
  }

  for (let y = 0; y < maxY; y += 1) {
    for (let x = 0; x < maxX; x += 1) {
      if (range.s.r > y) {
        range.s.r = y
      }
      if (range.s.c > x) {
        range.s.c = x
      }
      if (range.e.r < y) {
        range.e.r = y
      }
      if (range.e.c < x) {
        range.e.c = x
      }

      const document = documents[y]
      let cell = {v: null}

      if (document.hasOwnProperty(cols[x])) {
        cell = {v: document[cols[x]]}
      }

      if (!cell.v) {
        continue
      }

      const ref = XLSX.utils.encode_cell({
        c: x,
        r: y
      })

      if (_.isNumber(cell.v)) {
        cell.t = 'n'
      } else if (_.isBoolean(cell.v)) {
        cell.t = 'b'
      } else if (_.isDate(cell.v)) {
        cell.t = 'n'
        cell.z = XLSX.SSF._table[14]
        cell.v = formatDate(cell.v)
      } else if (_.isString(cell.v)) {
        cell.t = 's'
      } else {
        cell.t = 's'
        cell.v = JSON.stringify(cell.v)
      }

      ws[ref] = cell
    }
  }

  ws['!ref'] = XLSX.utils.encode_range(range)
  return ws
}

export default function xlsx(spec) {
  let {
    sheetName,
    fileName} = Object.assign({
    sheetName: 'Default',
    fileName: 'default.xlsx'
  }, spec)

  return function(req, res) {
    if (!res.body) {
      return res
        .status(204)
        .end()
    }

    if (!_.isArray(res.body)) {
      res.body = [res.body]
    }

    const wb = new Workbook(
      [sheetName],
      {[sheetName]: sheet(res.body)}
    )

    const xlsx = XLSX.write(wb, {
      type: 'buffer',
      bookSST: false,
      bookType: 'xlsx'
    })

    res
      .set('Content-Disposition', `attachment; filename="${fileName}"`)
      .set('Content-Type', 'application/octet-stream')
      .set('Content-Length', xlsx.length)
      .send(xlsx)
  }

}
