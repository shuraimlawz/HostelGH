import { Metadata } from "next";
import SchoolHostelsClient from "./SchoolHostelsClient";
import { SCHOOLS_MAP } from "@/lib/constants";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const school = SCHOOLS_MAP[slug];

  if (!school) {
    return {
      title: "School Not Found | HostelGH",
    };
  }

  const title = `Hostels Near ${school.shortName} (${school.name})`;
  const description = school.description || `Find and book verified student hostels near ${school.name} in ${school.city}.`;
  
  // You could optionally use a school-specific OG image if available, 
  // but for now we'll use the default or a placeholder.
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: school.shortName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const school = SCHOOLS_MAP[slug];

  if (!school) {
    return notFound();
  }

  return <SchoolHostelsClient />;
}
