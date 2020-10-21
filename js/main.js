const OMDB_API_KEY = "aa0b0e3e";
const OMDB_URL = `${window.location.protocol}//www.omdbapi.com/?apikey=${OMDB_API_KEY}`;

let OMDB_LIBRARY = null;
let STORAGE_LIBRARY = null;

const showError = function(msg) {
  if (msg) {
    const err = document.querySelector("#movies-library .errors");
    if (err) {
      err.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ${msg}</p>`;
      err.style.display = "block";

      showElement("#movies-library");
    }
  }
} // showError

const fetchData = function(params, callback) {
  const xhr = new XMLHttpRequest();
  xhr.responseType = "json";

  xhr.addEventListener("load", e => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.response && callback) {
        callback(xhr.response);
      } else {
        console.log(`${xhr.status} [${xhr.statusText}]`);
      }
    }
  });

  xhr.addEventListener("error", e => {
    //console.error("Could not connect properly!");
    showError("Something went wrong while connecting to OMDB!");
  });

  const u = `${OMDB_URL}&${params.join("&")}`;
  //console.log(`~ FetchData called for params: ${u}`);

  xhr.open("GET", u, true);
  xhr.send(null);
} // fetchData

const parseMovie = function(omdb) {
  if (OMDB_LIBRARY) {
    OMDB_LIBRARY.updateMovie(omdb);
  }
} // parseMovie

const parseMovies = function(omdb) {
  if (omdb["Response"] === "False") {
    //console.error(`${omdb["Error"] ? omdb["Error"] : "???"}`);
    showError(omdb["Error"]);
  } else {
    const library = new Library("movies-library");
    let m = null;

    if (omdb["Search"]) {
      // searched by title - one or more results found
      for (let i = 0; i < omdb["Search"].length; i++) {
        m = new Movie();
        m.parseFromOmdb(omdb["Search"][i]);
        library.addMovie(m);

        // update movie's ratings and plot
        let plot = "short";
        const p = document.getElementById("omdb-plot-type");
        if (p) {
          plot = p.value;
        }
        fetchData([`i=${m.imdb_id}`, `plot=${plot}`, "r=json"], parseMovie);
      }
    } else {
      // searched by IMDB ID
      m = new Movie();
      m.parseFromOmdb(omdb);
      library.addMovie(m);
    }

    showElement("#movies-library");

    OMDB_LIBRARY = library;
    OMDB_LIBRARY.renderHtml();
  }

  toggleSearchBtn();
  toggleElement("#movies-library .spinner");
} // parseMovies

const toggleSearchBtn = function() {
  const btn = document.getElementById("submit-btn");
  if (btn) {
    const i = btn.querySelector("i.fas");
    btn.disabled = !btn.disabled;

    if (btn.disabled) {
      i.className = "fas fa-spinner fa-pulse";
    } else {
      i.className = "fas fa-search";
    }
  }
} // toggleSearchBtn

const toggleElement = function(selector) {
  const elem = document.querySelector(selector);
  if (elem) {
    elem.style.display = elem.style.display == "block" ? "none" : "block";
  }
} // toggleElement

const showElement = function(selector) {
  const elem = document.querySelector(selector);
  if (elem) {
    elem.style.display = "block";
  }
} // showElement

const hideElement = function(selector) {
  const elem = document.querySelector(selector);
  if (elem) {
    elem.style.display = "none";
  }
} // hideElement

const onSearchMovies = function(e) {
  e.preventDefault();

  const omdbid = document.getElementById("omdb-id");
  if (omdbid) {
    omdbid.value = "";
  }

  if (OMDB_LIBRARY != null) {
    OMDB_LIBRARY.clear();
  }

  const form = e.target;

  if (form && form.elements.length) {
    toggleSearchBtn();
    toggleElement("#movies-library .spinner");

    const params = [];

    for (let i = 0, elem = null, val = null; i < form.elements.length; i++) {
      elem = form.elements[i];
    
      if (elem.name.indexOf("omdb-") === 0) {
        val = elem.value.trim();

        if (val) {
          if (elem.name == "omdb-title") {
            const tmp = elem.value.match(/tt\d+/g);
            if (tmp && omdbid) {
              // serching by IMDB ID
              omdbid.value = tmp[0];
            } else {
              // searching by title
              params.push(`${elem.getAttribute("data-omdb-param-name")}=${val}`);
            }
          } else {
            params.push(`${elem.getAttribute("data-omdb-param-name")}=${val}`);
          }
        }
      }
    }

    if (params.length) {
      fetchData(params, parseMovies);
    }
  } else {
    toggleSearchBtn();
    toggleElement("#movies-library .spinner");
  }
} // onSearchMovies

const onRatingChanged = function(e) {
  if (e.target.parentNode.nodeName.toLowerCase() == "li" && e.target.parentNode.getAttribute("data-rate")) {
    const li = e.target.parentNode;
    const ul = li.parentNode;

    const r = li.getAttribute("data-rate");
    
    ul.setAttribute("data-rated", r);

    if (STORAGE_LIBRARY) {
      STORAGE_LIBRARY.rateMovie(ul.getAttribute("data-imdbid"), r);
      STORAGE_LIBRARY.saveToStorage();
    }
  }
} // onRatingChanged

const onRatingMouseEnter = function(e) {
  if (e.target.parentNode.className == "my-rating" && e.target.getAttribute("data-rate")) {
    const li = e.target;

    const index = Array.from(li.parentNode.children).indexOf(li);

    for (let i = 1, item = null; i <= index; i++) {
      item = li.parentNode.children[i].querySelector("i.far.fa-star");
      if (item) {
        item.className = "fas fa-star fa-1x rated";
      }
    }

    for (let i = li.parentNode.children.length - 2; i > index; i--) {
      item = li.parentNode.children[i].querySelector("i.fas.fa-star");
      if (item) {
        item.className = "far fa-star fa-1x";
      }
    }
  }
} // onRatingMouseEnter

const onRatingMouseLeave = function(e) {
  if (e.target.className == "my-rating" && e.target.getAttribute("data-rated")) {
    const ul = e.target;
    const r = parseInt(ul.getAttribute("data-rated"), 10);

    ul.querySelectorAll("li[data-rate]").forEach(li => {
      let dr = parseInt(li.getAttribute("data-rate"), 10);
      
      const star = li.querySelector("i");
      if (star) {
        if (dr > r) {
          star.className = "far fa-star fa-1x";
        } else {
          star.className = "fas fa-star fa-1x";
        }
      }
    });
  }
} // onRatingMouseLeave

const onWatchedChanged = function(e) {
  if (e.target.className == "watched" && e.target.getAttribute("data-imdbid")) {
    STORAGE_LIBRARY.setMovieAsWatched(e.target.getAttribute("data-imdbid"), e.target.checked);
    STORAGE_LIBRARY.saveToStorage();
  }
} // onWatchedChanged

const onAddMovieToMyLibrary = function(e) {
  if (e.target.className.indexOf("add-movie-to-my-library") !== -1) {
    e.preventDefault();

    const id = e.target.getAttribute("data-imdbid");
    if (id) {
      const omdbMovie = OMDB_LIBRARY.getMovie(id);
      if (omdbMovie) {
        if (!STORAGE_LIBRARY) {
          STORAGE_LIBRARY = new Library("storage-library");
        }

        if (STORAGE_LIBRARY.getMoviesCount() == 0) {
          showElement("#storage-library");
        }

        if (OMDB_LIBRARY.getMoviesCount() == 1) {
          hideElement("#movies-library");
        }

        const storageMovie = STORAGE_LIBRARY.getMovie(id);
        if (storageMovie) {
          // already exists in storage library
          // only plot can be different (short|long)
          if (storageMovie.getPlot() != omdbMovie.getPlot()) {
            storageMovie.setPlot(omdbMovie.getPlot());
          }

          OMDB_LIBRARY.deleteMovie(id, true);
        } else {
          OMDB_LIBRARY.deleteMovie(id);

          STORAGE_LIBRARY.addMovie(omdbMovie);
          omdbMovie.renderHtml();
        }

        STORAGE_LIBRARY.saveToStorage();

        const elem = document.querySelector(`#storage-library .movie[data-imdb-id='${id}']`);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
        }
      }
    }
  }
} // onAddMovieToMyLibrary

