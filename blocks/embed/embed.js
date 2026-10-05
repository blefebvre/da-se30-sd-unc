/*
 * Embed Block (Block Collection embed)
 * https://www.aem.live/developer/block-collection/embed
 * 1 row: [optional placeholder image + link to the embed URL].
 * YouTube / Vimeo render 16:9; X/Twitter uses the widget script; any other
 * https URL becomes a generic iframe with a fixed responsive height (the
 * source embeds tall live-results pages that are not 16:9).
 * Embeds load lazily (IntersectionObserver), or on click when a placeholder
 * image is authored.
 */

const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  script.onload = callback;
  head.append(script);
  return script;
};

const getDefaultEmbed = (url) => `<div class="embed-frame embed-frame-generic">
    <iframe src="${url.href}"
      allow="encrypted-media; fullscreen" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;

const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  const src = vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : `${embed}${url.search}`;
  return `<div class="embed-frame embed-frame-video">
      <iframe src="https://www.youtube.com${src}"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  return `<div class="embed-frame embed-frame-video">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}"
      allow="autoplay; fullscreen; picture-in-picture"
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
};

const embedTwitter = (url) => {
  if (!url.href.startsWith('https://twitter.com')) {
    url.href = url.href.replace('https://x.com', 'https://twitter.com');
  }
  loadScript('https://platform.twitter.com/widgets.js');
  return `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
};

const EMBEDS_CONFIG = [
  { name: 'youtube', match: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'], embed: embedYoutube },
  { name: 'vimeo', match: ['vimeo.com'], embed: embedVimeo },
  { name: 'twitter', match: ['twitter.com', 'x.com'], embed: embedTwitter },
];

const hostMatches = (hostname, domain) => hostname === domain || hostname.endsWith(`.${domain}`);

const loadEmbed = (block, link, autoplay) => {
  if (block.classList.contains('embed-is-loaded')) return;

  let url;
  try {
    url = new URL(link);
  } catch (e) {
    return;
  }
  const config = EMBEDS_CONFIG.find((e) => e.match.some((d) => hostMatches(url.hostname, d)));
  if (config) {
    block.innerHTML = config.embed(url, autoplay);
    block.classList.add(`embed-${config.name}`);
  } else {
    block.innerHTML = getDefaultEmbed(url);
  }
  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  const placeholder = block.querySelector('picture');
  const anchor = block.querySelector('a[href]');
  const link = anchor ? anchor.href : block.textContent.trim().split(/\s+/).find((t) => /^https?:\/\//.test(t));
  if (!link) return;
  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder';
    wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      loadEmbed(block, link, true);
    });
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, link);
      }
    });
    observer.observe(block);
  }
}
