import React, { useState, useEffect } from 'react';
// In a real project, you would import the CSS file like this:
// import './styles.css';

// Main App component for the currency converter
const App = () => {
  // State to store the input amount
  const [amount, setAmount] = useState('');
  // State for the currency being converted from
  const [fromCurrency, setFromCurrency] = useState('USD');
  // State for the currency being converted to
  const [toCurrency, setToCurrency] = useState('EUR');
  // State to store the converted result
  const [convertedAmount, setConvertedAmount] = useState('');
  // State to manage any error messages related to conversion logic
  const [conversionError, setConversionError] = useState('');
  // State to store the fetched exchange rates (from USD as base)
  const [exchangeRates, setExchangeRates] = useState(null);
  // State to manage loading status of API call
  const [isLoading, setIsLoading] = useState(true);
  // State to manage API fetching errors
  const [apiError, setApiError] = useState('');

  // API Key for ExchangeRate-API.
  // IMPORTANT: For a production application, you should secure your API key
  // and not expose it directly in client-side code.
  // For demonstration, you can use a placeholder or sign up for a free key at exchangerate-api.com
  // Please replace 'YOUR_API_KEY' with your actual API key.
  const API_KEY = '90dec58af730ba168f3c60cd'; // Replace with your actual API key from exchangerate-api.com
  const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`; // Fetching rates with USD as base

  // useEffect hook to fetch exchange rates when the component mounts
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setIsLoading(true); // Set loading to true before fetching
      setApiError(''); // Clear any previous API errors
      console.log("Attempting to fetch exchange rates from:", API_URL); // Log the API URL
      if (API_KEY === 'YOUR_API_KEY' || !API_KEY) {
        setApiError('Please replace "YOUR_API_KEY" with your actual API key from exchangerate-api.com');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          // If response is not OK (e.g., 404, 500), throw an error
          const errorText = await response.text(); // Get raw text to see if it's JSON or HTML
          console.error("API Response not OK:", response.status, errorText);
          let errorMessage = `HTTP error! Status: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText); // Try parsing as JSON
            errorMessage = errorData.error_type || errorData.message || errorMessage;
          } catch (e) {
            // If not JSON, use the raw text
            errorMessage = `HTTP error! Status: ${response.status}. Response: ${errorText.substring(0, 100)}...`;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        if (data.result === 'success') {
          setExchangeRates(data.conversion_rates); // Store the conversion rates
        } else {
          // Handle API-specific errors reported in the 'result' field
          throw new Error(data.error_type || 'Failed to fetch exchange rates: Unknown API error.');
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        setApiError(`Failed to load exchange rates: ${error.message}. Please ensure your API key is correct and you have an active internet connection.`);
      } finally {
        setIsLoading(false); // Set loading to false after fetching (success or failure)
      }
    };

    fetchExchangeRates(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs only once on mount

  // Function to perform the currency conversion
  const convertCurrency = () => {
    setConversionError(''); // Clear previous conversion errors
    setConvertedAmount(''); // Clear previous converted amount

    // Ensure exchange rates are loaded before attempting conversion
    if (!exchangeRates) {
      setConversionError('Exchange rates not loaded yet. Please wait or check API.');
      return;
    }

    // Check if the input amount is a valid number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setConversionError('Please enter a valid positive number for the amount.');
      return;
    }

    // Check if the selected currencies exist in the fetched rates
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      setConversionError('Selected currency not supported by the API.');
      return;
    }

    let result;
    if (fromCurrency === 'USD') {
      // If converting from USD, directly use the rate
      result = numAmount * exchangeRates[toCurrency];
    } else if (toCurrency === 'USD') {
      // If converting to USD, divide by the 'from' currency's rate relative to USD
      result = numAmount / exchangeRates[fromCurrency];
    } else {
      // For cross-currency conversion (e.g., EUR to GBP)
      // Convert 'from' currency to USD first, then USD to 'to' currency
      const amountInUSD = numAmount / exchangeRates[fromCurrency];
      result = amountInUSD * exchangeRates[toCurrency];
    }

    // Format the result to two decimal places
    setConvertedAmount(result.toFixed(2));
  };

  // Function to swap the 'from' and 'to' currencies
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // useEffect hook to re-run conversion when amount or currencies change,
  // but only if exchange rates are already loaded
  useEffect(() => {
    if (exchangeRates && amount && !isNaN(parseFloat(amount))) {
      convertCurrency();
    } else if (!amount || isNaN(parseFloat(amount))) {
      setConvertedAmount(''); // Clear converted amount if input is invalid or empty
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]); // Dependencies: re-run when these states change

  // Get a list of available currencies from the fetched exchangeRates object keys
  // Only populate if exchangeRates is not null
  const currencies = exchangeRates ? Object.keys(exchangeRates).sort() : [];

  return (
    // Main container with full height, centered content, and dark background
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans">
      {/* Converter card */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Live Currency Converter</h1>

        {/* Loading and Error messages for API fetch */}
        {isLoading && (
          <p className="text-blue-400 text-center mb-4">Loading exchange rates...</p>
        )}
        {apiError && (
          <p className="text-red-400 text-center mb-4">{apiError}</p>
        )}

        {/* Input for amount */}
        <div className="mb-5">
          <label htmlFor="amount" className="block text-gray-300 text-sm font-semibold mb-2">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            disabled={isLoading || !!apiError} // Disable input if loading or API error
          />
        </div>

        {/* Currency selection dropdowns and Swap button */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6">
          {/* From Currency */}
          <div>
            <label htmlFor="fromCurrency" className="block text-gray-300 text-sm font-semibold mb-2">
              From
            </label>
            <select
              id="fromCurrency"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 transition duration-200"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.5em 1.5em',
              }}
              disabled={isLoading || !!apiError} // Disable select if loading or API error
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={swapCurrencies}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !!apiError} // Disable button if loading or API error
            title="Swap currencies"
          >
            {/* Swap icon (using inline SVG for simplicity and consistency) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          {/* To Currency */}
          <div>
            <label htmlFor="toCurrency" className="block text-gray-300 text-sm font-semibold mb-2">
              To
            </label>
            <select
              id="toCurrency"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 transition duration-200"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.5em 1.5em',
              }}
              disabled={isLoading || !!apiError} // Disable select if loading or API error
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error message display for conversion logic */}
        {conversionError && (
          <p className="text-red-400 text-sm mb-4 text-center">{conversionError}</p>
        )}

        {/* Converted amount display */}
        {convertedAmount && (
          <div className="mt-6 p-4 bg-blue-600 rounded-lg text-white text-center text-2xl font-bold shadow-md">
            {amount} {fromCurrency} = {convertedAmount} {toCurrency}
          </div>
        )}

        {/* Note about API usage */}
        <p className="text-gray-500 text-xs mt-6 text-center">
          Exchange rates are fetched from ExchangeRate-API.com. Remember to replace `YOUR_API_KEY` with your actual key.
        </p>
      </div>
    </div>
  );
};

export default App;
