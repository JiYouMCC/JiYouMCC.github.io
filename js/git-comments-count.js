$(function() {
    var elements = $("[post-id]");
    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        var issueId = element.attr('comments-count');
        var postId = element.attr('post-id');
        var oldCount = OldComments.GetCommentsCount(postId);
        element.attr('old-count', oldCount);
        if (issueId) {
            GithubComments.Comments.Count(issueId, function(result) {
                if (result.status) {
                    var sum = parseInt($("[comments-count='" + result.number + "']").attr('old-count')) + parseInt(result.count);
                    $("[comments-count='" + result.number + "']").text(sum);
                }
            });
        } else {
            $(elements[i]).text(oldCount);
        }
    }
});