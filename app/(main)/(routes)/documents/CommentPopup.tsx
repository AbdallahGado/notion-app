"use client";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { ReplyType, CommentType } from "./comment-types";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X, Edit2, Trash2, MessageSquarePlus, Clock, Smile } from "lucide-react";
import { init } from 'emoji-mart';
import Picker from '@emoji-mart/react';

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

function AddReplyForm({ onAdd }: Readonly<{ onAdd: (text: string) => void }>) {
  const [value, setValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div className="mt-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onAdd(value.trim());
            setValue("");
          }
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 border rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Reply..."
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          aria-label="Toggle emoji picker"
        >
          <Smile className="w-4 h-4" />
        </button>
        <button
          type="submit"
          className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition flex items-center gap-1"
          aria-label="Add reply"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Reply
        </button>
      </form>
      {showPicker && (
        <div className="mt-2">
          <Picker
            onEmojiSelect={(emoji: { native: string }) => {
              setValue(prev => prev + emoji.native);
              setShowPicker(false);
            }}
          />
        </div>
      )}
    </div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2 text-xs mb-1 ${
        reply.resolved
          ? "text-gray-400 italic"
          : "text-gray-700 dark:text-gray-200"
      }`}
    >
      <Avatar className="h-5 w-5 mt-0.5">
        <AvatarImage src={reply.userAvatar ?? undefined} />
      </Avatar>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {reply.userName || "Anonymous"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {reply.createdAt ? formatTimestamp(reply.createdAt) : ""}
          </span>
        </div>
        {editing ? (
          <>
            <input
              className="flex-1 border rounded px-1 py-0.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
              className="px-1 py-0.5 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition flex items-center gap-1"
              onClick={() => {
                onEdit(value);
                setEditing(false);
              }}
              aria-label="Save reply"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save
            </button>
          </>
        ) : (
          <>
            <span className="flex-1">{reply.text}</span>
            <div className="flex gap-1">
              <button
                className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition flex items-center gap-1"
                onClick={() => setEditing(true)}
                aria-label="Edit reply"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                className="px-1 py-0.5 rounded bg-red-600 text-white text-xs hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition flex items-center gap-1"
                onClick={onDelete}
                aria-label="Delete reply"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
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
  useEffect(() => {
    init({});
  }, []);
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900 dark:to-[#1e1e3f] border border-indigo-300 dark:border-indigo-700 rounded-lg shadow-2xl p-5 min-w-[280px] max-w-[420px] select-text"
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-7 w-7 ring-2 ring-indigo-500 dark:ring-indigo-400">
          <AvatarImage src={comment.userAvatar ?? undefined} />
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            {comment.userName || "Anonymous"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {comment.createdAt ? formatTimestamp(comment.createdAt) : ""}
          </span>
        </div>
      </div>
      <div
        className={`text-base mb-3 ${
          comment.resolved
            ? "text-gray-400 italic line-through"
            : "text-indigo-900 dark:text-indigo-100"
        }`}
      >
        {comment.text}
      </div>
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-3 mb-3 border-l-4 border-indigo-300 dark:border-indigo-700 pl-3 space-y-1">
          <AnimatePresence initial={false}>
            {comment.replies.map((reply, idx) => (
              <ReplyItem
                key={reply?.id ?? idx}
                reply={reply}
                onEdit={(text) => onEditReply(idx, text)}
                onDelete={() => onDeleteReply(idx)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
      {/* Emoji reactions */}
      <div className="flex gap-1 mb-3">
        {["👍", "❤️", "👏", "😊", "🤔"].map((emoji) => (
          <button
            key={emoji}
            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition"
            onClick={() => {
              // Add emoji reaction logic here
            }}
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Add reply */}
      <AddReplyForm onAdd={onAddReply} />
      <div className="mt-4 flex justify-end gap-3">
        <button
          className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          onClick={() => onToggleResolve(comment.id)}
          aria-label={comment.resolved ? "Unresolve comment" : "Resolve comment"}
        >
          {comment.resolved ? (
            <>
              <XCircle className="w-5 h-5" />
              Unresolve
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Resolve
            </>
          )}
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          onClick={() => onDeleteComment(comment.id)}
          aria-label="Delete comment"
        >
          <Trash2 className="w-5 h-5" />
          Delete
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          onClick={onClose}
          aria-label="Close comment popup"
        >
          <X className="w-5 h-5" />
          Close
        </button>
      </div>
    </motion.div>
  );
}
