import { useState, useCallback } from "react";
import { getChannelBlocks, shuffleArray } from "../services/arenaService";

// Preload image before displaying block
const preloadImage = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve();
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = url;
  });
};

// Preload video metadata before displaying block
const preloadVideo = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve();
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = video.onerror = () => resolve();
    video.src = url;
  });
};

export function useArenaChannel() {
  const [blocks, setBlocks] = useState([]);
  const [index, setIndex] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [channelSlug, setChannelSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadChannel = useCallback(async (slug) => {
    setLoading(true);
    setError("");
    setCurrentBlock(null);

    try {
      const fetched = await getChannelBlocks(slug);

      if (fetched.length === 0) {
        setError("Channel is empty");
        setChannelSlug("");
        setLoading(false);
        return;
      }

      const shuffled = shuffleArray(fetched);
      const first = shuffled[0];

      if (first.image?.display?.url) {
        await preloadImage(first.image.display.url);
      }

      const isVideoBlock = first.attachment?.content_type?.startsWith('video/');
      if (isVideoBlock && first.attachment?.url) {
        await preloadVideo(first.attachment.url);
      }

      setBlocks(shuffled);
      setIndex(0);
      setCurrentBlock(first);
      setChannelSlug(slug);
    } catch (err) {
      setError(err.message || "Channel not found");
      setChannelSlug("");
    }

    setLoading(false);
  }, []);

  const nextBlock = useCallback(async () => {
    if (blocks.length === 0) return;

    setLoading(true);

    let nextBlocks = blocks;
    let nextIndex = (index + 1) % blocks.length;

    // Reshuffle on wraparound
    if (nextIndex === 0 && blocks.length > 1) {
      nextBlocks = shuffleArray(blocks);
      setBlocks(nextBlocks);
    }

    const next = nextBlocks[nextIndex];

    if (next.image?.display?.url) {
      await preloadImage(next.image.display.url);
    }

    const isVideoBlock = next.attachment?.content_type?.startsWith('video/');
    if (isVideoBlock && next.attachment?.url) {
      await preloadVideo(next.attachment.url);
    }

    setIndex(nextIndex);
    setCurrentBlock(next);
    setLoading(false);
  }, [blocks, index]);

  const clearError = useCallback(() => setError(""), []);

  return {
    currentBlock,
    channelSlug,
    loading,
    error,
    hasLoaded: channelSlug !== "",
    loadChannel,
    nextBlock,
    clearError,
  };
}
