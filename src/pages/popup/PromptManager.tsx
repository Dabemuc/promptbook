import { ChatApp, Folder, Prompt, Settings, Tree } from "@src/types";
import {
  SimpleTreeItemWrapper,
  SortableTree,
  TreeItemComponentProps,
  TreeItem,
} from "dnd-kit-sortable-tree";
import React, { useRef, useState } from "react";
import { ContextMenu } from "radix-ui";
import { TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";

export default function PromptManager({
  tree,
  setTree,
  chatApp,
  settings,
}: {
  tree: Tree;
  setTree: (newTree: Tree) => void;
  chatApp: ChatApp | null;
  settings: Settings | null;
}) {
  const [editing, setEditing] = useState<TreeItem<Prompt | Folder> | undefined>(
    undefined,
  );

  const storeTree = (treeToStore: Tree) => {
    console.log("Persisting Tree", tree);
    chrome.storage.local.set({ savedPromptData: treeToStore });
  };

  const TreeItem = React.forwardRef<
    HTMLDivElement,
    TreeItemComponentProps<Prompt | Folder>
  >((props, ref) => {
    const pastePrompt = (text: string) => {
      if (!chatApp) {
        console.error("Failed to paste prompt. No chat app detected");
        return;
      }
      chatApp.paste_function(text, settings?.send_instantly.value ?? false);
    };

    const deletePrompt = (item: TreeItem<Prompt | Folder>) => {
      console.log("Deleting", item.id);
      //TODO: Add confirmation modal
      const newTree = [...tree];
      removeFromTree(item, newTree);
      storeTree(newTree);
      setTree(newTree);
    };

    const editPrompt = (item: TreeItem<Prompt | Folder>) => {
      console.log("Editing", item.id);
      setEditing(item);
    };

    console.log(props);

    return (
      <SimpleTreeItemWrapper {...props} ref={ref} showDragHandle={false}>
        <div className="w-full overflow-hidden">
          <span
            className="absolute inset-0 z-[-1]"
            style={
              props.item.type === "folder"
                ? { backgroundColor: props.item.color }
                : undefined
            }
          />
          <ContextMenu.Root>
            <ContextMenu.Trigger className="w-full cursor-grab">
              <div
                className="w-full p-2"
                title={
                  props.item.type === "prompt"
                    ? "Click to paste in chatbox"
                    : undefined
                }
                onClick={() => {
                  if (props.item.type === "prompt")
                    pastePrompt(props.item.text);
                }}
              >
                {props.item.type == "prompt"
                  ? props.item.title
                    ? props.item.title
                    : props.item.text.length <= 35
                      ? props.item.text
                      : props.item.text.substring(0, 32).concat("...")
                  : props.item.name}
              </div>
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
              <ContextMenu.Content className="p-1 border-gray-600 bg-white border-[1px] rounded-md flex justify-center">
                <ContextMenu.Item
                  className="p-2 cursor-pointer hover:bg-gray-300 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    editPrompt(props.item);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Pencil1Icon />
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="p-2 cursor-pointer hover:bg-gray-300 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePrompt(props.item);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <TrashIcon />
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Portal>
          </ContextMenu.Root>
        </div>
      </SimpleTreeItemWrapper>
    );
  });
  TreeItem.displayName = "TreeItem";

  const EditModal = ({ item }: { item: TreeItem<Folder | Prompt> }) => {
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
            <input
              type="color"
              defaultValue={item.color}
              ref={FolderColorRef}
            />
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

  return (
    <>
      {editing ? <EditModal item={editing!} /> : null}
      <div hidden={editing ? true : false}>
        <SortableTree
          items={tree}
          onItemsChanged={(newItems) => {
            console.log("itemsChanged Event", newItems);
            storeTree(newItems);
            setTree(newItems);
          }}
          TreeItemComponent={TreeItem}
        />
      </div>
    </>
  );
}

// Method to find and remove element from Tree utilizing breadth first search;
const removeFromTree = (
  itemToRemove: TreeItem<Folder | Prompt>,
  tree: Tree,
) => {
  const index = tree.findIndex((item) => {
    return item.id === itemToRemove.id;
  });

  if (index != -1) {
    // Item to remove has been found
    tree.splice(index, 1);
  } else {
    // Item not yet found. Need to go deeper
    tree.forEach((item) => {
      if (item.children && item.canHaveChildren) {
        removeFromTree(itemToRemove, item.children);
      }
    });
  }
};
