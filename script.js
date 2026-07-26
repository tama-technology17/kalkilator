// Google Auth Handler
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

let currentView = 'main-app';

function setLoggedInState(userData) {
    document.querySelector('.g_id_signin').classList.add('hidden');
    const userProfile = document.getElementById('user-profile');
    if(userProfile) userProfile.classList.remove('hidden');
    
    document.getElementById('user-name').innerText = userData.name;
    document.getElementById('user-avatar').src = userData.picture;

    const loginMessage = document.getElementById('login-message');
    if(loginMessage) loginMessage.classList.add('hidden');
    
    document.getElementById('main-app').classList.add('hidden');
    const calApp = document.getElementById('calendar-app');
    if(calApp) calApp.classList.add('hidden');
    const convApp = document.getElementById('converter-app');
    if(convApp) convApp.classList.add('hidden');
    
    const activeApp = document.getElementById(currentView);
    if(activeApp) activeApp.classList.remove('hidden');
}

function setLoggedOutState() {
    document.querySelector('.g_id_signin').classList.remove('hidden');
    const userProfile = document.getElementById('user-profile');
    if(userProfile) userProfile.classList.add('hidden');

    document.getElementById('main-app').classList.add('hidden');
    const calApp = document.getElementById('calendar-app');
    if(calApp) calApp.classList.add('hidden');
    const convApp = document.getElementById('converter-app');
    if(convApp) convApp.classList.add('hidden');
    
    const loginMessage = document.getElementById('login-message');
    if(loginMessage) loginMessage.classList.remove('hidden');
}

window.handleCredentialResponse = (response) => {
    const responsePayload = parseJwt(response.credential);
    const userData = {
        name: responsePayload.name,
        picture: responsePayload.picture
    };
    
    localStorage.setItem('kalkulayor_user', JSON.stringify(userData));
    setLoggedInState(userData);
};

