import { useEffect, useState } from "react";
import { ChatApp, Settings, Tree } from "@src/types";
import { chatAppList } from "@src/chatApps";
import { Header } from "./components/Header";
import { Body } from "./components/Body";
import { Footer } from "./components/Footer";

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

  return (
    <div className="h-full">
      <Header chatApp={chatApp} />
      <Body
        tree={savedData}
        setTree={setSavedData}
        settings={settings}
        chatApp={chatApp}
      />
      <Footer settings={settings} setSettings={setSettings} />
    </div>
  );
}
