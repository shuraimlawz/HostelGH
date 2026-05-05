"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToCSection {
    id: string;
    title: string;
}

export default function TableOfContents({ sections }: { sections: ToCSection[] }) {
    const [activeId, setActiveId] = useState("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: "-100px 0% -80% 0%" }
        );
        sections.forEach((section) => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [sections]);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: "smooth" });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                In this page
            </h4>
            <ul className="space-y-1">
                {sections.map((section) => (
                    <li key={section.id}>
                        <button
                            onClick={() => scrollTo(section.id)}
                            className={cn(
                                "text-xs font-semibold transition-all text-left block w-full py-1 hover:translate-x-1",
                                activeId === section.id
                                    ? "text-blue-600 dark:text-blue-400 font-bold"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
