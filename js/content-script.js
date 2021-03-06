let currentPrefs = {}

const hostnameMapping = {
  'tw.appledaily.com': /^https:\/\/tw\.appledaily\.com\/.+\/(\d{8})\/.+/g,
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
  'meta[name="iso-8601-publish-date"][content]',
  'meta[property="aja:published_data"][content]',
  'meta[name=pdate][content]',
  'meta[name="dcterms.created"][content]',
  'meta[name="date.available"][content]',
  'meta[name=date][content]',
  'meta[name="cXenseParse:recs:publishtime"][content]',
  'meta[name=firstcreate][content]',
  'meta[name="blaize:publicationDate"][content]'
]

const timeTagSelectors = [
  'time[itemprop=datePublished][datetime]',
  'time[itemprop=datePublished][date]',
  'time[datetime]',
  'time[date]',
  'time.articleDetail-header__date'
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
  'january': '01',
  'february': '02',
  'march': '03',
  'april': '04',
  'june': '06',
  'july': '07',
  'august': '08',
  'september': '09',
  'october': '10',
  'november': '11',
  'december': '12',
}
const dateRegex = /^(\d{4}\/\d{1,2}\/\d{1,2}).*/g
const localDateRegex = /^(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)?(?: |,)? ?((?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)(?: |\/|,|-)\d{1,2}(?: |\/|,|-)\d{4}).*/i
const localDateRegex2 = /^(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)?(?: |,)? ?(\d{1,2}(?: |\/|,|-)(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)(?: |\/|,|-)\d{4}).*/i

function convertFromLocalDate(dateStr) {
  const format = localDateRegex.test(dateStr) ? 1 : 2
  const m = format === 1 ? localDateRegex.exec(dateStr) : localDateRegex2.exec(dateStr)
  if (m.length === 2) {
    const s = m[1].replace(/( |\/|,|-)/g,' ').split(' ')
    let tmp = format === 1 ? `${s[2]}-${monthMapping[s[0]]}-${s[1].padStart(2,'0')}` : `${s[2]}-${monthMapping[s[1]]}-${s[0].padStart(2,'0')}`
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
        const m = dateRegex.exec(dateStr)
        if (m.length === 2) dateStr = m[1]
        dateStr = dateStr.replace(/\//g, '-')
      } if (dateStr.indexOf('/') === 2) { // DD/MM/YYYY
        dateStr = moment(dateStr, 'DD/MM/YYYY').format('YYYY-MM-DD')
      }
    }

    if (dateStr.includes('-')) {
      dateStr = dateStr.substr(0, 10) // YYYY-MM-DD
    } else {
      dateStr = dateStr.substr(0, 8) // YYYYMMDD
    }
    const res = moment(dateStr).format('YYYY-MM-DD')
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
  let dateNode
  let dateStr
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
    if (!dateStr) dateStr = dateNode.textContent.trim()
    console.log(dateStr)
    if (dateStr) return dateStrToDate(dateStr)
  }

  // fallback to data-seconds attribute
  if (!dateNode) {
    dateNode = document.querySelector('[data-seconds][data-datetime]')
  }
  if (dateNode) {
    const dataSeconds = dateNode.getAttribute('data-seconds')
    dateStr = moment((new Date(dataSeconds * 1000))).format('YYYY-MM-DD')
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

  return ''
}

const matching = (filter, url) => {
  if (filter.includes('*')) {
    const p = filter.replace(/(\W)/ig, '\\$1').replace(/\\\*/ig, '*').replace(/\*/ig, '.*')
    const re = new RegExp('^' + p + '$', 'ig')
    if (url.match(re) !== null) {
      return true
    }
  } else if (url === filter) {
    return true
  }
  return false
}

const urlFilter = url => {
  if (currentPrefs.filtering === 0) {
    //Detect date on every site and exclude specific websites
    if (currentPrefs.excludeSites) {
      for (let filter of currentPrefs.excludeSites) {
        if (matching(filter, url)) return true
      }
    }
    return false
  } else {
    //Only detect date on allowed websites
    if (currentPrefs.allowSites) {
      for (let filter of currentPrefs.allowSites) {
        if (matching(filter, url)) return false
      }
    }
    return true
  }
}

const init = preferences => {
  currentPrefs = preferences
  if (urlFilter(document.location.toString())) return
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
}

chrome.storage.local.get(results => {
  if ((typeof results.length === 'number') && (results.length > 0)) {
    results = results[0]
  }
  if (results.version) {
    init(results)
  }
})
