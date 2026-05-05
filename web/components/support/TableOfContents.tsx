"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToCSection { id: string; title: string; }

export default function TableOfContents({ sections }: { sections: ToCSection[] }) {
    const [activeId, setActiveId] = useState("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); }); },
            { rootMargin: "-100px 0% -80% 0%" }
        );
        sections.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, [sections]);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">In this page</h4>
            <ul className="space-y-1">
                {sections.map((section) => (
                    <li key={section.id}>
                        <button
                            onClick={() => scrollTo(section.id)}
                            className={cn(
                                "text-xs font-semibold transition-all text-left block w-full py-1 hover:translate-x-1",
                                activeId === section.id
                                    ? "text-primary font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {section.title}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
