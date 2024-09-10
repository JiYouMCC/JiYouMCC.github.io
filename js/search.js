var params = {};
if (location.search) {
  var parts = location.search.substring(1).split('&');
  for (var i = 0; i < parts.length; i++) {
    var nv = parts[i].split('=');
    if (!nv[0]) continue;
    params[nv[0]] = nv[1] || true;
  }
}

async function search(searchString) {
  var pagefind = await import("/pagefind/pagefind.js");
  await pagefind.options({
    showSubResults: false,
    excerptLength: 100
  });
  pagefind.init();
  var search = await pagefind.search(searchString);
  var results = await Promise.all(search.results.map(r => r.data()));
  $("#pagefind_result").text(" ");
  $("#search_message").html("搜索“" + searchString + "”，查找到 " + results.length + " 条记录");
  for (var i = 0; i < results.length; i++) {
    var row = $("<div></div>").addClass("row g-0");
    if ("image" in results[i]["meta"]) {
      var image_div = $("<div></div>").addClass("col-md-3");
      image_div.append(
        $("<img>")
          .attr("src", results[i]["meta"]['image'])
          .attr("title", results[i]["meta"]['title'])
          .attr("alt", results[i]["meta"]['title'])
          .attr("style", "max-width: 100%")
      )
      row.append(image_div);

      var text_div = $("<div></div>").addClass("col-md-9");
      var div_body_title = $("<a></a>")
        .attr('href', results[i]["url"])
        .attr('target', "_blank")
        .append($("<h4></h4>")
          .text(results[i]["meta"]['title'])
      );
      var div_body_p = $("<p>" + results[i]['excerpt'] + "</p>");
      var div_body = $("<div></div>").addClass("card-body");
      div_body.append(div_body_title);
      div_body.append(div_body_p);
      text_div.append(div_body);
      row.append(text_div);
    } else {
      var text_div = $("<div></div>").addClass("col-md-12");
      var div_body_title = $("<a></a>")
        .attr('href', results[i]["url"])
        .attr('target', "_blank")
        .append($("<h4></h4>")
          .text(results[i]["meta"]['title'])
      );
      var div_body_p = $("<p>" + results[i]['excerpt'] + "</p>");
      var div_body = $("<div></div>").addClass("card-body");
      div_body.append(div_body_title);
      div_body.append(div_body_p);
      text_div.append(div_body);
      row.append(text_div);
    }
    $("#pagefind_result").append(row);
  }
  //console.log(results)
}

search(decodeURIComponent(params['string']));