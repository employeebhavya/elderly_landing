document.addEventListener("DOMContentLoaded", function () {
  const desktopVideo = document.getElementById("desktop-video");
  const mobileVideo = document.getElementById("mobile-video");

  // Function to force video play on mobile
  function forceVideoPlay() {
    const videos = [desktopVideo, mobileVideo];

    videos.forEach((video) => {
      if (video) {
        // Reset video properties for iOS
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;

        // Try to play the video
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Video autoplay failed:", error);
            // If autoplay fails, try to play on user interaction
            document.addEventListener(
              "touchstart",
              function () {
                video
                  .play()
                  .catch((e) => console.log("Manual play failed:", e));
              },
              { once: true }
            );
          });
        }
      }
    });
  }

  // iOS Safari detection and handling
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (isIOS || isSafari) {
    // Force play on iOS/Safari
    setTimeout(forceVideoPlay, 100);

    // Also try on any user interaction
    ["touchstart", "click", "scroll"].forEach((event) => {
      document.addEventListener(event, forceVideoPlay, { once: true });
    });
  }

  // Ensure videos stay muted and loop
  [desktopVideo, mobileVideo].forEach((video) => {
    if (video) {
      video.addEventListener("loadeddata", function () {
        this.muted = true;
        this.volume = 0;
      });

      video.addEventListener("canplay", function () {
        if (this.paused) {
          this.play().catch((e) =>
            console.log("Canplay event play failed:", e)
          );
        }
      });
    }
  });
});
