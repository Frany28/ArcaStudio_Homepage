function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getAboutVideoScrollProgress({
  scroller,
  track,
}) {
  const scrollerRect = scroller.getBoundingClientRect();
  const trackRect = track.getBoundingClientRect();
  const trackTop =
    scroller.scrollTop + trackRect.top - scrollerRect.top;
  const travel = Math.max(
    1,
    track.offsetHeight - scroller.clientHeight,
  );

  return clamp(
    (scroller.scrollTop - trackTop) / travel,
    0,
    1,
  );
}

function seekAboutVideo(video, progress) {
  if (
    video.readyState < 1 ||
    !Number.isFinite(video.duration) ||
    video.duration <= 0
  ) {
    return false;
  }

  const finalFrameOffset = Math.min(1 / 30, video.duration);
  const targetTime =
    clamp(progress, 0, 1) *
    Math.max(0, video.duration - finalFrameOffset);

  if (Math.abs(video.currentTime - targetTime) < 1 / 120) {
    return true;
  }

  try {
    video.currentTime = targetTime;
    return true;
  } catch {
    return false;
  }
}

function connectAboutVideoScroll(
  video,
  track,
  {
    requestFrame = window.requestAnimationFrame.bind(window),
    cancelFrame = window.cancelAnimationFrame.bind(window),
    windowTarget = window,
  } = {},
) {
  const scroller = track.closest("[data-home-scroll-container]");
  if (!scroller) return () => {};

  let frameId = 0;

  const render = () => {
    frameId = 0;
    video.pause();
    seekAboutVideo(
      video,
      getAboutVideoScrollProgress({ scroller, track }),
    );
  };

  const scheduleRender = () => {
    if (frameId) return;
    frameId = requestFrame(render);
  };

  const mediaEvents = ["loadeddata", "loadedmetadata", "durationchange"];
  mediaEvents.forEach((eventName) => {
    video.addEventListener(eventName, scheduleRender);
  });
  scroller.addEventListener("scroll", scheduleRender, { passive: true });
  windowTarget.addEventListener("resize", scheduleRender, { passive: true });
  windowTarget.visualViewport?.addEventListener(
    "resize",
    scheduleRender,
    { passive: true },
  );

  scheduleRender();

  return () => {
    if (frameId) cancelFrame(frameId);
    mediaEvents.forEach((eventName) => {
      video.removeEventListener(eventName, scheduleRender);
    });
    scroller.removeEventListener("scroll", scheduleRender);
    windowTarget.removeEventListener("resize", scheduleRender);
    windowTarget.visualViewport?.removeEventListener(
      "resize",
      scheduleRender,
    );
  };
}

export {
  connectAboutVideoScroll,
  getAboutVideoScrollProgress,
  seekAboutVideo,
};
