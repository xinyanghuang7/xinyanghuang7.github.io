# Daily realtime input gate for Module 3 / Module 4

Module 3 and Module 4 are the highest-freshness parts of the daily blog. A post may be well-structured and still fail if these modules are stale.

## Required before drafting

Build a daily realtime input packet containing:

1. True holdings
   - ticker
   - current/delayed price snapshot
   - source and timestamp
   - 2-3 latest/relevant news nodes
   - GMT+8 converted time
   - source link
   - fact summary
   - thesis/action implication

2. Local watchlist
   - every local watchlist ticker independently
   - price snapshot
   - news retrieval result
   - fact nodes 1/2/3, or explicit no-fresh-hard-node state
   - last verifiable node date if fresh news is unavailable
   - next watchpoint

3. Creator digest
   - fixed sources: 美投君 / 本地美投系统 / 环球视野财经
   - latest video / transcript status
   - failure reason if transcript is unavailable
   - no inferred trading numbers from title-only results

4. CSP radar
   - option chain source
   - generation timestamp
   - screening criteria
   - concrete contracts or explicit unavailable state

## Publish blockers

Do not publish if:

- Module 4 contains a ticker that was not independently checked today.
- A watchlist ticker is hidden inside a merged row.
- A stale node is presented as fresh news.
- Creator retrieval failed but the post fabricates a digest.
- CSP has only vague ranges instead of contract rows when option data is available.

## Acceptable unavailable wording

If a ticker has no fresh node after retrieval:

> 当日检索未发现新的公司级硬节点；沿用最后可验证节点（YYYY-MM-DD，source），下一观察点是 ...

This is acceptable only if retrieval was actually attempted and recorded.
