import { useEffect, useState } from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: (value: boolean) => void;
}

export const DeleteModal = ({ isOpen, onConfirm }: DeleteModalProps) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        onConfirm(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        onConfirm(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      onClick={() => onConfirm(false)}
      className="fixed inset-0 flex items-center justify-center bg-gray-800/50 z-50"
    >
      <div className="bg-white p-3 rounded-lg shadow-lg w-40">
        <h2 className="text-xl font-bold mb-4 text-center">Delete?</h2>
        <div className="flex justify-between">
          <button
            className="px-2 py-1 bg-red-100 rounded-md cursor-pointer"
            onClick={() => onConfirm(true)}
          >
            Delete
          </button>
          <button
            className="px-2 py-1 bg-gray-200 rounded-md cursor-pointer"
            onClick={() => onConfirm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const useDeleteModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolver, setResolver] = useState<(value: boolean) => void>();

  const openModal = () => {
    console.log("Opened delete modal. Waiting for resolve");
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = (value: boolean) => {
    setIsOpen(false);
    if (resolver) resolver(value);
  };

  return {
    openModal,
    DeleteModalComponent: (
      <DeleteModal isOpen={isOpen} onConfirm={handleConfirm} />
    ),
  };
};
