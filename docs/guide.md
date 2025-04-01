# Additional

# Parameters

Description of parameters from the `config` file

## API

- `CLIENT_ID` and `CLIENT_SECRET` (string) - keys for accessing Spotify Web API. Created during [first installation](/install).

- `LASTFM_API_KEY` (string) - key for working with Last.fm API. Created [additionally](/tuning?id=Settings-lastfm).

- `MUSIXMATCH_API_KEY` (string) - key from the musixmatch service for the [detectLanguage](/reference/filter?id=detectlanguage) function. Created [additionally](/tuning?id=Settings-musicmatch).

## Listening history

- `ON_SPOTIFY_RECENT_TRACKS` (boolean) - if `true`, Spotify listening history is tracked. If `false`, it is disabled.

- `ON_LASTFM_RECENT_TRACKS` (boolean) - if `true`, Last.fm listening history is tracked. If `false`, it is disabled.

- `LASTFM_LOGIN` (string) - Last.fm user login whose history is being collected. Used by default and in other module functions.

- `LASTFM_RANGE_RECENT_TRACKS` (number) - number of recent tracks viewed in Last.fm history over the past 15 minutes.

- `COUNT_RECENT_TRACKS` (number) - number of history tracks to save. Default is 60 thousand. In practice, it works with larger values. The limit is a file size of 50 MB.

## General

- `LOG_LEVEL` (string) - when `info`, messages with information and errors from library functions are displayed. When `error`, only error messages are displayed. An empty string disables messages. The `config` parameters specify the default value that applies to each run. In your code, you can change the log level for the duration of the current execution `Admin.setLogLevelOnce('value')`.

- `LOCALE` (string) - the locale when requesting playlists. Affects how track names are presented. The default value is `AU`.

- `REQUESTS_IN_ROW` (number) - the number of parallel requests sent when possible. Defaults to 20. Affects the speed of data retrieval. For example, a request for playlist tracks. Increasing this is not recommended. Spotify started giving a shadow ban for a day or more (i.e. it stops responding to requests). If you continue to get banned, reduce the value to 10 or optimize the code to reduce the number of requests from the source.
- `MIN_DICE_RATING` (number) - the minimum coefficient value from 0.0 to 1.0 at which an item is considered the best match during imports, such as tracks in Spotify. The default is _0.6005_.  
  If the found item has a lower value, it is discarded. When multiple items satisfy the minimum value, the one with the highest value is selected.

# Identifier

The tables below show how to obtain an identifier from a link or URI.

## Playlist {docsify-ignore}

