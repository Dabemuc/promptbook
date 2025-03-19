import { chatAppList } from "@src/chatApps";
import { ChatApp, Settings, Tree } from "@src/types";

export const loadSavedData = (): Promise<Tree> => {
  return new Promise((resolve) => {
    chrome.storage.local.get({ savedPromptData: [] }, (data) => {
      console.log("Read data from localStore:", data.savedPromptData);
      resolve(data.savedPromptData);
    });
  });
};

export const storeSavedData = (dataToStore: Tree) => {
  console.log("Persisting Data", dataToStore);
  chrome.storage.local.set({ savedPromptData: dataToStore });
};

export const identifyChatApp = (): Promise<ChatApp | undefined> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        const foundApp = chatAppList.find((cA) =>
          tabs[0].url?.includes(cA.url),
        );
        if (foundApp) {
          console.log("Identified Chat App:", foundApp.name);
          resolve(foundApp);
          return;
        }
      }
      console.log("No Chat App detected!");
      resolve(undefined);
    });
  });
};

export const loadSettings = (): Promise<Settings> => {
  return new Promise((resolve) => {
    chrome.storage.local.get({ savedSettings: {} }, (data) => {
      console.log("Read settings from localStore:", data.savedSettings);
      resolve(data.savedSettings);
    });
  });
};

export const storeSettings = (settingsToStore: Settings) => {
  console.log("Persisting Settings", settingsToStore);
  chrome.storage.local.set({ savedSettings: settingsToStore });
};
