import './css/style.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36122923-4c7f71e9d9d6e85a0cc171286';
const searchQuery = '';
let page = 1;
let data;
let query;

btnLoadMore.addEventListener('click', onLoadMoreImages);
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
  query = evt.target.elements[0].value;
  btnLoadMore.style = 'display:block';

  if (query !== '') {
    fetchImages(query)
      .then(res => {
        createMarkup(res);
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    btnLoadMore.style = 'display:none';
  }
}

function onLoadMoreImages() {
  page += 1;
  fetchImages(query).then(res => {
    createMarkup(res);
  });
}

function createMarkup(res) {
  if (res) {
    const images = res.hits;

    console.log(images);
    if (images.length === 0) {
      gallery.innerHTML = '';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
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
      .join();

    gallery.innerHTML = markup;
    Notiflix.Notify.success('Hooray! We found totalHits images.');

    let galleryLightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionDelay: 250,
    });
  } else {
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    btnLoadMore.style = 'display:none';
  }
}