| id or playlistId       | URI                                         | Link                                                                                                            |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 5ErHcGR1VdYQmsrd6vVeSV | spotify:playlist:**5ErHcGR1VdYQmsrd6vVeSV** | [open.spotify.com/playlist/**5ErHcGR1VdYQmsrd6vVeSV**?si=123](open.spotify.com/playlist/5ErHcGR1VdYQmsrd6vVeSV) |
| 4vTwFTW4DytSY1N62itnwz | spotify:playlist:**4vTwFTW4DytSY1N62itnwz** | [open.spotify.com/playlist/**4vTwFTW4DytSY1N62itnwz**?si=123](open.spotify.com/playlist/4vTwFTW4DytSY1N62itnwz) |

## User {docsify-ignore}

For older accounts, it equals the username. For newer accounts, it is a sequence of letters and numbers.

| userId                    | URI                                        | Link                                                                                                   |
| ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| glennpmcdonald            | spotify:user:**glennpmcdonald**            | [open.spotify.com/user/**glennpmcdonald**](open.spotify.com/user/glennpmcdonald)                       |
| ldxdnznzgvvftcpw09kwqm151 | spotify:user:**ldxdnznzgvvftcpw09kwqm151** | [open.spotify.com/user/**ldxdnznzgvvftcpw09kwqm151**](open.spotify.com/user/ldxdnznzgvvftcpw09kwqm151) |

# Object Parameter Descriptions

The table describes the main keys of Spotify objects. The original can be read [here](https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/).

| Key                       | Range   | Description                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `popularity`              | 0 - 100 | Popularity of a track, artist, or album. Higher values indicate greater popularity.</br> <ul><li>Track: Calculated based on the total number of plays and their recency. Tracks with more recent plays are more popular than those with older plays. The value may lag by a few days and is not updated in real-time.</li> <li>Artist and Album: Calculated based on the popularity of their tracks.</li></ul> |
| `duration_ms`             | 0 - 0+  | Duration of the track in milliseconds ([calculator](https://www.google.com/search?q=minutes+to+milliseconds+calculator)). Useful for filtering out tracks with very short or very long durations by setting a minimum or maximum value.                                                                                                                                                                        |
| `explicit`                | boolean | Indicates the presence or absence of explicit content. In the [rangeTracks](/reference/filter?id=rangetracks) function, a value of `false` removes tracks with explicit content. A value of `true` or omitting this key keeps all tracks.                                                                                                                                                                      |
| `added_at`                | string  | The date the track was added to the playlist in string format. Example usage in the [Loved and Forgotten](/template?id=Loved-and-Forgotten) template.                                                                                                                                                                                                                                                          |
| `genres` and `ban_genres` | array   | Genres of the artist or album. Tests show that albums often have an empty list. In the [rangeTracks](/reference/filter?id=rangetracks) function, only tracks with at least one genre from the `genres` array and none from the `ban_genres` array are selected.                                                                                                                                                |
| `isRemoveUnknownGenre`    | boolean | If `true`, removes artists with an empty genre list (common for lesser-known artists). If `false`, keeps them. Default is `true`.                                                                                                                                                                                                                                                                              |
| `release_date`            | dates   | The period during which the album of the track was released, in date format ([format described here](/reference/filter?id=rangedateabs)). For example, between 2018 and 2020: `{ min: new Date('2018'), max: new Date('2020') }`                                                                                                                                                                               |

## Track Features {docsify-ignore}

| Key                | Range     | Description                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `acousticness`     | 0.0 - 1.0 | Confidence measure of whether the track is acoustic. A value of 1.0 indicates high confidence. ![Distribution of acousticness values](/img/acousticness.png)                                                                                                                                                                                                                        |
| `danceability`     | 0.0 - 1.0 | Measures how suitable a track is for dancing based on tempo, rhythm stability, beat strength, and overall regularity. Less danceable tracks are closer to 0.0, while more danceable ones are closer to 1.0. ![Distribution of danceability values](/img/danceability.png)                                                                                                           |
| `energy`           | 0.0 - 1.0 | Measures the intensity and activity of a track. Energetic tracks are typically fast, loud, and noisy, such as death metal tracks. Calculated based on dynamic range, perceived loudness, timbre, onset rate, and general entropy. Less energetic tracks are closer to 0.0, while more energetic ones are closer to 1.0. ![Distribution of energy values](/img/energy.png)           |
| `instrumentalness` | 0.0 - 1.0 | Predicts whether a track contains no vocals. For example, rap or spoken word tracks are clearly "vocal." The closer the value is to 1.0, the more likely the track is instrumental. Values above 0.5 are interpreted as instrumental, with higher confidence as the value approaches 1.0. ![Distribution of instrumentalness values](/img/instrumentalness.png)                     |
| `liveness`         | 0.0 - 1.0 | Detects the presence of an audience in the recording. Values above 0.8 indicate a high probability of a live track. ![Distribution of liveness values](/img/liveness.png)                                                                                                                                                                                                           |
| `loudness`         | -60 to 0  | Overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track. Useful for comparing the relative loudness of tracks. Typically ranges from -60 to 0 dB. ![Distribution of loudness values](/img/loudness.png)                                                                                                                                  |
| `speechiness`      | 0.0 - 1.0 | Measures the presence of spoken words in a track. Values closer to 1.0 characterize tracks as talk shows, podcasts, or audiobooks. Tracks with values above 0.66 are likely entirely spoken. Values between 0.33 and 0.66 may contain both speech and music. Below 0.33 is typical for music and tracks without speech. ![Distribution of speechiness values](/img/speechiness.png) |
| `valence`          | 0.0 - 1.0 | Describes the musical positiveness of a track. Higher values indicate a more positive, happy mood. Lower values indicate a more negative, sad, or depressed mood. ![Distribution of valence values](/img/valence.png)                                                                                                                                                               |
| `tempo`            | 30 - 210  | The overall tempo of a track in beats per minute (BPM). ![Distribution of tempo values](/img/tempo.png)                                                                                                                                                                                                                                                                             |
| `key`              | 0+        | The key of the track. Values are based on [Pitch Class](https://en.wikipedia.org/wiki/Pitch_class). For example, 0 = C, 1 = C♯/D♭, 2 = D, and so on. If the key is not set, the value is -1.                                                                                                                                                                                        |
| `mode`             | 0 or 1    | Modality of the track. Major = 1, Minor = 0.                                                                                                                                                                                                                                                                                                                                        |
| `time_signature`   | 1+        | An estimated overall time signature of a track, indicating the number of beats in each bar.                                                                                                                                                                                                                                                                                         |

# Genres for Recommendations

This list is only needed for [getRecomTracks](/reference/source?id=getrecomtracks). In [rangeTracks](/reference/filter?id=rangetracks), you can use [this list](http://everynoise.com/everynoise1d.cgi?scope=all).

```
a: acoustic, afrobeat, alt-rock, alternative, ambient, anime,
b: black-metal, bluegrass, blues, bossanova, brazil, breakbeat, british,
c: cantopop, chicago-house, children, chill, classical, club, comedy, country,
d: dance, dancehall, death-metal, deep-house, detroit-techno, disco, disney, drum-and-bass, dub, dubstep,
e: edm, electro, electronic, emo,
f: folk, forro, french, funk,
g: garage, german, gospel, goth, grindcore, groove, grunge, guitar,
h: happy, hard-rock, hardcore, hardstyle, heavy-metal, hip-hop, holidays, honky-tonk, house,
i: idm, indian, indie, indie-pop, industrial, iranian,
j: j-dance, j-idol, j-pop, j-rock, jazz,
k: k-pop, kids,
l: latin, latino,
m: malay, mandopop, metal, metal-misc, metalcore, minimal-techno, movies, mpb,
n: new-age, new-release,
o: opera,
p: pagode, party, philippines-opm, piano, pop, pop-film, post-dubstep, power-pop, progressive-house, psych-rock, punk, punk-rock,
r: r-n-b, rainy-day, reggae, reggaeton, road-trip, rock, rock-n-roll, rockabilly, romance,
s: sad, salsa, samba, sertanejo, show-tunes, singer-songwriter, ska, sleep, songwriter, soul, soundtracks,
spanish, study, summer, swedish, synth-pop,
t: tango, techno, trance, trip-hop, turkish,
w: work-out, world-music
```

# Playlist Categories

To get a list of available categories for a country, run the following code. Results will appear in the logs.

```js
let listCategory = Source.getListCategory({ limit: 50, country: "US" });
console.log(listCategory.map((c) => "\n" + c.name + "\n" + c.id).join("\n"));
```
