//GET MAIN SECTION
const mainSection = document.getElementById("main-section");
document.body.appendChild(mainSection);

//FUNCTION THAT CREATES THE ELEMENTS WITH CSS CLASSES
function createElementWithClass(tagName, ...classNames) {
   const el = document.createElement(tagName);
   classNames.forEach((className) => {
      el.classList.add(className);
   });
   return el;
}

//FUNCTION CREATE ELEMENTS AND APPEND THEM TO PAGE
function createElements(movie) {
   const movieDisplayContainer = createElementWithClass(
      "div",
      "movie-display-container",
      "shown"
   );
   const logoImage = createElementWithClass("img");
   const movieDescription = createElementWithClass("h1", "movie-description");
   const movieRating = createElementWithClass("span", "movie-subtitle-items");
   const movieTitle = createElementWithClass("h1", "movie-title");
   const movieCard = createElementWithClass("div", "movie-card");
   const logoContainer = createElementWithClass("span", "logo-container");
   const movieStatus = createElementWithClass("span", "movie-status");
   const movieSubtitle = createElementWithClass("div", "movie-subtitle");
   const favoriteContainer = createElementWithClass(
      "span",
      "movie-subtitle-items"
   );
   const starIcon = createElementWithClass("img");
   starIcon.src = "assets/Star.svg";
   const isFavorited = checkMovieIsFavorited(movie.id);
   const favoriteIcon = createElementWithClass("img", "heart-icon");

   favoriteIcon.addEventListener("click", (event) => {
      setFavoriteMovieStatus(event, movie);
   });

   const favoriteMovies = getFavoriteMovies() || [];

   if (favoriteMovies.includes(movie)) {
      favoriteIcon.src = "assets/heart-fill.svg";
   } else {
      favoriteIcon.src = "assets/heart.svg";
   }
   if (isFavorited) {
      favoriteIcon.src = "assets/heart-fill.svg";
   } else {
      favoriteIcon.src = "assets/heart.svg";
   }
   ///////////////////////////

   //Append section
   mainSection.appendChild(movieDisplayContainer);
   movieCard.appendChild(logoContainer);
   logoContainer.appendChild(logoImage);
   movieCard.appendChild(movieStatus);
   movieStatus.appendChild(movieTitle);
   movieStatus.appendChild(movieSubtitle);
   movieSubtitle.appendChild(movieRating);
   movieRating.insertAdjacentElement("afterbegin", starIcon);
   movieSubtitle.appendChild(favoriteContainer);
   favoriteContainer.textContent += "Favoritar";
   favoriteContainer.insertAdjacentElement("afterbegin", favoriteIcon);
   movieCard.appendChild(movieDescription);
   movieDisplayContainer.appendChild(movieCard);
   const movieDisplay = {
      logoImage,
      movieTitle,
      movieRating,
      movieDescription,
      favoriteIcon,
   };
   setMovieData(movieDisplay, movie);
}

//THROWS INFO INTO THE NEW COMPONENT
async function setMovieData(movieDisplay, movie) {
   movieDisplay.logoImage.src = await getMovieImage(movie);

   if (
      movie?.release_date === undefined ||
      movie.release_date === false ||
      !movie.release_date
   ) {
      movieYear = "Sem data publicada";
   } else {
      let fullMovieYear = movie?.release_date?.split("-");
      movieYear = fullMovieYear[0];
   }

   movieDisplay.movieTitle.textContent =
      movie.title + " " + "(" + movieYear + ")";
   movieDisplay.movieRating.innerHTML += movie.vote_average;
   movieDisplay.movieDescription.textContent = movie.overview
      ? movie.overview
      : "Filme sem descrição...";
}

//FUNCTION RENDER MOVIES
function renderMovie(movie) {
   createElements(movie);
}

//CLEARS THE DISPLAY
function clearSection() {
   mainSection.innerHTML = "";
}

