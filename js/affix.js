$('#affix-nav').css("position", "fixed");
$('#affix-nav').width($('#bottom_nav').width());

function change_position() {
  $('#affix-nav').width($('#bottom_nav').width());
  var bottom_position = $('#bottom_nav').offset().top + $('#bottom_nav').outerHeight(true)-$(window).scrollTop();
  if(bottom_position < 0 ) {
    $('#affix-nav').css("top", "69px");
  } else {
    $('#affix-nav').css("top", bottom_position);
  }
  if (($('#affix-nav').offset().top + $('#affix-nav').outerHeight(true)) > $('#comments').offset().top + $('#comments').outerHeight(true)) {
    $('#affix-nav').offset({ top: $('#comments').offset().top + $('#comments').outerHeight(true) -$('#affix-nav').outerHeight(true)});
  }
}


$(window).resize(function () {
  change_position();
});
$(window).scroll(function() {
  change_position();
});

var headers = $("#blog_content").find("h1,h2,h3,h4,h5,h6");
var maxHead = 6;
var minHead = 1;
for (var i = 0; i < headers.length; i++) {
  var currentHead = parseInt(headers[i].tagName[1]);
  if (currentHead < maxHead) {
    maxHead = currentHead;
  }
  if (currentHead > minHead) {
    minHead = currentHead;
  }
}

var links = $("<ul></ul>").attr("id", "affix-nav-ul").attr("class", "list-group list-group-flush");

// top
links.append(
  $("<a></a>")
    .attr("class", "list-group-item")
    .attr("affix_to","#top")
    .attr('href', '#top')
    .append(
      $("<i></i>")
      .attr("data-feather", "chevron-up")
  )
);

// links
for (var i = 0; i < headers.length; i++) {
  var currentHead = parseInt(headers[i].tagName[1]);
  var prefix="";
  for (var j = currentHead - maxHead -1; j >= 0; j--) {
    prefix+="　";
  }
  links.append($("<a></a>")
    .attr("id", "content_" + headers[i].id)
    .attr("class", currentHead == maxHead ? "list-group-item list-group-flush" : "list-group-item list-group-flush")
    .attr("affix_to","#" + headers[i].id)
    .attr("href", "#" + headers[i].id)
    .html(prefix + $(headers[i]).text()));
}

// 评论
links.append(
  $("<a></a>")
    .attr("class", "list-group-item")
    .attr("affix_to","#comments")
    .attr('href', '#comments')
    .append(
      $("<i></i>")
        .attr("data-feather", "message-square")
    )
    .append(" 评论")
);

// down
links.append(
  $("<a></a>")
    .attr("class", "list-group-item")
    .attr("affix_to","#bottom")
    .attr('href', '#bottom')
    .append(
      $("<i></i>")
        .attr("data-feather", "chevron-down")
  )
);

$("#affix-nav-pannel").append(links);
/*$('body').scrollspy({ target: '#affix-nav-pannel' });*/

$("a[affix_to]").click(function(){
  var target = $($(this).attr("affix_to"));
  var target_offset = 0;
  if ($(this).attr("affix_to") != "#top") {
    target_offset = target.offset().top
  }

  $("html,body").animate({scrollTop: target_offset}, 2000);
  return false;
});


