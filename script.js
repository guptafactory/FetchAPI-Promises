'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const imageContainer = document.querySelector('.images');
const imgElement = document.createElement('img');
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
/// Below function has Some issues ///

// const getJSON = function (url) {
//   fetch(url).then(response => {
//     if (!response.ok) {
//       throw new Error(`${errMsg} (${response.status})`);
//     }
//     return response.json();
//   });
// };
// const getCountryData3 = country => {
//   getJSON(`https://restcountries.com/v3.1/name/${country}`, 'Country not found')
//     .then(data => {
//       renderCountry(data[0]);
//       const neighbour = data[0].borders[0];
//       if (!neighbour) throw new Error('No neighbour found!');
//       return getJSON(
//         `https://restcountries.com/v3.1/alpha/${neighbour}`,
//         'Neighbour not found'
//       );
//     })
//     .then(data => renderCountry(data[0], 'neighbour'))
//     .catch(err => {
//       console.error(`${err}`);
//       renderError(`Something went wrong. ${err.message}. Try Again!`);
//     });
// };

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
function whereAmI() {
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

// Images Code
const wait = function (seconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
};
function createImage(imgPath) {
  return new Promise(function (resolve, reject) {
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
function displayImages() {
  createImage('img/img-1.jpg')
    .then(imgElement => console.log('Image 1 loaded'))
    .then(() => wait(2))
    .then(() => (imgElement.style.display = 'none'))
    .then(() => createImage('img/img-2.jpg'))
    .then(imgElement => {
      imgElement.style.display = 'block';
      console.log('Image 2 loaded');
    })
    .then(() => wait(2))
    .then(() => (imgElement.style.display = 'none'))
    .catch(err => console.error(err.message));
}

btn.addEventListener('click', function () {
  // getCountryData2('india');
  whereAmI();
  // displayImages();
});
