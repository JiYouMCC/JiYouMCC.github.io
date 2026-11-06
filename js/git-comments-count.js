$(async function() {
    var elements = $("[post-id]");
    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        var issueId = element.attr('comments-count');
        var postId = element.attr('post-id');
        var oldCount = OldComments.GetCommentsCount(postId);
        element.attr('old-count', oldCount);
        if (issueId) {
            try {
                var result = await GithubComments.Comments.Count(issueId);
                var sum = parseInt($("[comments-count='" + result.number + "']").attr('old-count')) + parseInt(result.count);
                $("[comments-count='" + result.number + "']").text(sum);
            } catch (error) {
                console.error('Unable to load GitHub comment count.', error);
                element.text(oldCount);
            }
        } else {
            $(elements[i]).text(oldCount);
        }
    }
});