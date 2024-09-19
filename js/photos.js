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
    $(".breadcrumb_photo").text("");
    for (var i = 0; i < paths.length; i++) {
      $(".breadcrumb_photo").append(
        $("<li></li>").attr("class", "breadcrumb-item").append(
          $("<a></a>").addClass("link-underline link-underline-opacity-0 link-underline-opacity-100-hover").attr("breakcrumb", paths[i]).attr('href', '#').text(paths[i])
        )
      );
    }

    $("a[breakcrumb]").click(function() {
      var breakcrumb = $(this).attr("breakcrumb");
      if (breakcrumb == "相册") {
        Photos.showFolders();
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
        $("<div></div>").addClass("col-xs-6 col-md-4 p-2").append(
          $("<div></div>").addClass("photo-div card text-center").append(
            $("<a></a>").addClass("text-decoration-none").attr("folder", Photos._folderNames[i]).attr("href", "#").append(
              $("<div></div>").addClass("thumbnail").append(
                $("<img>")
                .css("height", "auto")
                .css("aspect-ratio", 4 / 3)
                .attr("class", "card-img-top object-fit-cover")
                .css("object-position", "center")
                .attr("src", Photos._folders[Photos._folderNames[i]][0].path)
              ).append(
                $("<p></p>").addClass("mt-1 mb-2").text(Photos._folderNames[i] + "  ").append(
                  $("<span></span>").addClass("badge rounded-pill text-bg-primary").text(Photos._folders[Photos._folderNames[i]].length)
                )
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
    history.replaceState(null, '', "");
    var url = new URL(window.location.href);
    url.hash = '';
    history.replaceState(null, '', url.href);
  },
  showFolder: function(folderName) {
    Photos.clearPhotos();
    for (var i = 0; i < Photos._folders[folderName].length; i++) {
      $("#folders").append(
        $("<div></div>").addClass("col-xs-6 col-md-4 p-2").append(
          $("<div></div>").addClass("photo-div").append(
            $("<a></a>").attr("imgPath", Photos._folders[folderName][i].path).attr("href", "#").append(
              $("<div></div>").addClass("thumbnail").append(
                $("<img>")
                .css("height", "auto")
                .css("aspect-ratio", 4 / 3)
                .addClass("rounded object-fit-cover w-100")
                .attr("src", Photos._folders[folderName][i].path)
                .attr("title", Photos._folders[folderName][i].basename)
              )
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
    history.replaceState(null, '', "#" + folderName);
  },
  showImg: function(imgPath) {
    $("#big_img").attr("src", imgPath);
    $("#modal_photo").modal('show');
  }
}