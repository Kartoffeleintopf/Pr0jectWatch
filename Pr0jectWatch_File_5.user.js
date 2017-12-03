// ==UserScript==
// @name        Project Watch - File 5
// @icon 		https://bs.to/opengraph.jpg
// @namespace   https://bs.to/
// @include     https://bs.to/log
// @include     https://bs.to/settings
// @include     https://bs.to/playlist
// @include     https://bs.to/favorites
// @version    	1.0
// @description	Log and Settings
// @author     	Kartoffeleintopf
// @run-at 		document-start
// @require 	https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/BsSite/scripts/Sortable.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/BsSite/scripts/logStorage.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/BsSite/scripts/playlistStorage.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/Universal/scripts/data.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/Universal/scripts/initPage.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/BsSite/scripts/keyControll.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/BsSite/scripts/seriesStorage.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/BsSite/scripts/favCat.js
// @downloadURL http://kartoffeleintopf.github.io/Pr0jectWatch/Pr0jectWatch_File_5.user.js
// ==/UserScript==

initBsPage();

/**
 * Api initPage on Document loaded.
 */
var onDocumentReady = async function () {
    if (window.location.href == 'https://bs.to/log') {
        initLogCont();
    } else if (window.location.href == 'https://bs.to/settings') {
        initSettingCont();
    } else if (window.location.href == 'https://bs.to/playlist') {
        initPlaylistCont();
    } else if (window.location.href == 'https://bs.to/favorites') {
        initFavoriteCont();
    }

    initSideCont();
}

/**
 * Init Log Page.
 */
var initLogCont = function () {
    $('#contentContainer').empty().append('<h1 class="mainSiteTitle">Series-Log</h1>').append('<table id="logTable"></table>');

    var logItemns = (getData('reverseLog', false)) ? getFullLog() : getFullLog().reverse();

    var table = $('#logTable').append('<tr><th>Nr</th><th>Series</th><th>Season</th><th>Index</th><th>Episode German</th><th>Episode Original</th><th>Hoster</th><th>Date</th></tr>');
    $.each(logItemns, function (index, v) {
        table.append('<tr><td>' + (index + 1) + '</td><td>' + v.series + '</td><td>' + ((v.season == 0) ? 'S' : v.season) + '</td><td>' + v.episodeNr + '/' + v.episodes + '</td><td>' + v.episodeDE + '</td><td>' + v.episodeOR + '</td><td>' + v.hoster + '</td><td>' + v.date + '</td></tr>');
    });
}

/**
 * Creates a list with max Five Elements of the last watched Series with Seasons.
 */
var initSideCont = function () {
    var target = $('#sideContainerContent').empty().append('<h1 class="sideSiteTitel">Last Watched</h1>');

    var lastFiveList = [];
    $.each(getFullLog().reverse(), function (index, value) {
        if (!containsObject(value, lastFiveList)) {
            lastFiveList.push(value);
            return !(lastFiveList.length > 4) // Break if 5 Elements reached - Rest is Continue
        }
    });

    $.each(lastFiveList, function (index, value) {
        target.append('<div href="' + ('https://bs.to/serie/' + value.seriesId + '/' + value.season) + '" class="lastWatchedButton"><div class="lastWatchedsideTriangle"></div><div class="lastWatchedText">' + value.series + '</div></div>');
    });

    $('.lastWatchedButton').bind('click', function () {
        window.location = $(this).attr('href');
    });
}

/**
 * Check if Series is Already in Serieslist
 */
var containsObject = function (obj, list) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].series == obj.series) {
            return true;
            break;
        }
    }
    return false;
}

/**
 * Init Setting Page.
 */
var initSettingCont = function () {
    $('#contentContainer').empty().append('<h1 class="mainSiteTitle">Settings</h1>');
    addHosterSort();
    addStylesConf();
    addGeneralConf();
    addMediaplayerConf();

    $('.settingHeader').bind('click', function () {
        $(this).closest('.settingContainer').attr('ison', !($(this).closest('.settingContainer').attr('ison') == 'true'));
    });
}

