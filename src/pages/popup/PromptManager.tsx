// import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
// import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
import { ChatApp, Folder, Prompt, Settings, Tree } from "@src/types";
import {
  SimpleTreeItemWrapper,
  SortableTree,
  TreeItemComponentProps,
  TreeItem,
} from "dnd-kit-sortable-tree";
import React from "react";

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
  const storeTree = (treeToStore: Tree) => {
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
      const newTree = [...tree];
      removeFromTree(item, newTree);
      storeTree(newTree);
      setTree(newTree);
    };

    return (
      <SimpleTreeItemWrapper {...props} ref={ref} showDragHandle={false}>
        <div className="w-full flex justify-evenly items-center">
          <div
            className="w-full"
            title={
              props.item.type === "prompt"
                ? "Click to paste in chatbox"
                : undefined
            }
            onClick={() =>
              props.item.type === "prompt" ? pastePrompt(props.item.text) : null
            }
          >
            {props.item.type == "prompt"
              ? props.item.title
                ? props.item.title
                : props.item.text.length <= 35
                  ? props.item.text
                  : props.item.text.substring(0, 32).concat("...")
              : props.item.name}
          </div>
          <button
            className="px-2"
            onClick={(e) => {
              e.stopPropagation();
              deletePrompt(props.item);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            X
          </button>
        </div>
      </SimpleTreeItemWrapper>
    );
  });
  TreeItem.displayName = "TreeItem";

  return (
    <SortableTree
      items={tree}
      onItemsChanged={(newItems) => {
        console.log("itemsChanged Event", newItems);
        storeTree(newItems);
        setTree(newItems);
      }}
      TreeItemComponent={TreeItem}
    />
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
