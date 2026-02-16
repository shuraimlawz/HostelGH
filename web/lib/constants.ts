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
