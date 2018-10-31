import axios from 'axios';
import dompurify from 'dompurify';


function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong> ${store.name} </strong>
      </a>
    `
  }).join(' ');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('.search__input');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    // if there is no value quite it
    if(!this.value) {
      searchResults.style.display = 'none';
      return;
    }
    //show the search searchResults
    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          const html = searchResultsHTML(res.data);
          searchResults.innerHTML = dompurify.sanitize(html);
          return;
        }
        //tell them nothing came bracket
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result"> No results found for ${this.value}!! </div>`);
      })
      .catch(err => {
        console.error(err);
      });
  });
  // handle keyboard inputs
  searchInput.on('keyup', (e) => { //"e" stands for event
    // if they aren't pressing up, down or enter, who cares!
    console.log(e.keyCode);
    if (![38, 40, 13].includes(e.keyCode)) {
      return; //we don't care let him click with his mouth
    }
    const activeclass = 'search__result--active';
    const current = search.querySelector(`.${activeclass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeclass);
    }
    next.classList.add(activeclass)
  });
}

export default typeAhead;
