// service_worker.js
let activeTabId, lastUrl, lastTitle;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "captureScreen") {
        console.log(chrome)
        sendResponse({status: 'ok'})
    }
});


function getTabInfo(tabId) {
  chrome.tabs.get(tabId, function(tab) {
    if(lastUrl != tab.url || lastTitle != tab.title)
      console.log(lastUrl = tab.url, lastTitle = tab.title);
  });
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
  getTabInfo(activeTabId = activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(activeTabId == tabId) {
    getTabInfo(tabId);
  }
});