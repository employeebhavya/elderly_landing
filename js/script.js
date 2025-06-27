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

document.querySelectorAll(".faq-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const column = button.getAttribute("data-column");
    const content = button.closest("div").querySelector(".faq-content");
    const icon = button.querySelector("svg");

    // Close other open FAQs in the same column
    document
      .querySelectorAll(`.faq-content[data-column="${column}"]`)
      .forEach((otherContent) => {
        if (
          otherContent !== content &&
          otherContent.style.maxHeight !== "0px"
        ) {
          otherContent.style.maxHeight = "0px";
          otherContent.previousElementSibling
            .querySelector("svg")
            .classList.remove("rotate-180");
          otherContent.previousElementSibling
            .querySelector("h3")
            .classList.remove("text-primary-800");
        }
      });

    // Toggle current FAQ item
    if (content.style.maxHeight === "0px" || !content.style.maxHeight) {
      content.style.maxHeight = content.scrollHeight + "px";
      icon.classList.add("rotate-180");
      button.querySelector("h3").classList.add("text-primary-800");
    } else {
      content.style.maxHeight = "0px";
      icon.classList.remove("rotate-180");
      button.querySelector("h3").classList.remove("text-primary-800");
    }
  });

  // Pre-open the first FAQ item in each column on page load
  const firstLeftFaq = document.querySelector(
    '[data-column="left"] .faq-toggle'
  );
  if (firstLeftFaq) {
    const firstLeftContent = firstLeftFaq
      .closest("div")
      .querySelector(".faq-content");
    firstLeftContent.style.maxHeight = firstLeftContent.scrollHeight + "px";
    firstLeftFaq.querySelector("svg").classList.add("rotate-180");
    firstLeftFaq.querySelector("h3").classList.add("text-primary-800");
  }

  const firstRightFaq = document.querySelector(
    '[data-column="right"] .faq-toggle'
  );
  if (firstRightFaq) {
    const firstRightContent = firstRightFaq
      .closest("div")
      .querySelector(".faq-content");
    firstRightContent.style.maxHeight = firstRightContent.scrollHeight + "px";
    firstRightFaq.querySelector("svg").classList.add("rotate-180");
    firstRightFaq.querySelector("h3").classList.add("text-primary-800");
  }
});

// Back to top button functionality
const backToTopButton = document.getElementById("back-to-top");
if (backToTopButton) {
  // Show button when scrolling down
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.remove("hidden");
      backToTopButton.classList.add("scale-100");
    } else {
      backToTopButton.classList.add("hidden");
    }
  });
}
backToTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("DOMContentLoaded", function () {
  const blogContainer = document.getElementById("blog-posts");

  // Fetch recent posts from WordPress REST API
  fetch(
    "https://theelderlywellness.com/blogs/wp-json/wp/v2/posts?per_page=3&_embed"
  )
    .then((response) => response.json())
    .then((posts) => {
      blogContainer.innerHTML = ""; // Clear loading state

      posts.forEach((post) => {
        // Get featured image or placeholder
        const imageUrl =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
          "https://via.placeholder.com/600x400?text=Elderly+Wellness";
        const imageAlt =
          post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
          post.title.rendered;

        // Format date
        const postDate = new Date(post.date);
        const formattedDate = postDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Create blog card
        const blogCard = document.createElement("div");
        blogCard.className =
          "group overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300";
        blogCard.innerHTML = `
          <a href="${post.link}" class="block">
            <div class="h-48 overflow-hidden">
              <img src="${imageUrl}" alt="${imageAlt}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            </div>
            <div class="p-6">
              <span class="text-sm text-primary">${formattedDate}</span>
              <h3 class="text-xl font-semibold text-gray-800 mt-2 mb-3 group-hover:text-primary transition-colors duration-300">${
                post.title.rendered
              }</h3>
              <p class="text-gray-600 line-clamp-2">${post.excerpt.rendered.replace(
                /<[^>]*>/g,
                ""
              )}</p>
              <div class="mt-4 flex items-center text-primary group-hover:text-primary transition-colors duration-300">
                <span class="font-medium">Read More</span>
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </a>
        `;

        blogContainer.appendChild(blogCard);
      });
    })
    .catch((error) => {
      console.error("Error fetching blog posts:", error);
      blogContainer.innerHTML = `
        <div class="col-span-3 text-center py-8">
          <p class="text-gray-600">Unable to load blog posts at this time. Please visit our <a href="https://theelderlywellness.com/blogs/" class="text-primary hover:underline">blog page</a> directly.</p>
        </div>
      `;
    });
});
