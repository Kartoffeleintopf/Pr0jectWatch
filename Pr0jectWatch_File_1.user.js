﻿// ==UserScript==
// @name        Project Watch - File 1
// @icon 		https://bs.to/opengraph.jpg
// @namespace   https://bs.to/
// @include     /^https:\/\/bs.to(\/)?(((home|\?next|\?error|\?back|\?logout[^]*)[^\/]*)(\/)?)?$/
// @version    	1.0
// @description	Error-, Next-Redirect
// @author     	Kartoffeleintopf
// @run-at 		document-start
// @require 	https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/Universal/scripts/data.js
// @require     https://kartoffeleintopf.github.io/Pr0jectWatch/Universal/scripts/initPage.js
// ==/UserScript==

/**
 * Redirects to next Episode or season
 */
var redirectStart = function () {
    //Black page over original
    makeBlackPage();

    //Get the current lastplayed episode
    var series = getData('lastSeries');
    var season = getData('lastSeason');
    var episode = getData('lastEpisode');

    //Check error on cookies and fuck you
    if (/^https:\/\/bs.to(\/home)?\/?$/.test(window.location.href)) {
        //You know ?!
        setData('errorCode', 0);
        setData('autoplay', false);
        setData('lastSeries', 'none');
        setData('lastSeason', 'none');
        setData('lastEpisode', 'none');
             
        if (getData('beforeLogout', 'notSet') !== 'notSet') {
            var linkRef = getData('beforeLogout', 'https://bs.to/serie-genre');
            setData('beforeLogout', 'notSet');
            window.location = linkRef;
        } else {
            window.location = 'https://bs.to/serie-genre';
        }
    } else if (/^https:\/\/bs.to\/\?logout[^]*$/.test(window.location.href)) {
        setData('beforeLogout', jDecode(getGetter('redirect', 'https://bs.to/')));
        window.location = 'https://bs.to/logout';
    } else if (typeof series === 'undefined' ||
        typeof season === 'undefined' ||
        typeof episode === 'undefined') {

        alert('Enable cookies!!!');
        setData('autoplay', false);
        setData('errorCode', 0);
        window.location = 'https://bs.to/';
    } else if (window.location.href == 'https://bs.to/?error') {
        //Update the current errorcode to the next hoster
        setData('errorCode', getData('errorCode', 0) + 1);

        //And try it again
        window.location = 'https://bs.to/serie/' + series + '/' + season + '/' + episode;
    } else if (/^https:\/\/bs.to\/\?next[^\/]*$/.test(window.location.href)) {
        //Errorcode reset
        setData('errorCode', 0);

        var isAutoplay = getGetter('autoplay', 'none');
        if (isAutoplay !== 'none') {
            setData('autoplay', isAutoplay == 'true');
        }

        //Open the last season for next episode
        window.location = 'https://bs.to/serie/' + series + '/' + season;
    }
}
redirectStart();