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
    var group = $("<div></div>").addClass("list-group-item");
    var text_div = null;
    if ("image" in results[i]["meta"]) {
      group.append(
        $("<img>")
          .attr("src", results[i]["meta"]['image'])
          .attr("title", results[i]["meta"]['title'])
          .attr("alt", results[i]["meta"]['title'])
          .css("max-height", "150px")
          .addClass("rounded float-end")
      )
    }
    var div_body_title = $("<a></a>")
      .addClass('link-underline link-underline-opacity-0 link-underline-opacity-100-hover')
      .attr('href', results[i]["url"])
      .attr('target', "_blank")
      .append($("<h4></h4>")
        .text(results[i]["meta"]['title'])
    );

    var div_body = $("<div></div>");
    div_body.append(div_body_title);
    div_body.append(results[i]['excerpt']);
    group.append(div_body);
    $("#pagefind_result").append(group);
  }
}

search(decodeURIComponent(params['string']));
