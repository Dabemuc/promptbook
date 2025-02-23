import { useEffect, useState } from "react";
import { ChatApp, Folder, Prompt, Settings } from "@src/types";
import { chatAppList } from "@src/chatApps";
import PromptManager from "./PromptManager";

export default function Popup() {
  const [savedPrompts, setSavedPrompts] = useState<(Prompt | Folder)[]>([]);
  const [chatApp, setChatApp] = useState<ChatApp | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSavedPrompts();
    identifyChatApp();
    loadSettings();
  }, []);

  const loadSavedPrompts = () => {
    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
      // Parse and verify data
      console.log(data);
      const parsedData: Prompt[] = data.savedPrompts
        .map((elem: string) => {
          try {
            const parsedElem: Prompt = JSON.parse(elem);
            if (parsedElem.type === "prompt") return parsedElem;
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

  const identifyChatApp = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chatAppList.forEach((cA) => {
          if (tabs[0].url?.includes(cA.url)) {
            setChatApp(cA);
            return;
          }
        });
      }
    });
  };

  const loadSettings = () => {
    // TOOD: Really load settings
    // Create object here for now
    const settings: Settings = {
      send_instantly: {
        label: "Instantly send prompts",
        value: false,
      },
    };
    setSettings(settings);
  };

  const Header = () => {
    return (
      <div className="relative flex items-center w-full">
        <div className="p-2">
          {chatApp ? (
            <img
              className="h-5 w-5"
              src={chatApp.icon_svg_data_uri}
              title={chatApp.name + " identified"}
            />
          ) : (
            "N/A"
          )}
        </div>
        <span className="absolute left-1/2 transform -translate-x-1/2 font-bold p-2">
          PromptBook
        </span>
        <div className="p-2 ml-auto">Login</div>
      </div>
    );
  };

  const Body = () => {
    return (
      <div className="h-full p-2 px-4 overflow-x-hidden overflow-y-auto">
        <PromptManager
          items={savedPrompts}
          setItems={setSavedPrompts}
          chatApp={chatApp}
          loadSavedPrompts={loadSavedPrompts}
          settings={settings}
        />
      </div>
    );
  };

  const Footer = () => {
    return (
      <div className="relative flex items-center w-full">
        <div className="p-2">
          <input
            type="checkbox"
            title="Instantly send prompts"
            checked={settings?.send_instantly.value}
            onChange={() =>
              setSettings((prevSettings) => {
                if (prevSettings) {
                  return {
                    ...prevSettings,
                    send_instantly: {
                      ...prevSettings.send_instantly,
                      value: !prevSettings.send_instantly.value,
                      label: prevSettings.send_instantly.label,
                    },
                  };
                }
                return prevSettings;
              })
            }
          />
        </div>
        <span className="absolute left-1/2 transform -translate-x-1/2 p-2"></span>
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
