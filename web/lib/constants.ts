export const GHANA_BANKS = [
    { name: "Access Bank Ghana", code: "044" },
    { name: "ADB Bank", code: "014" },
    { name: "Absa Bank Ghana", code: "011" },
    { name: "CalBank", code: "021" },
    { name: "Consolidated Bank Ghana (CBG)", code: "028" },
    { name: "EcoBank Ghana", code: "013" },
    { name: "Fidelity Bank Ghana", code: "024" },
    { name: "First Atlantic Bank", code: "023" },
    { name: "GCB Bank", code: "012" },
    { name: "Guaranty Trust Bank (GTBank)", code: "026" },
    { name: "National Investment Bank (NIB)", code: "020" },
    { name: "Prudential Bank", code: "027" },
    { name: "Republic Bank", code: "019" },
    { name: "Société Générale Ghana", code: "015" },
    { name: "Stanbic Bank Ghana", code: "016" },
    { name: "Standard Chartered Bank", code: "010" },
    { name: "Universal Merchant Bank (UMB)", code: "017" },
    { name: "Zenith Bank Ghana", code: "025" }
].sort((a, b) => a.name.localeCompare(b.name));

export const GHANA_MOMO_PROVIDERS = [
    { name: "MTN Mobile Money", code: "MTN" },
    { name: "Telecel Cash (formerly Vodafone)", code: "VOD" },
    { name: "AirtelTigo Money", code: "ATL" }
];

export const REGIONAL_UNIVERSITIES = [
    {
        region: "Greater Accra",
        unis: [
            "Academic City University",
            "Accra Institute of Technology",
            "Accra Technical University",
            "African University College of Communications",
            "BlueCrest College",
            "Central University",
            "Ghana Christian University College",
            "Ghana Communication Technology University (GCTU)",
            "GIMPA",
            "Islamic University College",
            "Kings University College",
            "Knutsford University College",
            "Lancaster University Ghana",
            "Maranatha University College",
            "Methodist University Ghana",
            "Mountcrest University College",
            "Pentecost University",
            "Radford University College",
            "Regional Maritime University",
            "Regent University College of Science and Tech",
            "University of Ghana (Legon)",
            "University of Media, Arts and Communication (UniMAC)",
            "UPSA",
            "West End University College",
            "Wisconsin International University College",
            "Zenith University College"
        ]
    },
    {
        region: "Ashanti",
        unis: [
            "AAM-USTED (Kumasi/Mampong)",
            "Baptist University College",
            "Christ Apostolic University College",
            "Christian Service University College",
            "Garden City University College",
            "KNUST",
            "Kumasi Technical University"
        ]
    },
    {
        region: "Central",
        unis: [
            "Cape Coast Technical University",
            "University of Cape Coast (UCC)",
            "University of Education, Winneba (UEW)"
        ]
    },
    {
        region: "Eastern",
        unis: [
            "All Nations University",
            "Koforidua Technical University",
            "Presbyterian University Ghana",
            "University College of Agriculture and Environmental Studies",
            "University of Environment and Sustainable Development"
        ]
    },
    {
        region: "Western / Western North",
        unis: [
            "Takoradi Technical University",
            "University of Mines and Technology (UMaT)"
        ]
    },
    {
        region: "Volta / Oti",
        unis: [
            "Evangelical Presbyterian University",
            "Ho Technical University",
            "University of Health and Allied Sciences (UHAS)"
        ]
    },
    {
        region: "Northern / NE / Savannah",
        unis: [
            "Tamale Technical University",
            "University for Development Studies (UDS)"
        ]
    },
    {
        region: "Bono / Bono East / Ahafo",
        unis: [
            "Catholic University of Ghana",
            "Sunyani Technical University",
            "University of Energy and Natural Resources (UENR)"
        ]
    },
    {
        region: "Upper East",
        unis: [
            "Bolgatanga Technical University",
            "CK Tedam Uni of Technology & Applied Sciences"
        ]
    },
    {
        region: "Upper West",
        unis: [
            "Dr. Hilla Limann Technical University",
            "SDD-UBIDS (Wa)"
        ]
    }
];

