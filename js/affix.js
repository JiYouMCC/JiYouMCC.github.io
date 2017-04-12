$(function() { 
  $('#affix-nav').affix({
    offset: {
      top: function() {
        return $('#rss_nav').offset().top + $('#affix-nav-ul').height() + 20;
      },
      bottom: function() {
        return $('#bottom').outerHeight(true) + 20;
      }
    }
  });
  $('#affix-nav').width($('#rss_nav').width());
  $(window).resize(function () {
    $('#affix-nav').width($('#rss_nav').width());
  });
  $(window).scroll(function() {
    $('#affix-nav').width($('#rss_nav').width());
  });
});

var headers = $("#blog_content").find("h1,h2,h3,h4,h5,h6");
var maxHead = 6;
for (var i = 0; i < headers.length; i++) {
  $(headers[i]).attr("data-localize", $(headers[i]).text());
  var currentHead = parseInt(headers[i].tagName[1]);
  if (currentHead < maxHead) {
    maxHead = currentHead;
  }
}

var links = $("<ol></ol>").attr("id", "affix-nav-ul").attr("class", "nav nav-stacked").attr("role", "tablist");

links.append(
  $("<li></li").append(
    $("<a></a>").attr("affix_to","#top").attr('href', '#top').append(
      $("<span></span>").attr("class", "glyphicon glyphicon-triangle-top")
    )
  )
);

var currentParent = links;
var lastLi = null;
var currentClass = maxHead;

for (var i = 0; i < headers.length; i++) {
  var currentHead = parseInt(headers[i].tagName[1]);
  if (currentHead > currentClass) {
    while (currentHead > currentClass) {
      var newUl = $("<ol></ol>").addClass("nav").addClass("nav-stacked");
      if (lastLi != null){
        lastLi.append(newUl)
      } else {
        currentParent.append(newUl);
      }  
      
      currentClass += 1;
      currentParent = newUl;
    }
  } else if (currentHead < currentClass) {
    while (currentHead < currentClass) {
      currentClass -= 1;
      currentParent = currentParent.parent().parent();
    }
  } 
  
  lastLi = $("<li></li>").append(
    $("<a></a>").attr("affix_to","#" + headers[i].id).attr("href", "#" + headers[i].id).attr("data-localize", $(headers[i]).text()).text($(headers[i]).text())
  );
  currentParent.append(lastLi);
}

links.append(
  $("<li></li").append(
    $("<a></a>").attr("affix_to","#comments").attr('href', '#comments').append(
      $("<span></span>").attr("class", "glyphicon glyphicon-comment")
    ).append(" 评论")
  )
);

links.append(
  $("<li></li").append(
    $("<a></a>").attr("affix_to","#bottom").attr('href', '#bottom').append(
      $("<span></span>").attr("class", "glyphicon glyphicon-triangle-bottom")
    )
  )
);

$("#affix-nav-pannel").append(links);
$('body').scrollspy({ target: '#affix-nav-pannel' });

$("a[affix_to]").click(function(){
  var target = $($(this).attr("affix_to"));
  var target_offset = 0;  
  if ($(this).attr("affix_to") != "#top") {
    target_offset = target.offset().top
  }
  
  $("html,body").animate({scrollTop: target_offset}, 1000);
  return false;
});
