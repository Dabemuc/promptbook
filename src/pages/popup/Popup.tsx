import { useEffect, useState } from "react";
import { ChatApp, Settings, Tree } from "@src/types";
import { chatAppList } from "@src/chatApps";
import PromptManager from "./PromptManager";

export default function Popup() {
  const [savedData, setSavedData] = useState<Tree>([]);
  const [chatApp, setChatApp] = useState<ChatApp | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSavedData();
    identifyChatApp();
    loadSettings();
  }, []);

  const loadSavedData = () => {
    chrome.storage.local.get({ savedPromptData: [] }, (data) => {
      // Parse and verify data
      console.log(data);
      const parsedData: Tree = data.savedPromptData;
      if (parsedData.length == 0) {
        setSavedData([
          {
            type: "prompt",
            id: "1111",
            text: "This is a test prompt 123",
            canHaveChildren: false,
          },
          {
            type: "folder",
            id: "2222",
            color: "#123456",
            name: "TestFolder1",
            collapsed: true,
            canHaveChildren: true,
            children: [
              {
                type: "prompt",
                id: "3333",
                text: "This is second test prompt 456",
                canHaveChildren: false,
              },
              {
                type: "prompt",
                id: "4444",
                text: "And third test prompt 789",
                canHaveChildren: false,
              },
            ],
          },
        ]);
        console.log("LocalStore empty. Using test data");
      } else {
        setSavedData(parsedData);
        console.log("Read data from localStore:", parsedData);
      }
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
          tree={savedData}
          setTree={setSavedData}
          chatApp={chatApp}
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
