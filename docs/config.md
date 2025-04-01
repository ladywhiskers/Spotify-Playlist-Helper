# Parameters

Description of parameters from the `config` file

## API

- `CLIENT_ID` and `CLIENT_SECRET` (string) - keys for accessing the Spotify Web API. Created during [initial setup](/install).

- `LASTFM_API_KEY` (string) - key for working with the Last.fm API. Created [additionally](/tuning?id=lastfm-setup).

- `MUSIXMATCH_API_KEY` (string) - key from the musixmatch service for the [detectLanguage](/reference/filter?id=detectlanguage) function. Created [additionally](/tuning?id=Настройка-musicmatch).

## Listening History

- `ON_SPOTIFY_RECENT_TRACKS` (boolean) - when `true`, tracks Spotify listening history. When `false`, disables it.

- `ON_LASTFM_RECENT_TRACKS` (boolean) - when `true`, tracks Last.fm listening history. When `false`, disables it.

- `LASTFM_LOGIN` (string) - Last.fm user login whose history is being collected. Used by default and in other module functions.

- `LASTFM_RANGE_RECENT_TRACKS` (number) - number of recent tracks viewed in Last.fm history for the past 15 minutes.

- `COUNT_RECENT_TRACKS` (number) - number of saved history tracks. Default is 20,000. In practice, it works fine with 40,000. The limit is a file size of 50 MB.

## General

- `LOG_LEVEL` (string) - when `info`, displays information and error messages from library functions. When `error`, only error messages. An empty string disables messages. The default value is set in the `config` parameters, effective at each startup. In your code, you can change the log level for the current execution with `Admin.setLogLevelOnce('value')`.

- `LOCALE` (string) - locale when requesting playlists. Affects how track names are presented. Default value is `AU`.

- `REQUESTS_IN_ROW` (number) - number of parallel requests sent when possible. Default is 40. Affects the speed of data retrieval, such as playlist tracks. If you receive more `503` errors or have algorithms with a very high number of requests, it is recommended to lower this parameter. Increasing is not recommended.

- `MIN_DICE_RATING` (number) - minimum coefficient value from 0.0 to 1.0, at which an element is considered the best match when importing, for example, tracks into Spotify. Default is _0.6005_. If the found element has a lower value, it is discarded. When several elements meet the minimum value, the one with the highest value is chosen.
