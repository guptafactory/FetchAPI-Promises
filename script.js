'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const imageContainer = document.querySelector('.images');
///////////////////////////////////////
function renderCountry(data, className) {
  // console.log(data);
  const html = `
  <article class="country ${className}">
    <img class="country__img" src="${data.flags.png}" />
    <div class="country__data">
      <h3 class="country__name">${data.name.official}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(
        data.population / 1000000
      ).toFixed(1)} million people</p>
      <p class="country__row"><span>🗣️</span>${
        Object.values(data.languages)[0]
      }</p>
      <p class="country__row"><span>💰</span>${
        Object.values(data.currencies)[0].name
      }</p>
    </div>
  </article>
  `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
}
function renderNeighbour(country) {
  const request2 = new XMLHttpRequest();
  request2.open('GET', `https://restcountries.com/v3.1/alpha/${country}`);
  request2.send();
  request2.addEventListener('load', function () {
    const [data2] = JSON.parse(this.responseText);
    // console.log(data);
    renderCountry(data2, 'neighbour');
  });
}
// Example of callback hell
const getCountryData = function (country) {
  const request = new XMLHttpRequest();
  request.open('GET', `https://restcountries.com/v3.1/name/${country}`);
  request.send();
  request.addEventListener('load', function () {
    const [data] = JSON.parse(this.responseText);
    renderCountry(data, '');

    //// neighbour country
    const neighbour = data.borders[0];
    if (!neighbour) return;
    renderNeighbour(neighbour);
  });
};
const renderError = message => {
  countriesContainer.insertAdjacentText('beforeend', message);
  countriesContainer.style.opacity = 1;
};
// Promises
const getCountryData2 = function (country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(response => {
      if (!response.ok)
        throw new Error(`Country not found (${response.status})`);
      return response.json();
    })
    .then(data => {
      renderCountry(data[0]);
      const neighbour = data[0].borders;
      if (neighbour === undefined) throw new Error('No neighbour found');
      return fetch(`https://restcountries.com/v3.1/alpha/${neighbour[0]}`);
    })
    .then(response => {
      if (!response.ok)
        throw new Error(`Country not found (${response.status})`);
      return response.json();
    })
    .then(data => renderCountry(data[0], 'neighbour'))
    .catch(err => {
      console.error(`${err}`);
      renderError(`Something went wrong. ${err.message}. Try Again!`);
    });
};
/// Promises with Error Handling ///

const getJSON = function (url, errMsg = 'Hell Wrong!') {
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`${errMsg} (${response.status})`);
    }
    return response.json();
  });
};
const getCountryData3 = country => {
  getJSON(`https://restcountries.com/v3.1/name/${country}`, 'Country not found')
    .then(data => {
      renderCountry(data[0]);
      const neighbour = data[0].borders[0];
      if (!neighbour) throw new Error('No neighbour found!');
      return getJSON(
        `https://restcountries.com/v3.1/alpha/${'neighbour'}`,
        'Neighbour not found'
      );
    })
    .then(data => renderCountry(data[0], 'neighbour'))
    .catch(err => {
      console.error(`${err.message}`);
      renderError(`Something went wrong. ${err.message}. Try Again!`);
    });
};

function getLatLng() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos),
      err => reject(err)
    );
  });
}
function getGeocodedCountry(country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(response => {
      if (!response.ok) throw new Error(`Problem with Geocoding API`);
      return response.json();
    })
    .then(data => renderCountry(data[0]))
    .catch(err => console.error(err));
}
function whereAmI_1() {
  getLatLng()
    .then(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      return fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=627b08021e1240ea817c35a981084e0c`
      );
    })
    .then(response => response.json())
    .then(result => {
      if (result?.features?.length) {
        let prop = result?.features[0]?.properties;
        getGeocodedCountry(prop.country);
        // console.log(`You are in ${prop.state}, ${prop.country}`);
      } else {
        console.log('No address found');
      }
    })
    .catch(err => console.error(err));
}

//
// Using Async, Await
async function whereAmI_2() {
  try {
    const pos = await getLatLng();
    const { latitude: lat, longitude: lng } = pos.coords;
    // reverse geocoding
    const resGeo = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=627b08021e1240ea817c35a981084e0c`
    );
    if (!resGeo.ok) throw new Error('Error in Reverse Geocoding');
    const dataGeo = await resGeo.json();

    const country = dataGeo.features[0].properties.country;
    //Fetching country Data
    const res = await fetch(`https://restcountries.com/v3.1/name/${country}`);
    if (!res.ok) throw new Error('Error in fetching country data');
    const data = await res.json();
    renderCountry(data[0]);
    return country;
  } catch (err) {
    console.error(`${err.message} 💔`);
    renderError(err.message);
    throw err;
  }
}
// whereAmI_2()
//   .then(country => console.log(`2: Hello ${country}`))
//   .catch(err => console.error(`${err.message} 💫`))
//   .finally(() => console.log(`3: Hello`));

