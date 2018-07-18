var comments_messages = undefined;

function handleError(error) {
  var message = error.message ? error.message : error;
  $("#modal_error").modal('show');
  $("#error_message").text(message);
}

function addComment(comment) {
  var commentId = comment.id;
  var userName = comment.user.login;
  var userAvatar = comment.user.avatar_url;
  var userLink = comment.user.html_url;
  var date = new Date(comment.created_at);

  var comment_detail = $("<div></div>");
  comment_detail.append(
    $("<div></div>").attr('id', 'comment_text_' + commentId).addClass('page_blog_comment_message')
  );
  var name_div = $("<div></div>");
  name_div.append("<img class='img-circle' style='width: 20px;height: 20px;' alt='" + userName + "' src='" + userAvatar + "' />").append(" ");
  name_div.append($("<span></span>").addClass("page_blog_comment_name").text(userName)).append(" ");
  name_div.append($("<span></span>").addClass("page_datetime").text(Comments.formatDate(date)));
  name_div.append(" ").append(
    $("<a></a>").attr("href", userLink).attr("target", "_blank").attr("title", "Github page").append(
      $("<button></button>").addClass("btn btn-link").append(
        $("<span></span>").addClass("glyphicon glyphicon-home")
      )
    )
  );
  name_div.append(" ").append(
    $("<button></button>").addClass('btn btn-link').attr('title', "回复").attr('id', "button_reply_" + commentId).attr('reply', userName).append(
      $("<span></span>").addClass("glyphicon glyphicon-comment")
    )
  );

  var d_comments = $("<div></div>").addClass("list-group-item").attr('id', "comments_" + commentId).append(name_div).append(comment_detail);
  d_comments.insertAfter($("#div_comments"));
    var converter = new showdown.Converter({
    ghMentions: true,
    tables: true,
    tasklists: true,
    simpleLineBreaks: true,
    openLinksInNewWindow: true,
    simplifiedAutoLink: true
  });
  var html = converter.makeHtml(GithubComments.Emoji.Parse(comment.body));
  document.getElementById('comment_text_' + commentId).innerHTML = GithubComments.Emoji.Parse(html);
}

function showComments(issueId) {
  $('div[id^=comments_]').remove();
  var refresh = $("<div></div>").attr("id", "refresh_comments").addClass("list-group-item").append(
    $("<span></span>").addClass("glyphicon glyphicon-refresh glyphicon-refresh-animate")
  ).append(" 载入中……");
  refresh.insertAfter($("#div_comments"));

  GithubComments.Comments.Get(issueId, function(result) {
    $('#refresh_comments').remove();
    $('div[id^=comments_]').remove();
    if (result.status) {
      for (var i = 0; i < result.data.length; i++) {
        addComment(result.data[i]);
      }
      $("[comments-count='" + issueId + "']").text(result.data.length);

      $("button[id^=button_reply_]").click(function() {
        var reply = $(this).attr("reply");
        $("#commnet_text").val($("#comment").val() + "@" + reply + " ");
        $("html,body").animate({
          scrollTop: $("#comments").offset().top
        }, 1000)
      });
    } else {
      handleError(result.data);
    }
  });
}

function showForm() {
  GithubComments.User.Get(function(userInfo) {
      if (userInfo) {
        $("#comment_login").hide();
        $("#comment_form").show();
      } else {
        $("#comment_login").show();
        $("#comment_form").hide();
      }
    }
}
