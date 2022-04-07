chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.closeThis) chrome.tabs.remove(sender.tab.id);
  console.log("The listener is listening ");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./content.js"]
        })
            .then(() => {
                console.log("The content script is injected.");
            })
            .catch(err => console.log(err));
    }
});




    


