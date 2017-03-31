var params = {};
  if (location.search) {
    var parts = location.search.substring(1).split('&');
    for (var i = 0; i < parts.length; i++) {
        var nv = parts[i].split('=');
        if (!nv[0]) continue;
        params[nv[0]] = nv[1] || true;
    }
  }

  window.idx = lunr(function () {
    this.use(lunr.jp);
    this.field('post_id');
    this.field('title', { boost: 10 });
    this.field('category');
    this.field('tags');
  });

  window.data = $.getJSON('/search_data.json');
  window.data.then(function(loaded_data){
    $.each(loaded_data, function(index, value){
      window.idx.add(
        $.extend({ "id": index }, value)
      );
    });
    var results = window.idx.search(decodeURIComponent(params['string']));
    results.forEach(function(result) {
      var item = loaded_data[result.ref];
      var title = $("<td></td>").append($("<a></a>").text(item.title).attr("href", item.url));
      var date = $("<td></td>").addClass("page_datetime").addClass("text-right").text(item.date);
      var cat = $("<td></td>").addClass("text-center").append(
        $("<span></span>").append(
          $("<a></a>").attr("class", "label label-default").attr("href", "/type#" + item.category).text(item.category)));
      var comments = $("<td></td").addClass("text-center").append($("<span></span>").attr("class", "badge ds-thread-count").attr("comments-count", item.post_id));
      $("#result").append(
        $("<tr></tr")
          .append(title)
          .append(date)
          .append(cat)
          .append(comments)
          );
      });

    var elements = $("[comments-count]");
    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        var post = element.attr('comments-count');
        if (post) {
            Comments.post.commentCount.updateCallback(post, function(result) {
                if (result) {
                    $("[comments-count='" + result.post + "']").text(result.count);
                }
            });
        }
    }
  });
