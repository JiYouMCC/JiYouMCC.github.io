Comments = {
    _auth: undefined,
    _sync: undefined,
    _timestamp: undefined,
    init: function(type, config) {
        if (type == "firebase") {
            firebase.initializeApp(config);
            Comments._auth = firebase.auth();
            Comments._sync = firebase.database();
            Comments._timestamp = firebase.database.ServerValue.TIMESTAMP;
        } else if (type == "wilddog") {
            var app = wilddog.initializeApp(config);
            Comments._auth = app.auth();
            Comments._sync = app.sync();
            Comments._timestamp = app.sync().ServerValue.TIMESTAMP;
        }
    },
    handleError: function(error) {
        console.log(error);
    },
    formatDate: function(date) {
        return date.getFullYear() + "-" +
            ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("0" + date.getDate()).slice(-2) + " " +
            ("0" + date.getHours()).slice(-2) + ":" +
            ("0" + date.getMinutes()).slice(-2) + ":" +
            ("0" + date.getSeconds()).slice(-2) + " ";
    },
    errors: {
        NO_POST: "没有指定文章",
        NO_NAME: "昵称为空",
        NO_EMAIL: "邮件为空",
        NO_COMMIT: "评论为空",
        NO_COUNT: "没有指定数量"
    },
    handleCallback: function(callback, returnValue) {
        if (callback) {
            callback(returnValue)
        }
    },
    comment: {
        list: function(post, callback) {
            // TODO pagenation
            if (post) {
                Comments._sync.ref("/comments").orderByChild("post").equalTo(post).once("value", function(snapshot) {
                    Comments.handleCallback(callback, snapshot.val());
                });
            } else {
                Comments.handleError(Comments.errors.NO_POST);
                Comments.handleCallback(callback, undefined);
            }
        },
        listCallback: function(post, callback) {
            if (post) {
                var returnCallback = Comments._sync.ref("/comments").orderByChild("post").equalTo(post);
                returnCallback.on("value", function(snapshot) {
                    callback(snapshot.val());
                });
                return returnCallback;
            } else {
                Comments.handleError(Comments.errors.POSTID_CAN_NOT_BLANK);
                Comments.handleCallback(callback, undefined);
            }
        },
        add: function(name, email, post, comment, url, reply, callback) {
            if (!name) {
                Comments.handleError(Comments.errors.NO_NAME);
                Comments.handleCallback(callback, false);
                return;
            }

            if (!email) {
                Comments.handleError(Comments.errors.NO_EMAIL);
                Comments.handleCallback(callback, false);
                return;
            }

            if (!post) {
                Comments.handleError(Comments.errors.NO_POST);
                Comments.handleCallback(callback, false);
                return;
            }

            if (!comment) {
                Comments.handleError(Comments.errors.NO_COMMIT);
                Comments.handleCallback(callback, false);
                return;
            }

            Comments.post.commentCount.get(post, function(oldResult) {
                var commentRef = Comments._sync.ref("/comments");
                commentRef.push({
                    "name": name,
                    "email": email,
                    "post": post,
                    "timestamp": Comments._timestamp,
                    "comment": comment,
                    "url": url ? url : null,
                    "reply": reply ? reply : null
                }, function(error) {
                    if (error) {
                        Comments.handleError(error);
                        Comments.handleCallback(callback, false);
                    } else {
                        Comments.post.commentCount.set(post, oldResult.count + 1, function() {
                            Comments.handleCallback(callback, true);
                        });
                    }
                });
            });
        },
        recent: {
            _callback: undefined,
            get: function(count, callback) {
                count = count ? count : 10;
                Comments._sync.ref("/comments").orderByChild("timestamp").limitToLast(count).once("value", function(snapshot) {
                    Comments.handleCallback(callback, snapshot.val());
                });
            },
            updateCallback: function(count, callback) {
                Comments.comment.recent.removeCallback();
                Comments.comment._callback = Comments._sync.ref("/comments").orderByChild("timestamp").limitToLast(count);
                Comments.comment._callback.on("value", function(snapshot) {
                    callback(snapshot.val());
                });
            },
            removeCallback: function() {
                if (Comments.comment._callback) {
                    Comments.comment._callback.remove();
                    Comments.comment._callback = undefined;
                }
            }
        }
    },
    post: {
        commentCount: {
            get: function(post, callback) {
                if (!post) {
                    Comments.handleError(Comments.errors.NO_POST);
                    Comments.handleCallback(callback, null);
                    return;
                }

                Comments._sync.ref("/posts/" + post).once("value", function(snapshot) {
                    var count = 0;
                    if (snapshot && snapshot.val() && snapshot.val().count) {
                        count = snapshot.val().count
                    }

                    Comments.handleCallback(callback, {
                        "post": post,
                        "count": count
                    });
                });
            },
            set: function(post, count, callback) {
                if (!post) {
                    Comments.handleError(Comments.errors.NO_POST);
                    Comments.handleCallback(callback, false);
                    return;
                }

                if (!count) {
                    Comments.handleError(Comments.errors.NO_COUNT);
                    Comments.handleCallback(callback, false);
                    return;
                }

                Comments._sync.ref("/posts/" + post).set({
                    "count": count
                }, function(error) {
                    if (error) {
                        Comments.handleError(error);
                        Comments.handleCallback(callback, false);
                    } else {
                        Comments.handleCallback(callback, true);
                    }
                });
            },
            updateCallback(post, callback) {
                if (!post) {
                    Comments.handleError(Comments.errors.NO_POST);
                    Comments.handleCallback(callback, null);
                    return;
                }

                var returnCallback = Comments._sync.ref("/posts/" + post);
                returnCallback.on("value", function(snapshot) {
                    var count = 0;
                    if (snapshot && snapshot.val() && snapshot.val().count) {
                        count = snapshot.val().count
                    }

                    Comments.handleCallback(callback, {
                        "post": post,
                        "count": count
                    });
                });
                return returnCallback;
            }
        }
    },
    util: {
        showCount(elementClass = 'comments-count') {
            var elements = document.querySelectorAll("[" + elementClass + "]");
            for (var index = 0; index < elements.length; index++) {
                var element = elements[index];
                var post = element.getAttribute(elementClass);
                if (post) {
                    Comments.post.commentCount.updateCallback(post, function(result) {
                        if (result && (result.count != null || result.count != undefined)) {
                            var selects = document.querySelectorAll("[" + elementClass + "='" + result.post + "']");
                            for (var j = 0; j < selects.length; j++) {
                                var select = selects[j];
                                select.innerHTML = result.count;
                            }
                        }
                    });
                }
            }
        }
    }
}

window.onload = function() {
    Comments.util.showCount();
}