/**
 * Add HostersortConfig.
 */
var addHosterSort = function () {
    var hoster = JSON.parse(getData('hoster', JSON.stringify(defaultHoster)));
    if (hoster.length < defaultHoster.length) {
        hoster = defaultHoster;
        setData('hoster', JSON.stringify(defaultHoster), true);
    }

    var arrow = '<svg viewBox="0 0 30 30"><g><path d="M10 0 L25 15 L10 30 L5 25 L15 15 L5 5 Z" /></g></svg>';
    var target = $('#contentContainer').append('<div ison="false" class="settingContainer" id="hosterSortContainer"><div class="settingHeader">' + arrow + '<h3>Hoster Priority</h3></div><ul id="sortHoster"></ul></div>').find('#sortHoster');
    $.each(hoster, function (index, value) {
        $.each(hosterSupport, function (i, v) {
            if (v[0] == value) {
                target.append('<li sup="' + v[1] + '"><div class="sortIndex">' + (index + 1) + '</div><div class="hosterName">' + value + '</div></li>');
            }
        });
    })

    $("#sortHoster").sortable({
        onDrop: function ($item, container, _super) {
            var $clonedItem = $('<li/>');
            $item.before($clonedItem);

            $item.animate($clonedItem.position(), function () {
                $clonedItem.detach();
                _super($item, container);
            });

            var newSort = [];
            $('#sortHoster li[sup]').each(function (index, value) {
                newSort.push($(this).find('.hosterName').text().trim());
                $(this).find('.sortIndex').text(index + 1);
            });
            setData('hoster', JSON.stringify(newSort), true);
        },
        onDragStart: function ($item, container, _super) {
            var offset = $item.offset(),
            pointer = container.rootGroup.pointer;

            adjustment = {
                left: pointer.left - offset.left,
                top: pointer.top - offset.top
            };

            _super($item, container);
        },
        onDrag: function ($item, position) {
            $item.css({
                left: position.left - adjustment.left,
                top: position.top - adjustment.top
            });
        }
    });
}

/**
 * Add Styleconfig.
 */
var addStylesConf = function () {
    var arrow = '<svg viewBox="0 0 30 30"><g><path d="M10 0 L25 15 L10 30 L5 25 L15 15 L5 5 Z" /></g></svg>';
    var target = $('#contentContainer').append('<div ison="false" class="settingContainer" id="styleColorContainer"><div class="settingHeader">' + arrow + '<h3>Style</h3></div><select id="stylesApply"></select></div>').find('#stylesApply');

    var styleLink = getData('style', styleColors.Default);

    var isNotCustom = false;
    $.each(styleColors, function (index, value) {
        if (value == styleLink) {
            isNotCustom = true;
        }
        target.append('<option ' + ((value == styleLink) ? 'selected' : '') + ' value="' + value + '">' + index + '</option>');
    });

    $('#styleColorContainer').append('<span>Custom Colors</span><input placeholder="Customstyle Link" type="text" id="customStyles"><button id="applyStylesButton">Apply Custom Style</button>');

    if (!isNotCustom) {
        target.append('<option class="customSty" disabled selected value="' + styleLink + '">Custom Color</option>');
        $('#customStyles').val(styleLink);
    }

    $('#stylesApply').bind('change', function () {
        var styleHref = $('#stylesApply option:selected').val();
        setData('style', styleHref, true);
        $('#defineColors').attr('href', styleHref);
        $('#customStyles').val('');
    });

    $('#applyStylesButton').bind('click', function () {
        var styleHref = $('#customStyles').val();
        if (styleHref == '') {
            return false;
        }

        setData('style', styleHref, true);
        $('#defineColors').attr('href', styleHref);

        if (isNotCustom) {
            isNotCustom = false;
            target.append('<option class="customSty" disabled selected value="' + styleLink + '">Custom Color</option>');
        }

        $('.customSty:first').val(styleHref);
        target.val(styleHref);
    });
}

/**
 * Add GeneralConfigs.
 */
