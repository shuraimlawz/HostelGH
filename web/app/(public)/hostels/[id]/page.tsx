import { Metadata } from "next";
import HostelDetailsClient from "./HostelDetailsClient";

interface Props {
  params: Promise<{ id: string }>;
}

async function getHostel(id: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://hostelgh.onrender.com").replace(/\/$/, "");
  try {
    const res = await fetch(`${baseUrl}/hostels/public/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching hostel for metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hostel = await getHostel(id);

  if (!hostel) {
    return {
      title: "Hostel Not Found",
    };
  }

  const title = `${hostel.name} in ${hostel.city}`;
  const description = hostel.description || `Book ${hostel.name} in ${hostel.city} on HostelGH. Verified student accommodation.`;
  const image = hostel.images?.[0] || "/og.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: hostel.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }: Props) {
  // We don't actually need to fetch the hostel here since the client component does it with React Query.
  // However, we can pass the ID to the client component.
  // Note: params is a promise in newer Next.js versions.
  return <HostelDetailsClient />;
}