btn.addEventListener('click', function () {
  // getCountryData2('india');
  // getCountryData3('india');
  // whereAmI_1();

  (async function () {
    try {
      const country = await whereAmI_2();
      // console.log(`2: Hello ${country}`);
    } catch (err) {
      console.error(`${err.message} 💔`);
    }
    // console.log(`3: Hello`);
  })();
});
async function getMultipleCountries(country1, country2, country3) {
  try {
    /// Individual Promises one after another synchronously///
    const [data1] = await getJSON(
      `https://restcountries.com/v3.1/name/${country1}`
    );
    const [data2] = await getJSON(
      `https://restcountries.com/v3.1/name/${country2}`
    );
    const [data3] = await getJSON(
      `https://restcountries.com/v3.1/name/${country3}`
    );
    // console.log([data1.capital[0], data2.capital[0], data3.capital[0]]);

    // Asynchronous Promises, Running At time Time using Promises Combinator Function //

    const data = await Promise.all([
      getJSON(`https://restcountries.com/v3.1/name/${country1}`),
      getJSON(`https://restcountries.com/v3.1/name/${country2}`),
      getJSON(`https://restcountries.com/v3.1/name/${country3}`),
    ]);
    // console.log(data.map(dt => dt[0].capital[0]));
  } catch (err) {
    console.log(`${err.message} 💔`);
  }
}
getMultipleCountries('india', 'usa', 'portugal');

const timeout = function (time) {
  return new Promise(function (_, reject) {
    setTimeout(() => {
      reject(new Error('Request took too long'));
    }, time * 1000);
  });
};
// Promise.race() //
(async function () {
  const res = await Promise.race([
    getJSON(`https://restcountries.com/v3.1/name/${'india'}`),
    timeout(2.5),
  ]);
  // console.log(res);
})();

// Promise.allSettled() //
(async function () {
  try {
    const data = await Promise.allSettled([
      Promise.resolve('Resolved 1'),
      Promise.reject('Unresolved 1'),
      Promise.resolve('Resolved 2'),
    ]);
    // console.log(data);
  } catch (err) {
    console.error(err.message);
  }
})();

// Promise.any() //
(async function () {
  try {
    const data = await Promise.any([
      Promise.resolve('Resolved 1'),
      Promise.reject('Unresolved 1'),
      Promise.resolve('Resolved 2'),
    ]);
    // console.log(data);
  } catch (err) {
    console.error(err.message);
  }
})();

// Images Code
const wait = function (seconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
};
function createImage(imgPath) {
  return new Promise(function (resolve, reject) {
    const imgElement = document.createElement('img');
    imgElement.setAttribute('src', imgPath);
    imgElement.addEventListener('load', () => {
      imageContainer.append(imgElement);
      resolve(imgElement);
    });
    imgElement.addEventListener('error', () =>
      reject(new Error(`Image loading error! Try Again`))
    );
  });
}
function displayImages1() {
  createImage('img/img-1.jpg')
    .then(imgElement => console.log('Image 1 loaded'))
    .then(() => wait(4))
    .then(() => (imgElement.style.display = 'none'))
    .then(() => createImage('img/img-2.jpg'))
    .then(imgElement => {
      imgElement.style.display = 'block';
      console.log('Image 2 loaded');
    })
    .then(() => wait(4))
    .then(() => (imgElement.style.display = 'none'))
    .catch(err => console.error(err.message));
}
// displayImages1();
async function loadAndPause() {
  try {
    let imgElement = await createImage('img/img-1.jpg');
    console.log('Image 1 loaded');
    let res = await wait(2);
    imgElement.style.display = 'none';
    imgElement = await createImage('img/img-2.jpg');
    imgElement.style.display = 'block';
    console.log('Image 2 loaded');
    res = await wait(2);
    imgElement.style.display = 'none';
  } catch (err) {
    console.error(err.message);
  }
}
// loadAndPause();
async function loadAll(imgArr) {
  try {
    const imgs = imgArr.map(async imgSrc => await createImage(imgSrc));
    const imgEle = await Promise.all(imgs);
    imgEle.forEach(img => img.classList.add('parallel'));
  } catch (err) {
    console.error(err.message);
  }
}
const imgArr = ['img/img-1.jpg', 'img/img-2.jpg', 'img/img-3.jpg'];
// loadAll(imgArr);