var addGeneralConf = function () {
    var arrow = '<svg viewBox="0 0 30 30"><g><path d="M10 0 L25 15 L10 30 L5 25 L15 15 L5 5 Z" /></g></svg>';
    var target = $('#contentContainer').append('<div ison="false" class="settingContainer" id="generalStyles"><div class="settingHeader">' + arrow + '<h3>General</h3></div></div>').find('#generalStyles');

    addCheckbox(target, 'enableLog', true, 'Enable Log');
    addCheckbox(target, 'autoAutoplay', false, 'Enable Automatic Autoplay Turn On');
    addCheckbox(target, 'scrollUnwatched', true, 'Enable Automatic Scroll To First Unwatched Episode');
    addCheckbox(target, 'updateSeason', true, 'Update Favorised Seriesseason On New Season Watch');
    addCheckbox(target, 'playMerged', true, 'Don\'t Play [In Episode X Enthalten] - Episodes');
    addCheckbox(target, 'syncFavMenu', true, 'Enable Sync Series In Favmenu [Turn Off On Mobiledevices]');
    addCheckbox(target, 'syncOnlyWatchedFav', true, 'Sync Only Watched Series In Favmenu');
    addCheckbox(target, 'catFav', false, 'Categorize Favorite Menu', function (val) {
        $('#favNav').toggle(val);
        $('#favReload').click();
    });
    addCheckbox(target, 'episodeSearch', false, 'Enable Episodesearch. Seriessearch on Episodelist Will Be Disabled');
    addCheckbox(target, 'reverseLog', false, 'Reverse Log');
    addCheckbox(target, 'episodelistOnStart', false, 'Show Last Season As Startpage');

    addNumberInput(target, 'autoplayTime', 5, 'Timer Time For Autoplay [Sec]', 0, 60000);
    addNumberInput(target, 'updateWaitTime', 7, 'Time Till Next Listupdate [Days]', 1, 60000);
    addNumberInput(target, 'listTimeout', 10000, 'Time Till Serieslist Asynchron Load [Ms]', 1, 60000);
    addNumberInput(target, 'minCharsSearch', 3, 'Min Characters In Search Before List Shows', 0, 60000);

    target.append('<button id="updateList">Manual Update List</button>');
    $('#updateList').bind('click', function () {
        setData('lastUpdate', 0, true);
        window.location = 'https://bs.to/serie-genre?redirect=' + jEncode(window.location.href);
    });

    target.append('<button id="removeLog">Clear Log</button>');
    $('#removeLog').bind('click', function () {
        window.localStorage.removeItem('loglist');
        window.location.reload();
    });
}

/**
 * Add MediaplayerConfigs.
 */
var addMediaplayerConf = function () {
    var arrow = '<svg viewBox="0 0 30 30"><g><path d="M10 0 L25 15 L10 30 L5 25 L15 15 L5 5 Z" /></g></svg>';
    var target = $('#contentContainer').append('<div ison="false" class="settingContainer" id="mediaStyles"><div class="settingHeader">' + arrow + '<h3>Mediaplayer</h3></div></div>').find('#mediaStyles');

    addCheckbox(target, 'closeEnd', true, 'Close On End');
    addCheckbox(target, 'enablePreview', true, 'Enable Timeline Preview');

    addNumberInput(target, 'previewSteps', 20, 'Preview Image Steps', 1, 60000);
    addNumberInput(target, 'timeShow', 3, 'Timer Time For Controlls Hide [Sec]', 1, 60000);
    addNumberInput(target, 'timeStep', 5, 'Timerstep For Keycontroll [Sec]', 1, 60000);
    addNumberInput(target, 'volStep', 10, 'Volumestep For Keycontroll. Maxvolume: 100', 1, 100);
}

/**
 * Add an new Config with Checkbox.
 * @param addContainer {Jquery} - Container to add the config.
 * @param saveIndex {String} - Key for localStorage Save.
 * @param defaultState - Default State if not Set.
 * @param msg {String} - Description.
 */
