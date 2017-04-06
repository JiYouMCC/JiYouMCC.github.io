Comments.comment.recent.updateCallback(7, function(comments) {
  $("#recent-comments").text("");
  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i];
    var commentId = comment.id;
    $("#recent-comments").prepend(
      $("<a></a>").attr("data-toggle", "tooltip").attr("data-placement", "bottom").attr("title", Comments.formatDate(new Date(parseInt(comment.timestamp)))).addClass("list-group-item").attr("href", comment.post + "#comments_" + commentId).append(
        $("<div></div>").append(
          $("<span></span>").addClass("page_blog_comment_name").text(comment.name)
        )
      ).append(
        $("<div></div>").text(comment.comment.slice(0, 32))
      )
    );
  }
  $('[data-toggle="tooltip"]').tooltip();
});
