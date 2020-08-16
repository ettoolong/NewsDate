const hostnameMapping = {
  'hk.appledaily.com': /^https:\/\/hk\.appledaily\.com\/.+\/(\d{8})\/.+/g,
  'technews.tw': /^https:\/\/technews\.tw\/(\d{4}\/\d{2}\/\d{2})\/.+/g,
  'ccc.technews.tw': /^https:\/\/ccc\.technews\.tw\/(\d{4}\/\d{2}\/\d{2})\/.+/g,
  'finance.technews.tw': /^https:\/\/finance\.technews\.tw\/(\d{4}\/\d{2}\/\d{2})\/.+/g,
  'www.washingtonpost.com': /^https:\/\/www\.washingtonpost\.com\/.+\/(\d{4}\/\d{2}\/\d{2})\/.+/g,
}

const metaTagSelectors = [
  'meta[name=pubdate][property="article:published_time"][content]',
  'meta[name=pubdate][content]',
  'meta[property=pubdate][content]',
  'meta[property="article:published_time"][content]',
  'meta[property="og:article:published_time"][content]',
  'meta[property=lastPublishedDate][content]',
  'meta[itemprop=datePublished][content]',
  'meta[name=pdate][content]',
  'meta[name="dcterms.created"][content]',
  'meta[name="date.available"][content]',
  'meta[name=date][content]'
]

const timeTagSelectors = [
  'time[itemprop=datePublished][datetime]',
  'time[itemprop=datePublished][date]',
  'time[datetime]',
  'time[date]'
]

const monthMapping = {
  'jan': '01',
  'feb': '02',
  'mar': '03',
  'apr': '04',
  'may': '05',
  'jun': '06',
  'jul': '07',
  'aug': '08',
  'sep': '09',
  'oct': '10',
  'nov': '11',
  'dec': '12',
}
const localDateRegex = /^[A-Za-z]{3} ([A-Za-z]{3} \d{2} \d{4}) \d{2}:\d{2}:\d{2}.+/i

function convertFromLocalDate(dateStr) {
  const m = localDateRegex.exec(dateStr)
  if (m.length === 2) {
    let tmp = (monthMapping[m[1].substr(0,3).toLowerCase()] + m[1].substr(3)).replace(/\s/g,'/')
    tmp = moment(tmp, 'MM/DD/YYYY').format('YYYY-MM-DD')
    if (tmp === 'Invalid date') {
      return dateStr
    } else {
      return tmp
    }
  } else {
    return dateStr
  }
}

function getDateFromUrl() {
  const hostname = document.location.hostname
  // console.log(hostname)
  const url = document.location.toString()
  const regex = hostnameMapping[hostname]
  if (regex) {
    const match = regex.exec(url)
    if (match && match.length === 2) return match[1]
  }
  return ''
}

function gitColor(dateStr) {
  const today = moment()
  const newsDate = moment(dateStr)
  const days = today.diff(newsDate, 'days')
  if (days <= 3 ) {
    return 'cr-green'
  } else if (days <= 7 ) {
    return 'cr-yellow'
  } else if (days <= 30 ) {
    return 'cr-orange'
  } else {
    return 'cr-red'
  }
}

function dateStrToDate(dateStr) {
  if (localDateRegex.test(dateStr)) {
    dateStr = convertFromLocalDate(dateStr)
  }
  try {
    if (dateStr.includes('/')) {
      if (dateStr.indexOf('/') === 4) { // YYYY/MM/DD
        dateStr = dateStr.replace(/\//g, '-')
      } if (dateStr.indexOf('/') === 2) { // DD/MM/YYYY
        dateStr = moment(dateStr, 'DD/MM/YYYY').format('YYYY-MM-DD');
      }
    }

    if (dateStr.includes('-')) {
      dateStr = dateStr.substr(0, 10) // YYYY-MM-DD
    } else {
      dateStr = dateStr.substr(0, 8) // YYYYMMDD
    }
    const res = moment(dateStr).format('YYYY-MM-DD');
    if (res === 'Invalid date') {
      return ''
    } else {
      return res
    }
  } catch (ex) {
    return ''
  }
}

function getDateNodeFromMetaTag() {
  for (const selector of metaTagSelectors) {
    dateNode = document.querySelector(selector)
    if (dateNode) {
      return dateNode
    }
  }
}

function getDateNodeFromTimeTag() {
  for (const selector of timeTagSelectors) {
    dateNode = document.querySelector(selector)
    if (dateNode) {
      return dateNode
    }
  }
}

function getDate() {
  let dateNode, dateStr;
  dateStr = getDateFromUrl()
  if (dateStr) return dateStrToDate(dateStr)

  dateNode = getDateNodeFromMetaTag()
  if (dateNode) {
    dateStr = dateNode.getAttribute('content')
    if (dateStr) return dateStrToDate(dateStr)
  }

  // fallback to time tag
  dateNode = getDateNodeFromTimeTag()
  if (dateNode) {
    dateStr = dateNode.getAttribute('datetime')
    if (!dateStr) dateStr = dateNode.getAttribute('date')
    if (dateStr) return dateStrToDate(dateStr)
  }

  // fallback to data-seconds attribute
  if (!dateNode) {
    dateNode = document.querySelector('[data-seconds][data-datetime]')
  }
  if (dateNode) {
    const dataSeconds = dateNode.getAttribute('data-seconds')
    dateStr = moment((new Date(dataSeconds * 1000))).format('YYYY-MM-DD');
    if (dateStr) return dateStrToDate(dateStr)
  }

  //fallback to published_time attribute
  if (!dateNode) {
    dateNode = document.querySelector('[title=發布時間]')
  }
  if (dateNode) {
    dateStr = dateNode.textContent
    if (dateStr) return dateStrToDate(dateStr)
  }

  return '';
}

const date = getDate()
if (date) {
  const div = document.createElement('div')
  div.classList.add('cr', 'cr-top', 'cr-right', gitColor(date))
  div.style.fontFamily = 'Arial !important'
  div.textContent = date
  document.body.appendChild(div)
  div.addEventListener('click', () => {
    document.body.removeChild(div)
  }, {once: true})
}
// console.log(date)
