import { ChatApp, Settings, Tree } from "@src/types";
import { createContext, useContext, useEffect, useState } from "react";
import { identifyChatApp, loadSavedData, loadSettings } from "../lib/helpers";

type PopupContextType = {
  savedData: Tree;
  setSavedData: React.Dispatch<React.SetStateAction<Tree>>;
  chatApp: ChatApp | undefined;
  setChatApp: React.Dispatch<React.SetStateAction<ChatApp | undefined>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
};

const defaultContext: PopupContextType = {
  savedData: [],
  setSavedData: () => {},
  chatApp: undefined,
  setChatApp: () => {},
  settings: {
    send_instantly: {
      label: "Instantly send prompts",
      value: false,
    },
  },
  setSettings: () => {},
};

const PopupContext = createContext<PopupContextType>(defaultContext);

export const usePopupContext = () => {
  return useContext(PopupContext);
};

export const PopupContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [savedData, setSavedData] = useState<Tree>(defaultContext.savedData);
  const [chatApp, setChatApp] = useState<ChatApp | undefined>(
    defaultContext.chatApp,
  );
  const [settings, setSettings] = useState<Settings>(defaultContext.settings);

  useEffect(() => {
    const init = async () => {
      let loadedSavedData = await loadSavedData();
      let loadedSettings = await loadSettings();
      const identifiedChatApp = await identifyChatApp();

      // validate settings and data
      if (!loadedSavedData || loadedSavedData.length === 0) {
        loadedSavedData = defaultContext.savedData;
      }
      if (!loadedSettings || Object.keys(loadedSettings).length === 0) {
        loadedSettings = defaultContext.settings;
      }

      // Set state
      setSavedData(loadedSavedData);
      setSettings(loadedSettings);
      setChatApp(identifiedChatApp);

      console.log("Context updated:", {
        loadedSavedData,
        loadedSettings,
        identifiedChatApp,
      });
    };

    init();
  }, []);

  return (
    <PopupContext.Provider
      value={{
        savedData,
        setSavedData,
        chatApp,
        setChatApp,
        settings,
        setSettings,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};