//GET DATA FROM API
const baseURL = "https://api.themoviedb.org/3/movie/";
async function getPopularMovies() {
   const url = "".concat(
      baseURL,
      "popular/?api_key=",
      API_KEY,
      "&language=pt-BR&page=1"
   );

   const fetchResponse = await fetch(url);
   const { results } = await fetchResponse.json();
   return results;
}

//GETS THE MOVIE URL
async function getMovieImage(movie) {
   return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
}

//SEARCH MOVIE FUNCTION

const searchInputField = document.getElementById("search-input");
searchInputField.addEventListener("change", () => {
   const query = searchInputField.value;
   clearSection();
   searchMovie(query, displayFavoritesCheckbox).then((res) => {
      res.forEach((movie) => renderMovie(movie));
   });
});

async function searchMovie(query, checkbox) {
   checkbox.checked = false;
   const searchURL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&page=1&include_adult=false&query=${query}`;
   const fetchResponse = await fetch(searchURL);
   const { results } = await fetchResponse.json();
   return results;
}

//DISPLAY ONLY FAVORITED MOVIES FUNCTION
const displayFavoritesCheckbox = document.getElementById("checkbox");
displayFavoritesCheckbox.addEventListener("click", () => {
   if (displayFavoritesCheckbox.checked) {
      displayFavoritesOnly();
   } else {
      clearSection();
      getPopularMovies().then((res) => {
         res.forEach((movie) => renderMovie(movie));
      });
   }
});

//FUNCTION DISPLAY FAVORITE MOVIES ONLY
function displayFavoritesOnly() {
   clearSection();
   const movies = getFavoriteMovies() || [];

   movies.forEach((movie) => {
      if (Object.values(movie).includes(movie.id)) {
         movie.isFavorited = true;
      } else {
         movie.isFavorited = false;
      }
      renderMovie(movie);
   });
}

//starts the application
window.onload = async function () {
   const movies = await getPopularMovies();
   movies.forEach((movie) => {
      renderMovie(movie);
   });
};

const favoriteMoviesStorage = new Array();
localStorage.setItem("favorite movies", JSON.stringify(favoriteMoviesStorage));

function addFavoriteMoviesToStorage(movie) {
   movie.isFavorited = true;
   favoriteMoviesStorage.push(movie);
   const favoriteSet = new Set(favoriteMoviesStorage);
   const favoriteDefinitive = Array.from(favoriteSet);
   localStorage.setItem("favorite movies", JSON.stringify(favoriteDefinitive));
}
function removeFavoriteMovieFromStorage(movie) {
   const movies = getFavoriteMovies() || [];
   const movieToBeRemoved = movies.find(
      (favoriteMovie) => favoriteMovie.id === movie.id
   );

   const newFavoriteMovies = movies.filter(
      (favoriteMovie) => favoriteMovie.id != movieToBeRemoved.id
   );
   const favoriteSet = new Set(newFavoriteMovies);
   const favoriteDefinitive = Array.from(favoriteSet);

   localStorage.setItem("favorite movies", JSON.stringify(favoriteDefinitive));
}

function checkMovieIsFavorited(id) {
   const movies = getFavoriteMovies() || [];
   return movies.find((movie) => movie.id == id);
}

//SETS ICON TO FAVORITED MOVIES
function setFavoriteMovieStatus(event, movie) {
   const favoriteState = {
      favorited: "assets/heart-fill.svg",
      notFavorited: "assets/heart.svg",
   };

   if (event.target.src.includes(favoriteState.notFavorited)) {
      // aqui ele será favoritado
      event.target.src = favoriteState.favorited;
      addFavoriteMoviesToStorage(movie);
   } else {
      // aqui ele será desfavoritado
      event.target.src = favoriteState.notFavorited;
      removeFavoriteMovieFromStorage(movie);
   }
}

function getFavoriteMovies() {
   return JSON.parse(localStorage.getItem("favorite movies")) || [];
}
