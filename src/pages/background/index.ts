import { Prompt } from "@src/types";
import { v4 as uuidv4 } from "uuid";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "savePromptToPromptbook",
    title: "Save Selection To Promptbook",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "savePromptToPromptbook") {
    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
      const newPrompt: Prompt = {
        id: uuidv4(),
        text: info.selectionText!,
      };
      const updatedPrompts = [...data.savedPrompts, JSON.stringify(newPrompt)];
      chrome.storage.local.set({ savedPrompts: updatedPrompts });
    });
  }
});
