class Library {

  constructor(container) {
    this.container = container;
    this.movies = [];
  } // constructor

  getMoviesCount() {
    return this.movies.length;
  } // getMoviesCount

  addMovie(movie) {
    if (movie instanceof Movie) {
      this.movies.push(movie);

      movie.setContainer(this.container);
      //movie.renderHtml();
    }
  } // addMovie

  getMovie(imdb_id) {
    for (let i = 0; i < this.movies.length; i++) {
      if (this.movies[i].getImdbID() == imdb_id) {
        return this.movies[i];
      }
    }

    return null;
  } // getMovie

  updateMovie(omdb) {
    const movie = this.getMovie(omdb.imdbID);
    if (movie) {
      movie.update(omdb);
    }
  } // updateMovie

  deleteMovie(id, deleteRef = false) {
    let found = false;
    const nm = [];

    for (let i = 0; i < this.movies.length; i++) {
      if (this.movies[i].getImdbID() == id) {
        this.movies[i].delete();
        found = true;

        if (deleteRef) {
          delete this.movies[i];
        }
      } else {
        nm.push(this.movies[i]);
      }
    }

    if (found) {
      this.movies = nm;
    }
  } // deleteMovie

  rateMovie(id, rate) {
    const movie = this.getMovie(id);
    if (movie) {
      movie.rate(rate);
    }
  } // rateMovie

  setMovieAsWatched(id, bWatched) {
    const movie = this.getMovie(id);
    if (movie) {
      movie.setWatched(bWatched);
    }
  } // setMovieAsWatched

  renderHtml() {
    //this.movies.forEach(movie => { movie.renderHtml(); });
    for (let i = 0; i < this.movies.length; i++) {
      this.movies[i].renderHtml();
    }
  } // renderHtml

  clear() {
    for (let i = 0; i < this.movies.length; i++) {
      this.movies[i].delete();
      delete this.movies[i];
    }
    
    this.movies = [];
  } // clear

  saveToStorage() {
    let data = [];

    //console.table(this.movies);

    for (let i = 0; i < this.movies.length; i++) {
      data.push(this.movies[i].serialize());
    }

    Storage.save(data);
  } // saveToStorage

  readStorageData() {
    const data = Storage.read();

    if (data && data.length) {
      for (let i = 0, m = null; i < data.length; i++) {
        m = new Movie();
        m.deserialize(data[i]);
        this.addMovie(m);
      }
    }
  } // readStorageData

} // Library