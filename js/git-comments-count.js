$(function() {
    var elements = $("[post-id]");
    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        var issueId = element.attr('comments-count');
        var postId = element.attr('post-id');
        var oldCount = OldComments.GetCommentsCount(postId);
        if (issueId) {
            GithubComments.Comments.Count(issueId, function(result) {
                if (result.status) {
                    $("[comments-count='" + result.number + "']").text(result.count + oldCount);
                }
            });
        } else {
            $(elements[i]).text(oldCount);
        }
    }
});
