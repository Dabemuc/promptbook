import { Settings } from "@src/types";

type FooterProps = {
  settings: Settings | null;
  setSettings: (value: React.SetStateAction<Settings | null>) => void;
};

export const Footer = ({ settings, setSettings }: FooterProps) => {
  return (
    <div className="relative flex items-center w-full">
      <div className="p-2">
        <label className="flex items-center">
          <input
            className="mx-2"
            type="checkbox"
            title="Instantly send prompts"
            checked={settings?.send_instantly.value}
            onChange={() =>
              setSettings((prevSettings: Settings | null) => {
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
          {"Send prompts on click"}
        </label>
      </div>
      <span className="absolute left-1/2 transform -translate-x-1/2 p-2"></span>
      <div className="p-2 ml-auto"></div>
    </div>
  );
};
