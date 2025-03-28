import { UniqueIdentifier } from "@dnd-kit/core";
import { Folder, Prompt, Tree } from "@src/types";
import { TreeItem } from "dnd-kit-sortable-tree";

export const filterDataForSearch = (
  tree: Tree,
  searching: boolean,
  searchString: string,
) => {
  if (!searchString || !searching) return tree; // If no search, return full tree

  const matchedNodes = new Set<UniqueIdentifier>(); // Stores IDs of matching elements
  const parentMap = new Map<UniqueIdentifier, TreeItem<Folder | Prompt>>(); // Stores parent-child relationships

  // Helper function to traverse and find matches
  function traverse(node: TreeItem<Folder | Prompt>) {
    const isMatch =
      node.type === "folder"
        ? node.name?.toLowerCase().includes(searchString.toLowerCase())
        : node.text?.toLowerCase().includes(searchString.toLowerCase()) ||
          node.title?.toLowerCase().includes(searchString.toLowerCase());

    if (isMatch) matchedNodes.add(node.id);

    if (node.canHaveChildren && node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        parentMap.set(child.id, node); // Store parent reference
        traverse(child);
      });
    }
  }

  // Step 1: Find all matching nodes
  tree.forEach(traverse);

  // Step 2: Include all parent folders of matched nodes
  function includeParents(nodeId: UniqueIdentifier) {
    let parent = parentMap.get(nodeId);
    while (parent) {
      matchedNodes.add(parent.id);
      parent = parentMap.get(parent.id);
    }
  }

  matchedNodes.forEach(includeParents);

  // Step 3: Rebuild the tree with only matching nodes and parents
  function rebuildTree(
    node: TreeItem<Prompt | Folder>,
  ): TreeItem<Prompt | Folder> | null {
    if (!matchedNodes.has(node.id)) return null;

    return {
      ...node,
      children: node.children
        ? node.children
            .map(rebuildTree)
            .filter(
              (child): child is TreeItem<Prompt | Folder> => child !== null,
            )
        : [],
    };
  }

  return tree
    .map(rebuildTree)
    .filter((node): node is TreeItem<Prompt | Folder> => node !== null);
};
