const API_KEY = process.env.weather_api_key;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit

// Unit toggle event listener
document.getElementById('unitToggle').addEventListener('change', function(e) {
    currentUnit = e.target.checked ? 'imperial' : 'metric';
    const cityInput = document.getElementById('cityInput');
    if (cityInput.value.trim()) {
        getWeather();
    }
});

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                showError('Unable to retrieve your location');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

function fetchWeatherByCoords(lat, lon) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;

        xhr.open('GET', url, true);
        xhr.onload = handleXHRResponse(resolve, reject);
        xhr.onerror = handleXHRError(reject);
        xhr.send();
    });
}

function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showError(''); // Clear any previous errors
    fetchWeatherData(city);
}

function fetchWeatherData(city) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`;

        xhr.open('GET', url, true);
        xhr.onload = handleXHRResponse(resolve, reject);
        xhr.onerror = handleXHRError(reject);
        xhr.send();
    });
}

function handleXHRResponse(resolve, reject) {
    return function() {
        if (this.status === 200) {
            try {
                const data = JSON.parse(this.responseText);
                updateWeatherUI(data);
                resolve(data);
            } catch (error) {
                showError('Error parsing weather data');
                reject(error);
            }
        } else {
            const errorMessage = this.status === 404 
                ? 'City not found' 
                : 'Error fetching weather data';
            showError(errorMessage);
            reject(new Error(errorMessage));
        }
    };
}

function handleXHRError(reject) {
    return function() {
        showError('Network error occurred');
        reject(new Error('Network error'));
    };
}

function updateWeatherUI(data) {
    const weatherContainer = document.getElementById('weather-container');
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const feelsLike = document.getElementById('feels-like');
    const condition = document.getElementById('condition');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const weatherIcon = document.getElementById('weather-icon');

    // Update weather information
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'm/s' : 'mph';
    
    temperature.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
    feelsLike.textContent = `Feels like: ${Math.round(data.main.feels_like)}${tempUnit}`;
    
    condition.textContent = data.weather[0].description
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed)} ${windUnit}`;
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.alt = data.weather[0].description;

    // Show the weather container with animation
    weatherContainer.classList.add('active');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
}

// Add event listener for Enter key
document.getElementById('cityInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});

// Try to get user's location when the page loads
document.addEventListener('DOMContentLoaded', getCurrentLocation);