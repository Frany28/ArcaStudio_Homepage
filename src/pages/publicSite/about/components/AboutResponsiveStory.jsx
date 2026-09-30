import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useInView,
  useReducedMotion,
} from "motion/react";

import aboutHero from "../../../../assets/about/about-hero.webp";
import aboutStoryMobileMp4 from "../../../../assets/about/about-story-mobile.mp4";
import aboutStoryMobileReverseMp4 from "../../../../assets/about/about-story-mobile-reverse.mp4";
import aboutStoryMobileReverseWebm from "../../../../assets/about/about-story-mobile-reverse.webm";
import aboutStoryMobileWebm from "../../../../assets/about/about-story-mobile.webm";
import aboutStoryTabletMp4 from "../../../../assets/about/about-story-tablet.mp4";
import aboutStoryTabletReverseMp4 from "../../../../assets/about/about-story-tablet-reverse.mp4";
import aboutStoryTabletReverseWebm from "../../../../assets/about/about-story-tablet-reverse.webm";
import aboutStoryTabletWebm from "../../../../assets/about/about-story-tablet.webm";
import { ABOUT_CONTENT } from "../aboutContent.js";
import {
  connectAboutDirectionalScrollGate,
  getAboutStoryEntryDirection,
} from "../utils/aboutDirectionalScrollGate.js";
import { connectAboutVideoPlayback } from "../utils/aboutVideoPlayback.js";

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
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const wasInViewRef = useRef(false);
  const inView = useInView(stageRef, {
    amount: 0.9,
  });
  const [isTablet, setIsTablet] = useState(getInitialTabletMatch);
  const [viewportEnabled, setViewportEnabled] = useState(
    getInitialResponsiveViewportMatch,
  );
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [playbackDirection, setPlaybackDirection] = useState(null);

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
    setVideoCompleted(false);
    setVideoReady(false);
  }, [isTablet]);

  const shouldPlay =
    viewportEnabled &&
    inView &&
    playbackDirection !== null &&
    !reduceMotion &&
    !videoFailed &&
    !videoCompleted;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (!shouldPlay) {
      video.pause();
      return undefined;
    }

    return connectAboutVideoPlayback(video);
  }, [isTablet, shouldPlay]);

  useEffect(() => {
    const video = videoRef.current;
    const enteredStory = !wasInViewRef.current && inView;
    const leftStory = wasInViewRef.current && !inView;

    if (enteredStory) {
      const stage = stageRef.current;
      setPlaybackDirection(
        stage ? getAboutStoryEntryDirection(stage) : "forward",
      );
      setVideoCompleted(false);
      setVideoReady(false);
    }

    if (video && leftStory && !videoCompleted) {
      video.pause();

      try {
        video.currentTime = 0;
      } catch {
        // Safari can reject seeking until metadata is ready. Playback still
        // starts from the beginning when no current time was established.
      }
    }

    if (leftStory) setPlaybackDirection(null);

    wasInViewRef.current = inView;
  }, [inView, videoCompleted]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !shouldPlay) return undefined;

    return connectAboutDirectionalScrollGate(
      stage,
      playbackDirection,
    );
  }, [playbackDirection, shouldPlay]);

  const showStaticAlternative = reduceMotion || videoFailed;
  const reversePlayback = playbackDirection === "reverse";
  const mp4Source = isTablet
    ? reversePlayback
      ? aboutStoryTabletReverseMp4
      : aboutStoryTabletMp4
    : reversePlayback
      ? aboutStoryMobileReverseMp4
      : aboutStoryMobileMp4;
  const webmSource = isTablet
    ? reversePlayback
      ? aboutStoryTabletReverseWebm
      : aboutStoryTabletWebm
    : reversePlayback
      ? aboutStoryMobileReverseWebm
      : aboutStoryMobileWebm;

  return (
    <div
      ref={stageRef}
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-[var(--color-neutral-950-uniform)]"
      data-about-responsive-story
    >
      <img
        src={aboutHero}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full max-w-none object-cover object-center"
      />

      {!showStaticAlternative && (
        <video
          key={`${isTablet ? "tablet" : "mobile"}-${playbackDirection ?? "idle"}`}
          ref={videoRef}
          className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-300 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          autoPlay={shouldPlay}
          muted
          playsInline
          webkit-playsinline=""
          poster={aboutHero}
          preload={viewportEnabled ? "auto" : "none"}
          onLoadedData={() => setVideoReady(true)}
          onEnded={() => setVideoCompleted(true)}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
        >
          <source src={mp4Source} type="video/mp4" />
          <source src={webmSource} type="video/webm" />
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
  );
}

export default AboutResponsiveStory;
