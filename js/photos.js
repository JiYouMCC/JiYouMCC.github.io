Array.prototype.removeAll = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
}

var Photos = {
    _folders: {},
    _folderNames: [],
    init: function(imagePaths) {
        for (var i = 0; i < imagePaths.length; i++) {
            var image = imagePaths[i];
            var pathArray = image.path.split("/").removeAll("");
            var folder = pathArray[1];
            image["folder"] = folder;
            if (Photos._folders[folder]) {
                Photos._folders[folder].push(image);
            } else {
                Photos._folders[folder] = [image];
            }
        }
        Photos._folderNames = Object.keys(Photos._folders);
    },
    clearPhotos: function() {
        $("#folders").text(" ");
    },
    setBreadcrumb: function(paths) {
        $(".breadcrumb").text("");
        for (var i = 0; i < paths.length; i++) {
            $(".breadcrumb").append(
                $("<li></li>").append(
                    $("<a></a>").attr("breakcrumb", paths[i]).attr('href', '#').text(paths[i])
                )
            );
        }
        $("a[breakcrumb]").click(function() {
            var breakcrumb = $(this).attr("breakcrumb");
            if (breakcrumb == "相册") {
                Photos.showfolders();
            } else if (breakcrumb) {
                Photos.showFolder(breakcrumb);
            }
            return false;
        });
    },
    showFolders: function() {
        Photos.clearPhotos();
        for (var i = 0; i < Photos._folderNames.length; i++) {
            $("#folders").append(
                $("<div></div>").addClass("col-sm-6 col-md-4 photo-div").append(
                    $("<a></a>").attr("folder", Photos._folderNames[i]).attr("href", "#").append(
                        $("<div></div>").addClass("thumbnail").append(
                            $("<img>").attr("src", Photos._folders[Photos._folderNames[i]][0].path)
                        ).append(
                            $("<h1></h1>").addClass("text-center").text(Photos._folderNames[i] + "  ").append(
                                $("<span></span>").addClass("badge").text(Photos._folders[Photos._folderNames[i]].length)
                            )
                        )
                    )
                )
            );
        }
        $("a[folder]").click(function() {
            var folder = $(this).attr("folder");
            if (folder) {
                Photos.showFolder(folder);
            }
            return false;
        });

        Photos.setBreadcrumb(["相册"]);
    },
    showFolder: function(folderName) {
        Photos.clearPhotos();
        for (var i = 0; i < Photos._folders[folderName].length; i++) {
            $("#folders").append(
                $("<div></div>").addClass("col-sm-6 col-md-4 photo-div").append(
                    $("<a></a>").attr("imgPath", Photos._folders[folderName][i].path).attr("href", "#").append(
                        $("<div></div>").addClass("thumbnail").append(
                            $("<img>").attr("src", Photos._folders[folderName][i].path).attr("title", Photos._folders[folderName][i].basename)
                        )
                    )
                )
            );
        }
        $("a[imgPath]").click(function() {
            var imgPath = $(this).attr("imgPath");
            Photos.showImg(imgPath);
            return false;
        });

        Photos.setBreadcrumb(["相册", folderName]);
        window.location = window.location.origin+ window.location.pathname + "#" + folderName;
    },
    showImg: function(imgPath) {
        $("#big_img").attr("src", imgPath);
        $("#modal_photo").modal('show');
    }
}
