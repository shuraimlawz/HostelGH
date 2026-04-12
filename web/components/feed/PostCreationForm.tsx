"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Link as LinkIcon, Send, X, MapPin, Building2 } from "lucide-react";
import { feedApi } from "@/lib/feed";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import HostelSearchModal from "./HostelSearchModal";

interface PostCreationFormProps {
    onPostCreated: () => void;
}

export default function PostCreationForm({ onPostCreated }: PostCreationFormProps) {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [attachedHostel, setAttachedHostel] = useState<{ id: string; name: string; city: string; images: string[] } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await feedApi.createPost({
                content,
                hostelId: attachedHostel?.id,
            });
            setContent("");
            setAttachedHostel(null);
            setIsExpanded(false);
            onPostCreated();
            toast.success("Post shared with the community!");
        } catch (error) {
            toast.error("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <Card className="mb-8 border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300">
            <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's happening in your hostel?"
                                onClick={() => setIsExpanded(true)}
                                className={cn(
                                    "w-full bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-muted-foreground/60 resize-none transition-all duration-300",
                                    isExpanded ? "h-32" : "h-10 py-2"
                                )}
                            />

                            {attachedHostel && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center overflow-hidden">
                                            {attachedHostel.images?.[0] ? (
                                                <img src={attachedHostel.images[0]} alt={attachedHostel.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Building2 size={18} className="text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold truncate">{attachedHostel.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{attachedHostel.city}</span>
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setAttachedHostel(null)}
                                        className="h-8 w-8 hover:bg-white text-muted-foreground hover:text-red-500 rounded-full"
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            )}

                            {isExpanded && (
                                <div className="flex items-center justify-between pt-2 border-t border-primary/5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" type="button" className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 gap-2 text-xs font-bold">
                                            <ImageIcon size={16} />
                                            Photo
                                        </Button>
                                        <HostelSearchModal 
                                            onSelect={(hostel) => {
                                                setAttachedHostel({
                                                    id: hostel.id,
                                                    name: hostel.name,
                                                    city: hostel.city,
                                                    images: hostel.images || []
                                                });
                                            }}
                                            trigger={
                                                <Button variant="ghost" size="sm" type="button" className={cn(
                                                    "text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 gap-2 text-xs font-bold",
                                                    attachedHostel && "text-primary bg-primary/5"
                                                )}>
                                                    <LinkIcon size={16} />
                                                    {attachedHostel ? "Change Hostel" : "Attach Hostel"}
                                                </Button>
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {content && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                type="button"
                                                onClick={() => {
                                                    setContent("");
                                                    setIsExpanded(false);
                                                }}
                                                className="text-muted-foreground h-8 w-8 p-0"
                                            >
                                                <X size={16} />
                                            </Button>
                                        )}
                                        <Button 
                                            type="submit" 
                                            disabled={!content.trim() || isSubmitting}
                                            size="sm"
                                            className="h-8 px-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            {isSubmitting ? "Post..." : "Share Post"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
