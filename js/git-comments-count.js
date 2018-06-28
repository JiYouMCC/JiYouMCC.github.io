$(function() {
    var elements = $("[comments-count]");
    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        var issueId = element.attr('comments-count');
        if (issueId) {
            GithubComments.Comments.Count(issueId, function(result) {
                if (result.status) {
                    $("[comments-count='" + result.post + "']").text(result.count);
                }
            });
        }
    }
});