document.addEventListener('DOMContentLoaded', () => {
    // Check local storage for persistent login
    const savedUser = localStorage.getItem('kalkulayor_user');
    if (savedUser) {
        setLoggedInState(JSON.parse(savedUser));
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('kalkulayor_user');
            setLoggedOutState();
        });
    }

    const currentDisplay = document.getElementById('current');
    const historyDisplay = document.getElementById('history');
    
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let shouldResetScreen = false;

    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('num')) {
                const action = button.dataset.action;
                if (action === 'toggle-sign') {
                    toggleSign();
                } else {
                    appendNumber(button.dataset.number);
                }
            } else if (button.dataset.action === 'calculate') {
                compute();
                updateDisplay();
            } else {
                handleAction(button.dataset.action);
            }
        });
    });

    document.addEventListener('keydown', handleKeyboardInput);

    function appendNumber(number) {
        if (currentOperand === '0' && number === '0') return;
        if (shouldResetScreen) {
            currentOperand = '';
            shouldResetScreen = false;
        }
        if (number === '.' && currentOperand.includes('.')) return;
        
        if (currentOperand === '0' && number !== '.') {
            currentOperand = number;
        } else {
            currentOperand += number;
        }
        updateDisplay();
    }

    function handleAction(action) {
        switch (action) {
            case 'clear':
                clear();
                break;
            case 'clear-entry':
                currentOperand = '0';
                break;
            case 'backspace':
                backspace();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                chooseOperation(action);
                break;
            case 'percent':
                currentOperand = (parseFloat(currentOperand) / 100).toString();
                break;
            case 'inverse':
                if (parseFloat(currentOperand) === 0) {
                    alert("Tidak bisa membagi dengan nol!");
                    return;
                }
                currentOperand = (1 / parseFloat(currentOperand)).toString();
                break;
            case 'square':
                currentOperand = Math.pow(parseFloat(currentOperand), 2).toString();
                break;
            case 'sqrt':
                if (parseFloat(currentOperand) < 0) {
                    alert("Input tidak valid!");
                    return;
                }
                currentOperand = Math.sqrt(parseFloat(currentOperand)).toString();
                break;
        }
        updateDisplay();
    }

    function clear() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
        historyDisplay.innerText = '';
    }

    function backspace() {
        if (shouldResetScreen) return;
        currentOperand = currentOperand.slice(0, -1);
        if (currentOperand === '' || currentOperand === '-') currentOperand = '0';
    }

    function toggleSign() {
        if (currentOperand === '0') return;
        if (currentOperand.startsWith('-')) {
            currentOperand = currentOperand.slice(1);
        } else {
            currentOperand = '-' + currentOperand;
        }
        updateDisplay();
    }

    function chooseOperation(opAction) {
        if (currentOperand === '') return;
        if (previousOperand !== '') {
            compute();
        }
        operation = opAction;
        previousOperand = currentOperand;
        shouldResetScreen = true;
    }

    function compute() {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    alert("Tidak bisa dibagi nol!");
                    clear();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        currentOperand = parseFloat(computation.toFixed(10)).toString();
        operation = undefined;
        previousOperand = '';
    }

    function getOperationSymbol(opAction) {
        switch(opAction) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    }

    function updateDisplay() {
        let displayStr = currentOperand.toString().replace('.', ',');
        
        if (displayStr === 'NaN' || displayStr.includes('Infinity')) {
            currentDisplay.innerText = 'Error';
        } else {
            if (!displayStr.includes(',')) {
                let num = parseFloat(currentOperand);
                if (!isNaN(num)) {
                    displayStr = num.toLocaleString('id-ID');
                }
            } else {
                 const parts = displayStr.split(',');
                 let intPart = parseFloat(parts[0].replace(/\./g, '')).toLocaleString('id-ID');
                 displayStr = isNaN(parseFloat(parts[0])) ? `0,${parts[1]}` : `${intPart},${parts[1]}`;
            }
            
            if (displayStr.length > 10) {
                currentDisplay.style.fontSize = '32px';
            } else {
                currentDisplay.style.fontSize = '48px';
            }

            currentDisplay.innerText = displayStr;
        }
        
        if (operation != null) {
            const formattedPrev = parseFloat(previousOperand).toLocaleString('id-ID');
            historyDisplay.innerText = `${formattedPrev} ${getOperationSymbol(operation)}`;
        } else {
            historyDisplay.innerText = '';
        }
    }

    function handleKeyboardInput(e) {
        if (e.key >= 0 && e.key <= 9) appendNumber(e.key);
        if (e.key === '.' || e.key === ',') appendNumber('.');
        if (e.key === '=' || e.key === 'Enter') {
            e.preventDefault();
            compute();
            updateDisplay();
        }
        if (e.key === 'Backspace') {
            backspace();
            updateDisplay();
        }
        if (e.key === 'Escape') {
            clear();
            updateDisplay();
        }
        if (e.key === '+') chooseOperation('add');
        if (e.key === '-') chooseOperation('subtract');
        if (e.key === '*') chooseOperation('multiply');
        if (e.key === '/') chooseOperation('divide');
        
        const keyMap = {
            'Enter': 'calculate',
            '=': 'calculate',
            'Backspace': 'backspace',
            'Escape': 'clear',
            '+': 'add',
            '-': 'subtract',
            '*': 'multiply',
            '/': 'divide'
        };

        const action = keyMap[e.key];
        if (action) {
             const btn = document.querySelector(`[data-action="${action}"]`);
             if (btn) simulateClick(btn);
        } else if ((e.key >= 0 && e.key <= 9) || e.key === '.' || e.key === ',') {
             let val = (e.key === ',') ? '.' : e.key;
             const btn = document.querySelector(`[data-number="${val}"]`);
             if (btn) simulateClick(btn);
        }
    }

    function simulateClick(btn) {
        btn.classList.add('active-sim');
        setTimeout(() => btn.classList.remove('active-sim'), 100);
    }

    // Mobile Sidebar Toggle
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function toggleSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        }
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.dataset.target;
            currentView = target;
            
            if (localStorage.getItem('kalkulayor_user')) {
                document.getElementById('main-app').classList.add('hidden');
                const cal = document.getElementById('calendar-app');
                if(cal) cal.classList.add('hidden');
                const conv = document.getElementById('converter-app');
                if(conv) conv.classList.add('hidden');
                
                const targetEl = document.getElementById(target);
                if(targetEl) targetEl.classList.remove('hidden');
            }
            
            if (window.innerWidth < 768) toggleSidebar();
        });
    });

    // Calendar logic
    const monthYearEl = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    let currentDate = new Date();

    function renderCalendar() {
        if (!calendarGrid) return;
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        if (monthYearEl) monthYearEl.innerText = `${monthNames[month]} ${year}`;
        
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-cell', 'empty');
            calendarGrid.appendChild(emptyCell);
        }
        
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-cell');
            cell.innerText = i;
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('today');
            }
            calendarGrid.appendChild(cell);
        }
    }
    
    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
        renderCalendar();
    }

    // Converter logic
    const amountInput = document.getElementById('amount');
    const resultEl = document.getElementById('convert-result');
    const rateInfoEl = document.getElementById('rate-info');
    const swapBtn = document.getElementById('swap-currency');

    let exchangeRates = {};
    let selectedFrom = 'USD';
    let selectedTo = 'IDR';

    // Currency code -> Country/currency name map for searchability
    const currencyNames = {
        AED:'Dirham Uni Emirat Arab', AFN:'Afghan Afghani', ALL:'Lek Albania', AMD:'Dram Armenia', ANG:'Gulden Antila Belanda',
        AOA:'Kwanza Angola', ARS:'Peso Argentina', AUD:'Dolar Australia', AWG:'Florin Aruba', AZN:'Manat Azerbaijan',
        BAM:'Mark Konvertibel Bosnia', BBD:'Dolar Barbados', BDT:'Taka Bangladesh', BGN:'Lev Bulgaria', BHD:'Dinar Bahrain',
        BIF:'Franc Burundi', BMD:'Dolar Bermuda', BND:'Dolar Brunei', BOB:'Boliviano Bolivia', BRL:'Real Brasil',
        BSD:'Dolar Bahama', BTN:'Ngultrum Bhutan', BWP:'Pula Botswana', BYN:'Rubel Belarus', BZD:'Dolar Belize',
        CAD:'Dolar Kanada', CDF:'Franc Kongo', CHF:'Franc Swiss', CLP:'Peso Chili', CNY:'Yuan Tiongkok',
        COP:'Peso Kolombia', CRC:'Colon Kosta Rika', CUP:'Peso Kuba', CVE:'Escudo Tanjung Verde', CZK:'Koruna Ceko',
        DJF:'Franc Djibouti', DKK:'Krone Denmark', DOP:'Peso Dominika', DZD:'Dinar Aljazair', EGP:'Pound Mesir',
        ERN:'Nakfa Eritrea', ETB:'Birr Ethiopia', EUR:'Euro Eropa', FJD:'Dolar Fiji', FKP:'Pound Falkland',
        FOK:'Krone Faroe', GBP:'Pound Inggris', GEL:'Lari Georgia', GGP:'Pound Guernsey', GHS:'Cedi Ghana',
        GIP:'Pound Gibraltar', GMD:'Dalasi Gambia', GNF:'Franc Guinea', GTQ:'Quetzal Guatemala', GYD:'Dolar Guyana',
        HKD:'Dolar Hong Kong', HNL:'Lempira Honduras', HRK:'Kuna Kroasia', HTG:'Gourde Haiti', HUF:'Forint Hungaria',
        IDR:'Rupiah Indonesia', ILS:'Shekel Israel', IMP:'Pound Man', INR:'Rupee India', IQD:'Dinar Irak',
        IRR:'Rial Iran', ISK:'Krona Islandia', JEP:'Pound Jersey', JMD:'Dolar Jamaika', JOD:'Dinar Yordania',
        JPY:'Yen Jepang', KES:'Shilling Kenya', KGS:'Som Kyrgyzstan', KHR:'Riel Kamboja', KID:'Dolar Kiribati',
        KMF:'Franc Komoro', KRW:'Won Korea Selatan', KWD:'Dinar Kuwait', KYD:'Dolar Kepulauan Cayman', KZT:'Tenge Kazakhstan',
        LAK:'Kip Laos', LBP:'Pound Lebanon', LKR:'Rupee Sri Lanka', LRD:'Dolar Liberia', LSL:'Loti Lesotho',
        LYD:'Dinar Libya', MAD:'Dirham Maroko', MDL:'Leu Moldova', MGA:'Ariary Madagaskar', MKD:'Denar Makedonia',
        MMK:'Kyat Myanmar', MNT:'Tugrik Mongolia', MOP:'Pataca Makau', MRU:'Ouguiya Mauritania', MUR:'Rupee Mauritius',
        MVR:'Rufiyaa Maladewa', MWK:'Kwacha Malawi', MXN:'Peso Meksiko', MYR:'Ringgit Malaysia', MZN:'Metical Mozambik',
        NAD:'Dolar Namibia', NGN:'Naira Nigeria', NOK:'Krone Norwegia', NPR:'Rupee Nepal', NZD:'Dolar Selandia Baru',
        OMR:'Rial Oman', PAB:'Balboa Panama', PEN:'Sol Peru', PGK:'Kina Papua Nugini', PHP:'Peso Filipina',
        PKR:'Rupee Pakistan', PLN:'Zloty Polandia', PYG:'Guarani Paraguay', QAR:'Riyal Qatar', RON:'Leu Rumania',
        RSD:'Dinar Serbia', RUB:'Rubel Rusia', RWF:'Franc Rwanda', SAR:'Riyal Saudi Arabia', SBD:'Dolar Kepulauan Solomon',
        SCR:'Rupee Seychelles', SDG:'Pound Sudan', SEK:'Krona Swedia', SGD:'Dolar Singapura', SHP:'Pound Santa Helena',
        SLE:'Leone Sierra Leone', SOS:'Shilling Somalia', SRD:'Dolar Suriname', SSP:'Pound Sudan Selatan',
        STN:'Dobra Sao Tome dan Principe', SYP:'Pound Suriah', SZL:'Lilangeni Eswatini', THB:'Baht Thailand',
        TJS:'Somoni Tajikistan', TMT:'Manat Turkmenistan', TND:'Dinar Tunisia', TOP:'Paanga Tonga',
        TRY:'Lira Turki', TTD:'Dolar Trinidad dan Tobago', TVD:'Dolar Tuvalu', TWD:'Dolar Baru Taiwan',
        TZS:'Shilling Tanzania', UAH:'Hryvnia Ukraina', UGX:'Shilling Uganda', USD:'Dolar Amerika Serikat',
        UYU:'Peso Uruguay', UZS:'Som Uzbekistan', VES:'Bolivar Venezuela', VND:'Dong Vietnam',
        VUV:'Vatu Vanuatu', WST:'Tala Samoa', XAF:'Franc CFA Afrika Tengah', XCD:'Dolar Karibia Timur',
        XDR:'Hak Penarikan Khusus', XOF:'Franc CFA Afrika Barat', XPF:'Franc CFP Pasifik',
        YER:'Rial Yaman', ZAR:'Rand Afrika Selatan', ZMW:'Kwacha Zambia', ZWL:'Dolar Zimbabwe'
    };

    function buildOptions(listEl, selectedVal) {
        if (!listEl) return;
        const currencies = Object.keys(exchangeRates);
        listEl.innerHTML = '';
        currencies.forEach(code => {
            const item = document.createElement('div');
            item.classList.add('option-item');
            if (code === selectedVal) item.classList.add('selected');
            item.dataset.value = code;
            const name = currencyNames[code] || code;
            item.innerHTML = `<span class="option-code">${code}</span><span class="option-country">${name}</span>`;
            listEl.appendChild(item);
        });
    }

    function filterOptions(listEl, query, selectedVal) {
        const q = query.toLowerCase();
        let found = false;
        listEl.querySelectorAll('.option-item').forEach(item => {
            const code = item.dataset.value.toLowerCase();
            const name = (currencyNames[item.dataset.value] || '').toLowerCase();
            const match = code.includes(q) || name.includes(q);
            item.style.display = match ? '' : 'none';
            if (match) found = true;
        });
        const noResult = listEl.querySelector('.no-result');
        if (!found) {
            if (!noResult) {
                const div = document.createElement('div');
                div.classList.add('option-item', 'no-result');
                div.innerText = 'Tidak ditemukan';
                listEl.appendChild(div);
            }
        } else {
            if (noResult) noResult.remove();
        }
    }

    function setupDropdown(triggerId, panelId, searchId, listId, side) {
        const trigger = document.getElementById(triggerId);
        const panel = document.getElementById(panelId);
        const searchInput = document.getElementById(searchId);
        const listEl = document.getElementById(listId);
        const wrapper = trigger ? trigger.closest('.custom-select') : null;
        const selectedTextEl = document.getElementById(side === 'from' ? 'from-selected-text' : 'to-selected-text');

        if (!trigger || !wrapper) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close the other dropdown
            document.querySelectorAll('.custom-select.open').forEach(el => {
                if (el !== wrapper) el.classList.remove('open');
            });
            wrapper.classList.toggle('open');
            if (wrapper.classList.contains('open') && searchInput) {
                searchInput.value = '';
                buildOptions(listEl, side === 'from' ? selectedFrom : selectedTo);
                searchInput.focus();
            }
        });

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                filterOptions(listEl, searchInput.value, side === 'from' ? selectedFrom : selectedTo);
            });
        }

        if (listEl) {
            listEl.addEventListener('click', (e) => {
                const item = e.target.closest('.option-item');
                if (!item || item.classList.contains('no-result')) return;
                const val = item.dataset.value;
                if (side === 'from') selectedFrom = val;
                else selectedTo = val;
                if (selectedTextEl) selectedTextEl.innerText = val;
                wrapper.classList.remove('open');
                calculateConversion();
            });
        }
    }

    function calculateConversion() {
        if (!exchangeRates['USD'] || !amountInput) return;
        const amount = parseFloat(amountInput.value) || 0;
        const rateFromUSD = exchangeRates[selectedFrom];
        const rateToUSD = exchangeRates[selectedTo];
        const converted = (amount / rateFromUSD) * rateToUSD;
        if (resultEl) {
            try {
                resultEl.innerText = new Intl.NumberFormat('id-ID', { style: 'currency', currency: selectedTo, maximumFractionDigits: 4 }).format(converted);
            } catch {
                resultEl.innerText = converted.toFixed(4) + ' ' + selectedTo;
            }
        }
        if (rateInfoEl) {
            rateInfoEl.innerText = `1 ${selectedFrom} = ${(rateToUSD / rateFromUSD).toFixed(6)} ${selectedTo}`;
        }
    }

    async function fetchCurrencies() {
        if (!amountInput) return;
        try {
            if (rateInfoEl) rateInfoEl.innerText = 'Memuat data kurs terkini...';
            const res = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await res.json();
            exchangeRates = data.rates;
            setupDropdown('from-trigger', 'from-options-panel', 'from-search', 'from-options-list', 'from');
            setupDropdown('to-trigger', 'to-options-panel', 'to-search', 'to-options-list', 'to');
            calculateConversion();
        } catch (err) {
            if (rateInfoEl) rateInfoEl.innerText = 'Gagal memuat data kurs.';
        }
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(el => el.classList.remove('open'));
    });

    if (amountInput) {
        fetchCurrencies();
        amountInput.addEventListener('input', calculateConversion);
        swapBtn.addEventListener('click', () => {
            const temp = selectedFrom;
            selectedFrom = selectedTo;
            selectedTo = temp;
            document.getElementById('from-selected-text').innerText = selectedFrom;
            document.getElementById('to-selected-text').innerText = selectedTo;
            calculateConversion();
        });
    }
});
