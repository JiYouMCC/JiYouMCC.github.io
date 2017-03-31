$(function() {
    var elements = $("[comments-count]");
    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        var post = element.attr('comments-count');
        if (post) {
            Comments.post.commentCount.updateCallback(post, function(result) {
                if (result) {
                    element.text(result.count);
                }
            });
        }
    }
});