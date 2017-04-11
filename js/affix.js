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
});

//<a href="#title_0" data-localize="Gender List">Gender List</a>  
  var headers = $("#blog_content").find("h1,h2,h3,h4,h5,h6");
  var maxHead = 6;
  for (var i = 0; i < headers.length; i++) {
    var currentHead = parseInt(headers[i].tagName[1]);
    if (currentHead < maxHead) {
      maxHead = currentHead;
    }
  }
  
  var links = $("<ol></ol>").attr("id", "affix-nav-ul").attr("class", "nav nav-stacked").attr("role", "tablist");
  
  links.append(
    $("<li></li").append(
      $("<a></a>").attr("href", "#top").append(
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
        var newUl = $("<ol></ol>");
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
    
    lastLi = $("<li></li").append($("<a></a>").attr("href", "#" + headers[i].id).text($(headers[i]).text()));
    currentParent.append(lastLi);
  }
  
  links.append(
    $("<li></li").append(
      $("<a></a>").attr("href", "#bottom").append(
        $("<span></span>").attr("class", "glyphicon glyphicon-triangle-bottom")
      )
    )
  );
