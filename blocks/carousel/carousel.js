import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Carousel (Block Collection carousel, adapted).
 * Each row = one slide: [image | optional text content]. Image-only slides
 * render without a text overlay; an empty content cell is dropped. Single
 * slide = no controls. Prev/next arrows sit over the slide, dot indicators
 * overlay its bottom edge. scripts/aem.js here has no fetchPlaceholders, so
 * labels use the Block Collection defaults.
 */

const LABELS = {
  carousel: 'Carousel',
  carouselSlideControls: 'Carousel Slide Controls',
  previousSlide: 'Previous Slide',
  nextSlide: 'Next Slide',
  showSlide: 'Show Slide',
  of: 'of',
};

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  let realSlideIndex = Number.isNaN(slideIndex) ? 0 : slideIndex;
  if (realSlideIndex < 0) realSlideIndex = slides.length - 1;
  if (realSlideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
  // keep state in sync even if the observer cannot fire (e.g. hidden tab panel)
  updateActiveSlide(activeSlide);
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { root: block.querySelector('.carousel-slides'), threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  const cells = [...row.querySelectorAll(':scope > div')];
  // the image cell is the first one holding a picture (defaults to cell 1)
  const imageCell = cells.find((c) => c.querySelector('picture')) || null;
  cells.forEach((cell) => {
    if (cell === imageCell) {
      cell.className = 'carousel-slide-image';
      const img = cell.querySelector('picture img');
      if (img) {
        img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, slideIndex === 0, [
          { media: '(min-width: 600px)', width: '1200' },
          { width: '750' },
        ]));
      }
      slide.append(cell);
    } else if (cell.textContent.trim() || cell.querySelector('img, a')) {
      cell.className = 'carousel-slide-content';
      slide.append(cell);
    }
  });
  if (!slide.querySelector('.carousel-slide-content')) slide.classList.add('carousel-slide-image-only');

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy && labeledBy.id) {
    slide.setAttribute('aria-labelledby', labeledBy.id);
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.textContent.trim() || row.querySelector('picture, img'));
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', LABELS.carousel);

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  let slideIndicators;
  let slideIndicatorsNav;
  if (!isSingleSlide) {
    slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.className = 'carousel-slide-indicators-nav';
    slideIndicatorsNav.setAttribute('aria-label', LABELS.carouselSlideControls);
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${LABELS.previousSlide}"></button>
      <button type="button" class="slide-next" aria-label="${LABELS.nextSlide}"></button>
    `;
    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, carouselId));

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${LABELS.showSlide} ${idx + 1} ${LABELS.of} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
  });

  container.prepend(slidesWrapper);
  if (slideIndicatorsNav) container.append(slideIndicatorsNav);
  block.replaceChildren(container);

  const first = slidesWrapper.querySelector('.carousel-slide');
  if (first) updateActiveSlide(first);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
