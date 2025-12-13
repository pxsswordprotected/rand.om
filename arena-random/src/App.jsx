import { useState, useEffect } from "react";
import { getChannelBlocks, shuffleArray } from "./services/arenaService";
import {
  ArrowRight,
  CircleNotch,
  Warning,
  ArrowsClockwise,
} from "phosphor-react";

const DESIGN_TOKENS = {
  colors: {
    text: "#1A1A1A",
    hover: "#808080",
    error: "#912E2E",
    placeholder: "#9CA3AF",
  },
  spacing: {
    inputTop: 48,
    titleToType: 8,
    titleToContent: 28,
  },
  sizes: {
    containerWidth: 700,
    imageWidth: 500,
    iconSize: 20,
  },
  typography: {
    input: "clamp(14px, 4vw, 18px)",
    blockTitle: "clamp(18px, 5vw, 22px)",
    blockType: "clamp(12px, 3.5vw, 14px)",
    blockContent: "clamp(14px, 4vw, 18px)",
  },
};

const preloadImage = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
};

function App() {
  const [input, setInput] = useState("");
  const [shuffledBlocks, setShuffledBlocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastChannel, setLastChannel] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const handlePrimaryClick = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // If first time or channel changed → fetch + shuffle + show first
    const needsNewChannel = !hasLoaded || trimmed !== lastChannel;

    if (needsNewChannel) {
      setLoading(true);
      setError("");
      setCurrentBlock(null);

      try {
        const fetchedBlocks = await getChannelBlocks(trimmed);

        if (fetchedBlocks.length === 0) {
          setError("Channel is empty");
          setLastChannel("");
          setLoading(false);
          return;
        }

        const shuffled = shuffleArray(fetchedBlocks);
        const firstBlock = shuffled[0];

        // Preload image if it exists
        if (firstBlock.image?.display?.url) {
          await preloadImage(firstBlock.image.display.url);
        }

        setShuffledBlocks(shuffled);
        setCurrentIndex(0);
        setCurrentBlock(firstBlock);
        setLastChannel(trimmed);
        setHasLoaded(true);
      } catch (err) {
        setError(err.message || "Error loading channel");
        setLastChannel("");
      }

      setLoading(false);
      return;
    }

    // Same channel already loaded → just show next random block from shuffled list
    if (shuffledBlocks.length === 0) return;

    setLoading(true);

    const nextIndex = (currentIndex + 1) % shuffledBlocks.length;

    // On wraparound, reshuffle to keep it feeling fresh
    if (nextIndex === 0 && shuffledBlocks.length > 1) {
      const reshuffled = shuffleArray(shuffledBlocks);
      const nextBlock = reshuffled[0];

      // Preload image if it exists
      if (nextBlock.image?.display?.url) {
        await preloadImage(nextBlock.image.display.url);
      }

      setShuffledBlocks(reshuffled);
      setCurrentIndex(0);
      setCurrentBlock(nextBlock);
    } else {
      const nextBlock = shuffledBlocks[nextIndex];

      // Preload image if it exists
      if (nextBlock.image?.display?.url) {
        await preloadImage(nextBlock.image.display.url);
      }

      setCurrentIndex(nextIndex);
      setCurrentBlock(nextBlock);
    }

    setLoading(false);
  };

  // Global Enter key listener for refresh state
  useEffect(() => {
    const isRefreshState = hasLoaded && input.trim() === lastChannel && !loading && !error;

    if (!isRefreshState) return;

    const handleGlobalEnter = (e) => {
      if (e.key === "Enter" && e.target.tagName !== "INPUT") {
        handlePrimaryClick();
      }
    };

    document.addEventListener("keydown", handleGlobalEnter);
    return () => document.removeEventListener("keydown", handleGlobalEnter);
  }, [hasLoaded, input, lastChannel, loading, error]);

  const renderIcon = () => {
    if (loading) {
      return (
        <CircleNotch
          size={DESIGN_TOKENS.sizes.iconSize}
          className="animate-spin"
          color={DESIGN_TOKENS.colors.text}
        />
      );
    }

    if (error) {
      return (
        <Warning
          size={DESIGN_TOKENS.sizes.iconSize}
          color={DESIGN_TOKENS.colors.error}
        />
      );
    }

    if (hasLoaded && input.trim() === lastChannel) {
      return (
        <ArrowsClockwise
          size={DESIGN_TOKENS.sizes.iconSize}
          color={DESIGN_TOKENS.colors.text}
        />
      );
    }

    return (
      <ArrowRight
        size={DESIGN_TOKENS.sizes.iconSize}
        color={input.trim() ? DESIGN_TOKENS.colors.text : DESIGN_TOKENS.colors.placeholder}
      />
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div
        className="w-full max-w-[700px] mx-auto px-4 sm:px-6 lg:px-0"
        style={{ paddingTop: "clamp(24px, 5vh, 48px)" }}
      >
        {/* Input with icon */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading && (input.trim() || hasLoaded) && !error) {
              handlePrimaryClick();
            }
          }}
          className="relative w-full"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError("");
            }}
            placeholder="Channel link"
            spellCheck="false"
            autoComplete="off"
            className="w-full border-b border-[#1A1A1A] focus:outline-none pr-12 pb-2 placeholder:text-[#9CA3AF]"
            style={{ fontSize: DESIGN_TOKENS.typography.input }}
          />
          <button
            type="button"
            onClick={handlePrimaryClick}
            disabled={loading || (!input.trim() && !hasLoaded) || error}
            className="absolute right-0 bottom-0 p-2 disabled:cursor-default enabled:cursor-pointer select-none icon-button"
            aria-label={
              loading
                ? "Loading"
                : error
                  ? "Error"
                  : hasLoaded && input.trim() === lastChannel
                    ? "Get next block"
                    : "Submit"
            }
          >
            {renderIcon()}
          </button>
        </form>

        {/* Block display */}
        {currentBlock && (
          <div
            key={currentBlock.id}
            className="mt-8 w-full block-enter"
          >
            <a
              href={`https://www.are.na/block/${currentBlock.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-block"
            >
              <h2
                className="transition-colors group-hover:text-[#808080]"
                style={{
                  fontSize: DESIGN_TOKENS.typography.blockTitle,
                  color: DESIGN_TOKENS.colors.text,
                }}
              >
                {currentBlock.title ||
                  currentBlock.source?.title ||
                  "Untitled"}
              </h2>
            </a>

            <p
              style={{
                fontSize: DESIGN_TOKENS.typography.blockType,
                marginTop: `${DESIGN_TOKENS.spacing.titleToType}px`,
                color: DESIGN_TOKENS.colors.hover,
              }}
            >
              {currentBlock.class}
            </p>

            <div style={{ marginTop: `${DESIGN_TOKENS.spacing.titleToContent}px` }}>
              {currentBlock.image && currentBlock.class === "Link" && currentBlock.source?.url ? (
                <a
                  href={currentBlock.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full sm:max-w-[500px] hover:opacity-75 transition-opacity"
                  style={{ maxWidth: `${DESIGN_TOKENS.sizes.imageWidth}px` }}
                >
                  <img
                    src={currentBlock.image.display.url}
                    alt=""
                    className="w-full"
                  />
                </a>
              ) : currentBlock.image && currentBlock.class === "Media" && (currentBlock.source?.url || currentBlock.attachment?.url) ? (
                <a
                  href={currentBlock.source?.url || currentBlock.attachment?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full sm:max-w-[500px] hover:opacity-75 transition-opacity"
                  style={{ maxWidth: `${DESIGN_TOKENS.sizes.imageWidth}px` }}
                >
                  <img
                    src={currentBlock.image.display.url}
                    alt=""
                    className="w-full"
                  />
                </a>
              ) : currentBlock.image ? (
                <img
                  src={currentBlock.image.display.url}
                  alt=""
                  className="w-full sm:max-w-[500px]"
                  style={{ maxWidth: `${DESIGN_TOKENS.sizes.imageWidth}px` }}
                />
              ) : null}

              {currentBlock.class === "Link" && currentBlock.source?.url && !currentBlock.image && (
                <a
                  href={currentBlock.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#808080]"
                  style={{
                    fontSize: DESIGN_TOKENS.typography.blockContent,
                    color: DESIGN_TOKENS.colors.text,
                    textDecoration: "underline",
                  }}
                >
                  {currentBlock.source.url}
                </a>
              )}

              {currentBlock.class === "Media" && (currentBlock.source?.url || currentBlock.attachment) && !currentBlock.image && (
                <a
                  href={currentBlock.source?.url || currentBlock.attachment?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#808080]"
                  style={{
                    fontSize: DESIGN_TOKENS.typography.blockContent,
                    color: DESIGN_TOKENS.colors.text,
                    textDecoration: "underline",
                  }}
                >
                  {currentBlock.attachment?.file_name || currentBlock.source?.url || "View media"}
                </a>
              )}

              {currentBlock.class !== "Link" &&
                currentBlock.class !== "Image" &&
                currentBlock.class !== "Media" &&
                currentBlock.content && (
                  <p
                    className="whitespace-pre-wrap"
                    style={{
                      fontSize: DESIGN_TOKENS.typography.blockContent,
                      color: DESIGN_TOKENS.colors.text,
                    }}
                  >
                    {currentBlock.content}
                  </p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
