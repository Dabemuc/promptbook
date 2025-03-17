import { ChatApp, Folder, Prompt, Settings, Tree } from "@src/types";
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
  const { DeleteModalComponent, openModal } = useDeleteModal();

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

    const deletePrompt = async (item: TreeItem<Prompt | Folder>) => {
      console.log("Deleting", item.id);
      const confirm: boolean = await openModal();
      if (confirm) {
        const newTree = [...tree];
        removeFromTree(item, newTree);
        storeTree(newTree);
        setTree(newTree);
      } else {
        console.log("Deletion canceled");
      }
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

  return (
    <>
      {DeleteModalComponent}
      {editing ? (
        <EditModal
          item={editing!}
          setEditing={setEditing}
          setTree={setTree}
          storeTree={storeTree}
          tree={tree}
        />
      ) : null}
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
