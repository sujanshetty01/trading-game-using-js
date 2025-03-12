
// Sample stock data
const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 2.5 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 305.45, change: -1.2 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, change: 5.3 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3350.50, change: -0.8 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 330.15, change: 3.2 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 750.60, change: 4.5 },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 590.75, change: -2.1 },
    { symbol: 'DIS', name: 'Walt Disney Co.', price: 175.25, change: 1.7 }
  ];
  
  // User data
  let userData = {
    balance: 10000,
    portfolio: []
  };
  
  // DOM elements
  const balanceElement = document.getElementById('balance');
  const stockListElement = document.getElementById('stockList');
  const portfolioListElement = document.getElementById('portfolioList');
  const stockSymbolSelect = document.getElementById('stockSymbol');
  const tradeActionSelect = document.getElementById('tradeAction');
  const quantityInput = document.getElementById('quantity');
  const executeTradeButton = document.getElementById('executeTrade');
  const tradeMessageElement = document.getElementById('tradeMessage');
  
  // Initialize the app
  function initApp() {
    loadUserData();
    displayStocks();
    populateStockSymbols();
    updatePortfolio();
    updateBalance();
    
    // Add event listeners
    executeTradeButton.addEventListener('click', executeTrade);
    
    // Create dark mode toggle
    createDarkModeToggle();
    
    // Simulate market changes
    setInterval(updateStockPrices, 500);
  }
  
  // Create dark mode toggle
  function createDarkModeToggle() {
    const darkModeToggle = document.createElement('div');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '🌙';
    darkModeToggle.title = 'Toggle Dark Mode';
    
    document.body.appendChild(darkModeToggle);
    
    // Check for saved theme preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
      darkModeToggle.innerHTML = '☀️';
    }
    
    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDarkMode);
      darkModeToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
    });
  }
  
  // Load user data from localStorage if available
  function loadUserData() {
    const savedData = localStorage.getItem('tradingAppData');
    if (savedData) {
      userData = JSON.parse(savedData);
    }
  }
  
  // Save user data to localStorage
  function saveUserData() {
    localStorage.setItem('tradingAppData', JSON.stringify(userData));
  }
  
  // Display all stocks in the market
  function displayStocks() {
    stockListElement.innerHTML = '';
    
    stocks.forEach(stock => {
      const stockItem = document.createElement('div');
      stockItem.className = 'stock-item';
      
      const changeClass = stock.change >= 0 ? 'stock-change-positive' : 'stock-change-negative';
      const changeSymbol = stock.change >= 0 ? '+' : '';
      
      stockItem.innerHTML = `
        <div class="stock-info">
          <div class="stock-name">${stock.symbol} - ${stock.name}</div>
        </div>
        <div class="stock-details">
          <div class="stock-price">$${stock.price.toFixed(2)}</div>
          <div class="stock-change ${changeClass}">${changeSymbol}${stock.change.toFixed(2)}%</div>
        </div>
      `;
      
      stockListElement.appendChild(stockItem);
    });
  }
  
  // Populate stock symbols in the dropdown
  function populateStockSymbols() {
    stockSymbolSelect.innerHTML = '<option value="">Select a stock</option>';
    
    stocks.forEach(stock => {
      const option = document.createElement('option');
      option.value = stock.symbol;
      option.textContent = `${stock.symbol} - ${stock.name}`;
      stockSymbolSelect.appendChild(option);
    });
  }
  
  // Update portfolio display
  function updatePortfolio() {
    portfolioListElement.innerHTML = '';
    
    if (userData.portfolio.length === 0) {
      portfolioListElement.innerHTML = '<div class="portfolio-empty">You don\'t own any stocks yet.</div>';
      return;
    }
    
    userData.portfolio.forEach(item => {
      const stock = getStockBySymbol(item.symbol);
      const totalValue = stock.price * item.quantity;
      
      const portfolioItem = document.createElement('div');
      portfolioItem.className = 'portfolio-item';
      
      portfolioItem.innerHTML = `
        <div class="portfolio-info">
          <div class="portfolio-name">${item.symbol} - ${stock.name}</div>
          <div class="portfolio-quantity">${item.quantity} shares</div>
        </div>
        <div class="portfolio-value">$${totalValue.toFixed(2)}</div>
      `;
      
      portfolioListElement.appendChild(portfolioItem);
    });
  }
  
  // Update balance display
  function updateBalance() {
    balanceElement.textContent = userData.balance.toFixed(2);
  }
  
  // Execute a trade (buy or sell)
  function executeTrade() {
    const symbol = stockSymbolSelect.value;
    const action = tradeActionSelect.value;
    const quantity = parseInt(quantityInput.value, 10);
    
    if (!symbol) {
      showTradeMessage('Please select a stock.', 'error');
      return;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      showTradeMessage('Please enter a valid quantity.', 'error');
      return;
    }
    
    const stock = getStockBySymbol(symbol);
    
    if (action === 'buy') {
      // Buy stocks
      const totalCost = stock.price * quantity;
      
      if (totalCost > userData.balance) {
        showTradeMessage('Insufficient funds for this purchase.', 'error');
        return;
      }
      
      // Update portfolio
      const portfolioItem = userData.portfolio.find(item => item.symbol === symbol);
      
      if (portfolioItem) {
        portfolioItem.quantity += quantity;
      } else {
        userData.portfolio.push({
          symbol: symbol,
          quantity: quantity
        });
      }
      
      // Update balance
      userData.balance -= totalCost;
      
      showTradeMessage(`Successfully bought ${quantity} shares of ${symbol} for $${totalCost.toFixed(2)}.`, 'success');
    } else {
      // Sell stocks
      const portfolioItem = userData.portfolio.find(item => item.symbol === symbol);
      
      if (!portfolioItem) {
        showTradeMessage(`You don't own any shares of ${symbol}.`, 'error');
        return;
      }
      
      if (portfolioItem.quantity < quantity) {
        showTradeMessage(`You only have ${portfolioItem.quantity} shares of ${symbol} to sell.`, 'error');
        return;
      }
      
      // Calculate sale value
      const saleValue = stock.price * quantity;
      
      // Update portfolio
      portfolioItem.quantity -= quantity;
      
      // Remove from portfolio if quantity is 0
      if (portfolioItem.quantity === 0) {
        userData.portfolio = userData.portfolio.filter(item => item.symbol !== symbol);
      }
      
      // Update balance
      userData.balance += saleValue;
      
      showTradeMessage(`Successfully sold ${quantity} shares of ${symbol} for $${saleValue.toFixed(2)}.`, 'success');
    }
    
    // Update UI and save data
    updatePortfolio();
    updateBalance();
    saveUserData();
  }
  
  // Show trade message
  function showTradeMessage(message, type) {
    tradeMessageElement.textContent = message;
    tradeMessageElement.className = `trade-message ${type}`;
    
    // Clear message after 5 seconds
    setTimeout(() => {
      tradeMessageElement.textContent = '';
      tradeMessageElement.className = 'trade-message';
    }, 5000);
  }
  
  // Get stock by symbol
  function getStockBySymbol(symbol) {
    return stocks.find(stock => stock.symbol === symbol);
  }
  
  // Update stock prices randomly to simulate market changes
  function updateStockPrices() {
    stocks.forEach(stock => {
      // Random price change between -3% and +3%
      const changePercent = (Math.random() * 6) - 3;
      const changeAmount = stock.price * (changePercent / 100);
      
      stock.price += changeAmount;
      stock.change = changePercent;
      
      // Ensure price doesn't go below 1
      if (stock.price < 1) {
        stock.price = 1;
      }
    });
    
    // Update UI
    displayStocks();
    updatePortfolio();
  }
  
  // Initialize the app when the DOM is loaded
  document.addEventListener('DOMContentLoaded', initApp);
  