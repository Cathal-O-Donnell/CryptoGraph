/*
  API: https://www.coindesk.com/api
*/

"use strict"

const CANVAS = document.getElementById('graphCanvas');
const CONTEXT = CANVAS.getContext('2d');

let dataObjArr = [], priceArr = [], currentPriceObj = [];
let maxValue, pricePeak, dateStartString, dateEndString, rowHeight, columnWidth;
let monthArr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let columnPadding = 50, rowPadding = 50;

function init() {
  let dataMaxValue, dataRelativeArr = [], yAxisValuesArr = [], yAxisValuesRelativeArr = [];
  console.log('init');

  // Data
  dataObjArr = getCrypytoPriceData();
  currentPriceObj = getCurrentPrice();
  dataObjArr.push(currentPriceObj);
  priceArr = populatePriceArr(dataObjArr);
  dataMaxValue = getMaxArrValue(priceArr);
  pricePeak = getPricePeak(dataObjArr);
  yAxisValuesArr = populateYAxisValues(dataMaxValue);
  maxValue = yAxisValuesArr[yAxisValuesArr.length - 1];

  // Get relative data
  yAxisValuesRelativeArr = getRelativeArrValues(yAxisValuesArr);
  dataRelativeArr = getRelativeArrValues(priceArr);

  // Draw grid lines and axis labels
  rowHeight = (CANVAS.height - rowPadding) / dataObjArr.length;
  columnWidth = (CANVAS.width - columnPadding) / dataObjArr.length;
  drawRowLines(yAxisValuesRelativeArr);
  drawYAxisLabels(yAxisValuesArr, yAxisValuesRelativeArr);
  drawXAxisLabels(dataObjArr);

  // Display price info
  setInfoText();
  drawLine(dataRelativeArr);
}

// API
function getCurrentPrice() {
  let dataObj, selectedCurreny, requestURL;

  selectedCurreny = getSelectedCurrency();
  requestURL = 'https://api.coindesk.com/v1/bpi/currentprice/' + selectedCurreny;

  $.ajax({
    url: requestURL,
    dataType: 'json',
    async: false,
    success: function(data) {

        dataObj = {
          date: getCurrentDateFormatted(),
          price: parseFloat(data.bpi[selectedCurreny].rate.replace(',',''))
        }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText)
      alert('An error has occured');
    }
  });

  return dataObj;
}

function getCrypytoPriceData() {
  let requestURL = 'https://api.coindesk.com/v1/bpi/historical/close.json?currency=EUR&' + getDateParamater();
  let resultsArr = [];

  $.ajax({
    url: requestURL,
    dataType: 'json',
    async: false,
    success: function(data) {
      let dateKey, dataResult = data.bpi;

      for (var i = 0; i < Object.keys(dataResult).length; i++) {
        dateKey = Object.keys(dataResult)[i];

        resultsArr.push({
          date: dateKey,
          price: dataResult[dateKey].toFixed(2)
        });
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText)
      alert('An error has occured');
    }
  });

  return resultsArr;
}

// Canvas
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

function setInfoText() {
  let selectedCurrency = getSelectedCurrency();

  document.getElementById('txtCurrentValue').innerHTML = getCurrencySymbol(selectedCurrency) + currentPriceObj.price.toFixed(2);
  document.getElementById('txtLowValue').innerHTML = getCurrencySymbol(selectedCurrency) + getMinArrValue(priceArr).toFixed(2);
  document.getElementById('txtHighValue').innerHTML = getCurrencySymbol(selectedCurrency) + getMaxArrValue(priceArr).toFixed(2);
}

function populateYAxisValues(maxValue) {
  let resultArr = [0], lastValueAdded = 0;

  while (lastValueAdded <= maxValue) {
    resultArr.push(lastValueAdded += 1000);
  }

  resultArr.push(lastValueAdded += 1000);

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
  let monthIndexSequenceArr = [], yearIndexSequenceArr = [], currentMonth, priceMonth, priceYear, priceDay, monthColumnWidth

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

function getDateParamater() {
  let date, monthNumber, start, end;

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
    percentageOfCanvas = percentage(arr[i], maxValue);
    xValue = 0;

    if (percentageOfCanvas > 0) {
      xValue = (CANVAS.height - rowPadding) * (percentageOfCanvas / 100);
    }

    resultArr.push(xValue);
  }

  return resultArr;
}

function getSelectedCurrency() {
  return document.getElementById('lstCurrency').value;
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
  let resultsArr = [];

  for (let i = 0; i < arr.length; i++) {
    resultsArr.push(parseFloat(arr[i].price));
  }

  return resultsArr;
}

function setUpEventListeners() {
  document.getElementById('lstCurrency').addEventListener('change', init);
  document.getElementById('btnRefresh').addEventListener('click', init);
}

// DOM Ready
(function() {
  setUpEventListeners();
  init();
})();
