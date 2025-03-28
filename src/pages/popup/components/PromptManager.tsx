import { Folder, Prompt, Tree } from "@src/types";
import {
  SimpleTreeItemWrapper,
  SortableTree,
  TreeItemComponentProps,
  TreeItem,
} from "dnd-kit-sortable-tree";
import React, { useState } from "react";
import { ContextMenu } from "radix-ui";
import { TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { EditModal } from "./EditModal";
import { useDeleteModal } from "./DeleteModal";
import { usePopupContext } from "../contexts/PopupContext";
import { storeSavedData } from "../lib/helpers";
import { filterDataForSearch } from "../lib/filterSearch";

export default function PromptManager() {
  const {
    savedData,
    setSavedData,
    chatApp,
    settings,
    searching,
    searchString,
  } = usePopupContext();
  const [editing, setEditing] = useState<TreeItem<Prompt | Folder> | undefined>(
    undefined,
  );
  const { DeleteModalComponent, openModal } = useDeleteModal();

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

    const deletePrompt = async (item: TreeItem<Prompt | Folder>) => {
      console.log("Deleting", item.id);
      const confirm: boolean = await openModal();
      if (confirm) {
        const newData = [...savedData];
        removeFromTree(item, newData);
        storeSavedData(newData);
        setSavedData(newData);
      } else {
        console.log("Deletion canceled");
      }
    };

    const editPrompt = (item: TreeItem<Prompt | Folder>) => {
      console.log("Editing", item.id);
      setEditing(item);
    };

    return (
      <SimpleTreeItemWrapper
        {...props}
        ref={ref}
        showDragHandle={false}
        disableSorting={searching}
      >
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

  return (
    <>
      {DeleteModalComponent}
      {editing ? <EditModal item={editing!} setEditing={setEditing} /> : null}
      <div hidden={editing ? true : false}>
        <SortableTree
          items={
            !searching
              ? savedData
              : filterDataForSearch(savedData, searching, searchString)
          }
          onItemsChanged={(newItems) => {
            console.log("itemsChanged Event", newItems);
            if (searching) {
              console.log("Skipped storing items because searching");
              return;
            }
            storeSavedData(newItems);
            setSavedData(newItems);
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
