import { MagnifyingGlassIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { usePopupContext } from "../contexts/PopupContext";

export const SearchBar = () => {
  const { searchString, setSearchString, searching, setSearching } =
    usePopupContext();

  const handleStartSearch = () => {
    setSearching(true);
  };

  const handleStopSearch = () => {
    setSearching(false);
    setSearchString("");
  };

  return (
    <div className="w-full flex justify-end">
      {searching ? (
        <div className="relative w-full">
          <input
            type="text"
            autoFocus
            className="w-full p-1 border rounded-md border-gray-600"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
          <CrossCircledIcon
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={handleStopSearch}
          />
        </div>
      ) : (
        <MagnifyingGlassIcon
          className="cursor-pointer"
          onClick={handleStartSearch}
        />
      )}
    </div>
  );
};
