class Search {
  // This class handles the search overlay functionality
  constructor() {
    // Using querySelector/All to select elements
    this.resultsDiv = document.querySelector(".search-overlay__results");
    this.openButtons = document.querySelectorAll(".js-search-trigger");
    this.closeButtons = document.querySelectorAll(".search-overlay__close");
    this.searchOverlay = document.querySelector(".search-overlay");
    this.searchField = document.querySelector(".search-term");

    // Variables to track state
    this.isOverlayOpen = false;
    this.isSpinnerVisible = false;
    this.previousValue = "";
    this.typingTimer = null;

    // Setup event listeners
    this.events();
  }

  events() {
    // Add click event listeners for all search trigger buttons
    this.openButtons.forEach((btn) => {
      btn.addEventListener("click", this.openOverlay.bind(this));
    });

    // Add click event listeners for all close buttons
    this.closeButtons.forEach((btn) => {
      btn.addEventListener("click", this.closeOverlay.bind(this));
    });

    // Listen for keydown events on the document
    document.addEventListener("keydown", this.keyPressDispatcher.bind(this));

    // Listen for keyup events on the search field (if it exists)
    if (this.searchField) {
      this.searchField.addEventListener("keyup", this.typingLogic.bind(this));
    }
  }

  typingLogic() {
    // Only proceed if the current value is different than before
    if (this.searchField.value !== this.previousValue) {
      clearTimeout(this.typingTimer);

      // If search field has a value, show spinner and start timer
      if (this.searchField.value) {
        if (!this.isSpinnerVisible) {
          // Set the innerHTML to show a spinner; equivalent to jQuery's .html()
          this.resultsDiv.innerHTML = '<div class="spinner-loader"></div>';
          this.isSpinnerVisible = true;
        }

        // Start the timer to get results after 3/4 of second
        this.typingTimer = setTimeout(this.getResults.bind(this), 750);
      } else {
        // If the search field is empty, clear results and hide spinner
        this.resultsDiv.innerHTML = "";
        this.isSpinnerVisible = false;
      }
    }

    // Save the current value for future checks
    this.previousValue = this.searchField.value;
  }

  getResults() {
    // Construct the URL using the search field's value.
    const url =
      universityData.root_url +
      "/wp-json/university/v1/search?query=" +
      this.searchField.value;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((results) => {
        this.resultsDiv.innerHTML = `
        <div class="row">
          <div class="one-third">
            <h2 class="search-overlay__section-title">General Information</h2>
            ${
              results.generalInfo.length
                ? '<ul class="link-list min-list">'
                : "<p>No general information matches that search.</p>"
            }
              ${results.generalInfo
                .map(
                  (item) =>
                    `<li><a href="${item.permalink}">${item.title}</a> ${
                      item.postType === "post" ? `by ${item.authorName}` : ""
                    }</li>`
                )
                .join("")}
            ${results.generalInfo.length ? "</ul>" : ""}
          </div>
          <div class="one-third">
            <h2 class="search-overlay__section-title">Programs</h2>
            ${
              results.programs.length
                ? '<ul class="link-list min-list">'
                : `<p>No programs match that search. <a href="${universityData.root_url}/programs">View all programs</a></p>`
            }
              ${results.programs
                .map(
                  (item) =>
                    `<li><a href="${item.permalink}">${item.title}</a></li>`
                )
                .join("")}
            ${results.programs.length ? "</ul>" : ""}
  
            <h2 class="search-overlay__section-title">Professors</h2>
            ${
              results.professors.length
                ? '<ul class="professor-cards">'
                : `<p>No professors match that search.</p>`
            }
              ${results.professors
                .map(
                  (item) => `
                        <li class="professor-card__list-item">
                            <a class="professor-card" href="${item.permalink}">
                                <img class="professor-card__image" src="${item.image}">
                                <span class="professor-card__name">${item.title}</span>
                            </a>
                        </li>
                `
                )
                .join("")}
            ${results.professors.length ? "</ul>" : ""}
  
          </div>
          <div class="one-third">
            <h2 class="search-overlay__section-title">Campuses</h2>
            ${
              results.campuses.length
                ? '<ul class="link-list min-list">'
                : `<p>No campuses match that search. <a href="${universityData.root_url}/campuses">View all campuses</a></p>`
            }
              ${results.campuses
                .map(
                  (item) =>
                    `<li><a href="${item.permalink}">${item.title}</a></li>`
                )
                .join("")}
            ${results.campuses.length ? "</ul>" : ""}
  
            <h2 class="search-overlay__section-title">Events</h2>
            ${
              results.events.length
                ? ""
                : `<p>No events match that search. <a href="${universityData.root_url}/events">View all events</a></p>`
            }
              ${results.events
                .map(
                  (item) =>
                    `
                  <div class="event-summary">
                    <a class="event-summary__date t-center" href="${item.permalink}">
                    <span class="event-summary__month">
                        ${item.month}
                    </span>
                    <span class="event-summary__day">
                        ${item.day}
                    </span>
                    </a>
                    <div class="event-summary__content">
                    <h5 class="event-summary__title headline headline--tiny"><a href="${item.permalink}">${item.title}</a></h5>
                    <p>
                         ${item.description} 
                    <a href="${item.permalink}" class="nu gray">Learn more</a></p>
                    </div>
                </div>          
                  `
                )
                .join("")}
  
          </div>
        </div>
      `;
        this.isSpinnerVisible = false;
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        this.isSpinnerVisible = false;
      });
  }

  keyPressDispatcher(e) {
    // If user presses "s" (keycode 83), overlay is not open,
    // and no input or textarea is focused, open the overlay.
    if (
      e.keyCode === 83 &&
      !this.isOverlayOpen &&
      !document.activeElement.matches("input, textarea")
    ) {
      this.openOverlay();
    }

    // If user presses "esc" (keycode 27) and overlay is open, close it
    if (e.keyCode === 27 && this.isOverlayOpen) {
      this.closeOverlay();
    }
  }

  openOverlay() {
    // Add active class to search overlay and disable scrolling on body
    this.searchOverlay.classList.add("search-overlay--active");
    setTimeout(() => this.searchField.focus(), 301); // Timeout to allow for CSS transition
    document.body.classList.add("body-no-scroll");
    this.searchField.value = ""; // Clear the search field
    this.isOverlayOpen = true;
  }

  closeOverlay() {
    // Remove active class from search overlay and restore body scrolling
    this.searchOverlay.classList.remove("search-overlay--active");
    document.body.classList.remove("body-no-scroll");
    this.isOverlayOpen = false;
  }
}

export default Search;
