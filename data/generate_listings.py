#!/usr/bin/env python3
"""Generate ~5,000 synthetic real-estate listings for Austin, Denver, Phoenix.

Deterministic (seeded). Writes:
  - data/listings.json  (used by the seed script for embeddings + OpenSearch)
  - data/seed.sql        (Postgres source of truth)
"""
import json
import random

random.seed(42)

CITIES = {
    "Austin": {
        "center": (30.2672, -97.7431),
        "neighborhoods": [
            ("Zilker", 700_000, 1_400_000),
            ("Hyde Park", 525_000, 950_000),
            ("Mueller", 600_000, 1_050_000),
            ("Westlake", 1_200_000, 3_500_000),
            ("Round Rock", 340_000, 640_000),
        ],
    },
    "Denver": {
        "center": (39.7392, -104.9903),
        "neighborhoods": [
            ("LoHi", 650_000, 1_300_000),
            ("Cherry Creek", 800_000, 2_200_000),
            ("Washington Park", 700_000, 1_500_000),
            ("RiNo", 500_000, 950_000),
            ("Stapleton", 550_000, 900_000),
        ],
    },
    "Phoenix": {
        "center": (33.4484, -112.0740),
        "neighborhoods": [
            ("Arcadia", 750_000, 1_800_000),
            ("Biltmore", 600_000, 1_400_000),
            ("Desert Ridge", 550_000, 1_100_000),
            ("Downtown", 350_000, 750_000),
            ("Ahwatukee", 450_000, 850_000),
        ],
    },
}

STYLES = [
    "modern farmhouse", "mid-century ranch", "craftsman bungalow",
    "contemporary", "mediterranean villa", "brick traditional",
    "desert contemporary", "tudor revival",
]
FEATURES = [
    "chef's kitchen with quartz counters", "primary suite with spa-like bath",
    "mature shade trees", "covered patio with outdoor kitchen",
    "dedicated home office", "3-car garage", "walk-in pantry",
    "hardwood floors throughout", "resort-style backyard with pool",
    "open floor plan with vaulted ceilings", "new roof and HVAC (2023)",
    "butler's pantry", "owned solar array", "casita ideal for guests",
]
WALK_FLAVOR = {
    (80, 100): "steps to coffee shops, dining, and daily errands",
    (60, 79): "an easy stroll to neighborhood amenities",
    (40, 59): "a short drive to shopping and restaurants",
    (0, 39): "a quiet, car-friendly setting",
}
AGENTS = [
    "Noble Black", "Maya Chen", "Desert Rose Realty", "Lone Star Homes",
    "Mile High Properties", "Cactus & Co. Realty", "Hill Country Group",
]
STREETS = ["Oak", "Maple", "Cedar", "Willow", "Juniper", "Magnolia", "Elm", "Pecan"]
TYPES = ["house", "house", "house", "house", "condo", "townhome"]


def walk_text(score: int) -> str:
    for (lo, hi), text in WALK_FLAVOR.items():
        if lo <= score <= hi:
            return text
    return ""


def make_listing(i: int) -> dict:
    city = random.choice(list(CITIES.keys()))
    info = CITIES[city]
    neighborhood, p_lo, p_hi = random.choice(info["neighborhoods"])
    price = random.randint(p_lo // 1000, p_hi // 1000) * 1000
    beds = random.choices([2, 3, 3, 4, 4, 5], k=1)[0]
    baths = round(random.uniform(1.5, beds), 1)
    sqft = int(beds * random.uniform(380, 520) + random.uniform(-150, 400))
    school_rating = random.randint(4, 10)
    walk_score = random.randint(25, 98)
    dom = random.randint(0, 90)
    ptype = random.choice(TYPES)
    style = random.choice(STYLES)
    feats = random.sample(FEATURES, 3)
    school_bit = (
        f"Zoned for highly rated schools ({school_rating}/10). "
        if school_rating >= 8 else ""
    )
    description = (
        f"{beds}-bed, {baths}-bath {style} in {neighborhood}. "
        f"{sqft:,} sqft featuring {feats[0]}, {feats[1]}, and {feats[2]}. "
        f"{school_bit}{walk_text(walk_score).capitalize()}."
    )
    lat = info["center"][0] + random.uniform(-0.09, 0.09)
    lon = info["center"][1] + random.uniform(-0.09, 0.09)
    return {
        "id": f"LST-{i:05d}",
        "address": f"{random.randint(100, 9899)} {random.choice(STREETS)} St",
        "city": city,
        "neighborhood": neighborhood,
        "price": price,
        "beds": beds,
        "baths": baths,
        "sqft": sqft,
        "lat": round(lat, 5),
        "lon": round(lon, 5),
        "property_type": ptype,
        "school_rating": school_rating,
        "walk_score": walk_score,
        "days_on_market": dom,
        "description": description,
        "agent": random.choice(AGENTS),
    }


def main() -> None:
    listings = [make_listing(i) for i in range(1, 5001)]

    with open("data/listings.json", "w") as f:
        json.dump(listings, f)

    with open("data/seed.sql", "w") as f:
        f.write(
            """CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY, address TEXT, city TEXT, neighborhood TEXT,
  price INT, beds INT, baths NUMERIC, sqft INT,
  lat NUMERIC, lon NUMERIC, property_type TEXT,
  school_rating INT, walk_score INT, days_on_market INT,
  description TEXT, agent TEXT
);
"""
        )
        for j in range(0, len(listings), 500):
            batch = listings[j : j + 500]
            vals = []
            for L in batch:
                desc = L["description"].replace("'", "''")
                vals.append(
                    "('%s','%s','%s','%s',%d,%d,%s,%d,%s,%s,'%s',%d,%d,%d,'%s','%s')"
                    % (
                        L["id"], L["address"], L["city"], L["neighborhood"],
                        L["price"], L["beds"], L["baths"], L["sqft"],
                        L["lat"], L["lon"], L["property_type"],
                        L["school_rating"], L["walk_score"],
                        L["days_on_market"], desc, L["agent"],
                    )
                )
            f.write(
                "INSERT INTO listings (id,address,city,neighborhood,price,beds,"
                "baths,sqft,lat,lon,property_type,school_rating,walk_score,"
                "days_on_market,description,agent) VALUES\n"
                + ",\n".join(vals)
                + " ON CONFLICT (id) DO NOTHING;\n"
            )
    print(f"Wrote {len(listings)} listings -> data/listings.json, data/seed.sql")


if __name__ == "__main__":
    main()
