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
          className="transition-colors duration-100 group-hover:text-[#808080]"
          style={{
            fontSize: DESIGN_TOKENS.typography.blockTitle,
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

  // Helper: Check if block is a video
  const isVideo = (block) => {
    const contentType = block.attachment?.content_type;
    const fileName = block.attachment?.file_name;
    return (
      contentType?.startsWith('video/') ||
      /\.(mp4|webm|mov|avi|mkv)$/i.test(fileName || '')
    );
  };

  // Helper: Check if block is a PDF
  const isPDF = (block) => {
    const contentType = block.attachment?.content_type;
    const fileName = block.attachment?.file_name;
    return (
      contentType === 'application/pdf' ||
      /\.pdf$/i.test(fileName || '')
    );
  };

  // Video player (inline playback) - handles both Attachment and Media blocks
  if (isVideo(block) && (block.class === "Media" || block.class === "Attachment") && attachmentUrl) {
    return (
      <video
        src={attachmentUrl}
        poster={imageUrl || undefined}
        controls
        preload="metadata"
        playsInline
        aria-label={block.attachment?.file_name || 'Video'}
        className="w-full sm:max-w-[500px]"
        style={{ maxWidth: `${DESIGN_TOKENS.sizes.imageWidth}px` }}
      />
    );
  }

  // PDF viewer (inline reading) - handles Attachment blocks
  if (isPDF(block) && block.class === "Attachment" && attachmentUrl) {
    return (
      <iframe
        src={attachmentUrl}
        title={block.attachment?.file_name || 'PDF Document'}
        className="w-full sm:max-w-[500px] border-0"
        style={{
          maxWidth: `${DESIGN_TOKENS.sizes.imageWidth}px`,
          height: '600px'
        }}
      />
    );
  }

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

  // Attachment w/o video or PDF (ZIPs, etc.)
  if (block.class === "Attachment" && attachmentUrl && !isVideo(block) && !isPDF(block)) {
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-[#808080]"
        style={{
          fontSize: DESIGN_TOKENS.typography.blockContent,
          color: DESIGN_TOKENS.colors.text,
          textDecoration: "underline",
        }}
      >
        {block.attachment?.file_name || attachmentUrl || "View attachment"}
      </a>
    );
  }

  // Text cnt
  if (
    block.class !== "Link" &&
    block.class !== "Image" &&
    block.class !== "Media" &&
    block.content
  ) {
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
