# HostelGH Codebase Structure Exploration

## 1. Prisma Schema: School-Hostel Relationships

### Current Implementation
**Important Note:** There is **NO explicit School model** in the Prisma schema. Schools are managed as **denormalized data** through the Hostel model and constants.

### Hostel Model (Relevant Fields)
```prisma
model Hostel {
  id          String  @id @default(cuid())
  ownerId     String
  name        String
  description String?
  addressLine String
  city        String
  region      String?
  country     String  @default("GH")

  // Location Data
  latitude  Float?
  longitude Float?

  // School/University Association (Denormalized)
  university String?  // Stores university name as STRING, not a foreign key

  images     String[] @default([])
  amenities  String[] @default([])

  // Gender & Room Configuration
  genderCategory    RoomGender?

  // Booking & Availability
  bookingStatus     HostelBookingStatus @default(OPEN)
  minPrice      Int?

  // Relations
  owner      User             @relation("HostelOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  rooms      Room[]
  facilities HostelFacility[]
  bookings   Booking[]
  reviews    Review[]
  favorites  Favorite[]

  @@index([ownerId])
  @@index([city])
  @@index([isPublished])
}

model Room {
  id           String   @id @default(cuid())
  hostelId     String
  name         String   // e.g. "2-in-1", "4-in-1"
  description  String?
  capacity     Int
  totalUnits   Int
  pricePerTerm Int

  // Room Configuration (Ghana-specific)
  roomConfiguration String // "1 in a room", "2 in a room", etc.
  gender            RoomGender @default(MIXED)
  totalSlots        Int
  availableSlots    Int
  hasAC             Boolean    @default(false)
  utilitiesIncluded String[]   @default([])

  status    RoomStatus @default(AVAILABLE)
  hostel    Hostel     @relation(fields: [hostelId], references: [id], onDelete: Cascade)
  bookings  BookingItem[]

  @@index([hostelId])
  @@index([isActive])
  @@index([gender])
}
```

### Location Data Structure
- **Hostel Fields**: `latitude`, `longitude` (Float) - Nullable
- **Hostel Fields**: `city` (String) - Required
- **Hostel Fields**: `region` (String) - Optional
- **Hostel Fields**: `addressLine` (String) - Required

**Current State**: Location fields exist but may not be fully populated for all hostels.

---

## 2. School-University System (Frontend Constants)

### SCHOOLS_MAP Structure
Located in: `web/lib/constants.ts`

**Format**: `Record<string, SchoolMetadata>`

```typescript
export const SCHOOLS_MAP: Record<string, {
    name: string;           // Full university name
    shortName: string;      // Abbreviated name (for UI)
    city: string;           // City where located
    region: string;         // Administrative region
    color: string;          // Tailwind gradient for UI
    description: string;    // Marketing description
    areas?: string[];       // Surrounding areas/neighborhoods
}> = {
    "knust": {
        name: "Kwame Nkrumah University of Science and Technology",
        shortName: "KNUST",
        city: "Kumasi",
        region: "Ashanti",
        color: "from-yellow-600 to-orange-700",
        description: "Ghana's leading science and technology university...",
        areas: ["Ayeduase", "Kotei", "Maxima", "Bomso", "Kentinkrono"],
    },
    "ug": {
        name: "University of Ghana (Legon)",
        shortName: "UG Legon",
        city: "Accra",
        region: "Greater Accra",
        color: "from-blue-700 to-indigo-800",
        areas: ["Legon", "Madina", "Atomic Junction", "Adenta", "Haatso"],
    },
    // ... 8+ more schools mapped similarly
};
```

