class Movie {

  constructor() {
    this.hasBeenRendered = false;
    this.hasBeenWatched = false;

    this.parentContainer = null;

    this.imdb_id = "";
    this.title = "";

    this.plot = "";
    this.poster = "";
    
    this.ratings = "";
    this.my_rating = 0;

    this.year = "";
  } // constructor

  setContainer(container) {
    this.parentContainer = document.getElementById(container);
  } // setContainer

  setWatched(bWatched) {
    this.hasBeenWatched = bWatched;
  } // setWatched

  getImdbID() {
    return this.imdb_id;
  } // getImdbID

  getPlot() {
    return this.plot;
  } // getPlot

  setPlot(plot) {
    if (plot) {
      this.plot = plot;

      if (this.hasBeenRendered) {
        const m = document.querySelector(`#${this.parentContainer.id} div.movie[data-imdb-id="${this.imdb_id}"] .info .plot`);
        if (m) {
          m.innerHTML = this.plot;
        }
      }
    }
  } // setPlot

  parseFromOmdb(omdb) {
    this.imdb_id = omdb.imdbID;
    this.title = omdb.Title;

    this.plot = omdb.Plot;
    this.poster = omdb.Poster;
    
    this.ratings = omdb.Ratings;
    this.my_rating = (omdb.MyRating ? parseInt(omdb.MyRating, 10) : 0);

    this.year = omdb.Year;

    this.hasBeenWatched = (omdb.watched !== undefined) ? omdb.watched : false;
    if (this.hasBeenWatched === "false") {
      this.hasBeenWatched = false;
    }
  } // parseFromOmdb

  update(omdb) {
    this.ratings = omdb.Ratings;
    this.plot = omdb.Plot;

    if (this.hasBeenRendered) {
      const m = document.querySelector(`#${this.parentContainer.id} div.movie[data-imdb-id="${this.imdb_id}"] .info`);
      if (m) {
        const plot = m.querySelector(".plot");
        if (plot) {
          plot.innerHTML = this.plot;
        }
        
        if (this.ratings && this.ratings.length) {
          let elem = document.createElement("h4");
          elem.appendChild(document.createTextNode("Ratings:"));
          m.appendChild(elem);

          elem = document.createElement("ul");
          elem.className = "ratings fa-ul";

          elem.innerHTML = `${this.ratings.map(rating => {
            return `<li><i class="fa-li fas fa-hand-point-right"></i> ${rating.Source} ${rating.Value}</li>`
          }).join("")}`;

          m.appendChild(elem);
        }
      }
    }
  } // update

  delete() {
    const m = document.querySelector(`#${this.parentContainer.id} div.movie[data-imdb-id="${this.imdb_id}"]`);
    if (m) {
      m.parentNode.removeChild(m);
    }
  } // delete

  getRatingHtml() {
    let ratingHtml = `<ul class="my-rating" data-rated="${this.my_rating}" data-imdbid="${this.imdb_id}">`;
    ratingHtml += '<li><i class="far fa-meh fa-1x"></i></li>';

    const filled = 'fas fa-star fa-1x rated';
    const empty = 'far fa-star fa-1x';

    for (let i = 1; i <= 10; i++) {
      ratingHtml += `<li data-rate="${i}"><i class="${this.my_rating >= i ? filled : empty}"></i></li>`;
    }

    ratingHtml += '<li><i class="far fa-smile fa-1x"></i></li>';
    ratingHtml += '</ul>';

    return ratingHtml;
  } // getRatingHtml

  renderHtml() {
    if (this.parentContainer) {
      let html = `<div class="movie" data-imdb-id="${this.imdb_id}">
        <div class="poster">
          <img src="${this.poster}" alt="${this.title}" onerror="this.style.display='none';" />
        </div>
        <div class="info">
          <h3>${this.title} [${this.year}]</h3>
          <p class="plot">${this.plot ? this.plot : ""}</p>

          ${this.ratings !== undefined && this.ratings.length > 0 ? `<h4>Ratings:</h4><ul class="ratings fa-ul">
            ${this.ratings.map(rating => {
              return `<li><i class="fa-li fas fa-hand-point-right"></i> ${rating.Source} ${rating.Value}</li>`;
            }).join("")}
          </ul>` : ""}`;
      
      if (this.parentContainer.id === "storage-library") {
        html += this.getRatingHtml();

        html += `<div class="watched">
          <span><strong>Watched:</strong></span>
          <label class="switch">
            <input type="checkbox" ${this.hasBeenWatched ? 'checked="checked"' : ""} class="watched" data-imdbid="${this.imdb_id}" />
            <span class="slider round"></span>
          </label>
        </div>`;

        html += `<p>
          <a href="#" class="btn-link remove-movie-from-library" data-imdbid="${this.imdb_id}">
            <i class="fas fa-trash"></i> Remove</a></p>`;
      } else {
        html += `<p>
          <a href="#" class="btn-link add-movie-to-my-library" data-imdbid="${this.imdb_id}">
            <i class="fas fa-plus-square"></i> Add to my library</a></p>`
      }
      
      html += `</div></div></div>`;
      
      this.parentContainer.innerHTML += html;
    }

    this.hasBeenRendered = true;
  } // renderHtml

  rate(r) {
    //console.log(`${this.getImdbID()} changed rating to: ${r}`);
    this.my_rating = r;
  } // rate

  deserialize(obj) {
    this.parseFromOmdb(JSON.parse(obj));
  } // deserialize

  serialize() {
    const data = {
      imdbID : this.imdb_id,
      Title : this.title,
      Plot : this.plot,
      Poster : this.poster,
      Ratings : this.ratings,
      MyRating : this.my_rating,
      Year: this.year,
      watched: this.hasBeenWatched
    };

    return JSON.stringify(data);
  } // serialize

} // Movie