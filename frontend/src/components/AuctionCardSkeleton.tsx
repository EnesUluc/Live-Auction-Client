export function AuctionCardSkeleton() {
  return (
    <article className="auction-card" aria-hidden="true">
      <div className="row between">
        <span className="skeleton" style={{ width: 66, height: 22, borderRadius: 99 }} />
        <span className="skeleton" style={{ width: 84, height: 14 }} />
      </div>
      <div className="stack gap-8">
        <span className="skeleton" style={{ width: '76%', height: 19 }} />
        <span className="skeleton" style={{ width: '100%', height: 13 }} />
        <span className="skeleton" style={{ width: '58%', height: 13 }} />
      </div>
      <div className="row gap-16">
        <span className="skeleton grow" style={{ height: 42 }} />
        <span className="skeleton grow" style={{ height: 42 }} />
      </div>
      <span className="skeleton" style={{ width: 118, height: 31 }} />
    </article>
  )
}
