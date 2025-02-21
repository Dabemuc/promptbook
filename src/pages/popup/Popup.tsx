import { useEffect, useState } from "react";

export default function Popup() {
  const [savedTexts, setSavedTexts] = useState<string[]>([]);

  useEffect(() => {
    // Load saved texts from storage
    chrome.storage.local.get({ savedTexts: [] }, (data) => {
      setSavedTexts(data.savedTexts);
    });
  }, []);

  const pasteText = (text: string) => {
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

  return (
    <div className="popup-container">
      <h2 className="title">Saved Texts</h2>
      <ul className="text-list">
        {savedTexts.length > 0 ? (
          savedTexts.map((text, index) => (
            <li
              key={index}
              className="text-item"
              onClick={() => pasteText(text)}
            >
              {text}
            </li>
          ))
        ) : (
          <p className="empty-message">No saved texts</p>
        )}
      </ul>
    </div>
  );
}
