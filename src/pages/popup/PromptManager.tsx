import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChatApp, Folder, Prompt, Settings } from "@src/types";

export default function PromptManager({
  items,
  setItems,
  chatApp,
  settings,
  loadSavedPrompts,
}: {
  items: (Prompt | Folder)[];
  setItems: (newItems: (Prompt | Folder)[]) => void;
  chatApp: ChatApp | null;
  settings: Settings | null;
  loadSavedPrompts: () => void;
}) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    const stringifiedItems = newItems.map((item) => JSON.stringify(item));
    chrome.storage.local.set({ savedPrompts: stringifiedItems });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)}>
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            chatApp={chatApp}
            settings={settings}
            loadSavedPrompts={loadSavedPrompts}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

const DraggableItem = ({
  item,
  chatApp,
  settings,
  loadSavedPrompts,
}: {
  item: Prompt | Folder;
  chatApp: ChatApp | null;
  settings: Settings | null;
  loadSavedPrompts: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const pastePrompt = (text: string) => {
    if (!chatApp) {
      console.error("Failed to paste prompt. No chat app detected");
      return;
    }
    chatApp.paste_function(text, settings?.send_instantly.value ?? false);
  };

  const deletePrompt = (id: string) => {
    chrome.storage.local.get({ savedPrompts: [] }, (data) => {
      const indexToRemove = data.savedPrompts.findIndex((s: string) => {
        return JSON.parse(s).id === id;
      });
      if (indexToRemove === -1) {
        console.error(
          "Failed to delete prompt. Prompt with id " + id + " not found",
        );
        return;
      }
      data.savedPrompts.splice(indexToRemove, 1);
      chrome.storage.local.set({ savedPrompts: data.savedPrompts });
      console.log("Successfully deleted prompt with id " + id);
      loadSavedPrompts();
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      key={item.id}
      onClick={() => (item.type === "prompt" ? pastePrompt(item.text) : null)}
      className={
        "flex justify-evenly items-center p-1 my-1 rounded-md shadow-sm" + // Base styles
        " " +
        (item.type === "prompt" ? "bg-gray-200" : "bg-[" + item.color + "]") + // Folder vs Prompt styles
        " " +
        (isDragging ? "z-50 opacity-80 shadow-lg relative" : "") // Dragging effect
      }
    >
      {/* Item title/text */}
      <div className="w-full">
        {item.type === "folder" ? (
          <b>📂 {item.name}</b>
        ) : (
          `📝 ${
            item.title ??
            (item.text.length <= 30
              ? item.text
              : item.text.substring(0, 30) + " ...")
          }`
        )}
      </div>

      {/* Drag handle */}
      <div {...listeners} {...attributes} className="cursor-grab px-2">
        ⠿
      </div>

      {/* Delete button */}
      <button
        className="px-2"
        onClick={(e) => {
          e.stopPropagation();
          deletePrompt(item.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        X
      </button>
    </div>
  );
};
