import { DESIGN_TOKENS } from "../constants/designTokens";

export function BlockDisplay({ block }) {
  if (!block) return null;

  const title = block.title || block.source?.title || "Untitled";

  return (
    <div key={block.id} className="mt-8 w-full block-enter">
      {/* Title with link to Are.na */}
      <a
        href={`https://www.are.na/block/${block.id}`}
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
          {title}
        </h2>
      </a>

      {/* Block type */}
      <p
        style={{
          fontSize: DESIGN_TOKENS.typography.blockType,
          marginTop: `${DESIGN_TOKENS.spacing.titleToType}px`,
          color: DESIGN_TOKENS.colors.hover,
        }}
      >
        {block.class}
      </p>

      {/* Content */}
      <div style={{ marginTop: `${DESIGN_TOKENS.spacing.titleToContent}px` }}>
        <BlockContent block={block} />
      </div>
    </div>
  );
}

// Internal component for content rendering
function BlockContent({ block }) {
  const imageUrl = block.image?.display?.url;
  const sourceUrl = block.source?.url;
  const attachmentUrl = block.attachment?.url;

  // Link with image
  if (imageUrl && block.class === "Link" && sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full sm:max-w-[500px] hover:opacity-75 transition-opacity"
        style={{ maxWidth: `${DESIGN_TOKENS.sizes.imageWidth}px` }}
      >
        <img src={imageUrl} alt="" className="w-full" />
      </a>
    );
  }

  // Media with image
  if (imageUrl && block.class === "Media" && (sourceUrl || attachmentUrl)) {
    return (
      <a
        href={sourceUrl || attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full sm:max-w-[500px] hover:opacity-75 transition-opacity"
        style={{ maxWidth: `${DESIGN_TOKENS.sizes.imageWidth}px` }}
      >
        <img src={imageUrl} alt="" className="w-full" />
      </a>
    );
  }

  // Plain image
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="w-full sm:max-w-[500px]"
        style={{ maxWidth: `${DESIGN_TOKENS.sizes.imageWidth}px` }}
      />
    );
  }

  // Link without image
  if (block.class === "Link" && sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-[#808080]"
        style={{
          fontSize: DESIGN_TOKENS.typography.blockContent,
          color: DESIGN_TOKENS.colors.text,
          textDecoration: "underline",
        }}
      >
        {sourceUrl}
      </a>
    );
  }

  // Media w/o  image
  if (block.class === "Media" && (sourceUrl || attachmentUrl)) {
    return (
      <a
        href={sourceUrl || attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-[#808080]"
        style={{
          fontSize: DESIGN_TOKENS.typography.blockContent,
          color: DESIGN_TOKENS.colors.text,
          textDecoration: "underline",
        }}
      >
        {block.attachment?.file_name || sourceUrl || "View media"}
      </a>
    );
  }

  // Text cnt
  if (block.class !== "Link" && block.class !== "Image" && block.class !== "Media" && block.content) {
    return (
      <p
        className="whitespace-pre-wrap"
        style={{
          fontSize: DESIGN_TOKENS.typography.blockContent,
          color: DESIGN_TOKENS.colors.text,
        }}
      >
        {block.content}
      </p>
    );
  }

  return null;
}
