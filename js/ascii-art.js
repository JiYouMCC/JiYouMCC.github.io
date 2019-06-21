var REC_601 = [0.299, 0.587, 0.114];
var BT_709 = [0.2126, 0.7152, 0.0722];
var BT_2100 = [0.2627, 0.6780, 0.0593];
var AVERAGE = [1/3, 1/3, 1/3];

function getColorChars(colorStr) {
  function getCharDensity(char) {
    var canvas = document.createElement("canvas");
    canvas.width = 12;
    canvas.height = 12;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 12, 12);
    ctx.fillStyle = "#000000";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "12pt Courier, monospace";
    ctx.fillText(char, 6, 6);

    var sourceImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var sourceData = sourceImg.data;

    var point = 0;
    var s = sourceData.length / 4;

    for (i = 0; i < sourceData.length; i += 4) {
      luma = Math.floor((sourceData[i] + sourceData[i + 1] + sourceData[i + 2]) / 3);
      if (luma != 255) {
        point += 1;
      }
    }
    return point / s;
  }

  if (colorStr == undefined || colorStr == "") {
    colorStr = "MNHQ$OC?7>!:-;. ";
  }

  var colorArray = colorStr.split("");
  var tempArray = [];
  for (index in colorArray) {
    if (!tempArray.includes(colorArray[index])) {
      tempArray.push(colorArray[index]);
    }
  }

  colorArray = tempArray.sort(function(a, b) {
    if (getCharDensity(a) > getCharDensity(b)) {
      return -1;
    } else if (getCharDensity(a) < getCharDensity(b)) {
      return 1;
    } else {
      return 0
    }
  });
  return colorArray.join("");
}

// UI update

function setZoom() {
  var range = document.getElementById("range");
  var range_value = range.value;
  document.getElementById("ascii").style.transform = "scale(" + (range_value).toString() + ")";
}

function updateCanvas() {
  var imgInput = document.getElementById("img_input");
  if (imgInput.files && imgInput.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = document.getElementById("img");
      img.src = e.target.result;
    }
    reader.readAsDataURL(imgInput.files[0]);
  }
}

function getASCIICode(ctx, width, height, colorStr, greyScale) {
  var ascii = "";
  var greyImg = ctx.createImageData(width, height);
  var greyData = greyImg.data;
  var sourceImg = ctx.getImageData(0, 0, width, height);
  var sourceData = sourceImg.data;
  if (greyScale == undefined) {
    greyScale = REC_601;
  }
  var r_s = greyScale[0];
  var g_s = greyScale[1];
  var b_s = greyScale[2];
  for (i = 0; i < sourceData.length; i += 4) {
    luma = Math.floor(sourceData[i] * r_s + sourceData[i + 1] * g_s + sourceData[i + 2] * b_s);
    greyData[i] = greyData[i + 1] = greyData[i + 2] = luma;
    ascii += colorStr[Math.floor(luma * colorStr.length / 256)];
    greyData[i + 3] = sourceData[i + 3];
    if ((i / 4 + 1) % width == 0) {
      ascii += "\n";
    }
  }
  return ascii;
}

function showText() {
  var textWidth = document.getElementById("canvas_width").value;
  var textHeight = document.getElementById("canvas_height").value;
  var canvas = document.getElementById("canvas");
  canvas.width = textWidth;
  canvas.height = textHeight;
  var text = document.getElementById("text").value;
  var font = document.getElementById("font").value;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, textWidth, textHeight);
  ctx.fillStyle = "#000000";
  
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font;
  ctx.fillText(text, textWidth / 2, textHeight / 2);

}

function generateImg() {
  document.getElementById('ascii').innerHTML = "";
  var ascii = "";
  var colorStr = getColorChars(document.getElementById("color").value);

  var img = document.getElementById('img');
  var canvashide = document.createElement('canvas');
  var ctx = canvashide.getContext("2d");
  canvashide.width = img.width;
  canvashide.height = img.height;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvashide.width, canvashide.height);
  ctx.drawImage(img, 0, 0, img.width, img.height);
  document.getElementById('ascii').innerHTML = getASCIICode(ctx, canvashide.width, canvashide.height, colorStr, REC_601);
}

function generateText(){
  document.getElementById('ascii').innerHTML = "";
  var ascii = "";
  var colorStr = getColorChars(document.getElementById("color").value);

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext("2d");
  document.getElementById('ascii').innerHTML = getASCIICode(ctx, canvas.width, canvas.height, colorStr);
}