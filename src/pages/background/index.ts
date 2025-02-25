import { Prompt } from "@src/types";
import { v4 as uuidv4 } from "uuid";

import { TreeItem } from "dnd-kit-sortable-tree";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "savePromptToPromptbook",
    title: "Save Selection To Promptbook",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "savePromptToPromptbook") {
    chrome.storage.local.get({ savedPromptData: [] }, (data) => {
      const newPrompt: TreeItem<Prompt> = {
        type: "prompt",
        id: uuidv4(),
        text: info.selectionText!,
        canHaveChildren: false,
      };
      const updatedData = [...data.savedPromptData, newPrompt];
      chrome.storage.local.set({ savedPromptData: updatedData });
    });
  }
});
