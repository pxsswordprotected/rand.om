import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  CircleNotch,
  Warning,
  ArrowClockwise,
} from "phosphor-react";
import { useArenaChannel } from "./hooks/useArenaChannel";
import { BlockDisplay } from "./components/BlockDisplay";
import { DESIGN_TOKENS } from "./constants/designTokens";

function App() {
  const [input, setInput] = useState("");

  const {
    currentBlock,
    channelSlug,
    loading,
    error,
    hasLoaded,
    loadChannel,
    nextBlock,
    clearError,
  } = useArenaChannel();

  const isRefreshState = hasLoaded && input.trim() === channelSlug;

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || error) return;

    if (isRefreshState) {
      await nextBlock();
    } else {
      await loadChannel(trimmed);
    }
  }, [input, loading, error, isRefreshState, nextBlock, loadChannel]);

  // Global Enter key for refresh state
  useEffect(() => {
    if (!isRefreshState || loading || error) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && e.target.tagName !== "INPUT") {
        handleSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isRefreshState, loading, error, handleSubmit]);

  // Icon rendering (kept inline - tightly coupled to app state)
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
    if (isRefreshState) {
      return (
        <ArrowClockwise
          size={DESIGN_TOKENS.sizes.iconSize}
          color={DESIGN_TOKENS.colors.text}
        />
      );
    }
    return (
      <ArrowRight
        size={DESIGN_TOKENS.sizes.iconSize}
        color={
          input.trim()
            ? DESIGN_TOKENS.colors.text
            : DESIGN_TOKENS.colors.placeholder
        }
      />
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div
        className="w-full max-w-[700px] mx-auto px-4 sm:px-6 lg:px-0"
        style={{ paddingTop: "clamp(24px, 5vh, 48px)" }}
      >
        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="relative w-full"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) clearError();
            }}
            placeholder="Channel link"
            spellCheck="false"
            autoComplete="off"
            className="w-full border-b border-[#1A1A1A] focus:outline-none pr-12 pb-2 placeholder:text-[#9CA3AF]"
            style={{ fontSize: DESIGN_TOKENS.typography.input }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || (!input.trim() && !hasLoaded) || !!error}
            className="absolute right-0 bottom-1 p-2 disabled:cursor-default enabled:cursor-pointer select-none icon-button"
            aria-label={
              loading
                ? "Loading"
                : error
                  ? "Error"
                  : isRefreshState
                    ? "Get next block"
                    : "Submit"
            }
          >
            {renderIcon()}
          </button>
        </form>

        {/* Block display */}
        <BlockDisplay block={currentBlock} />
      </div>
    </div>
  );
}

export default App;
