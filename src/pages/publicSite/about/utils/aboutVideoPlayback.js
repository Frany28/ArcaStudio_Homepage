function connectAboutVideoPlayback(
  video,
  {
    documentTarget = document,
    interactionTarget = documentTarget,
  } = {},
) {
  const applyInlinePlaybackAttributes = () => {
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute?.("playsinline", "");
    video.setAttribute?.("webkit-playsinline", "");
  };

  const play = () => {
    if (documentTarget.hidden) return;

    applyInlinePlaybackAttributes();
    video.play()?.catch(() => undefined);
  };

  const synchronizeVisibility = () => {
    if (documentTarget.hidden) {
      video.pause?.();
      return;
    }

    play();
  };

  const mediaEvents = ["canplay", "loadeddata", "loadedmetadata"];
  const interactionEvents = ["touchstart", "pointerdown"];

  mediaEvents.forEach((eventName) => {
    video.addEventListener(eventName, play);
  });
  interactionEvents.forEach((eventName) => {
    interactionTarget.addEventListener(eventName, play, { passive: true });
  });
  documentTarget.addEventListener("visibilitychange", synchronizeVisibility);

  play();

  return () => {
    mediaEvents.forEach((eventName) => {
      video.removeEventListener(eventName, play);
    });
    interactionEvents.forEach((eventName) => {
      interactionTarget.removeEventListener(eventName, play);
    });
    documentTarget.removeEventListener(
      "visibilitychange",
      synchronizeVisibility,
    );
  };
}

export { connectAboutVideoPlayback };
