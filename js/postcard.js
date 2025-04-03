const PostcardCollection = {
  _postData: undefined,
  _filterData: undefined,
  _itemsPerPage: 12,
  Init: function(data) {
    PostcardCollection._postData = data.sort((a, b) => new Date(b['received_date']) - new Date(a['received_date']));
    PostcardCollection._postData.forEach(item => {
      item['tags'] = item['tags'] ? item['tags'].split(' ') : [];
    });
    PostcardCollection._filterData = PostcardCollection._postData;
    PostcardCollection.RefreshFilterElements(PostcardCollection._filterData);
    PostcardCollection.RefreshImageContainer();
    PostcardCollection.InitFilterElements();
    PostcardCollection.RefreshPagenation();
  },
  InitFilterElements: function() {
    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };

    const capitalize = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const updateDropdownText = (selector, text) => {
      // get first 3 item and join by , 
      // if more than 3, add '...'
      if (text.length > 3) {
        text = text.slice(0, 3).join(', ').concat('...(' + text.length + ')');
      } else {
        text = text.join(', ');
      }
      $(selector).text(text || capitalize(selector.split('-')[1]));
    };

    const handleCheckboxChange = (allSelector, itemSelector, dropdownSelector) => {
      $(allSelector).on('change', function() {
        const isChecked = $(this).is(':checked');
        $(itemSelector).prop('checked', isChecked);
      });

      $(itemSelector).not(allSelector).on('change', function() {
        const allChecked = $(itemSelector).not(allSelector).length === $(itemSelector).not(allSelector).filter(':checked').length;
        $(allSelector).prop('checked', allChecked);
      });

      $(itemSelector).on('change', function() {
        const selectedOptions = $(itemSelector + ':checked').not(allSelector).map(function() {
          return $(this).val();
        }).get();
        updateDropdownText(dropdownSelector, selectedOptions);
      });
    };

    handleCheckboxChange('#country-all', '#ul-country .form-check-input', '#dropdownMenuButton-country');
    handleCheckboxChange('#region-all', '#ul-region .form-check-input', '#dropdownMenuButton-region');
    handleCheckboxChange('#type-all', '#ul-type .form-check-input', '#dropdownMenuButton-type');
    handleCheckboxChange('#platform-all', '#ul-platform .form-check-input', '#dropdownMenuButton-platform');

    $('#ul-country .form-check-input').on('change', function() {
      const selectedCountries = $('#ul-country .form-check-input:checked').not('#country-all').map(function() {
        return $(this).val();
      }).get();
      const selectedRegions = $('#ul-region .form-check-input:checked').not('#region-all').map(function() {
        return $(this).val();
      }).get();

      const regionList = new Set();
      if (selectedCountries.length === 0) {
        PostcardCollection._postData.forEach(item => {
          if (item['region']) {
            regionList.add(item['region']);
          }
        });
      } else {
        PostcardCollection._postData.filter(item => selectedCountries.includes(item['country'])).forEach(item => {
          if (item['region']) {
            regionList.add(item['region']);
          }
        });
      }

      $('#ul-region').empty();
      $('#ul-region').append(
        $("<li></li>").append(
          $("<div></div>").addClass("dropdown-item").append(
            $("<input></input>").addClass("form-check-input me-1").attr("type", "checkbox").attr("value", "all").attr("id", "region-all"),
            $("<label></label>").addClass("form-check-label").attr("for", "region-all").text("All")
          )
        )
      );

      regionList.forEach(region => {
        $('#ul-region').append(
          $("<li></li>").append(
            $("<div></div>").addClass("dropdown-item").append(
              $("<input></input>").addClass("form-check-input me-1").attr("type", "checkbox").attr("value", region).attr("id", `region_${region}`),
              $("<label></label>").addClass("form-check-label").attr("for", `region_${region}`).text(region)
            )
          )
        );
        if (selectedRegions.includes(region))
          $(`#region_${region}`).prop('checked', true);
      });

      const selectedOptions = $('#ul-region .form-check-input:checked').not('#region-all').map(function() {
        return $(this).val();
      }).get();

      handleCheckboxChange('#region-all', '#ul-region .form-check-input', '#dropdownMenuButton-region');

      updateDropdownText('#dropdownMenuButton-region', selectedOptions);

      $('#ul-region .form-check-input').on('change', debounce(() => {
        PostcardCollection.GenerateFilter();
        PostcardCollection.RefreshImageContainer();
      }, 100));
    });

    $('#tag-all').on('change', function() {
      const isChecked = $(this).is(':checked');
      $('#div-tags .form-check-input').prop('checked', isChecked);
    });

    $("#inputTitle,#inputSender").width("12ch");

    $("#inputTitle,#inputSender").on('input', function(event) {
      function getStringWidth(str) {
        let width = 0;
        for (let char of str) {
          if (char.match(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/)) {
            // CJP characters
            width += 2;
          } else {
            // English characters
            width += 1;
          }
        }
        return width;
      }
      $(this).width(Math.max(getStringWidth($(this).val()), 12) + "ch");
    });

    $("#inputTitle,#inputSender").on('input', debounce(() => {
      PostcardCollection.GenerateFilter();
      PostcardCollection.RefreshImageContainer();
    }, 100));

    $('#ul-country .form-check-input, #ul-region .form-check-input, #ul-type .form-check-input, #ul-platform .form-check-input, #div-tags .form-check-input, #collapseSentDate .form-control, #collapseReceivedDate .form-control').on('change', debounce(() => {
      PostcardCollection.GenerateFilter();
      PostcardCollection.RefreshImageContainer();
    }, 100));

    $('#resetFilter').on('click', () => {
      $('#inputTitle, #inputSender, #inputSentDateStart, #inputSentDateEnd, #inputReceivedDateStart, #inputReceivedDateEnd').val('');
      $('#ul-country .form-check-input, #ul-region .form-check-input, #ul-type .form-check-input, #ul-platform .form-check-input, #div-tags .form-check-input').prop('checked', false);
      updateDropdownText('#dropdownMenuButton-country', []);
      updateDropdownText('#dropdownMenuButton-region', []);
      updateDropdownText('#dropdownMenuButton-type', []);
      updateDropdownText('#dropdownMenuButton-platform', []);
      $("#inputTitle,#inputSender").width("12ch");
      const bsCollapse = new bootstrap.Collapse('#collapseTags', {
        toggle: false
      }).hide();
      PostcardCollection.GenerateFilter();
      PostcardCollection.RefreshImageContainer();
    });
  },
  RefreshFilterElements: function(data) {
    const updateList = (selector, items, idPrefix) => {
      if (idPrefix === 'tag') {
        items.forEach(item => {
          $(selector).append(
            $("<div></div").addClass('d-flex flex-wrap').append(
              $("<input></input>").addClass("form-check-input me-1").attr("type", "checkbox").attr("value", item).attr("id", `${idPrefix}_${item}`),
              $("<label></label>").addClass("form-check-label me-2").attr("for", `${idPrefix}_${item}`).text(item)
            )
          )
        });
      } else {
        items.forEach(item => {
          $(selector).append(
            $("<li></li>").append(
              $("<div></div>").addClass("dropdown-item").append(
                $("<input></input>").addClass("form-check-input me-1").attr("type", "checkbox").attr("value", item).attr("id", `${idPrefix}_${item}`),
                $("<label></label>").addClass("form-check-label").attr("for", `${idPrefix}_${item}`).text(item)
              )
            )
          );
        });
      }
    };

    $("#cardCount").text(PostcardCollection._postData.length);
    $("#searchCount").text(data.length);

    const countryList = new Set();
    const typeList = new Set();
    const platformList = new Set();
    const friendList = new Set();
    const regionList = new Set();
    const tagList = new Set();

    data.forEach(item => {
      if (item['country']) countryList.add(item['country']);
      if (item['type']) typeList.add(item['type']);
      if (item['platform']) platformList.add(item['platform']);
      if (item['friend_id']) friendList.add(item['friend_id']);
      if (item['region']) regionList.add(item['region']);
      if (item['tags']) item['tags'].forEach(tag => tagList.add(tag));
    });

    updateList("#ul-country", countryList, 'country');
    updateList("#ul-type", typeList, 'type');
    updateList("#ul-platform", platformList, 'platform');
    updateList("#ul-region", regionList, 'region');
    updateList("#div-tags", tagList, 'tag');

    friendList.forEach(friend => {
      $("#datalistSender").append($("<option></option>").attr("value", friend));
    });
  },
  refreshPopoverListeners: function() {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    const popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
    popoverList.forEach(function(popover) {
      popover.dispose();
    });
    const newpopoverList = popoverTriggerList.map(function(popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl, {
        html: true,
        content: function() {
          const cardID = popoverTriggerEl.getAttribute('data-card-id');
          const cardTitle = popoverTriggerEl.getAttribute('data-card-title') || cardID;
          const cardUrl = popoverTriggerEl.getAttribute('data-card-url') || "#";
          const cardType = popoverTriggerEl.getAttribute('data-card-type') || "";
          const friendId = popoverTriggerEl.getAttribute('data-card-friend_id') || "";
          const friendUrl = popoverTriggerEl.getAttribute('data-card-friend_url') || "#";
          const country = popoverTriggerEl.getAttribute('data-card-country') || "";
          const region = popoverTriggerEl.getAttribute('data-card-region') || "";
          const sentDate = new Date(popoverTriggerEl.getAttribute('data-card-sent_date'));
          const receivedDate = new Date(popoverTriggerEl.getAttribute('data-card-received_date'));
          const tags = popoverTriggerEl.getAttribute('data-card-tags') || "";
          const platform = popoverTriggerEl.getAttribute('data-card-platform');
          const days = Math.floor((receivedDate - sentDate) / (1000 * 60 * 60 * 24));
          const sentDataStr = `${sentDate.getFullYear()}-${sentDate.getMonth() + 1}-${sentDate.getDate()}`;
          const receivedDataStr = `${receivedDate.getFullYear()}-${receivedDate.getMonth() + 1}-${receivedDate.getDate()}`;
          const location = region ? `${country} - ${region}` : country;
          let resultHtml = `<a href="${cardUrl}" target="_blank"><strong>${cardTitle}</strong></a>`;
          resultHtml += `<br><strong>From</strong> <a href="${friendUrl}" target="_blank">${friendId}</a> (${location})`;
          resultHtml += `<br><strong>On</strong> ${platform}`;
          resultHtml += `<br>${sentDataStr} ~ ${receivedDataStr} (${days} days)<br>`;
          tags.split(',').forEach(tag => {
            resultHtml += `<span class="me-1 badge text-bg-primary">${tag}</span>`;
          });
          return resultHtml;
        }
      })
    });
  },
  RefreshImageContainer: function() {
    try {
      $('[data-bs-toggle="popover"]').popover('hide');
    } catch (e) {}

    $("#cardCount").text(PostcardCollection._postData.length);
    $("#searchCount").text(PostcardCollection._filterData.length);
    PostcardCollection.GenerateImageContainer(PostcardCollection._filterData);
    PostcardCollection.RefreshPagenation()
  },
  GenerateImageContainer: function(data) {
    $("#imageContainer").empty();
    data.forEach(dataItem => {
      $("#imageContainer").append(
        $("<div></div>").attr("id", "image_" + dataItem['id']).addClass("col-lg-3 col-md-4 mb-4 col-6 image-item px-1").append(
          $("<img></img>").addClass("img-fluid img-thumbnail postcard")
          .attr("src", `/postcards/received/${dataItem['id']}.jpg`)
          .attr("alt", dataItem['id'])
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
    });
    PostcardCollection.refreshPopoverListeners();
  },
  GenerateFilter: function() {
    const getSelectedValues = (selector) => $(selector + ':checked').not(selector + '-all').map(function() {
      return $(this).val();
    }).get();

    const selectedCountries = getSelectedValues('#ul-country .form-check-input');
    const selectedRegions = getSelectedValues('#ul-region .form-check-input');
    const selectedTypes = getSelectedValues('#ul-type .form-check-input');
    const selectedPlatforms = getSelectedValues('#ul-platform .form-check-input');
    const selectedTags = getSelectedValues('#div-tags .form-check-input');
    const selectedFriend = $('#inputSender').val();
    const selectedTitle = $('#inputTitle').val();
    const sentDateStart = $('#inputSentDateStart').val();
    const sentDateEnd = $('#inputSentDateEnd').val();
    const receivedDateStart = $('#inputReceivedDateStart').val();
    const receivedDateEnd = $('#inputReceivedDateEnd').val();

    PostcardCollection._filterData = PostcardCollection._postData.filter(item => {
      const isTitleMatch = !selectedTitle || (item['title'] && item['title'].includes(selectedTitle)) || (item['id'] && item['id'].includes(selectedTitle)) || item['tags'].some(tag => tag.includes(selectedTitle));
      const isCountryMatch = !selectedCountries.length || selectedCountries.includes(item['country']);
      const isRegionMatch = !selectedRegions.length || selectedRegions.includes(item['region']);
      const isTypeMatch = !selectedTypes.length || selectedTypes.includes(item['type']);
      const isPlatformMatch = !selectedPlatforms.length || selectedPlatforms.includes(item['platform']);
      const isTagMatch = !selectedTags.length || selectedTags.some(tag => item['tags'].includes(tag));
      const isFriendMatch = !selectedFriend || (item['friend_id'] && item['friend_id'].includes(selectedFriend));
      const isSentDateMatch = (!sentDateStart || new Date(item['sent_date']) >= new Date(sentDateStart)) && (!sentDateEnd || new Date(item['sent_date']) <= new Date(sentDateEnd));
      const isReceivedDateMatch = (!receivedDateStart || new Date(item['received_date']) >= new Date(receivedDateStart)) && (!receivedDateEnd || new Date(item['received_date']) <= new Date(receivedDateEnd));
      return isTitleMatch && isCountryMatch && isRegionMatch && isTypeMatch && isPlatformMatch && isTagMatch && isFriendMatch && isSentDateMatch && isReceivedDateMatch;
    });
  },
  RefreshPagenation: function() {
    const totalPages = Math.ceil(PostcardCollection._filterData.length / PostcardCollection._itemsPerPage);
    const paginationContainer = $("#pagination");
    paginationContainer.empty();
    PostcardCollection.GeneratePagination(1, totalPages);
    paginationContainer.find(".page-link").first().trigger("click");
  },
  GeneratePagination: function(currentPage, totalPages) {
    const paginationContainer = $("#pagination");
    paginationContainer.empty();

    const firstPageItem = $("<li></li>").addClass("page-item").append(
      $("<a></a>").addClass("page-link").text(1).attr("href", "#").attr("data-page", 1)
    );
    paginationContainer.append(firstPageItem);

    if (totalPages > 4 && currentPage > 3) {
      const dotsItem = $("<li></li>").addClass("page-item").append(
        $("<a></a>").addClass("page-link disabled").text("...").attr("href", "#").attr("data-page", "...")
      );
      paginationContainer.append(dotsItem);
    }

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
      const pageItem = $("<li></li>").addClass("page-item").append(
        $("<a></a>").addClass("page-link").text(i).attr("href", "#").attr("data-page", i)
      );
      paginationContainer.append(pageItem);
    }

    if (totalPages > 4 && currentPage < totalPages - 2) {
      const dotsItem = $("<li></li>").addClass("page-item").append(
        $("<a></a>").addClass("page-link disabled").text("...").attr("href", "#").attr("data-page", "...")
      );
      paginationContainer.append(dotsItem);
    }

    if (totalPages > 1) {
      const lastPageItem = $("<li></li>").addClass("page-item").append(
        $("<a></a>").addClass("page-link").text(totalPages).attr("href", "#").attr("data-page", totalPages)
      );
      paginationContainer.append(lastPageItem);
    }

    paginationContainer.find(".page-item").removeClass("active");
    paginationContainer.find(".page-link").each(function() {
      if ($(this).attr("data-page") == currentPage) {
        $(this).parent().addClass("active");
      }
    });

    paginationContainer.find(".page-link").on("click", function(event) {
      const totalPages = Math.ceil(PostcardCollection._filterData.length / PostcardCollection._itemsPerPage);
      event.preventDefault();
      const page = parseInt($(this).attr("data-page"));
      const startIndex = (page - 1) * PostcardCollection._itemsPerPage;
      const endIndex = startIndex + PostcardCollection._itemsPerPage;
      PostcardCollection.GeneratePagination(page, totalPages);
      PostcardCollection.GenerateImageContainer(PostcardCollection._filterData.slice(startIndex, endIndex));
    });

    $("#cardstart").text((currentPage - 1) * PostcardCollection._itemsPerPage + 1);
    $("#cardend").text(Math.min(currentPage * PostcardCollection._itemsPerPage, PostcardCollection._filterData.length));
  }
}