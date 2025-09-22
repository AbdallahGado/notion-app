"use client";
import React, { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { ReplyType, CommentType } from "./comment-types";

function AddReplyForm({ onAdd }: Readonly<{ onAdd: (text: string) => void }>) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          onAdd(value.trim());
          setValue("");
        }
      }}
      className="flex gap-2 mt-2"
    >
      <input
        className="flex-1 border rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Reply..."
      />
      <button
        type="submit"
        className="px-2 py-1 rounded bg-indigo-500 text-white text-xs hover:bg-indigo-600"
      >
        Reply
      </button>
    </form>
  );
}

function ReplyItem({
  reply,
  onEdit,
  onDelete,
}: Readonly<{
  reply: ReplyType;
  onEdit: (text: string) => void;
  onDelete: () => void;
}>) {
  const [editing, setEditing] = useState(false);
  const initialText = reply?.text ?? "";
  const [value, setValue] = useState<string>(initialText || "");
  return (
    <div
      className={`flex items-center gap-2 text-xs mb-1 ${
        reply.resolved
          ? "text-gray-400 italic"
          : "text-gray-700 dark:text-gray-200"
      }`}
    >
      <Avatar className="h-5 w-5">
        <AvatarImage src={reply.userAvatar ?? undefined} />
      </Avatar>
      <span className="font-semibold text-gray-700 dark:text-gray-200">
        {reply.userName || "Anonymous"}
      </span>
      {editing ? (
        <>
          <input
            className="flex-1 border rounded px-1 py-0.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEdit(String(value));
                setEditing(false);
              }
            }}
            autoFocus
          />
          <button
            className="px-1 py-0.5 rounded bg-indigo-500 text-white text-xs hover:bg-indigo-600"
            onClick={() => {
              onEdit(value);
              setEditing(false);
            }}
          >
            Save
          </button>
        </>
      ) : (
        <>
          <span>{reply.text}</span>
          <button
            className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            className="px-1 py-0.5 rounded bg-red-500 text-white text-xs hover:bg-red-600"
            onClick={onDelete}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}

export default function CommentPopup({
  comment,
  onClose,
  onToggleResolve,
  onDeleteComment,
  onAddReply,
  onEditReply,
  onDeleteReply,
  style,
}: Readonly<{
  comment: CommentType;
  onClose: () => void;
  onToggleResolve: (id: string) => void;
  onDeleteComment: (id: string) => void;
  onAddReply: (text: string) => void;
  onEditReply: (index: number, text: string) => void;
  onDeleteReply: (index: number) => void;
  style?: React.CSSProperties;
}>) {
  return (
    <div
      style={style}
      className="bg-white dark:bg-[#23233a] border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3 min-w-[200px]"
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={comment.userAvatar ?? undefined} />
        </Avatar>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          {comment.userName || "Anonymous"}
        </span>
      </div>
      <div
        className={`text-sm mb-2 ${comment.resolved ? "text-gray-400 italic" : "text-gray-800 dark:text-gray-100"}`}
      >
        {comment.text}
      </div>
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-2 mb-2 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
          {comment.replies.map((reply, idx) => (
            <ReplyItem
              key={reply?.id ?? idx}
              reply={reply}
              onEdit={(text) => onEditReply(idx, text)}
              onDelete={() => onDeleteReply(idx)}
            />
          ))}
        </div>
      )}
      {/* Add reply */}
      <AddReplyForm onAdd={onAddReply} />
      <div className="mt-2">
        <button
          className="px-2 py-1 rounded bg-green-500 text-white text-xs hover:bg-green-600"
          onClick={() => onToggleResolve(comment.id)}
        >
          {comment.resolved ? "Unresolve" : "Resolve"}
        </button>
        <button
          className="ml-2 px-2 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
          onClick={() => onDeleteComment(comment.id)}
        >
          Delete Comment
        </button>
        <button
          className="ml-2 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