const onRemoveMovieFromLibrary = function(e) {
  if (e.target.className.indexOf("remove-movie-from-library") !== -1) {
    e.preventDefault();

    const id = e.target.getAttribute("data-imdbid");
    if (id) {
      const movie = STORAGE_LIBRARY.getMovie(id);
      if (movie) {
        STORAGE_LIBRARY.deleteMovie(id, true);
        STORAGE_LIBRARY.saveToStorage();

        if (STORAGE_LIBRARY.getMoviesCount() == 0) {
          hideElement("#storage-library");
        }
      }
    }
  }

  if (e.target.className.indexOf("remove-all") !== -1) {
    e.preventDefault();

    if (STORAGE_LIBRARY.getMoviesCount()) {
      STORAGE_LIBRARY.clear();
      STORAGE_LIBRARY.saveToStorage();
      
      hideElement("#storage-library");
    }
  }
} // onRemoveMovieFromLibrary

const onLoadMoviesLibrary = function() {
  toggleElement("#storage-library .spinner");
  
  STORAGE_LIBRARY = new Library("storage-library");
  STORAGE_LIBRARY.readStorageData();

  if (STORAGE_LIBRARY.getMoviesCount() > 0) {
    showElement("#storage-library");
    STORAGE_LIBRARY.renderHtml();
  }

  toggleElement("#storage-library .spinner");
} // onLoadMoviesLibrary

window.addEventListener("DOMContentLoaded", e => {
  onLoadMoviesLibrary();

  let elem = document.getElementById("omdb-year");
  if (elem) {
    elem.max = new Date().getUTCFullYear();
  }

  const form = document.getElementById("search-form");
  if (form) {
    form.addEventListener("submit", onSearchMovies);
  }

  const omdbLib = document.getElementById("movies-library");
  if (omdbLib) {
    omdbLib.addEventListener("click", onAddMovieToMyLibrary);
  }

  const storLib = document.getElementById("storage-library");
  if (storLib) {
    storLib.addEventListener("click", onRatingChanged);
    storLib.addEventListener("mouseenter", onRatingMouseEnter, true);
    storLib.addEventListener("mouseleave", onRatingMouseLeave, true);

    storLib.addEventListener("change", onWatchedChanged);

    storLib.addEventListener("click", onRemoveMovieFromLibrary);
  }
}); // DOMContentLoaded