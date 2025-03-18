import { SearchBar } from "./SearchBar";
import { usePopupContext } from "../contexts/PopupContext";

export const Header = () => {
  const { chatApp } = usePopupContext();

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
      <div className="p-2 ml-auto">
        <SearchBar />
      </div>
    </div>
  );
};
