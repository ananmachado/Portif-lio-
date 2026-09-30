import React from "react";

interface Block {
  id: number;
  type: "text" | "image" | "youtube" | "audio";
  content?: string | null;
  mediaUrl?: string | null;
  altText?: string | null;
  caption?: string | null;
  transcript?: string | null;
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/);
  return match?.[1] ?? null;
}

function TextBlock({ content }: { content: string }) {
  return <div className="editorial-prose" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br />") }} />;
}

function ImageBlock({ mediaUrl, altText, caption }: { mediaUrl: string; altText?: string | null; caption?: string | null }) {
  return <figure className="editorial-media m-0"><img src={mediaUrl} alt={altText ?? ""} loading="lazy" />{caption && <figcaption className="editorial-caption">{caption}</figcaption>}</figure>;
}

function YoutubeBlock({ mediaUrl, caption }: { mediaUrl: string; caption?: string | null }) {
  const videoId = extractYoutubeId(mediaUrl);
  if (!videoId) return <p role="alert" style={{ color: "var(--color-error)" }}>URL do YouTube inválida.</p>;
  return <figure className="editorial-media m-0"><div className="relative w-full" style={{ paddingBottom: "56.25%" }}><iframe src={`https://www.youtube.com/embed/${videoId}`} title={caption ?? "Vídeo do projeto"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" style={{ border: "none" }} loading="lazy" /></div>{caption && <figcaption className="editorial-caption">{caption}</figcaption>}</figure>;
}

function AudioBlock({ mediaUrl, caption, transcript }: { mediaUrl: string; caption?: string | null; transcript?: string | null }) {
  return <figure className="editorial-media m-0"><figcaption className="mb-3 font-medium">{caption || "Áudio do projeto"}</figcaption><audio controls className="w-full" aria-label={caption ?? "Áudio"}><source src={mediaUrl} />Seu navegador não suporta o elemento de áudio.</audio>{transcript && <details className="mt-4"><summary className="cursor-pointer text-sm font-medium">Ler transcrição</summary><p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>{transcript}</p></details>}</figure>;
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  const elements: React.ReactNode[] = [];
  let imageGroup: Block[] = [];

  const flushImageGroup = () => {
    if (!imageGroup.length) return;
    const group = imageGroup;
    imageGroup = [];
    elements.push(
      <div className="editorial-gallery" key={`gallery-${group[0].id}`}>
        {group.map((block) => (
          <ImageBlock key={block.id} mediaUrl={block.mediaUrl!} altText={block.altText} caption={block.caption} />
        ))}
      </div>
    );
  };

  blocks.forEach((block) => {
    if (block.type === "image" && block.mediaUrl) {
      imageGroup.push(block);
      return;
    }

    flushImageGroup();

    if (block.type === "text" && block.content) {
      elements.push(<section key={block.id} className="editorial-content-block"><TextBlock content={block.content} /></section>);
    }
    if (block.type === "youtube" && block.mediaUrl) {
      elements.push(<section key={block.id} className="editorial-content-block"><YoutubeBlock mediaUrl={block.mediaUrl} caption={block.caption} /></section>);
    }
    if (block.type === "audio" && block.mediaUrl) {
      elements.push(<section key={block.id} className="editorial-content-block"><AudioBlock mediaUrl={block.mediaUrl} caption={block.caption} transcript={block.transcript} /></section>);
    }
  });

  flushImageGroup();
  return <div className="project-content-flow">{elements}</div>;
}
