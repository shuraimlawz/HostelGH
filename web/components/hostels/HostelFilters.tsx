"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer } from "vaul";
import {
    Wifi,
    Wind,
    Utensils,
    Waves,
    Car,
    ShieldCheck,
    Coffee,
    Building2,
    Users,
    User,
    UserCheck,
    Layout,
    School,
    DollarSign,
    MapPin,
    Navigation,
    SlidersHorizontal,
    ChevronDown,
    Search,
    X,
    Clock,
    Star,
    GraduationCap
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { REGIONAL_UNIVERSITIES } from "@/lib/constants";

const AMENITIES = [
    { id: "WiFi", icon: Wifi },
    { id: "AC", icon: Wind },
    { id: "Laundry", icon: Utensils },
    { id: "Swimming Pool", icon: Waves },
    { id: "Parking", icon: Car },
    { id: "Security", icon: ShieldCheck },
    { id: "Study Room", icon: Coffee },
    { id: "Generator", icon: Building2 },
];

export default function HostelFilters() {
    const router = useRouter();
    const params = useSearchParams();

    const [query, setQuery] = useState(params.get("query") ?? "");
    const [university, setUniversity] = useState(params.get("university") ?? "");
    const [minPrice, setMinPrice] = useState(params.get("minPrice") ? (parseInt(params.get("minPrice")!) / 100).toString() : "");
    const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ? (parseInt(params.get("maxPrice")!) / 100).toString() : "");
    const [gender, setGender] = useState(params.get("gender") ?? "");
    const [roomConfig, setRoomConfig] = useState(params.get("roomConfig") ?? "");
    const [availableOnly, setAvailableOnly] = useState(params.get("availableOnly") === "true");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        params.get("amenities")?.split(",").filter(Boolean) ?? []
    );
    const [isFocused, setIsFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Load recent searches
    useEffect(() => {
        const saved = localStorage.getItem("recent_hostel_searches");
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    const saveRecentSearch = (q: string) => {
        if (!q || q.trim().length < 2) return;
        const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recent_hostel_searches", JSON.stringify(updated));
    };
    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query !== (params.get("query") ?? "")) {
                handleApply({ query });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);


    const handleApply = (overrides?: any) => {
        const p = new URLSearchParams();
        const activeQuery = overrides?.query !== undefined ? overrides.query : query;
        const activeUni = overrides?.university !== undefined ? overrides.university : university;
        const activeGender = overrides?.gender !== undefined ? overrides.gender : gender;

        if (activeQuery) p.set("query", activeQuery);
        if (activeUni) p.set("university", activeUni);
        if (activeGender) p.set("gender", activeGender);
        if (roomConfig) p.set("roomConfig", roomConfig);
        if (minPrice) p.set("minPrice", (parseFloat(minPrice) * 100).toString());
        if (maxPrice) p.set("maxPrice", (parseFloat(maxPrice) * 100).toString());
        if (availableOnly) p.set("availableOnly", "true");
        if (selectedAmenities.length > 0) p.set("amenities", selectedAmenities.join(","));

        router.push(`/hostels?${p.toString()}`);
    };

    const clearFilters = () => {
        setQuery("");
        setUniversity("");
        setGender("");
        setRoomConfig("");
        setMinPrice("");
        setMaxPrice("");
        setSelectedAmenities([]);
        router.push("/hostels");
    };

    const toggleAmenity = (id: string) => {
        setSelectedAmenities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    return (
        <div className="w-full bg-gray-50/50 dark:bg-slate-900/80 backdrop-blur-3xl border border-gray-200/50 dark:border-slate-800/50 rounded-2xl lg:rounded-[2.5rem] p-3 shadow-2xl shadow-gray-200/20 dark:shadow-none mb-10 transition-all">
            <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-0">
                
                {/* Smart Global Search */}
                <div className="flex-1 w-full lg:w-auto relative group rounded-xl lg:rounded-2xl transition-all">
                    <Search className={cn(
                        "absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300",
                        isFocused ? "text-blue-500" : "text-gray-400"
                    )} size={20} />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleApply();
                                saveRecentSearch(query);
                                setIsFocused(false);
                            }
                        }}
                        className="w-full h-14 bg-transparent pl-12 pr-4 outline-none font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 text-sm lg:text-base"
                        placeholder="Search hostels, schools, or cities..."
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />

                    {/* Suggestions Dropdown — only shows user's own recent searches */}
                    {isFocused && recentSearches.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="p-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock size={10} /> Recent Searches
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => { setQuery(s); handleApply({ query: s }); setIsFocused(false); }}
                                            className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-lg border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden lg:block w-px h-8 bg-gray-200 dark:bg-slate-800 mx-2" />

                {/* Desktop-Only University Select */}
                <div className="hidden lg:flex w-full lg:w-56 relative hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-slate-800/50 rounded-xl lg:rounded-2xl transition-colors">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={university}
                        onChange={(e) => { 
                            const val = e.target.value;
                            setUniversity(val); 
                            handleApply({ university: val }); 
                        }}
                        className="w-full h-14 bg-transparent pl-11 pr-10 outline-none font-semibold text-gray-900 dark:text-white text-sm appearance-none cursor-pointer"
                    >
                        <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Any University</option>
                        {REGIONAL_UNIVERSITIES.map(group => (
                            <optgroup key={group.region} label={group.region} className="text-gray-500 font-bold bg-gray-50 dark:bg-slate-800">
                                {group.unis.map(u => (
                                    <option key={u} value={u} className="text-gray-900 dark:text-white font-semibold bg-white dark:bg-slate-900">{u}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="hidden lg:block w-px h-8 bg-gray-200 dark:bg-slate-800 mx-2" />

                {/* Desktop-Only Tenant Type */}
                <div className="hidden lg:flex w-full lg:w-48 relative hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-slate-800/50 rounded-xl lg:rounded-2xl transition-colors">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={gender}
                        onChange={(e) => { 
                            const val = e.target.value;
                            setGender(val); 
                            handleApply({ gender: val }); 
                        }}
                        className="w-full h-14 bg-transparent pl-11 pr-10 outline-none font-semibold text-gray-900 dark:text-white text-sm appearance-none cursor-pointer"
                    >
                        <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Any Gender</option>
                        <option value="MALE" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Male Hostels</option>
                        <option value="FEMALE" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Female Hostels</option>
                        <option value="MIXED" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Mixed Hostels</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="hidden lg:block w-px h-8 bg-gray-200 dark:bg-slate-800 mx-2" />

                {/* Desktop Filter Popover */}
                <div className="hidden lg:block">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="h-11 px-6 rounded-xl bg-blue-600 text-white flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                <SlidersHorizontal size={14} />
                                Filters
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-6 rounded-2xl border-gray-100 dark:border-slate-800 shadow-2xl space-y-8 bg-white dark:bg-slate-900" align="end">
                            <FilterContent 
                                clearFilters={clearFilters} 
                                setAvailableOnly={setAvailableOnly}
                                availableOnly={availableOnly}
                                roomConfig={roomConfig}
                                setRoomConfig={setRoomConfig}
                                minPrice={minPrice}
                                setMinPrice={setMinPrice}
                                maxPrice={maxPrice}
                                setMaxPrice={setMaxPrice}
                                selectedAmenities={selectedAmenities}
                                toggleAmenity={toggleAmenity}
                                handleApply={handleApply}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Mobile Swipeable Filter Drawer (Vaul) */}
                <div className="lg:hidden w-full mt-2">
                    <Drawer.Root shouldScaleBackground>
                        <Drawer.Trigger asChild>
                            <button className="w-full h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                <SlidersHorizontal size={18} />
                                Refine Search
                            </button>
                        </Drawer.Trigger>
                        <Drawer.Portal>
                            <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
                            <Drawer.Content className="bg-white dark:bg-slate-900 flex flex-col rounded-t-[3rem] h-[92%] mt-24 fixed bottom-0 left-0 right-0 z-[101] outline-none">
                                <div className="p-6 bg-white dark:bg-slate-900 rounded-t-[3rem] flex-1 overflow-y-auto">
                                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 dark:bg-slate-800 mb-8" />
                                    
                                    <div className="space-y-10 pb-20">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Filters</h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personalize your search</p>
                                        </div>

                                        <FilterContent 
                                            clearFilters={clearFilters} 
                                            setAvailableOnly={setAvailableOnly}
                                            availableOnly={availableOnly}
                                            roomConfig={roomConfig}
                                            setRoomConfig={setRoomConfig}
                                            minPrice={minPrice}
                                            setMinPrice={setMinPrice}
                                            maxPrice={maxPrice}
                                            setMaxPrice={setMaxPrice}
                                            selectedAmenities={selectedAmenities}
                                            toggleAmenity={toggleAmenity}
                                            handleApply={handleApply}
                                            university={university}
                                            setUniversity={setUniversity}
                                            gender={gender}
                                            setGender={setGender}
                                            isMobile
                                        />
                                    </div>
                                </div>
                            </Drawer.Content>
                        </Drawer.Portal>
                    </Drawer.Root>
                </div>

                {/* Reset Shortcut */}
                {(query || university || gender || minPrice || selectedAmenities.length > 0) && (
                    <button 
                        onClick={clearFilters}
                        className="hidden lg:flex h-14 w-14 lg:ml-2 items-center justify-center rounded-xl lg:rounded-[1.5rem] bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shrink-0"
                        title="Clear all filters"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Active Filter Chips */}
            {(query || university || gender || roomConfig || minPrice || maxPrice || selectedAmenities.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 mt-4 px-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Active Filters:</span>
                    
                    {query && (
                        <FilterChip label={`"${query}"`} onRemove={() => { setQuery(""); handleApply({ query: "" }); }} />
                    )}
                    {university && (
                        <FilterChip label={university} onRemove={() => { setUniversity(""); handleApply({ university: "" }); }} />
                    )}
                    {gender && (
                        <FilterChip label={gender === "MIXED" ? "Mixed" : gender === "MALE" ? "Males Only" : "Females Only"} onRemove={() => { setGender(""); handleApply({ gender: "" }); }} />
                    )}
                    {roomConfig && (
                        <FilterChip label={roomConfig} onRemove={() => { setRoomConfig(""); handleApply({ roomConfig: "" }); }} />
                    )}
                    {selectedAmenities.map(a => (
                        <FilterChip key={a} label={a} onRemove={() => toggleAmenity(a)} />
                    ))}
                    {(minPrice || maxPrice) && (
                        <FilterChip label={`₵${minPrice || 0} - ₵${maxPrice || 'Any'}`} onRemove={() => { setMinPrice(""); setMaxPrice(""); handleApply({ minPrice: "", maxPrice: "" }); }} />
                    )}
                </div>
            )}
        </div>
    );
}

function FilterContent({ 
    clearFilters, 
    setAvailableOnly, 
    availableOnly, 
    roomConfig, 
    setRoomConfig, 
    minPrice, 
    setMinPrice, 
    maxPrice, 
    setMaxPrice, 
    selectedAmenities, 
    toggleAmenity, 
    handleApply,
    university,
    setUniversity,
    gender,
    setGender,
    isMobile = false
}: any) {
    return (
        <div className="space-y-10">
            {!isMobile && (
                <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Quick Filters</h3>
                    <button onClick={() => { clearFilters(); setAvailableOnly(false); }} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-widest">Reset All</button>
                </div>
            )}

            {/* Mobile-Only Selectors */}
            {isMobile && (
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">University</Label>
                        <div className="relative">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            <select
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="w-full h-14 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl px-12 outline-none font-bold text-xs text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="">Any University</option>
                                {REGIONAL_UNIVERSITIES.map(group => (
                                    <optgroup key={group.region} label={group.region} className="text-gray-500 font-bold bg-gray-50 dark:bg-slate-800">
                                        {group.unis.map(u => (
                                            <option key={u} value={u} className="text-gray-900 dark:text-white font-semibold bg-white dark:bg-slate-900">{u}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Gender</Label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full h-14 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl px-12 outline-none font-bold text-xs text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            >
                                <option value="">Any Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="MIXED">Mixed</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
            )}

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Available Only</p>
                    <p className="text-[9px] font-medium text-emerald-600/70 dark:text-emerald-400/50">Hide hostels with no rooms left</p>
                </div>
                <button 
                    onClick={() => setAvailableOnly(!availableOnly)}
                    className={cn(
                        "w-10 h-5 rounded-full transition-all relative",
                        availableOnly ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : "bg-gray-200 dark:bg-slate-800"
                    )}
                >
                    <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        availableOnly ? "left-6" : "left-1"
                    )} />
                </button>
            </div>

            {/* Room Config */}
            <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Room Type</Label>
                <select
                    value={roomConfig}
                    onChange={(e) => setRoomConfig(e.target.value)}
                    className="w-full h-11 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 outline-none font-bold text-xs text-gray-900 dark:text-white"
                >
                    <option value="" className="bg-white dark:bg-slate-900">Any Room Type</option>
                    <option value="1 IN A ROOM" className="bg-white dark:bg-slate-900">1 In a Room</option>
                    <option value="2 IN A ROOM" className="bg-white dark:bg-slate-900">2 In a Room</option>
                    <option value="3 IN A ROOM" className="bg-white dark:bg-slate-900">3 In a Room</option>
                    <option value="4 IN A ROOM" className="bg-white dark:bg-slate-900">4 In a Room</option>
                </select>
            </div>

            {/* Budget Range */}
            <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Budget (₵)</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                        <Input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="rounded-xl h-11 bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 font-bold text-xs pl-6 text-gray-900 dark:text-white placeholder:text-gray-400"
                            placeholder="Min"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-[10px]">₵</span>
                    </div>
                    <div className="relative">
                        <Input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="rounded-xl h-11 bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 font-bold text-xs pl-6 text-gray-900 dark:text-white placeholder:text-gray-400"
                            placeholder="Max"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-[10px]">₵</span>
                    </div>
                </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Essentials</Label>
                <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.map((a: any) => {
                        const isSelected = selectedAmenities.includes(a.id);
                        return (
                            <button
                                key={a.id}
                                onClick={() => toggleAmenity(a.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all",
                                    isSelected
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                        : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50"
                                )}
                            >
                                <a.icon size={12} className={cn(isSelected ? "text-blue-200" : "text-gray-300 dark:text-gray-600")} />
                                <span className="truncate">{a.id}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Button
                onClick={handleApply}
                className="w-full rounded-xl h-12 font-bold uppercase tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
                Apply Filters
            </Button>
        </div>
    );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400">
            {label}
            <button onClick={onRemove} className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors">
                <X size={10} />
            </button>
        </div>
    );
}
