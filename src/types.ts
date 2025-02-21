export type Prompt = {
  text: string;
  id: string;
};

export const isPrompt = (x: Prompt) => {
  return x.text && x.id;
};
