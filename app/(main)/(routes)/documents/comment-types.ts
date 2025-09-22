export type ReplyType = {
  text: string;
  id: string;
  resolved?: boolean;
  replies?: ReplyType[];
  userId?: string;
  userName?: string | null;
  userAvatar?: string | null;
};

export type CommentType = {
  from: number;
  to: number;
  text: string;
  id: string;
  resolved?: boolean;
  replies?: ReplyType[];
  userId?: string;
  userName?: string | null;
  userAvatar?: string | null;
};
