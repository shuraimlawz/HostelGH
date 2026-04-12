"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { feedApi } from "@/lib/feed";
import PostCard from "@/components/feed/PostCard";
import PostCreationForm from "@/components/feed/PostCreationForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Sparkles, TrendingUp, Search } from "lucide-react";
import { useState } from "react";

export default function FeedPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["feed", page],
        queryFn: () => feedApi.getPosts(page, 10),
    });

    const handlePostCreated = () => {
        queryClient.invalidateQueries({ queryKey: ["feed"] });
    };

    return (
        <main className="min-h-screen bg-zinc-50/50 pt-8 pb-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Sidebar - Navigation/Stats */}
                    <div className="hidden lg:col-span-3 lg:block space-y-6">
                        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border-none shadow-sm space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 px-3 mb-4">
                                Community
                            </h3>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-3 bg-primary/5 text-primary font-bold transition-all border-none">
                                <Users size={18} />
                                Explore Feed
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-3 text-muted-foreground hover:text-foreground font-bold transition-all">
                                <TrendingUp size={18} />
                                Popular Posts
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-3 text-muted-foreground hover:text-foreground font-bold transition-all">
                                <Sparkles size={18} />
                                My Interactions
                            </Button>
                        </div>

                        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-primary-foreground shadow-lg shadow-primary/20">
                            <h4 className="font-black text-lg leading-tight mb-2 tracking-tighter">
                                Connect with Roommates
                            </h4>
                            <p className="text-white/80 text-xs font-medium leading-relaxed mb-4">
                                Find the perfect company for your next hostel stay.
                            </p>
                            <Button className="w-full bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-9 rounded-xl shadow-sm">
                                Find Match
                            </Button>
                        </div>
                    </div>

                    {/* Main Feed Area */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="flex flex-col gap-1 mb-6">
                            <h1 className="text-2xl font-black tracking-tighter text-foreground sm:text-3xl">
                                Hostel Community
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium">
                                Share your experiences and discover the best student living.
                            </p>
                        </div>

                        <PostCreationForm onPostCreated={handlePostCreated} />

                        {isLoading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-card rounded-2xl p-6 space-y-4 animate-pulse border shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-zinc-200 rounded-full" />
                                            <div className="space-y-2">
                                                <div className="h-3 w-24 bg-zinc-200 rounded" />
                                                <div className="h-2 w-16 bg-zinc-100 rounded" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-full bg-zinc-200 rounded" />
                                            <div className="h-4 w-3/4 bg-zinc-200 rounded" />
                                        </div>
                                        <div className="h-48 bg-zinc-100 rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center space-y-4">
                                <p className="text-red-600 font-bold text-sm">Failed to load the feed</p>
                                <Button onClick={() => refetch()} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                    Try Again
                                </Button>
                            </div>
                        ) : data?.posts.length === 0 ? (
                            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-12 text-center border shadow-sm space-y-4">
                                <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users size={40} className="text-primary/40" />
                                </div>
                                <h3 className="font-bold text-lg">No posts yet</h3>
                                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                    Be the first one to share something with the HostelGH community!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data?.posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}

                                {data?.meta && data.meta.lastPage > page && (
                                    <div className="flex justify-center pt-8">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setPage(page + 1)}
                                            className="font-bold text-xs uppercase tracking-widest px-8 rounded-xl"
                                        >
                                            Load More Posts
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Trending/Suggested */}
                    <div className="hidden lg:col-span-3 lg:block space-y-6">
                        <div className="bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden border shadow-sm">
                            <div className="p-4 border-b border-primary/5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">
                                    Trending Now
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {[
                                    { tag: "#PentagonHostel", count: "1.2k posts" },
                                    { tag: "#RoommateMatching", count: "850 posts" },
                                    { tag: "#KNUSTLiving", count: "620 posts" },
                                    { tag: "#HostelLifeGH", count: "430 posts" },
                                ].map((item, i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="font-bold text-sm group-hover:text-primary transition-colors">{item.tag}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-medium">{item.count}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-primary/5 border-t border-primary/5 flex items-center justify-between group cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">View All</span>
                                <TrendingUp size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border shadow-sm space-y-4">
                             <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Search size={16} className="text-[#1877F2]" />
                             </div>
                             <h4 className="font-bold text-sm">Real-time Search</h4>
                             <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                 Looking for something specific? Search posts, hostels, and rooms across the feed.
                             </p>
                             <div className="relative">
                                 <Input 
                                    placeholder="Search feed..." 
                                    className="h-10 bg-zinc-50 border-none rounded-xl text-xs placeholder:text-muted-foreground/60 pl-10 ring-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                                 />
                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={14} />
                             </div>
                        </div>
                    </div>
                </di