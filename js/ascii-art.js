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
    colorStr = "■$&M#%0OGDC*+;, ";
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