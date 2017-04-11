$(function() {
  $('#affix-nav').affix({
    offset: {
      top: function() {
        return $('#rss_nav').offset().top + $('#affix-nav-ul').height() + 20;;
      }
    }
  });
  $('#affix-nav').width($('#rss_nav').width());
  $(window).resize(function () {
    $('#affix-nav').width($('#rss_nav').width());
  }); 
});