### Supported Schools (Slug Mapping)
1. **knust** - Kwame Nkrumah University of Science and Technology (Kumasi)
2. **ug** - University of Ghana (Legon) (Accra)
3. **ucc** - University of Cape Coast (Cape Coast)
4. **gctu** - Ghana Communication Technology University (Accra)
5. **uhas** - University of Health and Allied Sciences (Ho)
6. **uds** - University for Development Studies (Tamale)
7. **uew** - University of Education, Winneba (Winneba)
8. **umat** - University of Mines and Technology (Tarkwa)
9. **upsa** - UPSA (Accra)
10. **gimpa** - GIMPA (Accra)

### Additional University Lists
- `REGIONAL_UNIVERSITIES` - Complete list of 100+ Ghanaian universities organized by region
- `ALL_UNIVERSITIES` - Flattened array of all universities (used for dropdowns)

---

## 3. Schools Page Implementation

### URL Structure
- **Main Page**: `/schools` - Displays all 10 featured schools with grid layout
- **School Page**: `/schools/[slug]` - Dynamic page for each school (e.g., `/schools/knust`)

### Main Schools Page (`web/app/(public)/schools/page.tsx`)
**Type**: Static Server Component

**Features**:
- Displays all schools from `SCHOOLS_MAP` in a responsive grid
- Each school card shows:
  - Short name
  - Full name
  - City and region
  - Up to 3 popular areas/neighborhoods
  - Colored gradient bar for branding
- Includes catchall "All Other Universities" link to `/hostels`

### School Detail Page (`web/app/(public)/schools/[slug]/page.tsx`)
**Type**: Client Component (uses `"use client"` and React Query)

**URL Parameters**: `slug` (e.g., "knust", "ug")

**Functionality**:
```typescript
// 1. Resolves slug to school metadata from SCHOOLS_MAP
const school = SCHOOLS_MAP[slug];

// 2. Fetches hostels using React Query with two fallback strategies:
const { data: hostels } = useQuery({
    queryKey: ["school-hostels", slug],
    queryFn: async () => {
        // Primary: Filter by university name
        const { data } = await api.get("/hostels/public", {
            params: { 
                university: school.name,  // e.g., "University of Ghana (Legon)"
                sort: "relevance", 
                limit: 40 
            },
        });
        
        // Fallback: If no results, filter by city
        if (!Array.isArray(data) || data.length === 0) {
            const { data: cityData } = await api.get("/hostels/public", {
                params: { 
                    city: school.city,      // e.g., "Accra"
                    sort: "relevance", 
                    limit: 40 
                },
            });
            return Array.isArray(cityData) ? cityData : [];
        }
        return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5-minute cache
});
```

**Display Components**:
- Header with school name and region
- Statistics strip showing: hostels count, available now, starting price
- Popular areas section (links to `/hostels?city=AREA`)
- Hostel grid showing all matching hostels
- Owner CTA ("Own a Hostel Near [School]?")

### Filter Query Examples
- `/hostels?university=University%20of%20Ghana%20(Legon)` - Direct university filter
- `/hostels?city=Accra` - Fallback city-based filter
- `/schools/knust` → queries with `university: "Kwame Nkrumah University of Science and Technology"`

---

## 4. Search & Filter Functionality

### Search Flow Diagram
```
User Input (HostelFilters)
    ↓
Multiple Filter Parameters
    ↓
API Call to /hostels/public
    ↓
Backend publicSearch() with Smart Parsing
    ↓
Prisma Query with Complex Where Clause
    ↓
Results with Redis Caching
```

### HostelFilters Component (`web/components/hostels/HostelFilters.tsx`)

**Filter Parameters**:
1. **Query** - Free text search (global search across name, city, university, description)
2. **University** - Dropdown (REGIONAL_UNIVERSITIES from constants)
3. **Gender** - Select: Any Gender, Male Hostels, Female Hostels, Mixed Hostels
4. **Advanced Filters** (in Popover):
   - Room Configuration: "1 in a room" through "6 in a room"
   - Price Range: Min/Max monthly budget (in GHS, converted to pesewas)
   - Amenities: WiFi, AC, Laundry, Swimming Pool, Parking, Security, Study Room, Generator

