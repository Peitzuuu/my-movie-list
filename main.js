const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// generate movie cards
function renderMovieList(data){
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer text-muted">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">♡</button>
          </div>
        </div>
      </div>
    </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

// render Paginator
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for(let page = 1; page <=  numberOfPage; page++)
  rawHTML += `
  <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
  `

  paginator.innerHTML = rawHTML
}

// add function getMovieByPage
function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// send request to show api and insert data into modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImg = document.querySelector('#movie-modal-img')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImg.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
    .catch((err) => console.log(err))
}

// add function addToFavorite
function addToFavorite(id) {
  function isMovieIdMatched(movie) {
    return movie.id === id
  }
  
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(isMovieIdMatched)

  if (list.some(isMovieIdMatched)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// add event listener to call modal and add favorite
dataPanel.addEventListener('click', function onPanelClicked(event) {
  const id = event.target.dataset.id
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(id))
    event.target.innerText = '♥'
  }
})

// add paginator event listener
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMovieByPage(page))
})

// add search form event listener
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()  // 不要做預設動作(重整頁面)
  const keyword = searchInput.value.trim().toLowerCase() // .value可以回傳input裡面得值；.trim()去掉空白格；.toLowerCase()變小寫

  //錯誤處理：輸入無效字串(沒輸入)
  if(!keyword.length) {
    alert('Please enter a valid string!')
  }

  // 條件篩選一 for-of迴圈
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 條件篩選二 陣列操作方法：filter
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  // 錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMovieByPage(1))
})

// request data
axios
  .get(INDEX_URL)
  .then((response) => {
    // ...：「展開運算子」，展開陣列元素，將陣列或物件中的資料取出成獨立資料/元素
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMovieByPage(1)) //一開始顯示第一頁
  })
  .catch((err) => console.log(err))

