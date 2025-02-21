import { useEffect, useState } from "react";
import { isPrompt, Prompt } from "@src/types";

export default function Popup() {
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    loadSavedPrompts();
  }, []);

  const loadSavedPrompts = () => {
    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
      // Parse and verify data
      const parsedData: Prompt[] = data.savedPrompts
        .map((elem: string) => {
          try {
            const parsedElem = JSON.parse(elem);
            if (isPrompt(parsedElem)) return parsedElem;
          } catch (error) {
            console.error("Error loading prompt:", elem, error);
          }
          return null;
        })
        .filter((elem: Prompt): elem is Prompt => elem !== null); // filter non-valid entries
      // Set valid prompts
      setSavedPrompts(parsedData);
      console.log("Read prompts from localStore:", parsedData);
    });
  };

  const pastePrompt = (text: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (pastedText) => {
            const activeElement = document.activeElement as
              | HTMLInputElement
              | HTMLTextAreaElement
              | null;
            if (
              activeElement &&
              (activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA")
            ) {
              activeElement.value += pastedText;
            }
          },
          args: [text],
        });
      }
    });
  };

  const deletePrompt = (id: string) => {
    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
      const indexToRemove = data.savedPrompts.findIndex((s: string) => {
        return JSON.parse(s).id === id;
      });
      if (indexToRemove === -1) {
        console.error(
          "Failed to delete prompt. Prompt with id " + id + " not found",
        );
        return;
      }
      data.savedPrompts.splice(indexToRemove, 1);
      chrome.storage.local.set({ savedPrompts: data.savedPrompts });
      console.log("Successfully deleted prompt with id " + id);
      loadSavedPrompts();
    });
  };

  const promptWrapper = (prompt: Prompt) => {
    return (
      <li
        key={prompt.id}
        className="flex justify-evenly"
        onClick={() => pastePrompt(prompt.text)}
      >
        <div>{prompt.text}</div>
        <button onClick={() => deletePrompt(prompt.id)}>X</button>
      </li>
    );
  };

  const Header = () => {
    return (
      <div className="relative flex items-center w-full">
        <div className="p-2">ChatLogo</div>
        <span className="absolute left-1/2 transform -translate-x-1/2 font-bold p-2">
          PromptBook
        </span>
        <div className="p-2 ml-auto">Login</div>
      </div>
    );
  };

  const Body = () => {
    return (
      <div className="h-full p-2 overflow-x-hidden overflow-y-auto">
        <ul>
          {savedPrompts.length > 0 ? (
            savedPrompts.map((prompt) => promptWrapper(prompt))
          ) : (
            <p>No saved texts</p>
          )}
        </ul>
      </div>
    );
  };

  const Footer = () => {
    return (
      <div className="relative flex items-center w-full">
        <div className="p-2"></div>
        <span className="absolute left-1/2 transform -translate-x-1/2 p-2">
          Footer
        </span>
        <div className="p-2 ml-auto"></div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}
