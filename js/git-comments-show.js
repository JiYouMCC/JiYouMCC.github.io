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
var EMOJI_PAGE_SIZE = 48;
var EMOJI_RECENT_LIMIT = 12;
var EMOJI_RECENT_KEY = 'GITHUB_EMOJI_RECENT';

function getRecentEmojiAliases() {
  var stored = localStorage.getItem(EMOJI_RECENT_KEY);
  if (!stored) return [];

  try {
    var aliases = JSON.parse(stored);
    if (!Array.isArray(aliases)) throw new Error('Invalid recent emoji cache.');
    return aliases.filter(function(alias) {
      return GithubComments.Emoji.GetAliases().indexOf(alias) >= 0;
    });
  } catch (error) {
    localStorage.removeItem(EMOJI_RECENT_KEY);
    return [];
  }
}

function recordRecentEmoji(alias) {
  var aliases = getRecentEmojiAliases().filter(function(item) {
    return item != alias;
  });
  aliases.unshift(alias);
  localStorage.setItem(EMOJI_RECENT_KEY, JSON.stringify(aliases.slice(0, EMOJI_RECENT_LIMIT)));
}

function insertEmoji(alias) {
  $("#comment").val($("#comment").val() + " :" + alias + ": ");
  $("#comment").focus();
  recordRecentEmoji(alias);
  renderRecentEmojis();

  var modalElement = document.getElementById("emoji_picker_modal");
  if (modalElement) {
    bootstrap.Modal.getOrCreateInstance(modalElement).hide();
  }
}

function createEmojiButton(alias) {
  return $("<button></button>")
    .attr("type", "button")
    .attr("title", ":" + alias + ":")
    .attr("aria-label", ":" + alias + ":")
    .addClass("btn btn-light border emoji-picker-item")
    .append(GithubComments.Emoji.Parse(":" + alias + ":"))
    .click(function() {
      insertEmoji(alias);
    });
}

function createQuickEmojiButton(alias) {
  return $("<button></button>")
    .attr("type", "button")
    .attr("title", ":" + alias + ":")
    .addClass("btn btn-link p-0 me-1 emoji-quick-item")
    .append(GithubComments.Emoji.Parse(":" + alias + ":"))
    .click(function() {
      insertEmoji(alias);
    });
}

function renderRecentEmojis() {
  var recent = getRecentEmojiAliases();
  var section = $("#emoji_recent_section");
  var items = $("#emoji_recent");
  if (!section.length) return;
  items.text("");

  if (!recent.length) {
    section.addClass("d-none");
    return;
  }

  section.removeClass("d-none");
  for (var i = 0; i < recent.length; i++) {
    items.append(createQuickEmojiButton(recent[i]));
  }
}

function renderEmojiPicker(page) {
  var aliases = GithubComments.Emoji.GetAliases();
  var query = $("#emoji_picker_search").val().trim().toLowerCase();
  var filtered = aliases.filter(function(alias) {
    return alias.toLowerCase().indexOf(query) >= 0;
  });
  var pageCount = Math.max(1, Math.ceil(filtered.length / EMOJI_PAGE_SIZE));
  page = Math.min(Math.max(page, 1), pageCount);

  $("#emoji_picker_results").text("找到 " + filtered.length + " 个表情");
  $("#emoji_picker_grid").text("");

  var start = (page - 1) * EMOJI_PAGE_SIZE;
  for (var i = start; i < Math.min(start + EMOJI_PAGE_SIZE, filtered.length); i++) {
    $("#emoji_picker_grid").append(createEmojiButton(filtered[i]));
  }

  var pagination = $("#emoji_picker_pagination");
  pagination.text("");
  var previous = $("<button></button>")
    .attr("type", "button")
    .addClass("page-link")
    .text("上一页")
    .click(function() {
      renderEmojiPicker(page - 1);
    });
  pagination.append(
    $("<li></li>")
      .addClass("page-item" + (page == 1 ? " disabled" : ""))
      .append(previous)
  );
  pagination.append(
    $("<li></li>")
      .addClass("page-item disabled")
      .append($("<span></span>").addClass("page-link").text("第 " + page + " / " + pageCount + " 页"))
  );
  var next = $("<button></button>")
    .attr("type", "button")
    .addClass("page-link")
    .text("下一页")
    .click(function() {
      renderEmojiPicker(page + 1);
    });
  pagination.append(
    $("<li></li>")
      .addClass("page-item" + (page == pageCount ? " disabled" : ""))
      .append(next)
  );
}

