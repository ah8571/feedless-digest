// Quick test: try to find article cover image URLs
const tweetIds = ['2077114326985687525', '2076938757744513276', '2077156239059107867'];

for (const id of tweetIds) {
  // Try known X media URL patterns
  const urls = [
    `https://pbs.twimg.com/card_img/${id}?format=jpg&name=medium`,
    `https://pbs.twimg.com/card_img/${+id - 1}?format=jpg&name=medium`,
  ];
  for (const u of urls) {
    const r = await fetch(u, { redirect: 'manual' });
    if (r.status !== 404) console.log('HIT:', r.status, u.slice(0, 90));
  }
}
console.log('Done scanning patterns');
