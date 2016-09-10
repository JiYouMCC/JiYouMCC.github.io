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

Array.prototype.remove = function() {
  var what, a = arguments,
    L = a.length,
    ax;
  if (L == 1) {
    what = a[0];
    ax = this.indexOf(what);
    if (ax != -1) {
      this.splice(ax, 1);
    }
  }
  return this;
}

function calcuate() {
  var roles = document.getElementById("roles").value.split("\n").removeAll("");
  var players = document.getElementById("players").value.split("\n").removeAll("");
  if (roles.length == players.length) {
    document.getElementById("result").value = "";
    var count = roles.length;
    for (var i = 0; i < count; i++) {
      // Math.random range[0,1)
      // Math.random() * players.length range [0, length)
      // Math.floor(Math.random() * players.length) range [0, 1, 2, ... range-1]
      var player = players[Math.floor(Math.random() * players.length)];
      var role = roles[i];
      players.remove(player);
      document.getElementById("result").value += player + " ---------- " + role + " \n";
    }
  } else {
    document.getElementById("result").value = "角色与身份数量不符。"
  }
}

function clearArea(id) {
  document.getElementById(id).value = "";
}

function addRole() {
  var role = document.getElementById("role_add").value;
  var count = parseInt(document.getElementById("role_count").value);
  var current = document.getElementById("roles").value;
  if (current.length > 0) {
    if (current[current.length - 1] != "\n") {
      document.getElementById("roles").value += "\n";
    }
  }
  for (var i = 0; i < count; i++) {
    document.getElementById("roles").value += role + "\n";
  }
}
