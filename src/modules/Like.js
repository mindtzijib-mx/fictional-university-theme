import axios from "axios";

class Like {
  constructor() {
    if (document.querySelector(".like-box")) {
      axios.defaults.headers.common["X-WP-Nonce"] = universityData.nonce;
      this.events();
    }
  }

  events() {
    document
      .querySelector(".like-box")
      .addEventListener("click", this.ourClickDispatcher.bind(this));
  }

  // methods
  ourClickDispatcher(e) {
    const currentLikeBox = e.target.closest(".like-box");

    if (currentLikeBox.dataset.exists === "yes") {
      this.deleteLike(currentLikeBox);
    } else {
      this.createLike(currentLikeBox);
    }
  }

  async createLike(currentLikeBox) {
    try {
      const response = await axios.post(
        universityData.root_url + "/wp-json/university/v1/manageLike",
        { professorId: currentLikeBox.getAttribute("data-professor") }
      );
      if (response.data != "Only logged users can create a like") {
        currentLikeBox.setAttribute("data-exists", "yes");
        let likeCount = parseInt(
          currentLikeBox.querySelector(".like-count").innerHTML,
          10
        );
        likeCount++;
        currentLikeBox.querySelector(".like-count").innerHTML = likeCount;
        currentLikeBox.setAttribute("data-like", response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteLike(currentLikeBox) {
    try {
      const response = await axios({
        url: universityData.root_url + "/wp-json/university/v1/manageLike",
        method: "delete",
        data: {
          like: currentLikeBox.getAttribute("data-like"),
        },
      });
      currentLikeBox.setAttribute("data-exists", "no");
      let likeCount = parseInt(
        currentLikeBox.querySelector(".like-count").innerHTML,
        10
      );
      likeCount--;
      currentLikeBox.querySelector(".like-count").innerHTML = likeCount;
      currentLikeBox.setAttribute("data-like", "");
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }
}

export default Like;
