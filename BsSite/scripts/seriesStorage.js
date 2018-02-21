/**
 * Get the Fulllist of Series.
 * @return {Object-Array}
 */
var getFullList = async function () {
    var list = await seriesStorage.storage('serieslist');
    if (!list) {
        list = [];
        await seriesStorage.storage('serieslist',list);
    }
    
    return list.sort((a, b) => a.FullName.localeCompare(b.FullName));
}

/**
 * Save List.
 * @param FullObjectListArray {Object-Array} - Full Log
 */
var saveList = async function (FullObjectListArray) {
    await seriesStorage.storage('serieslist',FullObjectListArray);
}

/**
 * Update The List Async-Promise.
 * @param Object {Object-Array} - Array with all Series.
 * @param listArray {Object-Array} - Array with Name and seriesId.
 * @param callback {Function} - Function with Param:Percent Loaded
 * @return Promise-Boolean.
 */
var updateList = async function (objectArray, listArray, callback) {
    var list = await getFullList();
    var canuUpdateIndex = (typeof listArray !== 'undefined' && listArray !== null);
    var callbackExist = (typeof callback === 'function');

    var index = 0;
    return new Promise(resolve => {
        var asyncFun = async function () {
            var i = list.findIndex(item => item.Id.toLowerCase() === objectArray[index].Id.toLowerCase());
            if (i == -1) {
                list.push(objectArray[index]);
                i = list.length - 1
            }

            if (canuUpdateIndex && list[i].SeriesIndex === null) {
                list[i].SeriesIndex = listArray.filter(a => a.elemText.toLowerCase() === list[i].FullName.toLowerCase())[0].dataId;
            }

            if (callbackExist) {
                callback(((index + 2) / objectArray.length) * 100);
            }

            if (++index < objectArray.length) {
                setTimeout(asyncFun, 0);
            } else {
                await saveList(list);
                resolve(true);
            }
        }
        asyncFun();
    });
}

/**
 * Return all Favorites.
 * @return {Object-Array}
 */
var getFavorites = async function () {
    return (await getFullList()).filter(obj => obj.IsFav == true);
}

/**
 * Update all Param of an object.
 * @param obj {Object} - Object needed param:Id
 */
var updateEntry = async function (obj) {
    
    //Wait Till Other Update Is Ready
    if(window.thereIsAlreadyAnUpdatingEntry === true){
        await new Promise(function(resolve){
            var checkingInterval = setInterval(function(){
                if(window.thereIsAlreadyAnUpdatingEntry !== true){
                    clearInterval(checkingInterval);
                    resolve(true);
                }
            },100);
        });
    }
  
    window.thereIsAlreadyAnUpdatingEntry = true;
  
    var list = await getFullList();

    var i = list.findIndex(item => item.Id.toLowerCase() == obj.Id.toLowerCase());
    if (i > -1) {
        if (obj.FullName !== null && typeof obj.FullName !== 'undefined') {
            list[i].FullName = obj.FullName;
        }

        if (obj.Genre !== null && typeof obj.Genre !== 'undefined') {
            list[i].Genre = obj.Genre;
        }

        if (obj.IsFav !== null && typeof obj.IsFav !== 'undefined') {
            list[i].IsFav = obj.IsFav;
        }

        if (obj.FavSeason !== null && typeof obj.FavSeason !== 'undefined') {
            list[i].FavSeason = obj.FavSeason;
        }

        if (obj.SeriesIndex !== null && typeof obj.SeriesIndex !== 'undefined') {
            list[i].SeriesIndex = obj.SeriesIndex;
        }

        if (obj.IsWatched !== null && typeof obj.IsWatched !== 'undefined') {
            list[i].IsWatched = obj.IsWatched;
        }

        if (obj.IsSynced !== null && typeof obj.IsSynced !== 'undefined') {
            list[i].IsSynced = obj.IsSynced;
        }
        
        if (obj.LastSeasonMax !== null && typeof obj.LastSeasonMax !== 'undefined') {
            list[i].LastSeasonMax = obj.LastSeasonMax;
        }
        
        if (obj.HasNewEpisode !== null && typeof obj.HasNewEpisode !== 'undefined') {
            list[i].HasNewEpisode = obj.HasNewEpisode;
        }

        await saveList(list);
    } else {
        alert(obj.Id + " does not exist");
    }
    
    window.thereIsAlreadyAnUpdatingEntry = false;
}