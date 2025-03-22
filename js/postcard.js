PostcardCollection = {
  _postData: undefined,
  _filterData: undefined,
  Init: function(data) {
    _postData = data.sort((a, b) => new Date(b['sent_date']) - new Date(a['received_date']));
    // split tags
    _postData.forEach(item => {
      if (item['tags']) {
        item['tags'] = item['tags'].split(' ');
      } else {
        item['tags'] = [];
      }
    });

    _filterData = _postData;
    PostcardCollection.RefreshFilterElements(_filterData);
    PostcardCollection.RefreshImageContainer(_filterData);
    PostcardCollection.InitFilterElements();
  },
  InitFilterElements: function() {
    // control the behavior of the filter, do not related to data
    // country filter
    $('#country-all').on('change', function() {
      var isChecked = $(this).is(':checked');
      console.log(isChecked);
      $('#ul-country .form-check-input').prop('checked', isChecked);
    });

    $('#ul-country .form-check-input').not('#country-all').on('change', function() {
      var allChecked = $('#ul-country .form-check-input').not('#all').length === $('#ul-country .form-check-input').not('#all').filter(':checked').length;
      $('#country-all').prop('checked', allChecked);
    });

    $('#ul-country .form-check-input').on('change', function() {
      var selectedOptions = [];
      $('#ul-country .form-check-input:checked').not('#country-all').each(function() {
        selectedOptions.push($(this).val());
      });
      $('#dropdownMenuButton-country').text(selectedOptions.join(', ') || 'Select Countries');
    });

    // region filter
    $('#region-all').on('change', function() {
      var isChecked = $(this).is(':checked');
      console.log(isChecked);
      $('#ul-region .form-check-input').prop('checked', isChecked);
    });

    $('#ul-region .form-check-input').not('#region-all').on('change', function() {
      var allChecked = $('#ul-region .form-check-input').not('#all').length === $('#ul-region .form-check-input').not('#all').filter(':checked').length;
      $('#region-all').prop('checked', allChecked);
    });

    $('#ul-region .form-check-input').on('change', function() {
      var selectedOptions = [];
      $('#ul-region .form-check-input:checked').not('#region-all').each(function() {
        selectedOptions.push($(this).val());
      });
      $('#dropdownMenuButton-region').text(selectedOptions.join(', ') || 'Select Regions');
    });

    // type filter
    $('#type-all').on('change', function() {
      var isChecked = $(this).is(':checked');
      console.log(isChecked);
      $('#ul-type .form-check-input').prop('checked', isChecked);
    });

    $('#ul-type .form-check-input').not('#type-all').on('change', function() {
      var allChecked = $('#ul-type .form-check-input').not('#all').length === $('#ul-type .form-check-input').not('#all').filter(':checked').length;
      $('#type-all').prop('checked', allChecked);
    });

    $('#ul-type .form-check-input').on('change', function() {
      var selectedOptions = [];
      $('#ul-type .form-check-input:checked').not('#type-all').each(function() {
        selectedOptions.push($(this).val());
      });
      $('#dropdownMenuButton-type').text(selectedOptions.join(', ') || 'Select Types');
    });

    // platform filter
    $('#platform-all').on('change', function() {
      var isChecked = $(this).is(':checked');
      console.log(isChecked);
      $('#ul-platform .form-check-input').prop('checked', isChecked);
    });

    $('#ul-platform .form-check-input').not('#platform-all').on('change', function() {
      var allChecked = $('#ul-platform .form-check-input').not('#all').length === $('#ul-platform .form-check-input').not('#all').filter(':checked').length;
      $('#platform-all').prop('checked', allChecked);
    });

    $('#ul-platform .form-check-input').on('change', function() {
      var selectedOptions = [];
      $('#ul-platform .form-check-input:checked').not('#platform-all').each(function() {
        selectedOptions.push($(this).val());
      });
      $('#dropdownMenuButton-platform').text(selectedOptions.join(', ') || 'Select Platforms');
    });

    // tag filter
    $('#tag-all').on('change', function() {
      var isChecked = $(this).is(':checked');
      $('#div-tags .form-check-input').prop('checked', isChecked);
    });

    $('#inputTitle, #ul-country .form-check-input, #ul-region .form-check-input, #ul-type .form-check-input, #ul-platform .form-check-input, #div-tags .form-check-input, #collapseSentDate .form-control, #collapseReceivedDate .form-control, #inputSender').on('change', function() {
      PostcardCollection.GenerateFilter();
      PostcardCollection.RefreshImageContainer(PostcardCollection.GenerateFilter());
    });
  },
  RefreshFilterElements: function(data) {
    $("#cardCount").text(_postData.length);
    $("#searchCount").text(data.length);
    var countryList = new Set();
    var typeList = new Set();
    var platformList = new Set();
    var friendList = new Set();
    var regionList = new Set();
    var tagList = new Set();
    data.forEach(item => {
      if (item['country']) {
        countryList.add(item['country']);
      }
      if (item['type']) {
        typeList.add(item['type']);
      }
      if (item['platform']) {
        platformList.add(item['platform']);
      }
      if (item['friend_id']) {
        friendList.add(item['friend_id']);
      }
      if (item['region']) {
        regionList.add(item['region']);
      }
      if (item['tags']) {
        item['tags'].forEach(tag => {
          tagList.add(tag);
        });
      }
    });

    for (let country of countryList) {
      $("#ul-country").append(
        $("<li></li>").append(
          $("<div></div>").addClass("dropdown-item").append(
            $("<input></input>").addClass("form-check-input me-1").attr("type", "checkbox").attr("value", country).attr("id", country),
            $("<label></label>").addClass("form-check-label").attr("for", country).text(country)
          )
        )
      );
    }

    for (let type of typeList) {
      $("#ul-type").append(
        $("<li></li>").append(
          $("<div></div>").addClass("dropdown-item").append(
            $("<input></input>").addClass("form-check-input me-1").attr("type", "checkbox").attr("value", type).attr("id", type),
            $("<label></label>").addClass("form-check-label").attr("for", type).text(type)
          )
        )
      );
    }

    for (let platform of platformList) {
      $("#ul-platform").append(
        $("<li></li>").append(
          $("<div></div>").addClass("dropdown-item").append(
            $("<input></input>").addClass("form-check-input me-1").attr("type", "checkbox").attr("value", platform).attr("id", platform),
            $("<label></label>").addClass("form-check-label").attr("for", platform).text(platform)
          )
        )
      );
    }

    for (let friend of friendList) {
      $("#datalistSender").append(
        $("<option></option>").attr("value", friend)
      );
    };

    for (let region of regionList) {
      $("#ul-region").append(
        $("<li></li>").append(
          $("<div></div>").addClass("dropdown-item").append(
            $("<input></input>").addClass("form-check-input me-1").attr("type", "checkbox").attr("value", region).attr("id", region),
            $("<label></label>").addClass("form-check-label").attr("for", region).text(region)
          )
        )
      );
    }

    for (let tag of tagList) {
      $("#div-tags").append(
        $("<input></input>").addClass("form-check-input me-1").attr("type", "checkbox").attr("value", tag).attr("id", "tag_"+tag),
        $("<label></label>").addClass("form-check-label me-2").attr("for", "tag_"+tag).text(tag)
      );
    }
  },
  refreshPopoverListeners: function() {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });

    // Function to clear popover event listeners
    function clearPopoverListeners() {
      popoverList.forEach(function(popover) {
        popover.dispose();
      });
    }

    // Call the function to clear the listeners
    clearPopoverListeners();

    var popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl, {
        html: true,
        content: function() {
          var cardID = popoverTriggerEl.getAttribute('data-card-id');
          var cardTitle = popoverTriggerEl.getAttribute('data-card-title') || cardID;
          var cardUrl = popoverTriggerEl.getAttribute('data-card-url') || "#";
          var cardType = popoverTriggerEl.getAttribute('data-card-type') || "";
          var friendId = popoverTriggerEl.getAttribute('data-card-friend_id') || "";
          var friendUrl = popoverTriggerEl.getAttribute('data-card-friend_url') || "#";
          var country = popoverTriggerEl.getAttribute('data-card-country') || "";
          var region = popoverTriggerEl.getAttribute('data-card-region') || "";
          var sentDate = new Date(popoverTriggerEl.getAttribute('data-card-sent_date'));
          var receivedDate = new Date(popoverTriggerEl.getAttribute('data-card-received_date'));
          var tags = popoverTriggerEl.getAttribute('data-card-tags') || "";
          tags = tags.split(',');
          var platform = popoverTriggerEl.getAttribute('data-card-platform');
          var days = Math.floor((receivedDate - sentDate) / (1000 * 60 * 60 * 24));
          var sentDataStr = sentDate.getFullYear() + "-" + (sentDate.getMonth() + 1) + "-" + sentDate.getDate();
          var receivedDataStr = receivedDate.getFullYear() + "-" + (receivedDate.getMonth() + 1) + "-" + receivedDate.getDate();
          var location = country;
          if (region !== "") {
            location = location + ' - ' + region;
          }
          var resultHtml = "";
          resultHtml += '<a href="' + cardUrl + '" target="_blank"><strong>' + cardTitle + '</strong></a>';
          resultHtml += '<br><strong>From</strong> <a href="' + friendUrl + '" target="_blank">' + friendId + '</a> (' + location + ')' + ' [' + platform + ']';
          resultHtml += '<br>' + sentDataStr + ' ~ ' + receivedDataStr + ' (' + days + ' days)';
          resultHtml += '<br>';
          for (let i = 0; i < tags.length; i++) {
            resultHtml += '<a href="#"><span class="badge text-bg-primary">' + tags[i] + '</span></a> ';
          }
          return resultHtml;
        }
      })
    })
  },

  RefreshImageContainer: function(data) {
    $("#cardCount").text(_postData.length);
    $("#searchCount").text(data.length);
    $("#imageContainer").empty();
    for (let i = 0; i < data.length; i++) {
      var dataItem = data[i];
      $("#imageContainer").append(
        $("<div></div>").addClass("col-lg-3 col-md-4 mb-4 col-6 image-item").append(
          $("<img></img>").addClass("img-fluid img-thumbnail postcard")
          .attr("src", "/postcards/received/" + dataItem['id'] + ".jpg")
          .attr("title", dataItem['id'])
          .attr("data-bs-toggle", "popover")
          .attr("data-bs-placement", "bottom")
          .attr("data-card-id", dataItem['id'])
          .attr("data-card-url", dataItem["url"])
          .attr("data-card-title", dataItem["title"])
          .attr("data-card-platform", dataItem["platform"])
          .attr("data-card-friend_id", dataItem["friend_id"])
          .attr("data-card-friend_url", dataItem["friend_url"])
          .attr("data-card-country", dataItem["country"])
          .attr("data-card-region", dataItem["region"])
          .attr("data-card-sent_date", dataItem["sent_date"])
          .attr("data-card-received_date", dataItem["received_date"])
          .attr("data-card-type", dataItem["type"])
          .attr("data-card-tags", dataItem["tags"])
        ));
    }

    PostcardCollection.refreshPopoverListeners();


  },
  GenerateFilter: function() {
    // get filter query from ui elements and apply it to data
    // country filter
    var selectedCountries = [];
    $('#ul-country .form-check-input:checked').not('#country-all').each(function() {
      selectedCountries.push($(this).val());
    });

    // region filter
    var selectedRegions = [];
    $('#ul-region .form-check-input:checked').not('#region-all').each(function() {
      selectedRegions.push($(this).val());
    });

    // type filter
    var selectedTypes = [];
    $('#ul-type .form-check-input:checked').not('#type-all').each(function() {
      selectedTypes.push($(this).val());
    });

    // platform filter
    var selectedPlatforms = [];
    $('#ul-platform .form-check-input:checked').not('#platform-all').each(function() {
      selectedPlatforms.push($(this).val());
    });

    // tag filter
    var selectedTags = [];

    $('#div-tags .form-check-input:checked').not('#tag-all').each(function() {
      selectedTags.push($(this).val());
    });

    // friend filter
    var selectedFriend = $('#inputSender').val();
    var selectedTitle = $('#inputTitle').val();

    // sent date filter
    var sentDateStart = $('#inputSentDateStart').val();
    var sentDateEnd = $('#inputSentDateEnd').val();

    // received date filter
    var receivedDateStart = $('#inputReceivedDateStart').val();
    var receivedDateEnd = $('#inputReceivedDateEnd').val();

    // apply the filters to data and return the result
    var resultData = _postData.filter(item => {
      var isTitleMatch = selectedTitle === "" || (item['title'] && item['title'].includes(selectedTitle));
      var isCountryMatch = selectedCountries.length === 0 || selectedCountries.includes(item['country']);
      var isRegionMatch = selectedRegions.length === 0 || selectedRegions.includes(item['region']);
      var isTypeMatch = selectedTypes.length === 0 || selectedTypes.includes(item['type']);
      var isPlatformMatch = selectedPlatforms.length === 0 || selectedPlatforms.includes(item['platform']);
      var isTagMatch = selectedTags.length === 0 || selectedTags.every(tag => item['tags'].includes(tag));
      var isFriendMatch = selectedFriend === "" || item['friend_id'].includes(selectedFriend);
      var isSentDateMatch = (sentDateStart === "" || new Date(item['sent_date']) >= new Date(sentDateStart)) && (sentDateEnd === "" || new Date(item['sent_date']) <= new Date(sentDateEnd));
      var isReceivedDateMatch = (receivedDateStart === "" || new Date(item['received_date']) >= new Date(receivedDateStart)) && (receivedDateEnd === "" || new Date(item['received_date']) <= new Date(receivedDateEnd));
      return isTitleMatch && isCountryMatch && isRegionMatch && isTypeMatch && isPlatformMatch && isTagMatch && isFriendMatch && isSentDateMatch && isReceivedDateMatch;
    });
    _filterData = resultData;
    return resultData;
  }

}