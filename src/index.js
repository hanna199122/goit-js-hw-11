import './css/style.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';
let throttle = require('lodash.throttle');

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');
// window.addEventListener('scroll', throttle(loadMoreResults, 1000));

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36122923-4c7f71e9d9d6e85a0cc171286';
const searchQuery = '';
let page = 1;
let data;
let query;
const pageCounter = {
  totalPictures: 0,
  loadedPictures: 0,
};

let galleryLightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionDelay: 250,
});

btnLoadMore.addEventListener('click', onLoadMoreButton);
searchForm.addEventListener('submit', onSerchImages);

async function fetchImages(querySearch) {
  const params = new URLSearchParams({
    key: API_KEY,
    q: querySearch,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: page,
  });
  const URL = `${BASE_URL}?${params}`;

  try {
    const response = await axios.get(URL);
    data = response.data;
    console.log(data);

    return data;
  } catch (error) {
    console.log(error);

    return;
  }
}

async function onSerchImages(evt) {
  evt.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  query = evt.target.elements[0].value.trim();

  if (!query) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    btnLoadMore.style = 'display:none';
    return;
  }
  fetchImages(query)
    .then(res => {
      createMarkup(res);
      pageCounter.totalPictures = res.totalHits;
      pageCounter.loadedPictures = res.hits.length;
      console.log(pageCounter);
      if (pageCounter.totalPictures !== 0) {
        btnLoadMore.style = 'display:block';
        Notiflix.Notify.success(
          `Hooray! We found ${pageCounter.totalPictures} images.`
        );
      }
      if (pageCounter.totalPictures === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function onLoadMoreButton() {
  page += 1;
  fetchImages(query).then(res => {
    pageCounter.loadedPictures += res.hits.length;
    if (
      pageCounter.loadedPictures === pageCounter.totalPictures ||
      pageCounter.loadedPictures > pageCounter.totalPictures
    ) {
      btnLoadMore.style = 'display:none';
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
    console.log(pageCounter);
    createMarkup(res);
  });
}

function createMarkup(res) {
  const images = res.hits;
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
              <a class="gallery-link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
              </a>
            <div class="info">
            <p class="info-item">
              <b>Likes:</b>${likes}</b>
            </p>
            <p class="info-item">
              <b>Views:</b>${views}</b>
            </p>
            <p class="info-item">
              <b>Comments:</b>${comments}</b>
            </p>
            <p class="info-item">
              <b>Downloads:</b>${downloads}</b>
            </p>
          </div>
        </div>`;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  galleryLightbox.refresh();
}
