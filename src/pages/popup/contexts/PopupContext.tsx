import { ChatApp, Settings, Tree } from "@src/types";
import { createContext, useContext, useEffect, useState } from "react";
import {
  identifyChatApp,
  loadSavedData,
  loadSettings,
  storeSettings,
} from "../lib/helpers";

type PopupContextType = {
  savedData: Tree;
  setSavedData: React.Dispatch<React.SetStateAction<Tree>>;
  chatApp: ChatApp | undefined;
  setChatApp: React.Dispatch<React.SetStateAction<ChatApp | undefined>>;
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  searching: boolean;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
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
  updateSettings: () => {},
  searchString: "",
  setSearchString: () => {},
  searching: false,
  setSearching: () => {},
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
  const [searchString, setSearchString] = useState<string>(
    defaultContext.searchString,
  );
  const [searching, setSearching] = useState(false);

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

  const updateSettings = (newSettings: Settings) => {
    storeSettings(newSettings);
    setSettings(newSettings);
  };

  return (
    <PopupContext.Provider
      value={{
        savedData,
        setSavedData,
        chatApp,
        setChatApp,
        settings,
        updateSettings,
        searchString,
        setSearchString,
        searching,
        setSearching,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};
