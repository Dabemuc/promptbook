import { Folder, Prompt } from "@src/types";
import { TreeItem } from "dnd-kit-sortable-tree";
import { useEffect, useRef } from "react";
import { usePopupContext } from "../contexts/PopupContext";
import { storeSavedData } from "../lib/helpers";

export const EditModal = ({
  item,
  setEditing,
}: {
  item: TreeItem<Folder | Prompt>;
  setEditing: (itemToEdit: TreeItem<Prompt | Folder> | undefined) => void;
}) => {
  const { savedData, setSavedData } = usePopupContext();

  const PromptTextRef = useRef<HTMLTextAreaElement | null>(null);
  const PromptTitleRef = useRef<HTMLTextAreaElement | null>(null);
  const FolderNameRef = useRef<HTMLTextAreaElement | null>(null);
  const FolderColorRef = useRef<HTMLInputElement | null>(null);

  // Set cursor to last char in PromptTextRef
  useEffect(() => {
    if (PromptTextRef.current) {
      PromptTextRef.current.focus();
      PromptTextRef.current.setSelectionRange(
        PromptTextRef.current.value.length,
        PromptTextRef.current.value.length,
      );
    }
  }, [PromptTextRef]);

  const handleSavePrompt = () => {
    console.log("Saving", item.type, item.id);
    if (!PromptTextRef.current || !PromptTitleRef.current) {
      console.error(
        "Prompt title or text textarea ref.current is not defined. This should not happen!!!",
        {
          PromptTitleRef: PromptTitleRef.current,
          PromptTextRef: PromptTextRef.current,
        },
      );
      return;
    }
    console.log("Edited values:", {
      title: PromptTitleRef.current.value,
      text: PromptTextRef.current.value,
    });
    const indexOfItemToEdit = savedData.findIndex(
      (treeItem) => treeItem.id === item.id,
    );
    const copyOfTree = [...savedData];
    const itemToEdit = copyOfTree[indexOfItemToEdit];
    if (itemToEdit.type !== "prompt") {
      console.error(
        `Type of item in tree [${itemToEdit.type}] doesnt match type of editing [${item.type}]. This should not happen!!!`,
      );
      return;
    }
    itemToEdit.title = PromptTitleRef.current.value;
    itemToEdit.text = PromptTextRef.current.value;
    setSavedData(copyOfTree);

    storeSavedData(copyOfTree);
    setEditing(undefined);
  };

  const handleSaveFolder = () => {
    console.log("Saving", item.type, item.id);
    if (item.type !== "folder") {
      console.error(
        "handleSaveFolder function called on non-folder item. This should not happen!!!",
      );
      return;
    }
    if (!FolderNameRef.current || !FolderColorRef.current) {
      console.error(
        "Folder name textare or color input ref.current is not defined. This should not happen!!!",
        {
          FolderNameRef: FolderNameRef.current,
          FolderColorRef: FolderColorRef.current,
        },
      );
      return;
    }
    console.log("Edited values:", {
      name: FolderNameRef.current.value,
      color: FolderColorRef.current.value,
    });
    const indexOfItemToEdit = savedData.findIndex(
      (treeItem) => treeItem.id === item.id,
    );
    const copyOfTree = [...savedData];
    const itemToEdit = copyOfTree[indexOfItemToEdit];
    if (itemToEdit.type !== "folder") {
      console.error(
        `Type of item in tree [${itemToEdit.type}] doesnt match type of editing [${item.type}]. This should not happen!!!`,
      );
      return;
    }
    itemToEdit.name = FolderNameRef.current.value;
    itemToEdit.color = FolderColorRef.current.value;
    setSavedData(copyOfTree);

    storeSavedData(copyOfTree);
    setEditing(undefined);
  };

  const handleCancel = () => {
    console.log("Canceling edit of", item.id);
    setEditing(undefined);
  };

  return (
    <div className="p-2 size-full z-10 border-gray-600 bg-white border-[1px] rounded-md flex justify-center">
      {item.type === "prompt" ? (
        <div className="flex flex-col size-full">
          <textarea
            defaultValue={item.title ?? undefined}
            placeholder="Title ..."
            maxLength={30}
            ref={PromptTitleRef}
            className="p-1 mb-1 w-full border-gray-600 border-[1px] rounded-md resize-none"
          />
          <textarea
            defaultValue={item.text}
            placeholder="Prompt ..."
            autoFocus
            ref={PromptTextRef}
            className="p-1 size-full border-gray-600 border-[1px] rounded-md resize-none"
          />
          <div className="pt-1 px-1 w-full flex justify-between">
            <button
              className="px-2 py-1 bg-green-100 rounded-md cursor-pointer"
              onClick={handleSavePrompt}
            >
              Save
            </button>
            <button
              className="px-2 py-1 bg-red-100 rounded-md cursor-pointer"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col size-full">
          <textarea
            defaultValue={item.name ?? undefined}
            placeholder="Name ..."
            maxLength={30}
            ref={FolderNameRef}
            className="p-1 mb-1 w-full border-gray-600 border-[1px] rounded-md resize-none"
          />
          <label className="flex items-center mt-2">
            {"Color: "}
            <input
              type="color"
              defaultValue={item.color}
              ref={FolderColorRef}
              className="ml-3"
            />
          </label>
          <div className="pt-1 px-1 mt-auto w-full flex justify-between">
            <button
              className="px-2 py-1 bg-green-100 rounded-md cursor-pointer"
              onClick={handleSaveFolder}
            >
              Save
            </button>
            <button
              className="px-2 py-1 bg-red-100 rounded-md cursor-pointer"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
