// import libraries
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// import classes
import LoadMoreBtn from './components/loadMoreBtn.js';
import GalleryImageApiService from './components/api.js';

const refs = {
  form: document.getElementById('search-form'),
  gallery: document.querySelector('.gallery'),
};
const galleryImageApiService = new GalleryImageApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  isHidden: true,
});

refs.form.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', fetchHits);

function onSubmit(e) {
  e.preventDefault();
  loadMoreBtn.show();
  const form = e.currentTarget;
  galleryImageApiService.searchQuery = form.elements.searchQuery.value.trim();
  galleryImageApiService.resetPage();
  clearInner();
  fetchHits().finally(() => form.reset());
}
function createGalleryItemsImage({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<a class="gallery__item" href="${largeImageURL}">
            <div class="photo-card">
              <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                <div class="info">
                <p class="info-item"><b>Likes</b> ${likes}</p>
                <p class="info-item"><b>Views</b> ${views}</p>
                <p class="info-item"><b>Comments</b> ${comments}</p>
                <p class="info-item"><b>Downloads</b> ${downloads}</p>
                </div>
            </div>
          </a>`;
}
function updateGalleryList(markup) {
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
  smoothScroll();
}
function clearInner() {
  refs.gallery.innerHTML = '';
}
function onError(err) {
  console.error(err);
  loadMoreBtn.hide();
  clearInner();
  Notify.failure(
    `❌ Sorry, there are no images matching your search query. Please try again.`
  );
}
function fetchHits() {
  loadMoreBtn.disable();
  return getGalleryImageMarkup()
    .then(markup => {
      updateGalleryList(markup);
      loadMoreBtn.enable();
    })
    .catch(onError);
}
function getGalleryImageMarkup() {
  return galleryImageApiService.getImage().then(({ hits }) => {
    if (hits.length === 0) throw new Error('No Data!');
    return hits.reduce(
      (markup, hit) => markup + createGalleryItemsImage(hit),
      ''
    );
  });
}
function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
const lightbox = new SimpleLightbox('.gallery__item', {
  captionDelay: 250,
  captionsData: 'alt',
  enableKeyboard: true,
});