var addCheckbox = function (addContainer, saveIndex, defaultState, msg, callback) {
    addContainer.append('<div class="settingCheckbox"><label class="switch"><input ' + ((getData(saveIndex, defaultState)) ? 'checked' : '') + ' id="' + saveIndex + '" type="checkbox"/><span class="slider round"></span></label>' + msg + '<div>');
    $('#' + saveIndex).on('change', function () {
        setData(saveIndex, this.checked, true)
        if (typeof callback !== 'undefined') {
            callback(this.checked);
        }
    });
}

/**
 * Add an new Config with Numberinput.
 * @param addContainer {Jquery} - Container to add the config.
 * @param saveIndex {String} - Key for localStorage Save.
 * @param defaultState - Default State if not Set.
 * @param msg {String} - Description.
 * @param min {Number} - min number.
 * @param max {Number} - max number.
 */
var addNumberInput = function (addContainer, saveIndex, defaultState, msg, min, max) {
    addContainer.append('<label class="settingInput"><input min="' + min + '" max="' + max + '" value="' + (getData(saveIndex, defaultState)) + '" type="number" id="' + saveIndex + '">' + msg + '</label>');
    $('#' + saveIndex).on('change', function () {
        var value = $(this).val();
        if (!isNaN(value)) {
            value = parseInt(value);
            if (value < min || value > max) {
                return;
            }
        } else {
            return;
        }

        setData(saveIndex, value, true)
    });
}

/**
 * Init Playlist Page
 */
var initPlaylistCont = function () {
    $('#contentContainer').empty().append('<h1 class="mainSiteTitle">Playlist</h1>').append('<ul id="playlistList"></ul><button id="PlaylistPlay">Play All</button><button id="clearAllPlaylist">Clear All</button>');

    $('#playlistList').after('<div class="settingCheckbox"><label class="switch"><input ' + ((getData('keepPlaying', false)) ? 'checked' : '') + ' id="keepPlaying" type="checkbox"/>' +
        '<span class="slider round"></span></label>Keep Playing Last Series<div>');
    $('#keepPlaying').on('change', function () {
        setData('keepPlaying', this.checked, true)
    });

    var target = $('#playlistList');
    $.each(getFullPlayList(), function (index, value) {
        target.append(getPlaylistRow(value, index + 1));
    });

    $("#playlistList").sortable({
        handle: '.indexCol, .infoCol',
        onDrop: function ($item, container, _super) {
            var $clonedItem = $('<li/>');
            $item.before($clonedItem);

            $item.animate($clonedItem.position(), function () {
                $clonedItem.detach();
                _super($item, container);
            });

            removeAllPlaylist();
            $("#playlistList li[data-episode]").each(function (index, value) {
                $(this).find('.indexCol').text(index + 1);
                setPlayList($(this).attr('data-series'), parseInt($(this).attr('data-season')), $(this).attr('data-episode'), $(this).find('.seriesNameCol:first').text().trim(), $(this).find('.episodeCol:first span:first').text().trim(), parseInt($(this).attr('data-episodeindex')));
            });
        },
        onDragStart: function ($item, container, _super) {
            var offset = $item.offset(),
            pointer = container.rootGroup.pointer;

            adjustment = {
                left: pointer.left - offset.left,
                top: pointer.top - offset.top
            };

            _super($item, container);
        },
        onDrag: function ($item, position) {
            $item.css({
                left: position.left - adjustment.left,
                top: position.top - adjustment.top
            });
        }
    });

    $('#clearAllPlaylist').bind('click', function () {
        $('#playlistList').empty();
        removeAllPlaylist();
        if ($('#noEntry').length == 0) {
            $('#playlistList').after('<span id="noEntry">No Entry</span>');
        }
    });

    $('#playlistList li .delCol').bind('click', function (e) {
        removePlayList($(this).closest('li').attr('data-episode'));
        $(this).closest('li').remove();

        if ($('#playlistList li').length == 0) {
            $('#playlistList').after('<span id="noEntry">No Entry</span>');
        } else {
            $("#playlistList li").each(function (index, value) {
                $(this).find('.indexCol').text(index + 1);
            });
        }
    });

    $('#PlaylistPlay').bind('click', function () {
        if ($('#playlistList li').length != 0) {
            setData('lastSeries', 'notNot');
            setData('lastSeason', 'notNot');
            setData('lastEpisode', 'notNot');
            setData('isPlayingPlaylist', true);

            window.location = 'https://bs.to/?next';
        }
    });

    if ($('#playlistList li').length == 0) {
        $('#playlistList').after('<span id="noEntry">No Entry</span>');
    }
}

