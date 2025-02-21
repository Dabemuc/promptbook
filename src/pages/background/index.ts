console.log("background script loaded");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveSelectedText",
    title: "Save Selected Text",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "saveSelectedText") {
    chrome.storage.local.get({ savedTexts: [] }, (data) => {
      const updatedTexts = [...data.savedTexts, info.selectionText];
      chrome.storage.local.set({ savedTexts: updatedTexts });
    });
  }
});
