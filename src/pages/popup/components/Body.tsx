import { ChatApp, Tree, Settings } from "@src/types";
import PromptManager from "./PromptManager";

type BodyProps = {
  tree: Tree;
  setTree: (newTree: Tree) => void;
  chatApp: ChatApp | null;
  settings: Settings | null;
};

export const Body = ({ tree, setTree, chatApp, settings }: BodyProps) => {
  return (
    <div className="h-full p-2 px-4 overflow-x-hidden overflow-y-auto">
      <PromptManager
        tree={tree}
        setTree={setTree}
        chatApp={chatApp}
        settings={settings}
      />
    </div>
  );
};
