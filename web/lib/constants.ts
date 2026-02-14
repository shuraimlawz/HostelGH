export const GHANA_BANKS = [
    "GCB Bank",
    "EcoBank Ghana",
    "Zenith Bank Ghana",
    "Absa Bank Ghana",
    "Stanbic Bank Ghana",
    "Fidelity Bank Ghana",
    "Standard Chartered Bank",
    "CalBank",
    "ADB Bank",
    "Republic Bank",
    "Universal Merchant Bank (UMB)",
    "Prudential Bank",
    "Guaranty Trust Bank (GTBank)",
    "Access Bank Ghana",
    "First Atlantic Bank",
    "Société Générale Ghana",
    "National Investment Bank (NIB)",
    "Consolidated Bank Ghana (CBG)"
].sort();

export const GHANA_MOMO_PROVIDERS = [
    "MTN Mobile Money",
    "Telecel Cash (formerly Vodafone)",
    "AirtelTigo Money"
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
