export interface Listing {
  id: string;
  address: string;
  city: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  school_rating: number;
  walk_score: number;
  days_on_market: number;
  description: string;
  why?: string;
}

export default function ListingCard({ listing, rank }: { listing: Listing; rank: number }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-500/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="font-mono">#{rank}</span>
            <span>
              {listing.neighborhood} · {listing.city}
            </span>
          </div>
          <h3 className="mt-1 text-lg font-semibold">{listing.address}</h3>
          <p className="mt-1 text-sm text-white/60">{listing.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xl font-bold text-emerald-300">
            ${listing.price.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-white/50">
            {listing.beds} bd · {listing.baths} ba · {listing.sqft.toLocaleString()} sqft
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded bg-white/5 px-2 py-1">schools {listing.school_rating}/10</span>
        <span className="rounded bg-white/5 px-2 py-1">walk {listing.walk_score}</span>
        <span className="rounded bg-white/5 px-2 py-1">{listing.days_on_market}d on market</span>
      </div>
      <p className="mt-3 border-l-2 border-emerald-500/50 pl-3 text-xs italic text-emerald-100/70">
        {listing.why}
      </p>
    </article>
  );
}
