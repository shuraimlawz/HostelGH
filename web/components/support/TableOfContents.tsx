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
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-100px 0% -80% 0%" }
        );

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sections]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                In this page
            </h4>
            <ul className="space-y-2">
                {sections.map((section) => (
                    <li key={section.id}>
                        <button
                            onClick={() => scrollToSection(section.id)}
                            className={cn(
                                "text-sm font-medium transition-all text-left block w-full truncate",
                                activeId === section.id
                                    ? "text-blue-600 font-bold translate-x-1"
                                    : "text-gray-500 hover:text-gray-900 hover:translate-x-1"
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
