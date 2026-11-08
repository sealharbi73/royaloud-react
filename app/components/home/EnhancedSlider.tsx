import { memo, useEffect, useRef, useState, type RefObject } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { parseSlideVideo, youtubeEmbedUrl } from '../../lib/slideVideo';
import { useFirstInteraction } from '../../hooks/useFirstInteraction';

const DEFAULT_HERO_CTA_URL = '/products?source=latest';

function getHeroText(
  settings: Record<string, unknown> | undefined,
  key: string,
  fallback: string
): string {
  const value = settings?.[key];
  return typeof value === 'string' ? value.trim() : fallback;
}

export interface SliderBanner {
  link?: string;
  url?: string;
  image?: string;
  mobile_image?: string;
  video?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  btnname?: string;
  show_button?: boolean;
  direction?: string[];
  title_color?: string;
  subtitle_color?: string;
  btnname_color?: string;
  without_overlay?: boolean;
}

export interface EnhancedSliderProps {
  data: {
    slider_banner?: SliderBanner[];
    slides?: SliderBanner[];
    slider_view_height?: number;
    slider_animation_time?: number;
    slider_aniamtion_time?: number;
    slider_animation_enabled?: boolean;
    auto_play?: boolean;
    position?: number;
    in_container?: boolean;
    priority?: boolean;
    [key: string]: unknown;
  };
}

export function useSlideVideos(root: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = root.current;
    if (!element || !enabled) return;
    const playIf = (video: HTMLVideoElement, visible: boolean) => {
      if (!visible) return video.pause();
      video.muted = true;
      video.play().catch(() => undefined);
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) =>
              entries.forEach((entry) =>
                playIf(entry.target as HTMLVideoElement, entry.isIntersecting)
              ),
            { threshold: 0.5 }
          );
    const watched = new WeakSet<HTMLVideoElement>();
    const watch = () =>
      element.querySelectorAll<HTMLVideoElement>('video.enhanced-slider__video').forEach((video) => {
        if (watched.has(video)) return;
        watched.add(video);
        if (observer) observer.observe(video);
        else playIf(video, true);
      });
    watch();
    const mutations = new MutationObserver(watch);
    mutations.observe(element, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [root, enabled]);
}

const YOUTUBE_LISTEN_INTERVAL_MS = 500;
const YOUTUBE_LISTEN_TRIES = 20;
const YOUTUBE_PLAYING = 1;

function YouTubeBackground({ id }: { id: string }) {
  const interacted = useFirstInteraction();
  if (!interacted) return null;
  return <YouTubeFrame id={id} />;
}

function YouTubeFrame({ id }: { id: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<'loading' | 'playing' | 'failed'>('loading');

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    let heard = false;
    let tries = 0;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow) return;
      let data: { event?: string; info?: unknown } | null = null;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!data || typeof data !== 'object') return;
      heard = true;
      if (data.event === 'onError') return setState('failed');
      const playerState =
        data.event === 'onStateChange'
          ? data.info
          : (data.info as { playerState?: unknown } | null)?.playerState;
      if (playerState === YOUTUBE_PLAYING) setState('playing');
    };
    let timer: number | undefined;
    const send = () => {
      if (heard || tries >= YOUTUBE_LISTEN_TRIES) return window.clearInterval(timer);
      tries += 1;
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id, channel: 'widget' }),
        'https://www.youtube-nocookie.com'
      );
    };
    const listen = () => {
      window.clearInterval(timer);
      tries = 0;
      send();
      timer = window.setInterval(send, YOUTUBE_LISTEN_INTERVAL_MS);
    };
    window.addEventListener('message', onMessage);
    frame.addEventListener('load', listen);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('message', onMessage);
      frame.removeEventListener('load', listen);
    };
  }, [id]);

  if (state === 'failed') return null;
  return (
    <iframe
      ref={ref}
      className="enhanced-slider__video enhanced-slider__video--embed"
      data-state={state}
      src={youtubeEmbedUrl(id, window.location.origin)}
      title=""
      loading="lazy"
      allow="autoplay; encrypted-media"
      referrerPolicy="strict-origin-when-cross-origin"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

export function SlideVideo({ url, poster }: { url?: string; poster?: string }) {
  const video = parseSlideVideo(url);
  if (!video) return null;
  if (video.kind === 'youtube') return <YouTubeBackground id={video.id} />;
  return (
    <video
      className="enhanced-slider__video"
      src={video.src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

export const EnhancedSlider = memo(function EnhancedSlider(_props: EnhancedSliderProps) {
  const { theme } = useTwilight();
  const settings = theme?.settings as Record<string, unknown> | undefined;
  const title = getHeroText(settings, 'hero_title', 'عودٌ يليق بك');
  const subtitle = getHeroText(
    settings,
    'hero_subtitle',
    'اكتشف نفائس العود الطبيعي المختارة بعناية لتجربة عطرية استثنائية.'
  );
  const ctaUrl =
    getHeroText(settings, 'hero_cta_url', DEFAULT_HERO_CTA_URL) || DEFAULT_HERO_CTA_URL;

  return (
    <div className="royaloud-hero-banner">
      <img
        src="/images/hero-main%20(2).png"
        alt=""
        aria-hidden="true"
        className="royaloud-hero-banner__image"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <div className="royaloud-hero-banner__scrim" aria-hidden="true" />
      <div className="royaloud-hero-banner__content">
        {title && <h2 className="royaloud-hero-banner__title">{title}</h2>}
        {subtitle && <p className="royaloud-hero-banner__subtitle">{subtitle}</p>}
        <Link to={ctaUrl} className="royaloud-hero-banner__cta">
          تسوق بفخامة
        </Link>
      </div>
    </div>
  );
});
