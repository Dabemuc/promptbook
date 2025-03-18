import { ChatApp, Settings, Tree } from "@src/types";
import { createContext, useContext, useEffect, useState } from "react";
import { identifyChatApp, loadSavedData, loadSettings } from "../lib/helpers";

type PopupContextType = {
  savedData: Tree;
  setSavedData: React.Dispatch<React.SetStateAction<Tree>>;
  chatApp: ChatApp | undefined;
  setChatApp: React.Dispatch<React.SetStateAction<ChatApp | undefined>>;
  settings: Settings | undefined;
  setSettings: React.Dispatch<React.SetStateAction<Settings | undefined>>;
};

const PopupContext = createContext<PopupContextType>({
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
});

export const usePopupContext = () => {
  return useContext(PopupContext);
};

export const PopupContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [savedData, setSavedData] = useState<Tree>([]);
  const [chatApp, setChatApp] = useState<ChatApp | undefined>();
  const [settings, setSettings] = useState<Settings | undefined>();

  useEffect(() => {
    loadSavedData(setSavedData);
    identifyChatApp(setChatApp);
    loadSettings(setSettings);
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
