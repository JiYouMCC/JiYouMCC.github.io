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
    var div_left = $("<div></div>").addClass("media-left");
    if ("image" in results[i]["meta"]) {
      div_left.append(
        $("<img>").addClass("media-object").attr("src", results[i]["meta"]['image']).attr("title", results[i]["meta"]['title']).attr("alt", results[i]["meta"]['title']).css("max-width", "75px").css("max-height", "150px")
      )
    };
    var div_body_title = $("<a></a>").attr('href', results[i]["url"]).attr('target', "_blank").append($("<h4></h4>").addClass("media-heading").text(results[i]["meta"]['title']));
    var div_body_p = $("<p>" + results[i]['excerpt'] + "</p>");
    var div_body = $("<div></div>").addClass("media-body");
    div_body.append(div_body_title);
    div_body.append(div_body_p);

    var div_media = $("<div></div>").addClass("media");
    div_media.append(div_left);
    div_media.append(div_body);

    $("#pagefind_result").append(
      $("<li></li>").addClass("list-group-item").append(div_media)
    )
  }
  //console.log(results)
}

search(decodeURIComponent(params['string']));