export const ALL_UNIVERSITIES = REGIONAL_UNIVERSITIES.flatMap(r => r.unis).sort();

/** Map of URL slug → school metadata used by /schools/[slug] pages */
export const SCHOOLS_MAP: Record<string, {
    name: string;
    shortName: string;
    city: string;
    region: string;
    color: string; // Tailwind gradient classes
    description: string;
    areas?: string[];
}> = {
    "knust": {
        name: "Kwame Nkrumah University of Science and Technology",
        shortName: "KNUST",
        city: "Kumasi",
        region: "Ashanti",
        color: "from-yellow-600 to-orange-700",
        description: "Ghana's leading science and technology university located in Kumasi, Ashanti region.",
        areas: ["Ayeduase", "Kotei", "Maxima", "Bomso", "Kentinkrono"],
    },
    "ug": {
        name: "University of Ghana (Legon)",
        shortName: "UG Legon",
        city: "Accra",
        region: "Greater Accra",
        color: "from-blue-700 to-indigo-800",
        description: "Ghana's premier university, located at Legon, Accra. Home to thousands of undergraduate and postgraduate students.",
        areas: ["Legon", "Madina", "Atomic Junction", "Adenta", "Haatso"],
    },
    "ucc": {
        name: "University of Cape Coast",
        shortName: "UCC",
        city: "Cape Coast",
        region: "Central",
        color: "from-green-700 to-teal-800",
        description: "One of Ghana's leading universities situated in the historic Cape Coast.",
        areas: ["Pedu", "Kwaprow", "Abura", "Oguaa"],
    },
    "gctu": {
        name: "Ghana Communication Technology University",
        shortName: "GCTU",
        city: "Accra",
        region: "Greater Accra",
        color: "from-purple-700 to-violet-800",
        description: "A technology-focused university in Tesano, Accra. Formerly Ghana Telecom University College.",
        areas: ["Tesano", "Achimota", "Abelemkpe", "Dzorwulu"],
    },
    "uhas": {
        name: "University of Health and Allied Sciences",
        shortName: "UHAS",
        city: "Ho",
        region: "Volta",
        color: "from-pink-700 to-rose-800",
        description: "Ghana's dedicated health sciences university, located in Ho, Volta Region.",
        areas: ["Ho", "Sokode", "Kpando"],
    },
    "uds": {
        name: "University for Development Studies",
        shortName: "UDS",
        city: "Tamale",
        region: "Northern",
        color: "from-cyan-700 to-sky-800",
        description: "A multi-campus development-focused university with campuses across northern Ghana.",
        areas: ["Tamale", "Nyankpala", "Wa", "Navrongo"],
    },
    "uew": {
        name: "University of Education, Winneba",
        shortName: "UEW",
        city: "Winneba",
        region: "Central",
        color: "from-red-700 to-orange-800",
        description: "Ghana's university dedicated to teacher education, with campuses in Winneba and Kumasi.",
        areas: ["Winneba", "Kumasi Campus"],
    },
    "umat": {
        name: "University of Mines and Technology",
        shortName: "UMaT",
        city: "Tarkwa",
        region: "Western",
        color: "from-stone-600 to-zinc-800",
        description: "Specialist university for mining and technology in Tarkwa, Western Region.",
        areas: ["Tarkwa", "Bogoso"],
    },
    "upsa": {
        name: "UPSA",
        shortName: "UPSA",
        city: "Accra",
        region: "Greater Accra",
        color: "from-teal-700 to-cyan-800",
        description: "University of Professional Studies, Accra — a leading business and professional education institution.",
        areas: ["Legon", "Adenta", "Madina"],
    },
    "gimpa": {
        name: "GIMPA",
        shortName: "GIMPA",
        city: "Accra",
        region: "Greater Accra",
        color: "from-slate-700 to-gray-800",
        description: "Ghana Institute of Management and Public Administration — a leading management school in Greenhill, Accra.",
        areas: ["Greenhill", "Achimota", "East Legon"],
    },
};
