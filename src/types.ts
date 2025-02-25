import { TreeItem, TreeItems } from "dnd-kit-sortable-tree";

export type Prompt = {
  type: "prompt";
  text: string;
  public_id?: string;
  title?: string;
  canHaveChildren: false;
};

export type Folder = {
  type: "folder";
  name: string;
  color: string;
  collapsed: true;
  canHaveChildren: true;

  children: TreeItem<Folder | Prompt>[];
};

export type Tree = TreeItems<Folder | Prompt>;

export type ChatApp = {
  name: "chatgpt";
  url: string;
  icon_svg_data_uri: string;
  paste_function: (text: string, send: boolean) => void;
};

export type Settings = {
  send_instantly: {
    label: string;
    value: boolean;
  };
};
