/*
  API: https://www.coindesk.com/api

  TODO::
    / y-axis labels (1000s) - grid lines
    - x-axis labels (month start + year number)
    - current price
    - loading spinner
    - currency selector
    - percentage change (calculate over last day/ week/ month/ year)
    - 'animated' line draw?
    - other cryptos? - requires new api
    - two cryptos same graph (graph legend)
    - on hover price & date display
*/

const CANVAS = document.getElementById('graphCanvas');
const CONTEXT = CANVAS.getContext('2d');

let dataObjArr = [];
let data = getCrypytoPriceData();
let maxValue = 0;
let pricePeak = 0;

let monthArr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let columnPadding = 50;
let rowPadding = 50;
let rowHeight = (CANVAS.height - rowPadding) / dataObjArr.length;
let columnWidth = (CANVAS.width - columnPadding) / dataObjArr.length;

// API
function getCrypytoPriceData() {
  let requestURL = 'https://api.coindesk.com/v1/bpi/historical/close.json?currency=EUR&' + getDateParamater();
  let historicalDataResults = [];

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

        dataObjArr.push(dataObject);
        historicalDataResults.push(dataResult[objKey]);
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

  document.getElementById('txtLowValue').innerHTML = getCurrencySymbol(selectedCurrency) + getMinArrValue(data).toFixed(2);
  document.getElementById('txtHighValue').innerHTML = getCurrencySymbol(selectedCurrency) + getMaxArrValue(data).toFixed(2);
  document.getElementById('txtAvgValue').innerHTML = getCurrencySymbol(selectedCurrency) + getArrAverageValue(data).toFixed(2);

  document.getElementById('priceInfoContainer').style.display = 'block';
}

function populateYAxisValues(maxValue) {
  let resultArr = [0];
  let lastValueAdded = 0;

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

  for (var x = 0; x < 12; x++) {
    CONTEXT.moveTo(monthColumnWidth * x + columnPadding, 0);
    CONTEXT.lineTo(monthColumnWidth * x + columnPadding, CANVAS.height - columnPadding);
  }

  CONTEXT.lineWidth = 0.5;
  CONTEXT.strokeStyle = "#ccc";
  CONTEXT.stroke();
}

function drawXAxisLabels(dataObjArr) {
  let monthColumnWidth = (CANVAS.width - columnPadding) / monthArr.length;
  let monthIndexSequenceArr = [], yearIndexSequenceArr = [], currentMonth, priceMonth, priceYear;

  CONTEXT.font = "10px Verdana";
  CONTEXT.fillStyle = "#4AA5D9";

  for (let i = 0; i < dataObjArr.length; i++) {
    priceMonth = dataObjArr[i].date.split('-')[1];
    priceYear = dataObjArr[i].date.split('-')[0];

    if (priceMonth != currentMonth) {
      currentMonth = priceMonth;

      monthIndexSequenceArr.push(priceMonth.replace(/^[0\.]+/, ''));
      yearIndexSequenceArr.push(priceYear.substring(2));
    }
  }

  // Remove first element of array (current month)
  monthIndexSequenceArr.shift();
  yearIndexSequenceArr.shift();
  for (let i = 0; i <= monthIndexSequenceArr.length; i++) {

    CONTEXT.fillText(monthArr[monthIndexSequenceArr[i] - 1] + " '" + yearIndexSequenceArr[i], monthColumnWidth * i + columnPadding, CANVAS.height - (rowPadding / 2));
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

// DOM Ready
(function() {
  let dataMaxValue, dataRelativeArr = [], yAxisValuesArr = [], yAxisValuesRelativeArr = [];

  CONTEXT.fillStyle = "#f2f2f2";
  CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

  dataMaxValue = getMaxArrValue(data);
  pricePeak = getPricePeak(dataObjArr);

  yAxisValuesArr = populateYAxisValues(dataMaxValue);
  maxValue = yAxisValuesArr[yAxisValuesArr.length - 1];

  yAxisValuesRelativeArr = getRelativeArrValues(yAxisValuesArr);

  drawRowLines(yAxisValuesRelativeArr);
  drawColumnLines();
  dataRelativeArr = getRelativeArrValues(data);

  setInfoText();
  drawLine(dataRelativeArr);
  drawYAxisLabels(yAxisValuesArr, yAxisValuesRelativeArr);
  drawXAxisLabels(dataObjArr);
})();