**URL Parameter Encoding**:
```
/hostels?
  query=near%20legon
  &university=University%20of%20Ghana
  &gender=MALE
  &roomConfig=2%20in%20a%20room
  &minPrice=100000       // in pesewas (1,000 GHS = 100,000 pesewas)
  &maxPrice=500000
  &amenities=WiFi,AC
```

### Backend Search Service (`apps/api/src/modules/hostels/hostels.service.ts`)

**publicSearch() Method Features**:

#### 1. Smart Natural Language Parsing
```typescript
// Price extraction: "cheap", "affordable", "under 3000"
if (searchQuery.includes("cheap")) {
    maxPriceFilter = 1500 * 100; // Set max to 1500 GHS
}
const underMatch = searchQuery.match(/(?:under|below|less than|max)\s*(\d+)/);
if (underMatch) {
    maxPriceFilter = parseInt(underMatch[1], 10) * 100;
}

// Gender extraction: "female", "girls", "ladies", "women", etc.
if (searchQuery.includes("female") || searchQuery.includes("girls")) {
    genderFilter = "FEMALE";
}

// Room config extraction: "single", "2 in a room", "2 in 1"
if (searchQuery.includes("single") || searchQuery.includes("1 in a room")) {
    roomConfigFilter = "1 in a room";
}

// Amenity extraction: "wifi", "ac", "internet"
if (searchQuery.includes("ac") || searchQuery.includes("air condition")) {
    amenitiesFilter.push("AC");
}

// School proximity: "near Legon", "close to KNUST"
const nearMatch = searchQuery.match(/(?:near|close to|around|at)\s+([a-zA-Z\s]+)/);
if (nearMatch) {
    // Matches against ALIASES: "legon" → "University of Ghana"
}
```

#### 2. Alias Mapping
```typescript
const ALIASES: Record<string, string[]> = {
    "legon": ["University of Ghana", "UG"],
    "knust": ["Kwame Nkrumah University", "Tech"],
    "ucc": ["University of Cape Coast"],
    // ...
};
```

#### 3. Prisma Filter Query
```typescript
const results = await this.prisma.hostel.findMany({
    where: {
        isPublished: true,
        city: city ? { contains: city, mode: "insensitive" } : undefined,
        region: region ? { equals: region, mode: "insensitive" } : undefined,
        university: universityFilter
            ? { contains: universityFilter, mode: "insensitive" }
            : undefined,
        gender: genderFilter ? { equals: genderFilter as any } : undefined,
        
        // Global search across multiple fields
        OR: searchQuery ? [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { city: { contains: searchQuery, mode: "insensitive" } },
            { university: { contains: searchQuery, mode: "insensitive" } },
            { description: { contains: searchQuery, mode: "insensitive" } },
        ] : undefined,
        
        // Amenities (must contain all selected)
        amenities: amenitiesFilter?.length > 0
            ? { hasEvery: amenitiesFilter }
            : undefined,
            
        bookingStatus: { not: "CLOSED" },
        
        // Price range filter
        minPrice: minPriceFilter !== undefined || maxPriceFilter !== undefined
            ? { gte: minPriceFilter, lte: maxPriceFilter }
            : undefined,
        
        // Room availability filter
        rooms: {
            some: {
                isActive: true,
                availableSlots: { gt: 0 },
                roomConfiguration: roomConfigFilter ? { equals: roomConfigFilter } : undefined,
            },
        },
    },
    include: { rooms: { where: { isActive: true } } },
    orderBy: orderBy,
    skip: (page - 1) * limit,
    take: limit,
});
```

#### 4. Sorting Options
- **relevance** - Featured (desc) → Bookings count (desc) → Rating (desc) → Recency (desc)
- **price_asc** - Minimum price ascending
- **price_desc** - Minimum price descending
- **name_asc** - Name alphabetically
- **default/newest** - Creation date descending

