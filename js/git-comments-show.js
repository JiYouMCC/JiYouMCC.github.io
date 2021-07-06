var emojiList = [":smile:",
  ":grin:",
  ":joy:",
  ":flushed:",
  ":heart_eyes:",
  ":sweat:",
  ":cry:",
  ":angry:",
  ":sleepy:",
  ":+1:",
  ":fist:",
  ":sunny:",
  ":trollface:",
  ":octocat:"
];

var pageButtonTitle = {
  'next': '下页',
  'last': '尾页',
  'prev': '上页',
  'first': '首页'
}

function formatDate(e) {
  return e.getFullYear() + "-" + ("0" + (e.getMonth() + 1)).slice(-2) + "-" + ("0" + e.getDate()).slice(-2) + " " + ("0" + e.getHours()).slice(-2) + ":" + ("0" + e.getMinutes()).slice(-2) + ":" + ("0" + e.getSeconds()).slice(-2) + " "
}

function timeSince(when) {
    var now = new Date();
    var span = now.valueOf() - when.valueOf();
    var years = span / (1000 * 60 * 60 * 24 * 365);
    var month = span / (1000 * 60 * 60 * 24 * 30);
    var day = span / (1000 * 60 * 60 * 24);
    var hours = span / (1000 * 60 * 60);
    var minutes = span / (1000 * 60);
    var seconds = span / (1000);

    if (years >= 1) {
        return(parseInt(years) + "年前");
    } else if (month >= 1) {
        return(parseInt(month) + "个月前");
    } else if (day >= 1) {
        return(parseInt(day) + "天前");
    } else if (hours >= 1) {
        return(parseInt(hours) + "小时前");
    } else if (minutes >= 1) {
        return(parseInt(minutes) + "分钟前");
    } else if (seconds >= 1) {
        return(parseInt(seconds) + "秒前");
    } else {
        return("刚刚");
    }
}


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
  name_div.append(
    $("<span></span>")
      .addClass("page_datetime")
      .text(timeSince(date))
      .attr("title",formatDate(date)
  ));  
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
  d_comments.insertAfter("#div_comments");
  document.getElementById('comment_text_' + commentId).innerHTML = comment.body_html;
  emojiProcess();
}

function showComments(issueId, page, postId) {
  if (!page) {
    page = 1;
  }
  $('div[id^=comments_]').remove();
  var refresh = $("<div></div>").attr("id", "refresh_comments").addClass("list-group-item").append(
    $("<span></span>").addClass("glyphicon glyphicon-refresh glyphicon-refresh-animate")
  ).append(" 载入中……");
  refresh.insertAfter($("#div_comments"));

  GithubComments.Comments.Count(issueId, function(result) {
    if (result.status) {
      $("[comments-count='" + issueId + "']").text(result.count + OldComments.GetCommentsCount(postId));
    }
  });

  GithubComments.Comments.Get(issueId, function(result) {
    $('#refresh_comments').remove();
    $('div[id^=comments_]').remove();
    if (result.status) {
      if (result.links.length) {
        var pages = $("<div></div>").addClass("list-group-item").attr('id', "comments_page");
        var buttons = $('<div class="btn-group" role="group"></div>');
        for (index in result.links) {
          var title = result.links[index].ref;
          if (pageButtonTitle[title]) {
            title = pageButtonTitle[title];
          }

          buttons.append($('<button type="button" class="btn btn-default">' + title + '</button>').attr('id', 'button_page_' + result.links[index].ref).attr('issueId', issueId).attr('page', result.links[index].page));
        }
        pages.append(buttons);
        $("#git_comments").append(pages);
      }

      for (var i = result.data.length - 1; i >= 0; i--) {
        addComment(result.data[i]);
      }

      $("button[id^=button_reply_]").click(function() {
        var reply = $(this).attr("reply");
        $("#comment").val($("#comment").val() + "@" + reply + " ");
        $("html,body").animate({
          scrollTop: $("#comment").offset().top
        }, 1000);
        $("#comment").focus();
      });

      $("button[id^=button_page_]").click(function() {
        var b_page = $(this).attr("page");
        var b_issue = $(this).attr("issueId");
        showComments(b_issue, b_page, postId);
      });
    } else {
      handleError(result.data);
    }
  }, page);
}

