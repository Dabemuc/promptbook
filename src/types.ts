export type Prompt = {
  text: string;
  id: string;
  public_id?: string;
  title?: string;
};

export const isPrompt = (x: Prompt) => {
  return x.text && x.id;
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
