/*
  API: https://www.coindesk.com/api

  TODO::
    / y-axis labels (1000s) - grid lines
    - x-axis labels (month start + year number)
    - column line refactor - draw line when month changes in data
    / current price
    - currency selector
    - percentage change (calculate over last day/ week/ month/ year)
    - 'animated' line draw?
    - other cryptos? - requires new api
    - two cryptos same graph (graph legend)
    - on hover price & date display
*/

const CANVAS = document.getElementById('graphCanvas');
const CONTEXT = CANVAS.getContext('2d');

let dataObjArr = getCrypytoPriceData();
let priceArr = [];
let currentPriceObj = getCurrentPrice();

let maxValue = 0;
let pricePeak = 0;

let monthArr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let columnPadding = 50;
let rowPadding = 50;
let rowHeight = (CANVAS.height - rowPadding) / dataObjArr.length;
let columnWidth = (CANVAS.width - columnPadding) / dataObjArr.length;

// API
function getCurrentPrice() {
  // Current price https://api.coindesk.com/v1/bpi/currentprice/EUR
  let dataObj, selectedCurreny, requestURL;

  selectedCurreny = getSelectedCurrency()
  requestURL = 'https://api.coindesk.com/v1/bpi/currentprice/' + selectedCurreny;

  $.ajax({
    url: requestURL,
    dataType: 'json',
    cache: false,
    async: false,
    success: function(data) {
      let dataResult = data.bpi;
      let objKey, dataObject;

      for (var i = 0; i < Object.keys(dataResult).length; i++) {
        let dataResult = data.bpi[selectedCurreny];
        let dataResultPrice = dataResult.rate.replace(',','');

        dataObj = {
          date: getCurrentDateFormatted(),
          price: parseFloat(dataResultPrice)
        }
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
    }
  });

  return dataObj;
}

function getCrypytoPriceData() {
  let requestURL = 'https://api.coindesk.com/v1/bpi/historical/close.json?currency=EUR&' + getDateParamater();
  let historicalDataResults = [];

  // Historical data
  $.ajax({
    url: requestURL,
    dataType: 'json',
    cache: false,
    async: false,
    success: function(data) {
      let dataResult = data.bpi;
      let objKey, dataObject;

      for (var i = 0; i < Object.keys(dataResult).length; i++) {
        objKey = Object.keys(dataResult)[i];

        dataObject = {
          date: objKey,
          price: dataResult[objKey].toFixed(2)
        };

        historicalDataResults.push(dataObject);
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
    }
  });

  return historicalDataResults;
}

// Line
function drawLine(arr) {
  let x, y;

  CONTEXT.beginPath();

  for (let i = 0; i < arr.length; i++) {
    x = columnWidth * i + columnPadding;
    y = CANVAS.height - (arr[i] + rowPadding);

    CONTEXT.lineTo(x, y);
  }

  CONTEXT.lineWidth = 2;
  CONTEXT.strokeStyle = "#60be7a";
  CONTEXT.stroke();
}

// Misc
function getCurrentDateFormatted() {
  let date = new Date();
  let month = date.getMonth() + 1;

  if (month < 10) {
    month = '0' + month;
  }

  return date.getFullYear() + '-' + month + '-' + date.getDate();
}

function getMaxArrValue(arr) {
  let max;

  for (let i = 0; i < arr.length; i++) {
    if (max == null || arr[i] > max) {
      max = arr[i];
    }
  }

  return max;
}

function getPricePeak(arr) {
  let peakPrice;

  for (let i = 0; i < arr.length; i++) {
    if (peakPrice == null || arr[i].price > peakPrice) {
      peakPrice = arr[i].price;
    }
  }

  return peakPrice;
}

function getMinArrValue(arr) {
  let min;

  for (let i = 0; i < arr.length; i++) {
    if (min == null || arr[i] < min) {
      min = arr[i];
    }
  }

  return min;
}

function getArrAverageValue(arr) {
  let total = 0;

  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }

  return total / arr.length;
}

function getDateParamater() {
  let DATE, start, end, monthNumber;

  date = new Date();
  monthNumber = date.getMonth() + 1;

  if (monthNumber < 10) {
    monthNumber = '0' + monthNumber;
  }

  start = (date.getFullYear() - 1) + '-' + monthNumber + '-' + date.getDate();
  end = date.getFullYear() + '-' + monthNumber + '-' + date.getDate();

  return 'start=' + start + '&end=' + end;
}

function percentage(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

function getRelativeArrValues(arr) {
  let xValue, percentageOfCanvas, resultArr = [];

  for (let i = 0; i < arr.length; i++) {
    xValue = 0;
    percentageOfCanvas = percentage(arr[i], maxValue);

    if (percentageOfCanvas > 0) {
      xValue = (CANVAS.height - rowPadding) * (percentageOfCanvas / 100);
    }

    resultArr.push(xValue);
  }

  return resultArr;
}

function setInfoText() {
  let selectedCurrency = getSelectedCurrency();

    document.getElementById('txtCurrentValue').innerHTML = getCurrencySymbol(selectedCurrency) + currentPriceObj.price.toFixed(2);

  document.getElementById('txtLowValue').innerHTML = getCurrencySymbol(selectedCurrency) + getMinArrValue(priceArr).toFixed(2);
  document.getElementById('txtHighValue').innerHTML = getCurrencySymbol(selectedCurrency) + getMaxArrValue(priceArr).toFixed(2);
  document.getElementById('txtAvgValue').innerHTML = getCurrencySymbol(selectedCurrency) + getArrAverageValue(priceArr).toFixed(2);

  document.getElementById('priceInfoContainer').style.display = 'block';
}

function populateYAxisValues(maxValue) {
  let resultArr = [0], lastValueAdded = 0;

  while (lastValueAdded <= maxValue) {
    lastValueAdded += 1000;
    resultArr.push(lastValueAdded);
  }

  return resultArr;
}

function drawRowLines(arr) {

  for (var y = 0; y <= arr.length; y++) {
    CONTEXT.moveTo(rowPadding, CANVAS.height - arr[y] - rowPadding);
    CONTEXT.lineTo(CANVAS.width, CANVAS.height - arr[y] - rowPadding);
  }

  CONTEXT.lineWidth = 0.5;
  CONTEXT.strokeStyle = "#ccc";
  CONTEXT.stroke();
}

function drawColumnLines() {
  let monthColumnWidth = (CANVAS.width - columnPadding) / monthArr.length;

  for (var x = 0; x < monthArr.length; x++) {
    CONTEXT.moveTo(monthColumnWidth * x, 0);
    CONTEXT.lineTo(monthColumnWidth * x, CANVAS.height - columnPadding);
  }

  CONTEXT.lineWidth = 0.5;
  CONTEXT.strokeStyle = "#ccc";
  CONTEXT.stroke();
}

function drawColumnLine(x, dateText) {

  CONTEXT.moveTo(columnWidth * x + columnPadding, 0);
  CONTEXT.lineTo(columnWidth * x + columnPadding, CANVAS.height - columnPadding);

  CONTEXT.lineWidth = 0.5;
  CONTEXT.strokeStyle = "#ccc";
  CONTEXT.stroke();
}

function writeXAxisDate(x, dateText) {
  CONTEXT.font = "10px Verdana";
  CONTEXT.fillStyle = "#4AA5D9";

  CONTEXT.fillText(dateText, columnWidth * x + columnPadding, CANVAS.height - (rowPadding / 2));
}

function drawXAxisLabels(dataObjArr) {
  let monthIndexSequenceArr = [], yearIndexSequenceArr = [], currentMonth, priceMonth, priceYear, monthColumnWidth

  monthColumnWidth = (CANVAS.width - columnPadding) / monthArr.length;

  for (let i = 0; i < dataObjArr.length; i++) {
    priceMonth = dataObjArr[i].date.split('-')[1];
    priceYear = dataObjArr[i].date.split('-')[0];
    priceDay = dataObjArr[i].date.split('-')[2];

    if (priceMonth != currentMonth) {
      currentMonth = priceMonth;

      monthIndexSequenceArr.push(priceMonth.replace(/^[0\.]+/, ''));
      yearIndexSequenceArr.push(priceYear.substring(2));

      let dateString = monthArr[priceMonth.replace(/^[0\.]+/, '') - 1] + '-' + priceYear.substring(2);

      drawColumnLine(i);

      if (parseInt(priceDay) < 15) {
        writeXAxisDate(i, dateString);
      }
    }
  }
}

function drawYAxisLabels(arr, relativeYValues) {
  CONTEXT.font = "10px Verdana";
  CONTEXT.fillStyle = "#4AA5D9";

  for (let i = arr.length - 1; i >= 0; i--) {
    CONTEXT.fillText(arr[i], (columnPadding / 2) - (columnPadding / 5), CANVAS.height - relativeYValues[i] - rowPadding);
  }
}

function getSelectedCurrency() {
  return 'EUR'; // hardcoded for now
}

function getCurrencySymbol(selectedCurrency) {

  switch(selectedCurrency) {
    case 'EUR':
      return '€';
      break;
    case 'USD':
      return '$'
      break;
    case 'GBP':
      return '£';
      break;
  }
}

function populatePriceArr(arr) {
  let resultsArr = []
  for (let i = 0; i < arr.length; i++) {
    resultsArr.push(parseFloat(arr[i].price));
  }

  return resultsArr;
}

function init() {
  let dataMaxValue, dataRelativeArr = [], yAxisValuesArr = [], yAxisValuesRelativeArr = [];

  CONTEXT.fillStyle = "#f2f2f2";
  CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

  dataObjArr.push(currentPriceObj);

  priceArr = populatePriceArr(dataObjArr);

  dataMaxValue = getMaxArrValue(priceArr);
  pricePeak = getPricePeak(dataObjArr);
  yAxisValuesArr = populateYAxisValues(dataMaxValue);
  maxValue = yAxisValuesArr[yAxisValuesArr.length - 1];

  // Get relative data
  yAxisValuesRelativeArr = getRelativeArrValues(yAxisValuesArr);
  dataRelativeArr = getRelativeArrValues(priceArr);

  // Draw grid lines and axis
  drawRowLines(yAxisValuesRelativeArr);
  //drawColumnLines();
  drawYAxisLabels(yAxisValuesArr, yAxisValuesRelativeArr);
  drawXAxisLabels(dataObjArr);

  // Display price info
  setInfoText();
  drawLine(dataRelativeArr);
}

// DOM Ready
(function() {
  init();
})();
