var emojiList = [":smile:",
  ":rofl:",
  ":flushed:",
  ":thinking:",
  ":raised_eyebrow:",
  ":face_in_clouds:",
  ":face_exhaling:",
  ":sleeping:",
  ":face_with_spiral_eyes:",
  ":sob:",
  ":triumph:",
  ":angry:",
  ":selfie:"
];

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
    return (parseInt(years) + "年前");
  } else if (month >= 1) {
    return (parseInt(month) + "个月前");
  } else if (day >= 1) {
    return (parseInt(day) + "天前");
  } else if (hours >= 1) {
    return (parseInt(hours) + "小时前");
  } else if (minutes >= 1) {
    return (parseInt(minutes) + "分钟前");
  } else if (seconds >= 1) {
    return (parseInt(seconds) + "秒前");
  } else {
    return ("刚刚");
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
    $("<article></article>").attr('id', 'comment_text_' + commentId)
  );
  var name_div = $("<div></div>");
  name_div.append("<img class='img-circle' style='width: 20px;height: 20px;' alt='" + userName + "' src='" + userAvatar + "' />").append(" ");
  name_div.append($("<span></span>").text(userName)).append(" ");
  name_div.append(
    $("<span></span>")
    .addClass("fw-bold text-nowrap")
    .text(timeSince(date))
    .attr("title", formatDate(date)));
  name_div.append(" ").append(
    $("<a></a>").attr("href", userLink).attr("target", "_blank").attr("title", "Github page").append(
      "<i data-feather='home'></i>"
    )
  );
  name_div.append(" ").append(
    $("<a></a>").attr("href", "#comment_form").attr('title', "回复").attr('id', "button_reply_" + commentId).attr('reply', userName).append(
      "<i data-feather='message-square'></i>"
    )
  );

  var d_comments = $("<div></div>")
    .addClass("list-group-item")
    .attr('id', "comments_" + commentId)
    .append(name_div)
    .append(comment_detail);
  $("#div_comments").after(d_comments);
  document.getElementById('comment_text_' + commentId).innerHTML = comment.body_html;
  emojiProcess();
  feather.replace();
}

function showComments(issueId, postId) {
  $('div[id^=comments_]').remove();
  $("<div></div>").attr("id", "refresh_comments").addClass("list-group-item").append(
      "<span class=\"glyphicon-refresh-animate\"><i data-feather=\"refresh-cw\"></i></span>"
     ).append(" 载入中……").insertAfter($("#div_comments"));
  function loopShowComments(issueId, page) {
    GithubComments.Comments.Get(
      issueId, 
      function(result) {
        if (result.status) {
          if (result.links.length) {
            for (index in result.links) {
              var title = result.links[index].ref;
              if (title == 'next') {
                loopShowComments(issueId, page + 1);
              }
            }
          }
          for (var i = 0; i < result.data.length; i++) {
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
        } else {
          handleError(result.data);
        }
      },
      page
    )
  };
  GithubComments.Comments.Count(issueId, function(result) {
    if (result.status) {
      $("[comments-count='" + issueId + "']").text(result.count + OldComments.GetCommentsCount(postId));
      if (result.count==0 && $('#comment_all_count').attr('with_old') != 'true') {
        $("#comment_all_count").attr('style', 'border-bottom-right-radius: 5px;border-bottom-left-radius: 5px;')
      } else {
        $("#comment_all_count").removeAttr('style');
      }
    }
  });
  $('#refresh_comments').remove();
  loopShowComments(issueId, 1);
}

function showLogin() {
  $("#comment_form").text("");
  $("#comment_form").append(
    $("<i data-feather=\"github\">")
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
    $("#comment").val($("#comment").val() + " " + emoji + " ");
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
          $("[comments-count='" + issueId + "']").text(
            parseInt($("[comments-count='" + issueId + "']").text()) + 1
          );
          $("#comment_all_count").removeAttr('style');
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
    $("<span class=\"glyphicon-refresh-animate\"><i data-feather=\"refresh-cw\"></i></span>")
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