/**
 * Get an Playlist Item.
 * @param obj {Object} - Playlist Object.
 * @param index {Number} - Index of Listitem.
 * @return Listitem {String}
 */
var getPlaylistRow = function (obj, index) {
    return '<li data-series="' + obj.seriesID + '" data-episodeIndex="' + obj.episodeIndex + '" data-season="' + obj.season + '" data-episode="' + obj.episodeID + '">' +
    '<div class="indexCol">' + index + '</div><div class="infoCol"><span class="seriesNameCol">' + obj.seriesName + '</span><span class="seasonCol">' + ((obj.season == 0) ? 'Specials' : ('Season ' + obj.season)) + '</span>' +
    '<span class="episodeCol">' + 'Episode ' + obj.episodeIndex + ' - <span>' + obj.episodeName + '</span></span></div><div class="delCol"><svg viewBox="0 0 25 25"><g><path d="M5 0L12.5 7.5L20 0L25 5L17.5 12.5L25 20L20 25L12.5 17.5L5 25L0 20L7.5 12.5L0 5Z"/></g></svg></div></li>';
}

/**
 * Init Favorite Sort Page
 */
var initFavoriteCont = function () {
    $('#contentContainer').empty().append('<h1 class="mainSiteTitle">Favorites</h1>');

    $('#contentContainer').append($("<ul>", {
            "id": "catMainList"
        }));

    $.each(getCatFavs(getFavorites()), function (key, value) {
        var list = $('<ul>', {
                "class": "catList"
            });

        var index = 0;
        if (value.length != 0) {
            $.each(value.map(a => getCatFavRow(++index, a)), function (i, value) {
                list.append(value);
            });
        } else {
            list.append('<li><span class="emptyCat">Category Empty</span></li>');
        }

        var entity = $('<li>').append('<h2 class="catTitle"><span class="catMainTitle">' + key + '</span> <span class="editDelete edit">Edit</span> <span class="editDelete delete">Delete</span></h2>').append(list);
        if (entity.find('.catMainTitle').text().trim() == 'Not Sorted') {
            entity.find('.editDelete').remove();
        }
        $('#catMainList').append(entity);
    });

    $('#contentContainer').append('<button id="addCat">Add New Category</button>');
    $('#addCat').bind('click', function (e) {
        var list = $('<ul>', {
                "class": "catList"
            }).append('<li><span class="emptyCat">Category Empty</span></li>');

        $('#catMainList').prepend($('<li>').append('<h2 class="catTitle"><span class="catMainTitle">New Category</span> <span class="editDelete edit">Edit</span> <span class="editDelete delete">Delete</span></h2>').append(list));

        saveCategoryList();
    });

    $('#catMainList').on('click', '.delete', function () {
        var cont = $(this);
        if ($(this).closest('li').find('ul li').lenght != 0) {
            $('#catMainList .catTitle').each(function () {
                if ($(this).text().trim() == 'Not Sorted') {
                    $(this).closest('li').find('ul').append(cont.closest('li').find('li'));
                    return false;
                }
            });
        }

        $(this).closest('li').remove();
        saveCategoryList();
    });

    $('#catMainList').on('click', '.edit', function () {
        var title = $(this).closest('li').find('.catMainTitle');
        var titleName = $(this).closest('li').find('.catMainTitle').text().trim();
        title.replaceWith('<input id="titleInput" value="' + titleName + '">')

        $('#titleInput').focus().select();

        $('#titleInput').bind('blur', function () {
            $(this).replaceWith('<span class="catMainTitle">' + $(this).val() + '</span>');
            saveCategoryList();
        });

        $('#titleInput').keyup(function (e) {
            if (e.keyCode == 13) {
                $(this).replaceWith('<span class="catMainTitle">' + $(this).val() + '</span>');
                saveCategoryList();
            }
        });
    });

    $("#catMainList").sortable({
        nested: false,
        handle: '.catTitle',
        exclude: '.editDelete',
        onDrop: function ($item, container, _super) {
            var $clonedItem = $('<li/>').css('height', $item.outerHeight() + 'px').attr('class', 'swipeHolder');
            $item.before($clonedItem);

            $item.animate($clonedItem.position(), function () {
                $clonedItem.detach();
                _super($item, container);
            });

            saveCategoryList();
        },
        onDragStart: function ($item, container, _super) {
            var offset = $item.offset(),
            pointer = container.rootGroup.pointer;

            adjustment = {
                left: pointer.left - offset.left,
                top: pointer.top - offset.top
            };

            _super($item, container);
        },
        onDrag: function ($item, position) {
            $item.css({
                left: position.left - adjustment.left,
                top: position.top - adjustment.top
            });
        }
    });

    restartSortableFavList();
}

