Comments.comment.recent.updateCallback(7, function(comments) {
  $("#recent-comments").text("");
  for (commentId in comments) {
    var comment = comments[commentId];
    $("#recent-comments").prepend(
      $("<a></a>").addClass("list-group-item").attr("href", comment.post + "#comments_" + commentId).append(
        $("<div></div>").append(
          $("<span></span>").addClass("page_blog_comment_name").text(comment.name)
        ).append(" ").append(
          $("<span></span>").addClass('page_datetime').text(Comments.formatDate(new Date(parseInt(comment.timestamp))))
        )
      ).append(
        $("<div></div>").text(comment.comment.slice(0, 32))
      )
    );
  }
})
