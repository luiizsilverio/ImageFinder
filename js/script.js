import Config from "./config.js";

const formElement = document.querySelector("#searchForm");
const resultElement = document.querySelector("#resultContainer");

const searchOptions = {
  contentType: "",
  text: "",
  page: 1,
  per_page: 6
}

formElement.addEventListener('submit', handleSubmit);


async function handleSubmit(event) {
  event.preventDefault();

  const selectElement = document.querySelector("#searchSelect");
  const inputElement = document.querySelector("#searchInput");

  searchOptions.contentType = selectElement.value;
  searchOptions.text = inputElement.value;

  refreshData();
}

async function refreshData() {
  const api = useAPI();

  const dados = await api.fetchImage(searchOptions);

  let result;

  if (searchOptions.contentType == "video") {
    result = dados?.videos
      .map(video => getImageBoxHtml(video.image, video.video_files[0].link, ""))
      .join("\n");
  } else {
    result = dados?.photos
      .map(img => getImageBoxHtml(img.src.tiny, img.src.original, img.alt))
      .join("\n");
  }

  resultElement.innerHTML += result;
  showMoreHtml();
}

const getImageBoxHtml = (src, href, alt) => `
  <div class="imageBox--container">
    <div class="imageBox--imgContainer" title="${alt}" >
      <img class="imageBox--img" src="${src}" alt="${alt}" />
    </div>
    <div class="imageBox--informationContainer">
      <span class="imageBox--informationTitle">
        ${alt}
      </span>
      <a
        href="${href}"
        class="imageBox--downloadLink"
        target="_blank"
      >
        Download
        <img src="./assets/images/icons/ic-download.svg" />
      </a>
    </div>
  </div>
`

function useAPI() {
  const baseUrl = "https://api.pexels.com";

  return {
    fetchImage: async (searchOptions) => {
      // url = 'https://api.pexels.com/v1/search?query=dog&page=1&per_page=6'
      // url = 'https://api.pexels.com/videos/search?query=dog&page=1&per_page=6'

      const route = searchOptions.contentType === "video" ? "videos" : "v1";

      const url = `${baseUrl}/${route}/search?`;

      const params= new URLSearchParams({
        query: searchOptions.text,
        page: searchOptions.page,
        per_page: searchOptions.per_page,
      });
      
      try {
        const response = await fetch(url + params, {
          method: 'GET',
          headers: {
            'Authorization': Config.PEXELS_API_KEY 
          }
        })

        if (response.ok) {
          const data = await response.json();
          return data;
        } 

        throw new Error('Status: ' + response.status);        
      }
      catch (err) {
        console.log('Erro ao acessar API:', err.message);
      }
    }
  }
}

const showMoreHtml = () => {
  const showMoreContainer = document.querySelector(".showMoreButton--container");
  const buttonExists = document.querySelector("#showMore--button");
  
  if (!buttonExists) {
    const showMoreButton = document.createElement('button');
    showMoreButton.setAttribute("id", "showMore--button");
    showMoreButton.textContent = "Mostrar Mais";

    showMoreButton.addEventListener('click', () => {
      searchOptions.page++;
      refreshData();
    });

    showMoreContainer.append(showMoreButton);
  }
}
