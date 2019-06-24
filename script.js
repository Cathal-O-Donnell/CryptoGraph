/*
  API: https://www.coindesk.com/api

  TODO::
    - y-axis labels (1000s) - grid lines
    - x-axis labels (month start)
    - current price
    - loading spinner
    - currency selector
    - percentage change (API)
    - 'animated' line draw?

    - other cryptos? - requires new api
    - two cryptos same graph
    - on hover price & date display
*/

const CANVAS = document.getElementById('graphCanvas');
const CONTEXT = CANVAS.getContext('2d');

// Price variables
let data = getCrypytoPriceData();
let maxValue = 0;

// Grid
let columnPadding = 50;
let rowPadding = 50;

let rowHeight = (CANVAS.height - rowPadding) / (data.length + 2);
let columnWidth = (CANVAS.width - columnPadding) / (data.length + 2);

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

        historicalDataResults.push(dataResult[objKey]);
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
    }
  });

  return historicalDataResults;
}

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
  document.getElementById('txtLowValue').innerHTML = getMinArrValue(data).toFixed(2);
  document.getElementById('txtHighValue').innerHTML = getMaxArrValue(data).toFixed(2);
  document.getElementById('txtAvgValue').innerHTML = getArrAverageValue(data).toFixed(2);

  document.getElementById('priceInfoContainer').style.display = 'block';
}

function populateYAxisValues(maxValue) {
  let resultArr = [];
  let lastValueAdded = 0;

  while (lastValueAdded <= maxValue) {
    lastValueAdded += 1000;
    resultArr.push(lastValueAdded);
  }

  lastValueAdded += 1000;
  resultArr.push(lastValueAdded);

  return resultArr;
}

function drawRowLines(arr) {
  console.log(arr);
  for (var y = 0; y <= arr.length; y++) {
    CONTEXT.moveTo(0, CANVAS.height - arr[y] - rowPadding);
    CONTEXT.lineTo(CANVAS.width, CANVAS.height - arr[y] - rowPadding);
  }

  CONTEXT.lineWidth = 1;
  CONTEXT.strokeStyle = "#ccc";
  CONTEXT.stroke();
}

function drawColumnLines() {
  let monthColumnWidth = (CANVAS.width - columnPadding) / 12;

  for (var x = 0; x < 12; x++) {
    CONTEXT.moveTo(monthColumnWidth * x + columnPadding, 0);
    CONTEXT.lineTo(monthColumnWidth * x + columnPadding, CANVAS.height - columnPadding);
  }

  CONTEXT.lineWidth = 0.5;
  CONTEXT.strokeStyle = "#ccc";
  CONTEXT.stroke();
}

(function() {
  let dataRelativeArr = [];
  let yAxisValuesArr = [];
  let yAxisValuesRelativeArr = [];

  CONTEXT.fillStyle = "#f2f2f2";
  CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

  maxValue = getMaxArrValue(data);
  yAxisValuesArr = populateYAxisValues(maxValue);
  yAxisValuesRelativeArr = getRelativeArrValues(yAxisValuesArr);

  drawRowLines(yAxisValuesRelativeArr);
  drawColumnLines();

  maxValue += maxValue / 100 * 10;
  dataRelativeArr = getRelativeArrValues(data);
  setInfoText();
  //drawGrid();
  drawLine(dataRelativeArr);
  //drawXAxisLabels();
})();