import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowRight,
  CircleNotch,
  Warning,
  ArrowClockwise,
} from "phosphor-react";
import { useArenaChannel } from "./hooks/useArenaChannel";
import { BlockDisplay } from "./components/BlockDisplay";
import { DESIGN_TOKENS } from "./constants/designTokens";

// A pure CSS spinner. No SVG. No Vector Math. No Wobble.
const CSSSpinner = () => (
  <div
    className="animate-spin rounded-full border-2 border-gray-200 border-t-black"
    style={{
      width: "20px",
      height: "20px",
      // This ensures it spins around a perfect geometric center
      boxSizing: "border-box",
    }}
  />
);

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

  // Tooltip state and refs
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

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

  // Tooltip event handlers
  const handleTooltipMouseEnter = (e) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
    setShowTooltip(true);
  };

  const handleTooltipMouseMove = (e) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${e.clientX + 15}px`;
      tooltipRef.current.style.top = `${e.clientY + 10}px`;
    }
  };

  const handleTooltipMouseLeave = () => {
    setShowTooltip(false);
  };

  // Icon rendering (kept inline - tightly coupled to app state)
  const renderIcon = () => {
    if (loading) {
      return (
        <div
          className="animate-spin inline-flex items-center justify-center"
          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
        >
          <CSSSpinner />
        </div>
      );
    }
    if (error) {
      return (
        <span
          onMouseEnter={handleTooltipMouseEnter}
          onMouseMove={handleTooltipMouseMove}
          onMouseLeave={handleTooltipMouseLeave}
          className="inline-block relative error-icon-hitbox"
          style={{ verticalAlign: "middle" }}
        >
          <Warning
            size={DESIGN_TOKENS.sizes.iconSize}
            color={DESIGN_TOKENS.colors.error}
          />
        </span>
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
        style={{
          paddingTop: "clamp(24px, 5vh, 48px)",
          paddingBottom: "clamp(24px, 5vh, 48px)",
        }}
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
            placeholder="Are.na channel link"
            spellCheck="false"
            autoComplete="off"
            className="w-full border-b border-[#1A1A1A] focus:outline-none pr-12 pb-2 placeholder:text-[#9CA3AF]"
            style={{ fontSize: DESIGN_TOKENS.typography.input }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !input.trim() || !!error}
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

        {/* Error Tooltip */}
        {showTooltip && error && (
          <div
            ref={tooltipRef}
            className="fixed pointer-events-none z-50 text-sm"
            style={{
              color: DESIGN_TOKENS.colors.error,
              left: `${mousePositionRef.current.x + 15}px`,
              top: `${mousePositionRef.current.y + 10}px`,
            }}
          >
            Enter valid channel link
          </div>
        )}

        {/* Block display */}
        <BlockDisplay block={currentBlock} />
      </div>
    </div>
  );
}

export default App;