/**
 * Restart the List-List Sort
 */
var restartSortableFavList = function () {
    if (typeof window.favSortList !== 'undefined') {
        window.favSortList.sortable("destroy");
    }

    window.favSortList = $("#catMainList ul").sortable({
            nested: false,
            group: 'favOnList',
            onDrop: function ($item, container, _super) {
                var $clonedItem = $('<li/>');
                $item.before($clonedItem);

                $item.animate($clonedItem.position(), function () {
                    $clonedItem.detach();
                    _super($item, container);
                });

                saveCategoryList();
            },
            onDragStart: function ($item, container, _super) {
                var offset = $item.offset(),
                pointer = container.rootGroup.pointer;

                adjustment = {
                    left: pointer.left - offset.left,
                    top: pointer.top - offset.top
                };

                _super($item, container);
            },
            onDrag: function ($item, position) {
                $item.css({
                    left: position.left - adjustment.left,
                    top: position.top - adjustment.top
                });
            }
        });
}

/**
 * Get a listsort element.
 * @param i {Number} - Index
 * @param favObj {Object} - Favorite Object
 * @return {JQuery}
 */
var getCatFavRow = function (i, favObj) {
    var index = '<div class="catFavIndex">' + i + '</div>';
    var title = '<div class="catFavTitle">' + favObj.FullName + '</div>';
    var season = '<div class="catFavSeason ' + ((favObj.IsWatched) ? 'catFavWatched' : '') + '">' + ((favObj.FavSeason == 0) ? 'Specials' : 'Season ' + favObj.FavSeason) + '</div>';

    return $("<li>", {
        'class': 'catFavEntitly',
        'dataId': favObj.Id
    }).html(index + title + season);
}

/**
 * Clean Lists and Save all Sortings
 */
var saveCategoryList = function () {
    var returnObj = {};
    $('#catMainList ul').each(function () {
        if ($(this).find('li').length == 0) {
            $(this).append('<li><span class="emptyCat">Category Empty</span></li>');
        } else if ($(this).find('li').length > 1) {
            $(this).find('.emptyCat').parent().remove();
        }

        var title = $(this).prev('h2').find('.catMainTitle').text().trim();
        if (title != 'Not Sorted') {
            returnObj[title] = [];

            $(this).find('li').each(function (index, value) {
                if (typeof $(this).attr('dataid') !== 'undefined') {
                    $(this).find('.catFavIndex').text(index + 1)
                    returnObj[title].push($(this).attr('dataid'));
                }
            });
        }

        $(this).find('li[dataid]').each(function (index, value) {
            if (typeof $(this).attr('dataid') !== 'undefined') {
                $(this).find('.catFavIndex').text(index + 1)
            }
        });
    });

    restartSortableFavList();
    setCatFavs(returnObj);
    $('#favReload').click();
}
