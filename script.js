


class ApiService {
  
  baseUrl = 'https://restcountries.com/v3.1';


  /**
    * Поиск страны по названию
    * @param {string} name 
    * @returns {Promise<Array>} 
    */
   
  async searchCountry(name) {
    try {
      const response = await fetch(`${this.baseUrl}/name/${encodeURIComponent(name)}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Страна не найдена');
        }
        throw new Error('Ошибка при загрузке данных');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Получение стран по кодам
   * @param {Array<string>} codes 
   * @returns {Promise<Array>} 
   */
  async getCountriesByCodes(codes) {
    try {
      if (!codes || codes.length === 0) {
        return [];
      }

      const codesString = codes.join(',');
      const response = await fetch(`${this.baseUrl}/alpha?codes=${codesString}`);

      if (!response.ok) {
        throw new Error('Ошибка при загрузке соседних стран');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}



class Country {
  constructor(data) {
    this.name = data.name.common;
    this.officialName = data.name.official;
    this.flag = data.flag;
    this.capital = data.capital ? data.capital[0] : 'Нет столицы';
    this.population = data.population;
    this.region = data.region;
    this.subregion = data.subregion;
    this.area = data.area;
    this.currencies = this.formatCurrencies(data.currencies);
    this.languages = this.formatLanguages(data.languages);
    this.borders = data.borders || [];
    this.cca3 = data.cca3; 
  }

  
   // Форматирование валют
   
  formatCurrencies(currencies) {
    if (!currencies) return 'Нет данных';
    return Object.values(currencies)
      .map((currency) => `${currency.name} (${currency.symbol || ''})`)
      .join(', ');
  }

  
   //Форматирование языков
   
  formatLanguages(languages) {
    if (!languages) return 'Нет данных';
    return Object.values(languages).join(', ');
  }

  
   // Форматирование числовых значений
   
  formatNumber(num) {
    return new Intl.NumberFormat('ru-RU').format(num);
  }
}


class CountryView {
  countryContainer = document.getElementById('countryContainer');
  neighborsContainer = document.getElementById('neighborsContainer');
  neighborsList = document.getElementById('neighborsList');
  errorMessage = document.getElementById('errorMessage');

 
   // Отображение ошибки
 
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove('hidden');
    this.countryContainer.innerHTML = '';
    this.hideNeighbors();
  }


  //Скрытие ошибки
   
  hideError() {
    this.errorMessage.classList.add('hidden');
  }

  /**
   * Отрисовка карточки страны
   * @param {Country} country 
   * @param {Function} onNeighborsClick 
   */
  renderCountry(country, onNeighborsClick) {
    this.hideError();

    const card = document.createElement('div');
    card.className = 'country-card';

    card.innerHTML = `
      <div class="country-header">
        <div class="country-flag">${country.flag}</div>
        <div class="country-name">${country.name}</div>
      </div>
      <div class="country-info">
        <div class="info-item">
          <span class="info-label">Официальное название:</span>
          <span class="info-value">${country.officialName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Столица:</span>
          <span class="info-value">${country.capital}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Население:</span>
          <span class="info-value">${country.population} чел.</span>
        </div>
        <div class="info-item">
          <span class="info-label">Регион:</span>
          <span class="info-value">${country.region}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Подрегион:</span>
          <span class="info-value">${country.subregion || 'Нет данных'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Площадь:</span>
          <span class="info-value">${country.area} км²</span>
        </div>
        <div class="info-item">
          <span class="info-label">Валюты:</span>
          <span class="info-value">${country.currencies}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Языки:</span>
          <span class="info-value">${country.languages}</span>
        </div>
        ${country.borders.length > 0
        ? `<button class="neighbors-btn" id="neighborsBtn">Показать соседние страны (${country.borders.length})</button>`
        : '<p style="margin-top: 20px; color: #999; text-align: center;">Нет соседних стран</p>'
      }
      </div>
    `;

    this.countryContainer.innerHTML = '';
    this.countryContainer.appendChild(card);

    // Добавляем обработчик для кнопки соседей
    if (country.borders.length > 0) {
      const neighborsBtn = document.getElementById('neighborsBtn');
      neighborsBtn.addEventListener('click', onNeighborsClick);
    }
  }

  /**
   * Отрисовка списка соседних стран
   * @param {Array<Country>} neighbors - массив соседних стран
   */
  renderNeighbors(neighbors) {
    if (!neighbors || neighbors.length === 0) {
      return;
    }

    this.neighborsContainer.classList.remove('hidden');
    this.neighborsList.innerHTML = '';

    neighbors.forEach((neighbor) => {
      const neighborCard = document.createElement('div');
      neighborCard.className = 'neighbor-card';
      neighborCard.innerHTML = `
        <div class="neighbor-flag">${neighbor.flag}</div>
        <div class="neighbor-name">${neighbor.name}</div>
      `;

      // При клике на соседнюю страну - загружаем её
      neighborCard.addEventListener('click', () => {
        const event = new CustomEvent('neighborClick', { detail: neighbor.name });
        document.dispatchEvent(event);
      });

      this.neighborsList.appendChild(neighborCard);
    });
  }

  
    //Скрытие списка соседних стран
   
  hideNeighbors() {
    this.neighborsContainer.classList.add('hidden');
    this.neighborsList.innerHTML = '';
  }

 
   //Показать индикатор загрузки
   
  showLoading() {
    this.countryContainer.innerHTML = `
      <div class="country-card" style="text-align: center; padding: 40px;">
        <p style="font-size: 1.2rem; color: #667eea;">Загрузка...</p>
      </div>
    `;
  }
}


class CountryService {
  constructor() {
    this.apiService = new ApiService();
    this.view = new CountryView();
    this.currentCountry = null;
  }

  /**
   * Поиск и отображение страны
   * @param {string} countryName - название страны
   */
  async searchCountry(countryName) {
    if (!countryName || countryName.trim() === '') {
      this.view.showError('Введите название страны');
      return;
    }

    try {
      this.view.showLoading();
      this.view.hideNeighbors();

      const data = await this.apiService.searchCountry(countryName.trim());

      if (!data || data.length === 0) {
        this.view.showError('Страна не найдена');
        return;
      }

      
      this.currentCountry = new Country(data[0]);
      this.view.renderCountry(this.currentCountry, () => this.loadNeighbors());
    } catch (error) {
      this.view.showError(error.message || 'Произошла ошибка при загрузке данных');
    }
  }

  
   // Загрузка и отображение соседних стран
   
  async loadNeighbors() {
    if (!this.currentCountry || this.currentCountry.borders.length === 0) {
      return;
    }

    try {
      const neighborsBtn = document.getElementById('neighborsBtn');
      if (neighborsBtn) {
        neighborsBtn.disabled = true;
        neighborsBtn.textContent = 'Загрузка...';
      }

      const data = await this.apiService.getCountriesByCodes(this.currentCountry.borders);
      const neighbors = data.map((countryData) => new Country(countryData));

      this.view.renderNeighbors(neighbors);
    } catch (error) {
      this.view.showError('Не удалось загрузить соседние страны');
    } finally {
      const neighborsBtn = document.getElementById('neighborsBtn');
      if (neighborsBtn) {
        neighborsBtn.disabled = false;
        neighborsBtn.textContent = `Показать соседние страны (${this.currentCountry.borders.length})`;
      }
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const countryService = new CountryService();
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  searchBtn.addEventListener('click', () => {
    countryService.searchCountry(searchInput.value);
  });


  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      countryService.searchCountry(searchInput.value);
    }
  });

  
  document.addEventListener('neighborClick', (e) => {
    const countryName = e.detail;
    searchInput.value = countryName;
    countryService.searchCountry(countryName);
  });
});
