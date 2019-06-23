/*
  API: https://www.coindesk.com/api
  Dates in given range: https://jsfiddle.net/elchininet/fcym5zq5/
*/

const CANVAS = document.getElementById('graphCanvas');
const CONTEXT = CANVAS.getContext('2d');

let dateArr = populateDateArr();
let data = getCrypytoPriceData();
let maxValue = 0;
getCrypytoPriceData();
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

      for (var i = 0; i < Object.keys(dataResult).length; i++) {
        let objKey = Object.keys(dataResult)[i];

        historicalDataResults.push(dataResult[objKey]);
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
    }
  });

  return historicalDataResults;
}


function getHistoricalPriceData() {

  let apiBaseURI = 'https://api.coindesk.com/v1/bpi/historical/close.json?';

  let historicalDataResults = [];
  let start, end;
  for (let i = dateArr.length - 1; i >= 0; i--) {
    let requestURL;
    dateParameter = dateArr[i];

    requestURL = apiBaseURI + 'start=' + dateParameter + '&end=' + dateParameter;

    $.ajax({
      url: requestURL,
      dataType: 'json',
      cache: false,
      async: false,
      success: function(data) {
        let dataResult = data.bpi;
        let objKey = Object.keys(dataResult)[0];

        historicalDataResults.push(dataResult[objKey]);
      },
      error: function(xhr, ajaxOptions, thrownError) {
        alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
      }
    });
  }

  return historicalDataResults;
}

// Grid
let rowHeight = CANVAS.height / (data.length + 2);
let columnWidth = CANVAS.width / (data.length + 2);
let columnPadding = columnWidth * 2;
let rowPadding = rowHeight * 2;

function drawGrid() {

  // Rows
  for (var y = data.length; y <= data.length; y++) {
    CONTEXT.moveTo(columnPadding, rowHeight * y);
    CONTEXT.lineTo(CANVAS.width, rowHeight * y);
  }

  // Columns
  for (var x = 0; x < data.length; x++) {
    CONTEXT.moveTo(columnWidth * x + columnPadding, 0);
    CONTEXT.lineTo(columnWidth * x + columnPadding, CANVAS.height - rowPadding);
  }

  CONTEXT.lineWidth = 1;
  CONTEXT.strokeStyle = "#ccc";
  CONTEXT.stroke();
}

// Line
function drawLine(arr) {
  CONTEXT.beginPath();
  console.log(arr);
  // Upside down
  for (let i = 0; i < arr.length; i++) {
    let x = columnWidth * i + (columnWidth * 2);
    let y = CANVAS.height - (arr[i] + rowPadding);

    CONTEXT.lineTo(x, y);
  }

  CONTEXT.lineWidth = 2;
  CONTEXT.strokeStyle = "#60be7a";
  CONTEXT.stroke();
}

function drawXAxisLabels() {
  let columnIndex = 0;
  for (var i = dateArr.length - 1; i >= 0; i--) {
    CONTEXT.fillText(dateArr[i], (columnWidth * columnIndex) + columnPadding, CANVAS.height - rowPadding + 20);
    columnIndex += 1;
  }
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

function getDateParamater() {
  let date = new Date();
  let start, end, monthNumber;

  monthNumber = date.getMonth() + 1;

  if (monthNumber < 10) {
    monthNumber = '0' + monthNumber;
  }

  start = (date.getFullYear() - 1) + '-' + monthNumber + '-' + date.getDate();
  end = date.getFullYear() + '-' + monthNumber + '-' + date.getDate();

  return 'start=' + start + '&end=' + end;
}

function populateDateArr() {
  let date = new Date();
  let dateArr = [];
  let monthNumber;
  for (let i = 0; i < 12; i++) {
    let thisMonth = date.getMonth();
    date.setMonth(thisMonth);

    if ((thisMonth - i < 0) && (date.getMonth() != (thisMonth + i))) {
      date.setDate(0);
    } else if ((thisMonth - i >= 0) && (date.getMonth() != thisMonth - i)) {
      date.setDate(0);
    }

    monthNumber = date.getMonth() + 1;

    if (monthNumber < 10) {
      monthNumber = '0' + monthNumber;
    }

    dateArr.push(date.getFullYear() + '-' + monthNumber + '-01');

  }

  return dateArr;
}

function percentage(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

function getRelativeArrValues(arr) {
  let resultArr = [];

  for (let i = 0; i < arr.length; i++) {
    let xValue = 0;
    let percentageOfCanvas = percentage(arr[i], maxValue);

    if (percentageOfCanvas > 0) {
      xValue = (CANVAS.height - rowPadding) * (percentageOfCanvas / 100);
    }

    resultArr.push(xValue);
  }

  return resultArr;
}

(function() {
  let dataRelativeArr = [];
  maxValue = getMaxArrValue(data);
  maxValue += maxValue / 100 * 10;
  dataRelativeArr = getRelativeArrValues(data);

  //drawGrid();
  drawLine(dataRelativeArr);
  //drawXAxisLabels();
})();