function showLogin() {
  $("#comment_form").text("");
  $("#comment_form").append(
    $("<span class='icon icon--github'><svg viewBox='0 0 16 16'><path fill='#828282' d='M7.999,0.431c-4.285,0-7.76,3.474-7.76,7.761 c0,3.428,2.223,6.337,5.307,7.363c0.388,0.071,0.53-0.168,0.53-0.374c0-0.184-0.007-0.672-0.01-1.32 c-2.159,0.469-2.614-1.04-2.614-1.04c-0.353-0.896-0.862-1.135-0.862-1.135c-0.705-0.481,0.053-0.472,0.053-0.472 c0.779,0.055,1.189,0.8,1.189,0.8c0.692,1.186,1.816,0.843,2.258,0.645c0.071-0.502,0.271-0.843,0.493-1.037 C4.86,11.425,3.049,10.76,3.049,7.786c0-0.847,0.302-1.54,0.799-2.082C3.768,5.507,3.501,4.718,3.924,3.65 c0,0,0.652-0.209,2.134,0.796C6.677,4.273,7.34,4.187,8,4.184c0.659,0.003,1.323,0.089,1.943,0.261 c1.482-1.004,2.132-0.796,2.132-0.796c0.423,1.068,0.157,1.857,0.077,2.054c0.497,0.542,0.798,1.235,0.798,2.082 c0,2.981-1.814,3.637-3.543,3.829c0.279,0.24,0.527,0.713,0.527,1.437c0,1.037-0.01,1.874-0.01,2.129 c0,0.208,0.14,0.449,0.534,0.373c3.081-1.028,5.302-3.935,5.302-7.362C15.76,3.906,12.285,0.431,7.999,0.431z'/></svg></span>")
  ).append(
    $("<button></button>").attr('type', 'button').attr('id', 'comment_button_login').addClass('btn btn-link').text('登录')
  );
  $("#comment_button_login").click(function() {
    GithubComments.User.Login();
  });
}

function showUserForm(issueId, userInfo) {
  $("#comment_form").text("");
  $("#comment_form").append(
    $("<div></div>").addClass('form-group').append(
      $("<img class='img-circle' style='width: 20px;height: 20px;' src='" + userInfo.avatar_url + "' />")
    ).append(" ").append(
      $("<span></span>").attr('id', 'label_name').addClass('page_blog_comment_name').text(userInfo.login)
    ).append(
      $("<button></button>").attr('type', 'button').attr('id', 'comment_button_logout').addClass('btn btn-link').text('退出')
    )
  );
  var bar = $("<div></div>").addClass('form-group').attr('id', 'emoji-bar');
  for (var i = 0; i < emojiList.length; i++) {
    var emoji = emojiList[i];
    bar.append(
      $("<a></a>").attr('id', 'emoji-' + i).attr('emoji', emoji).append(
        GithubComments.Emoji.Parse(emoji)
      )
    );
  };
  $("#comment_form").append(bar);
  $("a[id^=emoji-]").click(function() {
    var emoji = $(this).attr("emoji");
    $("#comment").val($("#comment").val() + emoji);
  });
  $("#comment_form").append(
    $("<div></div>").addClass('form-group').append(
      $("<textarea></textarea>").attr('name', 'comment').attr('id', 'comment').addClass('form-control')
    )
  );
  $("#comment_form").append(
    $("<div></div>").addClass('text-center').append(
      $("<button></button>").attr('id', 'add_comment').addClass('btn btn-default').text('评论')
    )
  );
  $("#comment_button_logout").click(function() {
    GithubComments.User.Logout();
    showForm();
  });
  $("#add_comment").click(function() {
    if ($("#comment").val()) {
      $("#add_comment").prop('disabled', true);
      GithubComments.Comments.Add(issueId, $("#comment").val(), function(result) {
        if (result.status) {
          $("#comment").val("");
          addComment(result.data);
          $("html,body").animate({
            scrollTop: $("#comment_text_" + result.data.id).offset().top
          }, 1000);
          $("[comments-count='" + issueId + "']").text(
            parseInt($("[comments-count='" + issueId + "']").text()) + 1
          );
        } else {
          handleError(result.data);
        }
      });
      $("#add_comment").prop('disabled', false);
    } else {
      handleError("评论不能为空！");
    }
  });
}

function showForm(issueId) {
  $("#comment_form").text("");
  $("#comment_form").append(
    $("<span class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate\"></span>")
  );
  GithubComments.User.Get(function(userInfo) {
    if (userInfo) {
      showUserForm(issueId, userInfo);
    } else {
      showLogin();
    }
  })
}

function emojiProcess() {
  var elements = $("g-emoji");
  for (var i = 0; i < elements.length; i++) {
    var element = $(elements[i]);
    var alias = element.attr('alias');
    var newEmoji = $(GithubComments.Emoji.Parse(":" + alias + ":"));
    newEmoji.insertAfter(element);
    element.remove();
  }
}
