let currentPrefs = {}

const saveToPreference = (id, value) => {
  let update = {}
  update[id] = value
  chrome.storage.local.set(update)
}

const handleVelueChange = id => {
  let elem = document.getElementById(id)
  if (elem) {
    let elemType = elem.getAttribute('type')
    if (elemType === 'radioGroup') {
      let radios = Array.from(elem.querySelectorAll('input[name='+id+']'))
      for (let radio of radios) {
        radio.addEventListener('input', event => {
          if (radio.checked) {
            saveToPreference(id, parseInt(radio.getAttribute('value')))
          }
        })
      }
    }
  }
}

const reIndex = (id) => {
  const list = document.querySelector(`#${id}.list`)
  let child = list.firstElementChild
  let index = 0
  while (child) {
    child.querySelector('.removeButton').setAttribute('index', index)
    index++
    child = child.nextSibling
  }
}

const addSite = (id, site, index) => {
  const div = document.createElement('div')
  div.classList.add('listItem')
  const text = document.createElement('div')
  const removeButton = document.createElement('div')
  removeButton.classList.add('removeButton')
  removeButton.setAttribute('index', index)
  removeButton.textContent = 'X'
  text.textContent = site
  div.appendChild(removeButton)
  div.appendChild(text)
  const list = document.querySelector(`#${id}.list`)
  list.appendChild(div)
  list.classList.remove('hide')
  removeButton.addEventListener('click', e => {
    const idx = parseInt(e.target.getAttribute('index'))
    const parentNode = e.target.parentNode
    parentNode.parentNode.removeChild(parentNode)
    reIndex(id)
    currentPrefs[id].splice(idx, 1)
    saveToPreference(id, currentPrefs[id])
    if (currentPrefs[id].length === 0 ) {
      list.classList.add('hide')
    }
  })
}

const setValueToElem = (id, value) => {
  let elem = document.getElementById(id)
  if (elem) {
    let elemType = elem.getAttribute('type')
    if (elemType === 'list') {
      for (const i in value) {
        const site = value[i]
        addSite(id, site, i)
      }
    } else if (elemType === 'radioGroup') {
      let radios = Array.from(elem.querySelectorAll('input[name='+id+']'))
      for (let radio of radios) {
        if (parseInt(radio.getAttribute('value')) === value) {
          radio.checked = true
          break
        }
      }
    }
  }
}

const init = preferences => {
  currentPrefs = preferences
  for (let p in preferences) {
    setValueToElem(p, preferences[p])
    handleVelueChange(p)
  }
  const l10nTags = document.querySelectorAll('[data-l10n-id]')
  for (const tag of l10nTags) {
    tag.textContent = chrome.i18n.getMessage(tag.getAttribute('data-l10n-id'))
  }

  const inputTags = document.querySelectorAll('input.site')
  for (const tag of inputTags) {
    tag.setAttribute('placeholder', chrome.i18n.getMessage('placeholder'))
  }

  const buttons = document.querySelectorAll('.button')
  for (const button of buttons) {
    button.addEventListener('click', e => {
      const pref = e.target.getAttribute('pref')
      const input = document.querySelector(`input[pref=${pref}]`)
      const site = input.value.trim()
      if (site !== '' && (site.startsWith('http://') || site.startsWith('https://'))) {
        input.value = ''
        const index = currentPrefs[pref].length
        addSite(pref, site, index)
        currentPrefs[pref].push(site)
        saveToPreference(pref, currentPrefs[pref])
      }
    })
  }
}

window.addEventListener('load', () => {
  chrome.storage.local.get(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0]
    }
    if (results.version) {
      init(results)
    }
  })
}, true)
