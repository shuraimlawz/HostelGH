"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, ExternalLink, Link as LinkIcon } from "lucide-react";
import { Post, feedApi } from "@/lib/feed";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import CommentSection from "./CommentSection";

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(false); // In a real app, this would come from the post data if the user liked it
    const [likesCount, setLikesCount] = useState(post._count.likes);
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post._count.comments);

    const handleLike = async () => {
        try {
            if (isLiked) {
                await feedApi.unlikePost(post.id);
                setLikesCount(prev => prev - 1);
            } else {
                await feedApi.likePost(post.id);
                setLikesCount(prev => prev + 1);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            toast.error("Failed to update like");
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/feed/${post.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    };

    const handleShare = async () => {
        try {
            await feedApi.sharePost(post.id);
            if (navigator.share) {
                await navigator.share({
                    title: `Check out this post on HostelGH`,
                    text: post.content,
                    url: `${window.location.origin}/feed/${post.id}`,
                });
            } else {
                handleCopyLink();
            }
        } catch (error) {
            // share cancelled or failed
        }
    };

    return (
        <Card className="mb-6 overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage src={post.author.avatarUrl} alt={post.author.firstName} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold leading-none">
                            {post.author.firstName[0]}{post.author.lastName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight">
                            {post.author.firstName} {post.author.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal size={18} />
                </Button>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                    {post.content}
                </p>

                {post.images && post.images.length > 0 && (
                    <div className={cn(
                        "grid gap-2 mb-4 rounded-xl overflow-hidden",
                        post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                    )}>
                        {post.images.map((img, i) => (
                            <img 
                                key={i} 
                                src={img} 
                                alt={`Post image ${i + 1}`} 
                                className="w-full h-auto object-cover max-h-[400px] hover:scale-[1.02] transition-transform duration-500"
                            />
                        ))}
                    </div>
                )}

                {/* Attached Hostel/Room Preview */}
                {(post.hostel || post.room) && (
                    <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 mb-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center overflow-hidden border shadow-sm">
                                {post.hostel?.images?.[0] ? (
                                    <img src={post.hostel.images[0]} alt={post.hostel.name} className="h-full w-full object-cover" />
                                ) : (
                                    <Building2 className="text-muted-foreground w-6 h-6" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-0.5">
                                    {post.room ? "Featured Room" : "Featured Hostel"}
                                </span>
                                <span className="text-sm font-bold text-foreground">
                                    {post.room ? post.room.name : post.hostel?.name}
                                </span>
                                {post.hostel?.city && (
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        {post.hostel.city}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Link 
                            href={post.room ? `/hostels/${post.hostelId}?room=${post.roomId}` : `/hostels/${post.hostelId}`}
                            className="bg-background text-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2 shadow-sm"
                        >
                            View <ExternalLink size={10} />
                        </Link>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-primary/5 mt-2">
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleLike}
                        className={cn(
                            "flex items-center gap-2 text-xs font-bold transition-all hover:bg-pink-50 hover:text-pink-600",
                            isLiked && "text-pink-600 bg-pink-50"
                        )}
                    >
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110" : ""} />
                        {likesCount > 0 && <span>{likesCount}</span>}
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowComments(!showComments)}
                        className={cn(
                            "flex items-center gap-2 text-xs font-bold transition-all hover:bg-blue-50 hover:text-blue-600",
                            showComments && "text-blue-600 bg-blue-50"
                        )}
                    >
                        <MessageCircle size={16} />
                        {commentsCount > 0 && <span>{commentsCount}</span>}
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleCopyLink}
                        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-zinc-100 rounded-full"
                    >
                        <LinkIcon size={16} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleShare}
                        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-zinc-100 rounded-full"
                    >
                        <Share2 size={16} />
                    </Button>
                </div>
            </CardFooter>

            {showComments && (
                <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <CommentSection 
                        postId={post.id} 
                        initialComments={[]} // We could fetch comments here or rely on the component to fetch
                        onCommentAdded={() => setCommentsCount(prev => prev + 1)}
                    />
                </div>
            )}
        </Card>
    );
}

function Building2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