#### 5. Caching
```typescript
const cacheKey = `search:${JSON.stringify(params)}`;
const cached = await this.redis.getJson<any[]>(cacheKey);
if (cached) return cached;

// ... perform search ...

await this.redis.setJson(cacheKey, results, 300); // 5-minute TTL
```

#### 6. Pagination
- Default limit: 12 hostels per page
- Infinite scroll with React Query's `useInfiniteQuery`
- Tracks page param in URL

### Search Example Queries
```
1. "female hostels near legon"
   → Parsed as: gender=FEMALE, university=University of Ghana, city=Accra

2. "cheap 2 in a room with wifi under 2000"
   → Parsed as: maxPrice=200000, roomConfig="2 in a room", amenities=["WiFi"]

3. "/hostels?university=KNUST&minPrice=150000&maxPrice=500000"
   → Direct parametric search for KNUST hostels in price range

4. "/schools/knust" 
   → Queries: /hostels/public?university=Kwame%20Nkrumah%20University&sort=relevance&limit=40
```

---

## 5. Data Structure Summary

### Key Data Models

#### Hostel Entity
```typescript
{
    id: string;
    ownerId: string;
    name: string;
    description: string | null;
    addressLine: string;
    city: string;              // Used for city-based filtering
    region: string | null;
    country: string;           // Default: "GH"
    
    // Location coordinates
    latitude: number | null;
    longitude: number | null;
    
    // School association (denormalized string)
    university: string | null; // E.g., "University of Ghana (Legon)"
    
    // Room & Amenity Data
    amenities: string[];       // E.g., ["WiFi", "AC", "Security"]
    minPrice: number | null;   // In pesewas (integer)
    
    // Booking state
    bookingStatus: "OPEN" | "LIMITED" | "CLOSED" | "FULL";
    
    // Gender category
    genderCategory: "MALE" | "FEMALE" | "MIXED" | null;
    
    // Featured/publishing
    isFeatured: boolean;
    isPublished: boolean;
    
    // Relationships
    rooms: Room[];            // Room inventory
    owner: User;              // Hostel owner
    reviews: Review[];        // Student reviews
    favorites: Favorite[];    // User favorites
}
```

#### Room Entity
```typescript
{
    id: string;
    hostelId: string;
    name: string;             // E.g., "2-in-1", "4-in-1"
    capacity: number;         // Tenants per room
    totalSlots: number;       // Total available slots
    availableSlots: number;   // Current availability
    
    // Configuration & pricing
    roomConfiguration: string; // "1 in a room", "2 in a room", etc.
    gender: "MALE" | "FEMALE" | "MIXED";
    pricePerTerm: number;     // In pesewas (integer)
    
    hasAC: boolean;
    utilitiesIncluded: string[]; // ["water", "light", "gas"]
    status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "ARCHIVED";
    isActive: boolean;
}
```

#### School Metadata (Constants)
```typescript
{
    name: string;          // "University of Ghana (Legon)"
    shortName: string;     // "UG Legon"
    city: string;          // "Accra"
    region: string;        // "Greater Accra"
    color: string;         // Tailwind classes
    description: string;   // Marketing text
    areas: string[];       // ["Legon", "Madina", "Atomic Junction", ...]
}
```

---

## 6. API Endpoints Used

### Public Hostel Search
```
GET /hostels/public
Query Parameters:
- query?: string              // Free text search
- university?: string         // Filter by university name
- city?: string              // Filter by city
- region?: string            // Filter by region
- minPrice?: number          // Min monthly rent (pesewas)
- maxPrice?: number          // Max monthly rent (pesewas)
- gender?: string            // "MALE" | "FEMALE" | "MIXED"
- roomConfig?: string        // "1 in a room", "2 in a room", etc.
- amenities?: string[]       // ["WiFi", "AC", ...]
- sort?: string              // "relevance" | "price_asc" | "price_desc" | "name_asc"
- limit?: number             // Default: 12
- page?: number              // Default: 1
```

