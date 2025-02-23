export type Prompt = {
  type: "prompt";
  text: string;
  id: string;
  public_id?: string;
  title?: string;
};

export type Folder = {
  type: "folder";
  id: string;
  name: string;
  is_open: boolean;
  color: string;
  content: Folder | Prompt | null;
};

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
