# Advanced Tuning

## Update

### Update Library

Replace all contents of the `library.gs` file with the new content using <kbd>Ctrl</kbd><kbd>A</kbd> and <kbd>Ctrl</kbd><kbd>V</kbd>, which can be found [here](https://github.com/Chimildic/goofy/blob/main/library.js) or [here](https://script.google.com/d/1DnC4H7yjqPV2unMZ_nmB-1bDSJT9wQUJ7Wq-ijF4Nc7Fl3qnbT0FkPSr/edit?usp=sharing) using <kbd>Ctrl</kbd><kbd>A</kbd> and <kbd>Ctrl</kbd><kbd>C</kbd>, and save the file.

### Update Parameters

1. Change the required parameter in the `config.gs` file (the current list is [here](https://github.com/ladywhiskers/Spotify-Playlist-Helper/blob/main/config.js))
2. Run the `setProperties` function in the editor

### Update Access Rights

When expanding the library's functions, additional access rights may be required. For example, to upload an image or access favorite tracks. If necessary, the [changelog](/changelog.md) of the next update will include instructions on updating access rights.

1. Insert the following function and run it once in the editor. After that, you can delete it.
    ```js
    function resetAuth(){
        Auth.reset();
    }
    ```
2. Click `start deployment` - `test deployments` in the top menu of the editor
3. Copy the link from the opened window and open it in a new tab
4. Click `Authorize` and confirm the new access rights

## Time Zone

To work with dates in your time zone, follow these steps:

1. Find your time zone [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). You need the value from the second column. For example, `Europe/Moscow`.
2. Go to the project settings (menu on the left), check the box next to `Show appsscript.json manifest file in editor`.
3. Go to the `appsscript.json` file and change the value of `timeZone` to yours, save the change.
4. Return to the project settings and disable the visibility of the `appsscript.json` file.

## Last.fm Setup

Required for the [Last.fm](/reference/lastfm) module. If not used, no need to perform.

1. Connect Spotify to Last.fm [here](https://www.last.fm/settings/applications)
2. Create an entry point [here](https://www.last.fm/api/account/create). Fill in the name and description arbitrarily. Skip the rest, leave it blank.
3. Assign the obtained `API key` to the `LASTFM_API_KEY` parameter. Also, specify your login in `LASTFM_LOGIN`. And set `true` for `ON_LASTFM_RECENT_TRACKS`.
4. Run the `setProperties` function in the editor.

![Lastfm account api](/img/lastfm_account_api3.png)

## Musixmatch Setup

Required for the [detectLanguage](/reference/filter?id=detectlanguage) function. If not used, no need to perform.

1. Go to the [developer.musixmatch.com](https://developer.musixmatch.com/signup) website to register and get an API key. Fill in the phone and address arbitrarily (123 and World, for example). The email must be real, it will ask for confirmation.
2. After confirming the email, go to the [applications dashboard](https://developer.musixmatch.com/admin/applications). Copy the key.
3. Insert it into the parameters from the `config` file and run the `setProperties` function.
