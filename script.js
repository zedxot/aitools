document.addEventListener('DOMContentLoaded', () => {
    // --- Global variable to hold AI Tools Data ---
    // It will be populated asynchronously after fetching the JSON.
    let aiToolsData = [];

    // --- DOM Elements ---
    const toolsTableBody = document.getElementById('tools-table-body');
    const noResultsMessage = document.getElementById('no-results');
    const searchInput = document.getElementById('search');
    const filterPricingModelDiv = document.getElementById('filter-pricing-model');
    const filterModalityRadios = document.querySelectorAll('input[name="modality"]');
    const filterModalityTypeContainer = document.getElementById('filter-modality-type-container');
    const filterModalityTypeDiv = document.getElementById('filter-modality-type');
    const filterCategorySelect = document.getElementById('filter-category');
    const filterLicenseSelect = document.getElementById('filter-license');
    const filterYearSelect = document.getElementById('filter-year');
    const filterApiAvailableRadios = document.querySelectorAll('input[name="api_available"]');
    const filterCountrySelect = document.getElementById('filter-country');
    const resetButton = document.getElementById('reset-filters');


    // --- State Variables for Filters ---
    let currentFilters = {
        searchText: '',
        pricingModel: [],
        modality: 'All', // 'All', 'Single-modal', 'Multi-modal'
        modalityType: [],
        category: [],
        license: [],
        releaseYear: '',
        apiAvailable: 'All', // 'All', 'Yes', 'No'
        country: ''
    };

    // --- Helper Functions ---

    /**
     * Fetches the AI tools data from the JSON file.
     */
    async function fetchAiToolsData() {
        try {
            const response = await fetch('aiTools.json'); // Path to your JSON file
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            aiToolsData = await response.json();
            console.log("Data loaded:", aiToolsData); // For debugging
            initializeApplication(); // Now that data is loaded, initialize filters and table
        } catch (error) {
            console.error("Could not load AI tools data:", error);
            noResultsMessage.textContent = "Failed to load data. Please try again later.";
            noResultsMessage.classList.remove('hidden');
        }
    }


    /**
     * Extracts unique values for a given key from the dataset.
     * Handles arrays of strings by flattening them.
     * @param {string} key - The property key to extract values from.
     * @param {boolean} isArray - True if the property is an array of strings.
     * @returns {string[]} An array of unique, sorted values.
     */
    function getUniqueValues(key, isArray = false) {
        let values = new Set();
        aiToolsData.forEach(tool => {
            if (tool[key]) {
                if (isArray) {
                    tool[key].forEach(item => values.add(item));
                } else {
                    values.add(tool[key]);
                }
            }
        });
        return Array.from(values).sort();
    }

    /**
     * Populates filter options dynamically.
     */
    function populateFilters() {
        // Pricing Model
        const pricingModels = getUniqueValues('pricing_model');
        filterPricingModelDiv.innerHTML = pricingModels.map(model => `
            <label class="inline-flex items-center">
                <input type="checkbox" name="pricing_model" value="${model}" class="form-checkbox text-blue-600 rounded-md">
                <span class="ml-2">${model}</span>
            </label>
        `).join('');

        // Modality Type
        const modalityTypes = getUniqueValues('modality_type', true);
        filterModalityTypeDiv.innerHTML = modalityTypes.map(type => `
            <label class="inline-flex items-center">
                <input type="checkbox" name="modality_type" value="${type}" class="form-checkbox text-blue-600 rounded-md">
                <span class="ml-2">${type}</span>
            </label>
        `).join('');

        // Category/Use Case
        const categories = getUniqueValues('category_use_case', true);
        filterCategorySelect.innerHTML = categories.map(category => `
            <option value="${category}">${category}</option>
        `).join('');

        // License Type
        const licenses = getUniqueValues('license_type');
        filterLicenseSelect.innerHTML = licenses.map(license => `
            <option value="${license}">${license}</option>
        `).join('');

        // Release Year
        const years = getUniqueValues('release_year').filter(year => typeof year === 'number'); // Ensure it's a number
        filterYearSelect.innerHTML += years.map(year => `
            <option value="${year}">${year}</option>
        `).join('');

        // Country of Origin
        const countries = getUniqueValues('country_of_origin');
        filterCountrySelect.innerHTML += countries.map(country => `
            <option value="${country}">${country}</option>
        `).join('');
    }

    /**
     * Renders the table rows based on the filtered data.
     * @param {Array} tools - The array of AI tool objects to display.
     */
    function renderTable(tools) {
        toolsTableBody.innerHTML = ''; // Clear existing rows
        if (tools.length === 0) {
            noResultsMessage.classList.remove('hidden');
            return;
        }
        noResultsMessage.classList.add('hidden');

        tools.forEach(tool => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-blue-50 transition duration-150 ease-in-out';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                    ${tool.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${tool.developer_company || 'N/A'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                    ${tool.category_use_case ? tool.category_use_case.join(', ') : 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${tool.pricing_model === 'Open Source' ? 'bg-green-100 text-green-800' :
                          tool.pricing_model === 'Free' ? 'bg-indigo-100 text-indigo-800' :
                          tool.pricing_model === 'Freemium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}">
                        ${tool.pricing_model || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${tool.license_type || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${tool.modality || 'N/A'}
                    ${tool.modality === 'Single-modal' && tool.modality_type ? ` (${tool.modality_type.join(', ')})` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${tool.api_available ? 'Yes' : 'No'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${tool.number_of_parameters || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${tool.release_year || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${tool.country_of_origin || 'N/A'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 max-w-xs overflow-hidden text-ellipsis">
                    ${tool.short_description || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                    ${tool.link ? `<a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="font-medium">Link</a>` : 'N/A'}
                </td>
            `;
            toolsTableBody.appendChild(row);
        });
    }

    /**
     * Applies all active filters to the data and re-renders the table.
     */
    function filterAndRenderTools() {
        let filteredTools = [...aiToolsData]; // Create a mutable copy

        // 1. Text Search
        if (currentFilters.searchText) {
            const searchTerm = currentFilters.searchText.toLowerCase();
            filteredTools = filteredTools.filter(tool =>
                (tool.name && tool.name.toLowerCase().includes(searchTerm)) ||
                (tool.short_description && tool.short_description.toLowerCase().includes(searchTerm))
            );
        }

        // 2. Pricing Model
        if (currentFilters.pricingModel.length > 0) {
            filteredTools = filteredTools.filter(tool =>
                currentFilters.pricingModel.includes(tool.pricing_model)
            );
        }

        // 3. Modality
        if (currentFilters.modality !== 'All') {
            filteredTools = filteredTools.filter(tool =>
                tool.modality === currentFilters.modality
            );
        }

        // 4. Modality Type (only applies if Single-modal is selected and types are chosen)
        if (currentFilters.modality === 'Single-modal' && currentFilters.modalityType.length > 0) {
            filteredTools = filteredTools.filter(tool =>
                tool.modality_type && currentFilters.modalityType.some(type => tool.modality_type.includes(type))
            );
        }

        // 5. Category/Use Case
        if (currentFilters.category.length > 0) {
            filteredTools = filteredTools.filter(tool =>
                tool.category_use_case && currentFilters.category.some(cat => tool.category_use_case.includes(cat))
            );
        }

        // 6. License Type
        if (currentFilters.license.length > 0) {
            filteredTools = filteredTools.filter(tool =>
                currentFilters.license.includes(tool.license_type)
            );
        }

        // 7. Release Year
        if (currentFilters.releaseYear) {
            filteredTools = filteredTools.filter(tool =>
                tool.release_year === parseInt(currentFilters.releaseYear)
            );
        }

        // 8. API Available
        if (currentFilters.apiAvailable !== 'All') {
            const apiStatus = currentFilters.apiAvailable === 'Yes';
            filteredTools = filteredTools.filter(tool => tool.api_available === apiStatus);
        }

        // 9. Country of Origin
        if (currentFilters.country) {
            filteredTools = filteredTools.filter(tool =>
                tool.country_of_origin === currentFilters.country
            );
        }

        renderTable(filteredTools);
    }

    /**
     * Resets all filters to their initial state.
     */
    function resetFilters() {
        searchInput.value = '';
        filterPricingModelDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.querySelector('input[name="modality"][value="All"]').checked = true;
        filterModalityTypeDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        filterModalityTypeContainer.style.display = 'none'; // Hide modal type filter
        filterCategorySelect.selectedIndex = -1; // Deselect all
        filterLicenseSelect.selectedIndex = -1; // Deselect all
        filterYearSelect.value = '';
        document.querySelector('input[name="api_available"][value="All"]').checked = true;
        filterCountrySelect.value = '';

        currentFilters = {
            searchText: '',
            pricingModel: [],
            modality: 'All',
            modalityType: [],
            category: [],
            license: [],
            releaseYear: '',
            apiAvailable: 'All',
            country: ''
        };

        filterAndRenderTools();
    }


    // --- Event Listeners ---
    // Note: These listeners are added once DOM is ready, but filterAndRenderTools
    // will be called only after data is loaded.

    searchInput.addEventListener('input', (e) => {
        currentFilters.searchText = e.target.value;
        filterAndRenderTools();
    });

    filterPricingModelDiv.addEventListener('change', (e) => {
        if (e.target.name === 'pricing_model') {
            currentFilters.pricingModel = Array.from(filterPricingModelDiv.querySelectorAll('input[name="pricing_model"]:checked'))
                                             .map(cb => cb.value);
            filterAndRenderTools();
        }
    });

    filterModalityRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.modality = e.target.value;
            // Show/hide modality type filter based on modality selection
            if (currentFilters.modality === 'Single-modal') {
                filterModalityTypeContainer.style.display = 'block';
            } else {
                filterModalityTypeContainer.style.display = 'none';
                currentFilters.modalityType = []; // Clear modality types if not single-modal
                filterModalityTypeDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            }
            filterAndRenderTools();
        });
    });

    filterModalityTypeDiv.addEventListener('change', (e) => {
        if (e.target.name === 'modality_type') {
            currentFilters.modalityType = Array.from(filterModalityTypeDiv.querySelectorAll('input[name="modality_type"]:checked'))
                                              .map(cb => cb.value);
            filterAndRenderTools();
        }
    });

    filterCategorySelect.addEventListener('change', (e) => {
        currentFilters.category = Array.from(e.target.selectedOptions).map(option => option.value);
        filterAndRenderTools();
    });

    filterLicenseSelect.addEventListener('change', (e) => {
        currentFilters.license = Array.from(e.target.selectedOptions).map(option => option.value);
        filterAndRenderTools();
    });

    filterYearSelect.addEventListener('change', (e) => {
        currentFilters.releaseYear = e.target.value;
        filterAndRenderTools();
    });

    filterApiAvailableRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.apiAvailable = e.target.value;
            filterAndRenderTools();
        });
    });

    filterCountrySelect.addEventListener('change', (e) => {
        currentFilters.country = e.target.value;
        filterAndRenderTools();
    });

    resetButton.addEventListener('click', resetFilters);


    // --- Initialization function ---
    // This is called AFTER the data has been successfully fetched.
    function initializeApplication() {
        populateFilters();      // Populate dropdowns and checkboxes
        filterAndRenderTools(); // Render the table with no filters applied initially
    }

    // --- Start the application by fetching data ---
    fetchAiToolsData();
});