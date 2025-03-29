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
    // Retrieve the search term value
    const searchValue = this.searchField.value;

    // Create fetch promises for posts and pages endpoints
    const postsPromise = fetch(
      `${universityData.root_url}/wp-json/wp/v2/posts?search=${searchValue}`
    ).then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching posts");
      }
      return response.json();
    });

    const pagesPromise = fetch(
      `${universityData.root_url}/wp-json/wp/v2/pages?search=${searchValue}`
    ).then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching pages");
      }
      return response.json();
    });

    // Use Promise.all to wait for both promises to resolve
    Promise.all([postsPromise, pagesPromise])
      .then(([posts, pages]) => {
        // Combine the results from posts and pages

        const combinedResults = posts.concat(pages);

        // Build the HTML string conditionally based on the number of results
        this.resultsDiv.innerHTML = `
      <h2 class="search-overlay__section-title">General Information</h2>
      ${
        combinedResults.length
          ? '<ul class="link-list min-list">'
          : "<p>No general information matches that search.</p>"
      }
        ${combinedResults
          .map(
            (item) =>
              `<li>
                <a href="${item.link}">${item.title.rendered}</a> ${
                  item.type === "post" ? `by ${item.authorName}` : ""
                }
              </li>`
          )
          .join("")}
      ${combinedResults.length ? "</ul>" : ""}
    `;
        // Hide the spinner after processing the results
        this.isSpinnerVisible = false;
      })
      .catch(() => {
        // Handle errors in case any of the fetch requests fail
        this.resultsDiv.innerHTML =
          "<p>Unexpected error; please try again.</p>";
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
