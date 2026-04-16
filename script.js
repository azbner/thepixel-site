const revealItems = [...document.querySelectorAll(".reveal")];

revealItems.forEach((item, index) => {
  item.classList.add(`reveal-delay-${Math.min(index % 3, 2)}`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const cards = document.querySelectorAll(".tilt-card");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!prefersReducedMotion.matches) {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

const interactiveItems = document.querySelectorAll(".button, .feature-card, .community-card");
const videoFeed = document.querySelector("#video-feed");

if (!prefersReducedMotion.matches) {
  interactiveItems.forEach((item) => {
    item.addEventListener("pointerenter", () => {
      item.style.boxShadow = "0 0 0 1px rgba(119, 242, 255, 0.18), 0 24px 80px rgba(2, 6, 23, 0.62)";
    });

    item.addEventListener("pointerleave", () => {
      item.style.boxShadow = "";
    });
  });

}

const channelId = "UCtsSmR-XhHHCQ-HslQeUsIw";
const rssFeedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
const rssApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeedUrl)}`;

const formatDate = (value) => {
  const date = new Date(value);

  return new Intl.DateTimeFormat("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const sanitizeText = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderVideos = async () => {
  if (!videoFeed) {
    return;
  }

  try {
    const response = await fetch(rssApiUrl);

    if (!response.ok) {
      throw new Error("rss fetch failed");
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items.slice(0, 3) : [];

    if (!items.length) {
      throw new Error("no items");
    }

    videoFeed.innerHTML = items
      .map((item) => {
        const title = sanitizeText(item.title || "Video the PIXEL");
        const date = sanitizeText(formatDate(item.pubDate));
        const thumb = sanitizeText(item.thumbnail || "");
        const link = sanitizeText(item.link || "#");

        return `
          <a class="video-card liquid-card reveal is-visible tilt-card" href="${link}" target="_blank" rel="noreferrer">
            <img class="video-card-thumb" src="${thumb}" alt="${title}">
            <div class="video-card-copy">
              <span class="panel-kicker">YouTube</span>
              <h3>${title}</h3>
              <time datetime="${sanitizeText(item.pubDate)}">${date}</time>
            </div>
          </a>
        `;
      })
      .join("");
  } catch (error) {
    videoFeed.innerHTML = `
      <article class="video-card liquid-card">
        <div class="video-card-copy">
          <span class="panel-kicker">Indisponible</span>
          <h3>Les videos ne peuvent pas etre chargees pour le moment.</h3>
          <p>Tu peux toujours ouvrir la chaine ou la page des shorts avec les boutons juste en dessous.</p>
        </div>
      </article>
    `;
  }
};

renderVideos();
