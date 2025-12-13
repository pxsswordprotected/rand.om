// Helper to parse Are.na URL or slug
export function parseArenaInput(input) {
  input = input.trim();

  if (input.startsWith("http")) {
    const match = input.match(/are\.na\/[^/]+\/([^/?]+)/);
    return match ? match[1] : input;
  }

  return input;
}

// Fisher-Yates shuffle algorithm
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fetch ALL blocks from a channel with pagination
export async function getChannelBlocks(input) {
  const channelSlug = parseArenaInput(input);

  let allBlocks = [];
  let page = 1;
  const perPage = 100; // Max allowed by Are.na

  while (true) {
    const response = await fetch(
      `https://api.are.na/v2/channels/${channelSlug}?per=${perPage}&page=${page}`,
    );

    if (!response.ok) throw new Error("Channel not found");

    const data = await response.json();
    const blocks = (data.contents || []).filter((block) => block && block.id);

    if (blocks.length === 0) break; // No more blocks

    allBlocks = allBlocks.concat(blocks);

    // If we got fewer than per Page, we're on the last page
    if (blocks.length < perPage) break;

    page++;
  }

  return allBlocks;
}
