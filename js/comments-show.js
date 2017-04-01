var comments_messages = undefined;

function showError(error) {
  var message = error.message ? error.message : error;
  $("#modal_error").modal('show');
  $("#error_message").text(message);
}

Comments.handleError = function(error) {
  showError(error);
};

function getGravatar(email, size = 100) {
  return "https://www.gravatar.com/avatar/" + md5(email) + "?s=" + size;
}

function showComments(page) {
  Comments.comment.listCallback(page, function(messages) {
    comments_messages = messages;
    $('div[id^=comments_]').remove();
    for (commentId in messages) {
      var comment = messages[commentId];
      var comment_detail = $("<div></div>");
      if (comment.reply) {
        comment_detail.append(
          $("<div></div>").append(
            $("<span></span>").text("引用")
          ).append(" ").append(
            $("<strong></strong>").text(messages[comment.reply].name)
          ).append(" ").append(
            $("<span></span>").addClass('page_datetime').text(Comments.formatDate(new Date(parseInt(messages[comment.reply].timestamp))))
          ).append(" ").append(
            $("<span></span>").text("的评论：")
          ).append(
            $("<div></div>").addClass('page_blog_comment_message_reply').text(messages[comment.reply].comment)
          )
        )
      }

      comment_detail.append(
        $("<div></div>").addClass('page_blog_comment_message').text(comment.comment)
      );

      var name_div = $("<div></div>");

      //some mobile do not suport add image. I don't know why.
      try {
        name_div.append("<img class='img-circle' alt='" + comment.name + "' src='" + getGravatar(comment.email, 20) + "' />").append(" ");
      } catch (err) {
        console.log("some mobile do not suport add image. I don't know why.");
      }

      var name_div = $("<div></div>").append(
        $("<strong></strong>").text(comment.name)
      ).append(" ").append(
        $("<span></span>").addClass('page_datetime').text(Comments.formatDate(new Date(parseInt(comment.timestamp))))
      );
      if (comment.url) {
        name_div.append(" ").append(
          $("<a></a>").attr('href', comment.url).attr('target', '_blank').attr('title', "网站").append(
            $("<button></button>").addClass('btn btn-link').append(
              $("<span></span>").addClass("glyphicon glyphicon-home")
            )
          )
        );
      }

      name_div.append(" ").append(
        $("<button></button>").addClass('btn btn-link').attr('title', "回复").attr('id', "button_reply_" + commentId).attr('reply', commentId).append(
          $("<span></span>").addClass("glyphicon glyphicon-comment")
        )
      );

      var d_comments = $("<div></div>").addClass("list-group-item").attr('id', "comments_" + commentId).append(name_div).append(comment_detail);
      d_comments.insertAfter($("#div_comments"));
    }

    $("button[id^=button_reply_]").click(function() {
      var reply = $(this).attr("reply");
      $("#reply").val(reply);
      $("#reply_user").text(comments_messages[reply].name);
      $("#reply_to").show();
    });
  });

  $("#add_comment").click(function() {
    $("#add_comment").attr("disabled", "");
    Comments.comment.add($("#name").val(), $("#email").val(), page, $("#comment").val(), $("#url").val(), $("#reply").val(), function(result) {
      if (result) {
        $("#comment").val("");
      }

      $("#add_comment").removeAttr("disabled");
    });
  });

  $("#reply_clear").click(function() {
    $("#reply").val("");
    $("#reply_to").hide();
  });
}