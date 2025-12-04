// Fetch all blocks from a channel
export async function getChannelBlocks(channelSlug) {
  const response = await fetch(`https://api.are.na/v2/channels/${channelSlug}`);
  if (!response.ok) throw new Error("Channel not found");
  const data = await response.json();
  return data.contents || [];
}

// Fetch blocks from a user
export async function getUserBlocks(username) {
  const response = await fetch(`https://api.are.na/v2/users/${username}`);
  if (!response.ok) throw new Error("User not found");
  const data = await response.json();
  return data.blocks || [];
}

// Get random block from array
export function getRandomBlock(blocks) {
  if (!blocks.length) return null;
  return blocks[Math.floor(Math.random() * blocks.length)];
}
