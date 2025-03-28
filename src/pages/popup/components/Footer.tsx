import { Settings } from "@src/types";
import { usePopupContext } from "../contexts/PopupContext";

export const Footer = () => {
  const { settings, updateSettings } = usePopupContext();

  return (
    <div className="relative flex items-center w-full">
      <div className="p-2">
        <label className="flex items-center">
          <input
            className="mx-2"
            type="checkbox"
            title="Instantly send prompts"
            checked={settings?.send_instantly.value}
            onChange={() => {
              if (settings) {
                const newSettings: Settings = {
                  ...settings,
                  send_instantly: {
                    ...settings.send_instantly,
                    value: !settings.send_instantly.value,
                  },
                };
                updateSettings(newSettings);
              }
            }}
          />
          {"Send prompts on click"}
        </label>
      </div>
      <span className="absolute left-1/2 transform -translate-x-1/2 p-2"></span>
      <div className="p-2 ml-auto"></div>
    </div>
  );
};
