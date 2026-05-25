import axios from 'axios';

export class TableManager {
  constructor({
    tableName,
    apiRoute,
    rowRenderer,
    defaultSortField,
    containerId,
    searchInputId,
    paginationControls,
    mobileRenderer,
    mobileContainerId,
    filterConfig = {}
  }) {
    this.tableName = tableName;
    this.apiRoute = apiRoute;
    this.rowRenderer = rowRenderer;
    this.defaultSortField = defaultSortField;
    this.page = 1;
    this.limit = 20;
    this.searchTerm = '';
    this.containerId = containerId;
    this.mobileRenderer = mobileRenderer || rowRenderer; // Default to rowRenderer if no mobileRenderer
    this.mobileContainerId = mobileContainerId || containerId;
    this.searchInputId = searchInputId;
    this.paginationControls = paginationControls;
    this.filterConfig = filterConfig;
    this.filterElements = this.initFilterElements();

    this.initTable();
    this.initSearch();
    this.initPagination();
    this.initFilters();
  }

  // ✅ Detect Mobile
  isMobile() {
    return window.innerWidth <= 768;
  }

  // ✅ Initialize Filters
  initFilterElements() {
    return Object.keys(this.filterConfig).reduce((elements, key) => {
      elements[key] = document.querySelector(this.filterConfig[key]);
      return elements;
    }, {});
  }

  initFilters() {
    Object.entries(this.filterElements).forEach(([key, element]) => {
      if (element) {
        element.addEventListener('change', () => {
          this.page = 1;
          this.fetchTableData();
        });
      }
    });
  }

  // ✅ Debounce Function to Optimize Search
  debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // ✅ Sanitize Search Input
  sanitizeSearchInput(input) {
    return input.replace(/[^\w\sא-ת]/gi, '').trim();
  }

  // ✅ Fetch Table Data Using Axios
  async fetchTableData() {
    
    try {
      const sanitizedSearch = this.sanitizeSearchInput(this.searchTerm);
      let baseRoute = this.apiRoute || `/api/v1/${this.tableName}`;
      let separator = baseRoute.includes('?') ? '&' : '?';
      let queryString = `${baseRoute}${separator}page=${this.page}&limit=${this.limit}&sort=${this.defaultSortField}&search=${encodeURIComponent(sanitizedSearch)}`;
      
      // let queryString = `/api/v1/${this.tableName}?page=${this.page}&limit=${this.limit}&sort=${this.defaultSortField}&search=${encodeURIComponent(sanitizedSearch)}`;

      Object.entries(this.filterElements).forEach(([key, element]) => {
        if (element && element.value) {
          queryString += `&${encodeURIComponent(key)}=${element.value}`;
        }
      });

      const response = await axios.get(queryString);
      console.log(response.data.data.data)

      if (response.data.status === 'success') {
        this.renderTable(response.data.data.data);
        this.renderPaginationControls(response.data.pagination);
      } else {
        console.error('Failed to fetch data:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }







// ✅ Render Table Rows
renderTable(items) {
  const container = document.querySelector(
      this.isMobile() ? `#${this.mobileContainerId}` : `#${this.containerId}`
  );

  if (!container) {
      console.error('⚠️ Container not found for rendering!');
      return;
  }

  // ✅ Find and Remove All Skeleton Rows
  const skeletons = document.getElementById('table-skeleton');
   if(skeletons) skeletons.forEach(skeleton => skeleton.remove());

  // ✅ Clear Table Before Rendering New Data 
  container.innerHTML = '';



  if (items && items.length > 0) {
      items.forEach((item, index) => {
          const rowHTML = this.isMobile()
              ? this.mobileRenderer(item, index) // Use mobile renderer
              : this.rowRenderer(item, index); // Use desktop renderer

          container.insertAdjacentHTML('beforeend', rowHTML);
      });
  } else {
      container.insertAdjacentHTML('beforeend', `
          <tr>
              <td colspan="7">
                  <p class="lead text-center">
                      אין תוצאות
                      <div class="no_results_img">
                          <img src="/img/noresults.svg" />
                      </div>
                  </p>
              </td>
          </tr>
      `);
  }
}





  // ✅ Render Pagination Controls
  renderPaginationControls(pagination) {
    const { currentPage, totalPages } = pagination;

    const prevButton = document.getElementById(this.paginationControls.prev);
    const nextButton = document.getElementById(this.paginationControls.next);
    const paginationInfo = document.getElementById(this.paginationControls.info);

    if (prevButton && nextButton) {
      // Update pagination info
      if (paginationInfo) {
        paginationInfo.textContent = `עמוד ${currentPage} מ ${totalPages}`;
      }

      // Handle previous button
      prevButton.disabled = currentPage <= 1;
      prevButton.onclick = () => {
        if (currentPage > 1) {
          this.page = currentPage - 1;
          this.fetchTableData();
        }
      };

      // Handle next button
      nextButton.disabled = currentPage >= totalPages;
      nextButton.onclick = () => {
        if (currentPage < totalPages) {
          this.page = currentPage + 1;
          this.fetchTableData();
        }
      };
    }
  }

  // ✅ Initialize Table
  initTable() {
    this.fetchTableData();
  }

  // ✅ Initialize Search Input with Debounced API Calls
  initSearch() {
    const searchInput = document.querySelector(`#${this.searchInputId}`);
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        this.debounce((event) => {
          this.searchTerm = event.target.value;
          this.page = 1; // Reset to the first page on search
          this.fetchTableData();
        }, 300) // Adjust debounce delay as needed
      );
    }
  }

  // ✅ Initialize Pagination Controls
  initPagination() {
    const actionsSection = document.querySelector('.actions');
    actionsSection.addEventListener('click', (event) => {
      if (event.target.closest('.openSearch')) {
        const userSearchInput = document.querySelector('.user-serach-input');
        userSearchInput.style.display = userSearchInput.style.display === 'none' ? 'block' : 'none';
      }

      if (event.target.closest('.closeSearch')) {
        const userSearchInput = document.querySelector('.user-serach-input');
        userSearchInput.style.display = 'none';
      }
    });
  }
}
