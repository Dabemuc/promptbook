import { Folder, Prompt, Tree } from "@src/types";
import { TreeItem } from "dnd-kit-sortable-tree";
import { useRef } from "react";

export const EditModal = ({
  item,
  tree,
  setTree,
  storeTree,
  setEditing,
}: {
  item: TreeItem<Folder | Prompt>;
  tree: Tree;
  setTree: (newTree: Tree) => void;
  storeTree: (treeToStore: Tree) => void;
  setEditing: (itemToEdit: TreeItem<Prompt | Folder> | undefined) => void;
}) => {
  const PromptTextRef = useRef<HTMLTextAreaElement | null>(null);
  const PromptTitleRef = useRef<HTMLTextAreaElement | null>(null);
  const FolderNameRef = useRef<HTMLTextAreaElement | null>(null);
  const FolderColorRef = useRef<HTMLInputElement | null>(null);

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
    const indexOfItemToEdit = tree.findIndex(
      (treeItem) => treeItem.id === item.id,
    );
    const copyOfTree = [...tree];
    const itemToEdit = copyOfTree[indexOfItemToEdit];
    if (itemToEdit.type !== "prompt") {
      console.error(
        `Type of item in tree [${itemToEdit.type}] doesnt match type of editing [${item.type}]. This should not happen!!!`,
      );
      return;
    }
    itemToEdit.title = PromptTitleRef.current.value;
    itemToEdit.text = PromptTextRef.current.value;
    setTree(copyOfTree);

    storeTree(tree);
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
    const indexOfItemToEdit = tree.findIndex(
      (treeItem) => treeItem.id === item.id,
    );
    const copyOfTree = [...tree];
    const itemToEdit = copyOfTree[indexOfItemToEdit];
    if (itemToEdit.type !== "folder") {
      console.error(
        `Type of item in tree [${itemToEdit.type}] doesnt match type of editing [${item.type}]. This should not happen!!!`,
      );
      return;
    }
    itemToEdit.name = FolderNameRef.current.value;
    itemToEdit.color = FolderColorRef.current.value;
    setTree(copyOfTree);

    storeTree(tree);
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
          <input type="color" defaultValue={item.color} ref={FolderColorRef} />
          <div className="pt-1 px-1 w-full flex justify-between">
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
