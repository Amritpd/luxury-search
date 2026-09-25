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
    <article className="rounded-[24px] border border-stone-200 bg-white/70 p-5 shadow-[0_4px_20px_rgba(27,29,26,0.04)] transition hover:border-[#a88f5b] hover:shadow-[0_8px_30px_rgba(27,29,26,0.08)]">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-bold text-[#f7f3ee] bg-[#2d4039] px-2 py-0.5 rounded-full text-[11px]">
              Rank #{rank}
            </span>
            <span className="font-medium text-[#a88f5b] uppercase tracking-[0.14em] text-[11px]">
              {listing.neighborhood} · {listing.city}
            </span>
          </div>
          <h3 className="mt-1.5 text-xl font-semibold text-stone-900">{listing.address}</h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">{listing.description}</p>
        </div>
        <div className="shrink-0 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
          <div className="text-2xl font-bold text-[#2d4039]">
            ${listing.price.toLocaleString()}
          </div>
          <div className="mt-1 text-xs font-medium text-stone-500">
            {listing.beds} bd · {listing.baths} ba · {listing.sqft.toLocaleString()} sqft
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-1 text-stone-700 font-medium">
          Schools <span className="font-bold text-[#2d4039]">{listing.school_rating}/10</span>
        </span>
        <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-1 text-stone-700 font-medium">
          Walk Score <span className="font-bold text-[#2d4039]">{listing.walk_score}</span>
        </span>
        <span className="rounded-full bg-stone-100 border border-stone-200 px-2.5 py-1 text-stone-700 font-medium">
          {listing.days_on_market}d on market
        </span>
      </div>

      {listing.why && (
        <div className="mt-3.5 rounded-xl border border-[#a88f5b]/25 bg-[#a88f5b]/10 p-3 text-xs leading-relaxed text-stone-800">
          <span className="font-semibold text-[#a88f5b] uppercase tracking-wider text-[10px] block mb-0.5">
            AI Match Rationale
          </span>
          {listing.why}
        </div>
      )}
    </article>
  );
}
