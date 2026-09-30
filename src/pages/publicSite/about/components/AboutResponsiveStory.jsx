import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useReducedMotion,
} from "motion/react";

import aboutHero from "../../../../assets/about/about-hero.webp";
import aboutStoryMobileMp4 from "../../../../assets/about/about-story-mobile.mp4";
import aboutStoryMobileWebm from "../../../../assets/about/about-story-mobile.webm";
import aboutStoryTabletMp4 from "../../../../assets/about/about-story-tablet.mp4";
import aboutStoryTabletWebm from "../../../../assets/about/about-story-tablet.webm";
import { ABOUT_CONTENT } from "../aboutContent.js";
import { connectAboutVideoScroll } from "../utils/aboutVideoScroll.js";

function getInitialTabletMatch() {
  return typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;
}

function getInitialResponsiveViewportMatch() {
  return typeof window === "undefined" ||
    window.matchMedia("(max-width: 1024px)").matches;
}

function AboutResponsiveStory() {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const [isTablet, setIsTablet] = useState(getInitialTabletMatch);
  const [viewportEnabled, setViewportEnabled] = useState(
    getInitialResponsiveViewportMatch,
  );
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const tabletQuery = window.matchMedia("(min-width: 768px)");
    const responsiveViewportQuery = window.matchMedia(
      "(max-width: 1024px)",
    );
    const updateViewportMatches = () => {
      setIsTablet(tabletQuery.matches);
      setViewportEnabled(responsiveViewportQuery.matches);
    };

    updateViewportMatches();
    tabletQuery.addEventListener?.("change", updateViewportMatches);
    responsiveViewportQuery.addEventListener?.(
      "change",
      updateViewportMatches,
    );

    return () => {
      tabletQuery.removeEventListener?.("change", updateViewportMatches);
      responsiveViewportQuery.removeEventListener?.(
        "change",
        updateViewportMatches,
      );
    };
  }, []);

  useEffect(() => {
    setVideoFailed(false);
    setVideoReady(false);
  }, [isTablet]);

  const scrollScrubEnabled =
    viewportEnabled && !reduceMotion && !videoFailed;

  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track || !scrollScrubEnabled) {
      video?.pause();
      return undefined;
    }

    return connectAboutVideoScroll(video, track);
  }, [isTablet, scrollScrubEnabled]);

  const showStaticAlternative = reduceMotion || videoFailed;
  const mp4Source = isTablet
    ? aboutStoryTabletMp4
    : aboutStoryMobileMp4;
  const webmSource = isTablet
    ? aboutStoryTabletWebm
    : aboutStoryMobileWebm;

  return (
    <div
      ref={trackRef}
      className={`relative w-full bg-[var(--color-neutral-950-uniform)] ${
        scrollScrubEnabled ? "h-[600svh]" : "h-[100svh]"
      }`}
      data-about-responsive-story
      data-about-video-scroll-track={scrollScrubEnabled ? "true" : "false"}
    >
      <div className="sticky top-0 h-[100svh] w-full touch-pan-y overflow-hidden">
        <img
          src={aboutHero}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full max-w-none object-cover object-center"
        />

        {!showStaticAlternative && (
          <video
            key={isTablet ? "tablet" : "mobile"}
            ref={videoRef}
            className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-300 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
            muted
            playsInline
            webkit-playsinline=""
            poster={aboutHero}
            preload={viewportEnabled ? "auto" : "none"}
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
          >
            <source src={webmSource} type="video/webm" />
            <source src={mp4Source} type="video/mp4" />
          </video>
        )}

        {showStaticAlternative && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 px-[16px]">
            <p className="m-0 w-full max-w-[823px] break-words text-center font-[var(--font-sans)] text-[48px] font-bold leading-[58px] tracking-[-1px] text-[var(--color-neutral-100-uniform)] max-[767px]:text-[20px] max-[767px]:leading-[24px] max-[767px]:tracking-[-0.5px]">
              {ABOUT_CONTENT.description}
            </p>
          </div>
        )}

        {!showStaticAlternative && (
          <p className="sr-only">{ABOUT_CONTENT.description}</p>
        )}
      </div>
    </div>
  );
}

export default AboutResponsiveStory;
