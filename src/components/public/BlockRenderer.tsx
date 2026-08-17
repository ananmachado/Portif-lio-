import React, { useState, useRef } from 'react';
import { ProjectBlock } from '../../types';
import { Play, Pause, Volume2, VolumeX, FileText, ExternalLink, Maximize2, X } from 'lucide-react';

interface BlockRendererProps {
  block: ProjectBlock;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Extract YouTube Embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = '';
    
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  switch (block.type) {
    case 'texto':
      return (
        <div className="my-6 space-y-4 text-base leading-relaxed" id={`block-text-${block.id}`}>
          {block.content?.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="whitespace-pre-line font-normal" style={{ color: 'var(--theme-text-primary)' }}>
              {paragraph}
            </p>
          ))}
        </div>
      );

    case 'imagem':
      return (
        <figure className="my-8 space-y-3" id={`block-image-${block.id}`}>
          <div className="relative group overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--theme-border)' }}>
            <img
              src={block.media_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
              alt={block.alt_text || 'Imagem do projeto'}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <button
              onClick={() => setShowImageZoom(true)}
              aria-label="Ampliar imagem"
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          {block.caption && (
            <figcaption className="text-xs text-center italic" style={{ color: 'var(--theme-text-secondary)' }}>
              {block.caption}
            </figcaption>
          )}

          {/* Modal Image Zoom */}
          {showImageZoom && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
              onClick={() => setShowImageZoom(false)}
              role="dialog"
              aria-label="Imagem ampliada"
            >
              <div className="relative max-w-5xl max-h-[90vh]">
                <button
                  onClick={() => setShowImageZoom(false)}
                  aria-label="Fechar ampliação"
                  className="absolute -top-12 right-0 p-2 text-white hover:opacity-80"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={block.media_url || ''}
                  alt={block.alt_text || 'Imagem ampliada'}
                  className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
                />
              </div>
            </div>
          )}
        </figure>
      );

    case 'youtube': {
      const embedUrl = getYouTubeEmbedUrl(block.media_url || '');
      return (
        <figure className="my-8 space-y-3" id={`block-youtube-${block.id}`}>
          {embedUrl ? (
            <div className="relative w-full overflow-hidden rounded-2xl border aspect-video shadow-md" style={{ borderColor: 'var(--theme-border)' }}>
              <iframe
                src={embedUrl}
                title={block.alt_text || 'Vídeo do YouTube'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="p-6 rounded-xl border text-center text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              Link de vídeo do YouTube indisponível ou inválido.
            </div>
          )}
          {block.caption && (
            <figcaption className="text-xs text-center italic" style={{ color: 'var(--theme-text-secondary)' }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'audio':
      return (
        <div
          className="my-8 p-6 rounded-2xl border space-y-4 shadow-xs"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
          id={`block-audio-${block.id}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAudio}
                aria-label={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 focus:outline-none"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                  {block.caption || 'Conteúdo em Áudio'}
                </p>
                <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                  Player de áudio acessível
                </p>
              </div>
            </div>

            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Ativar som' : 'Silenciar áudio'}
              className="p-2.5 rounded-xl border hover:opacity-80"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <audio
            ref={audioRef}
            src={block.media_url}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          {/* Transcript accordion */}
          {block.transcript && (
            <div className="pt-3 border-t" style={{ borderColor: 'var(--theme-border)' }}>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                aria-expanded={showTranscript}
                className="flex items-center gap-2 text-xs font-semibold hover:underline focus:outline-none"
                style={{ color: 'var(--theme-primary)' }}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{showTranscript ? 'Ocultar Transcrição Textual' : 'Ver Transcrição Textual'}</span>
              </button>

              {showTranscript && (
                <div
                  className="mt-3 p-4 rounded-xl text-xs leading-relaxed space-y-2 border font-mono"
                  style={{
                    backgroundColor: 'var(--theme-bg)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-secondary)',
                  }}
                >
                  <p className="font-semibold text-[var(--theme-text-primary)] font-sans">Transcrição Acessível:</p>
                  <p>{block.transcript}</p>
                </div>
              )}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};
