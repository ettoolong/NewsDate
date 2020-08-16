let currentPrefs = {};

const saveToPreference = (id, value) => {
  let update = {};
  update[id] = value;
  chrome.storage.local.set(update);
};

const reIndex = () => {
  const list = document.querySelector('.list')
  let child = list.firstElementChild
  let index = 0
  while (child) {
    child.querySelector('.removeButton').setAttribute('index', index)
    index++
    child = child.nextSibling
  }
}

const addSite = (site, index) => {
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
  const list = document.querySelector('.list')
  list.appendChild(div)
  list.classList.remove('hide')
  removeButton.addEventListener('click', e => {
    const idx = parseInt(e.target.getAttribute('index'))
    const parentNode = e.target.parentNode
    parentNode.parentNode.removeChild(parentNode)
    reIndex()
    currentPrefs.excludeSites.splice(idx, 1)
    saveToPreference('excludeSites', currentPrefs.excludeSites);
    if (currentPrefs.excludeSites.length === 0 ) {
      list.classList.add('hide')
    }
  })
}

const setValueToElem = (id, value) => {
  let elem = document.getElementById(id);
  if(elem) {
    let elemType = elem.getAttribute('type');
    if(elemType === 'list') {
      for (const i in value) {
        const site = value[i]
        addSite(site, i)
      }
    }
  }
};

const init = preferences => {
  currentPrefs = preferences;
  for(let p in preferences) {
    setValueToElem(p, preferences[p]);
  }
  let l10nTags = Array.from(document.querySelectorAll('[data-l10n-id]'));
  l10nTags.forEach(tag => {
    tag.textContent = chrome.i18n.getMessage(tag.getAttribute('data-l10n-id'));
  });
  document.querySelector('.site').setAttribute('placeholder', chrome.i18n.getMessage('placeholder'))
  const input = document.querySelector('.site')
  document.querySelector('.button').addEventListener('click', () => {
    const site = input.value.trim()
    if (site !== '' && (site.startsWith('http://') || site.startsWith('https://'))) {
      input.value = ''
      const index = currentPrefs.excludeSites.length
      addSite(site, index)
      currentPrefs.excludeSites.push(site)
      saveToPreference('excludeSites', currentPrefs.excludeSites);
    }
  })
};

window.addEventListener('load', event => {
  chrome.storage.local.get(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    if (results.version) {
      init(results);
    }
  });
}, true);
