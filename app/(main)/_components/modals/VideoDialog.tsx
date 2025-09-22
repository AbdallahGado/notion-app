import React, { useState } from "react";

interface VideoDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export const VideoDialog: React.FC<VideoDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [url, setUrl] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white dark:bg-[#23233a] p-4 rounded-lg shadow-xl w-80 flex flex-col gap-3">
        <div className="font-semibold text-base mb-1">Embed Video</div>
        <input
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={() => {
              onSubmit(url);
              onClose();
            }}
            type="button"
            disabled={!url}
          >
            Embed
          </button>
        </div>
      </div>
    </div>
  );
};
