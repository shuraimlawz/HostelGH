"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Comment, feedApi } from "@/lib/feed";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
    postId: string;
    initialComments?: Comment[];
    onCommentAdded?: () => void;
}

export default function CommentSection({ postId, initialComments = [], onCommentAdded }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting || !user) return;

        setIsSubmitting(true);
        try {
            const comment = await feedApi.addComment(postId, newComment);
            setComments([comment, ...comments]);
            setNewComment("");
            onCommentAdded?.();
        } catch (error) {
            toast.error("Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await feedApi.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
            toast.success("Comment deleted");
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };

    return (
        <div className="space-y-4 pt-4 border-t border-primary/5">
            {user && (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="text-[10px] font-bold">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="relative flex-1">
                        <Input
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="h-9 bg-zinc-50 border-none rounded-xl pr-10 text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary/20"
                        />
                        <button 
                            type="submit" 
                            disabled={!newComment.trim() || isSubmitting}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 disabled:opacity-30 p-1 transition-all"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center py-4 opacity-40">
                        No comments yet. Start the conversation!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={comment.author.avatarUrl} />
                                <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                                    {comment.author.firstName[0]}{comment.author.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold leading-none">{comment.author.firstName} {comment.author.lastName}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {user?.id === comment.authorId && (
                                        <button 
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="bg-zinc-50 p-2.5 rounded-xl rounded-tl-none border border-black/5">
                                    <p className="text-xs leading-relaxed text-foreground font-medium">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