function createEmojiPicker() {
  if ($("#emoji_picker_modal").length) return;

  $("body").append(
    '<div class="modal fade" id="emoji_picker_modal" tabindex="-1" aria-labelledby="emoji_picker_title" aria-hidden="true">' +
      '<div class="modal-dialog modal-lg modal-dialog-scrollable">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h5 class="modal-title" id="emoji_picker_title">选择 GitHub 表情</h5>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<input id="emoji_picker_search" class="form-control mb-3" type="search" placeholder="按别名搜索，例如 smile">' +
            '<div id="emoji_picker_results" class="text-muted mb-2"></div>' +
            '<div id="emoji_picker_grid" class="emoji-picker-grid"></div>' +
          '</div>' +
          '<div class="modal-footer justify-content-center">' +
            '<ul id="emoji_picker_pagination" class="pagination pagination-sm mb-0"></ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );

  $("#emoji_picker_search").on("input", function() {
    renderEmojiPicker(1);
  });
}

async function showEmojiPicker() {
  createEmojiPicker();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("emoji_picker_modal")).show();
  $("#emoji_picker_results").text("正在加载表情……");
  $("#emoji_picker_grid").text("");

  try {
    if (!GithubComments._emojiJson && GithubComments._emojiLoadPromise) {
      await GithubComments._emojiLoadPromise;
    }

    if (!GithubComments._emojiJson) {
      throw new Error("表情列表尚未加载，请稍后重试。");
    }
    renderEmojiPicker(1);
  } catch (error) {
    $("#emoji_picker_results").text(error.message);
  }
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
  var name_div = $("<div></div>").addClass("mb-3");
  name_div.append(
    $("<a></a>").attr("href", userLink).attr("target", "_blank").append(
      $("<img />")
        .addClass("rounded-circle")
        .css("width", "20px")
        .css("height", "20px")
        .attr("alt", userName)
        .attr("src", userAvatar)
    )
  ).append(" ");
  name_div.append(" ").append(
    $("<a></a>")
      .addClass("link-underline link-underline-opacity-0 link-underline-opacity-100-hover")
      .attr("href", "#comment_form")
      .attr('title', "回复" + userName)
      .attr('id', "button_reply_" + commentId)
      .attr('reply', userName)
      .append(
        $("<span></span>").text("@" + userName)
      )
  );
  name_div.append(" ").append(
    $("<span></span>")
    .addClass("fw-bold text-nowrap")
    .text(timeSince(date))
    .attr("title", formatDate(date)));


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

async function showComments(issueId, postId) {
  $('div[id^=comments_]').remove();
  $("<div></div>")
    .attr("id", "refresh_comments")
    .addClass("list-group-item")
    .append(
      "<i data-feather=\"refresh-ccw\"></i>"
     ).append(" 载入中……").insertAfter($("#div_comments"));
  feather.replace();
  try {
    var countResult = await GithubComments.Comments.Count(issueId);
    $("[comments-count='" + issueId + "']").text(countResult.count + OldComments.GetCommentsCount(postId));
    if (countResult.count == 0 && $('#comment_all_count').attr('with_old') != 'true') {
      $("#comment_all_count").attr('style', 'border-bottom-right-radius: 5px;border-bottom-left-radius: 5px;')
    } else {
      $("#comment_all_count").removeAttr('style');
    }
  } catch (error) {
    console.error('Unable to load GitHub comment count.', error);
  }

  try {
    var page = 1;
    while (page) {
      var result = await GithubComments.Comments.Get(issueId, page);
      for (var i = 0; i < result.data.length; i++) {
        addComment(result.data[i]);
      }

      var nextLink = result.links.find(function(link) {
        return link.ref == 'next';
      });
      page = nextLink ? nextLink.page : undefined;
    }

    $("a[id^=button_reply_]").click(function() {
      var reply = $(this).attr("reply");
      $("#comment").val($("#comment").val() + "@" + reply + " ");
      $("html,body").animate({
        scrollTop: $("#comment").offset().top
      }, 1000);
      $("#comment").focus();
    });
  } catch (error) {
    handleError(error);
  } finally {
    $('#refresh_comments').remove();
  }
}

function showLogin() {
  $("#comment_form").text("");
  $("#comment_form").append(
    $("<i data-feather=\"github\">")
  ).append(
    $("<button></button>")
      .attr('type', 'button')
      .attr('id', 'comment_button_login')
      .addClass('btn btn-link')
      .text('登录')
  );
  feather.replace();
  $("#comment_button_login").click(function() {
    GithubComments.User.Login();
  });
}

function showUserForm(issueId, userInfo) {
  $("#comment_form").text("");
  $("#comment_form").append(
    $("<div></div>").addClass('form-group').append(
      $("<img class='rounded-circle' style='width: 20px;height: 20px;' src='" + userInfo.avatar_url + "' />")
    ).append(" ").append(
      $("<span></span>").attr('id', 'label_name').addClass('page_blog_comment_name').text(userInfo.login)
    ).append(
      $("<button></button>").attr('type', 'button').attr('id', 'comment_button_logout').addClass('btn btn-link').text('退出')
    )
  );
  var bar = $("<div></div>").addClass('form-group').attr('id', 'emoji-bar');
  for (var i = 0; i < emojiList.length; i++) {
    var emoji = emojiList[i].slice(1, -1);
    bar.append(createQuickEmojiButton(emoji));
  }
  bar.append(
    $("<button></button>")
      .attr("type", "button")
      .attr("id", "emoji_picker_button")
      .addClass("btn btn-sm btn-outline-secondary ms-2")
      .text("更多表情")
      .click(showEmojiPicker)
  );
  $("#comment_form").append(bar);
  $("#comment_form").append(
    $("<div></div>")
      .attr("id", "emoji_recent_section")
      .addClass("form-group mt-2 d-none")
      .append($("<strong></strong>").addClass("d-block mb-1").text("最近使用"))
      .append($("<div></div>").attr("id", "emoji_recent"))
  );
  renderRecentEmojis();
  $("#comment_form").append(
    $("<div></div>").addClass('form-group  mt-2').append(
      $("<textarea></textarea>").attr('name', 'comment').attr('id', 'comment').addClass('form-control')
    )
  );
  $("#comment_form").append(
    $("<div></div>").addClass('text-center mt-2').append(
      $("<button></button>").attr('id', 'add_comment').addClass('btn btn-primary').text('评论')
    )
  );
  $("#comment_button_logout").click(function() {
    GithubComments.User.Logout();
    showForm();
  });
  $("#add_comment").click(async function() {
    if ($("#comment").val()) {
      $("#add_comment").prop('disabled', true);
      try {
        var comment = await GithubComments.Comments.Add(issueId, $("#comment").val());
        $("#comment").val("");
        addComment(comment);
        $("[comments-count='" + issueId + "']").text(
          parseInt($("[comments-count='" + issueId + "']").text()) + 1
        );
        $("#comment_all_count").removeAttr('style');
      } catch (error) {
        handleError(error);
      } finally {
        $("#add_comment").prop('disabled', false);
      }
    } else {
      handleError("评论不能为空！");
    }
  });
}

async function showForm(issueId) {
  $("#comment_form").text("");
  $("#comment_form").append(
    $("<i data-feather=\"refresh-ccw\"></i>")
  );
  feather.replace();
  try {
    var userInfo = await GithubComments.User.Get();
    if (userInfo) {
      showUserForm(issueId, userInfo);
    } else {
      showLogin();
    }
  } catch (error) {
    showLogin();
    handleError(error);
  }
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