### Get Hostel by ID
```
GET /hostels/public/:id
```

---

## 7. Current Limitations & Architecture Notes

### School-Hostel Relationship Design
**Denormalized Approach** (Current):
- Hostels store `university` as a simple STRING field
- No direct database relationship/foreign key
- Pros: Flexible, supports many-to-many implicitly
- Cons: No referential integrity, string matching required

**Alternative** (Not Implemented):
- Could create explicit `School` model with 1:N relationship to Hostels
- Would require major schema migration
- Would enable better data validation and querying

### Location Data
- `latitude` and `longitude` fields exist but may not be fully populated
- City-based filtering is the primary fallback when university name doesn't match
- No geospatial queries currently implemented (PostGIS not in use)

### Search Limitations
- Meilisearch integration commented out/disabled (Phase 2 feature)
- Currently relies on Prisma string matching with `insensitive` mode
- Smart parsing works well for natural language but may miss edge cases
- Cache invalidation is time-based (5 minutes) not event-based

### Frontend Architecture
- Schools page is semi-static (hardcoded SCHOOLS_MAP for 10 featured schools)
- All other universities are accessible via `/hostels` with university filter
- No dedicated "university listing" page - uses generic hostel search with university param

---

## 8. Filter/Search Flow Example

### Scenario: User searches "female hostels under 2000 near KNUST"

1. **Frontend** (HostelFilters.tsx):
   - Captures input in search box
   - User presses Enter or clicks "Apply"
   
2. **Query Building**:
   ```
   Query: "female hostels under 2000 near KNUST"
   ```

3. **Backend Parsing** (publicSearch):
   ```typescript
   // Gender extraction
   genderFilter = "FEMALE"
   
   // Price extraction
   underMatch = "2000"
   maxPriceFilter = 200000  // pesewas
   
   // School extraction
   nearMatch = "KNUST"
   universityFilter = "Kwame Nkrumah University of Science and Technology"
   
   // Build WHERE clause with all filters
   ```

4. **Database Query**:
   ```prisma
   WHERE {
     isPublished: true
     gender: FEMALE
     minPrice: { lte: 200000 }
     university: { contains: "Kwame Nkrumah..." }
     rooms: {
       some: {
         isActive: true
         availableSlots: { gt: 0 }
       }
     }
   }
   ORDER BY isFeatured DESC, _count.bookings DESC, rating DESC
   ```

5. **Results**: Filtered hostel list returned with pagination

---

## 9. Key Files Reference

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models (Hostel, Room, User, etc.) |
| `web/lib/constants.ts` | SCHOOLS_MAP, REGIONAL_UNIVERSITIES, etc. |
| `web/app/(public)/schools/page.tsx` | Schools listing page |
| `web/app/(public)/schools/[slug]/page.tsx` | School detail page with hostel filtering |
| `web/app/(public)/hostels/page.tsx` | Main hostel search & listing page |
| `web/components/hostels/HostelFilters.tsx` | Filter UI component |
| `web/components/hostels/SortBar.tsx` | Sort options UI |
| `apps/api/src/modules/hostels/hostels.service.ts` | Backend search/filter logic |

---

## 10. Next Steps for Enhancement

Potential improvements based on current architecture:

1. **Explicit School Model**: Create School model in Prisma for better data integrity
2. **Geospatial Queries**: Implement PostGIS for distance-based filtering ("5km from campus")
3. **Meilisearch**: Re-enable full-text search with typo tolerance and relevance ranking
4. **Dynamic School Pages**: Generate school pages dynamically from database instead of hardcoded constants
5. **Availability Tracking**: Implement real-time slot availability caching
6. **Review-based Filtering**: Add filter by minimum rating/review count
7. **Roommate Matching**: Leverage existing `roommateMatchingPrefs` data for personalized recommendations
