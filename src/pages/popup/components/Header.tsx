import { SearchBar } from "./SearchBar";
import { usePopupContext } from "../contexts/PopupContext";

export const Header = () => {
  const { chatApp, searching } = usePopupContext();

  return (
    <div className="relative flex items-center w-full">
      <div className="p-2">
        {chatApp ? (
          <img
            className="size-5 min-h-5 min-w-5"
            src={chatApp.icon_svg_data_uri}
            title={chatApp.name + " identified"}
          />
        ) : (
          "N/A"
        )}
      </div>
      {!searching ? (
        <span className="absolute left-1/2 transform -translate-x-1/2 font-bold p-2">
          PromptBook
        </span>
      ) : null}
      <div className="p-2 w-full">
        <SearchBar />
      </div>
    </div>
  );
};
