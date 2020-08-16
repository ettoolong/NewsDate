let defaultPreference = {
  excludeSites: [],
  version: 1
};
let preferences = {};

const storageChangeHandler = (changes, area) => {
  if(area === 'local') {
    let changedItems = Object.keys(changes);
    for (let item of changedItems) {
      preferences[item] = changes[item].newValue;
    }
  }
};

const loadPreference = () => {
  chrome.storage.local.get(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    if (!results.version) {
      preferences = defaultPreference;
      chrome.storage.local.set(defaultPreference, res => {
        chrome.storage.onChanged.addListener(storageChangeHandler);
      });
    } else {
      preferences = results;
      chrome.storage.onChanged.addListener(storageChangeHandler);
    }
    if (preferences.version !== defaultPreference.version) {
      let update = {};
      let needUpdate = false;
      for(let p in defaultPreference) {
        if(preferences[p] === undefined) {
          update[p] = defaultPreference[p];
          needUpdate = true;
        }
      }
      if(needUpdate) {
        chrome.storage.local.set(update);
      }
    }
  });
};

window.addEventListener('DOMContentLoaded', event => {
  loadPreference();
});
