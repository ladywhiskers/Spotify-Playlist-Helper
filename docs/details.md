# How it works
The main principle of operation is based on the use of JavaScript functions to create an algorithm that automates various tasks. For example, finding favorite tracks that haven't been listened to for a long time.

The algorithm runs on the Google Apps Script platform, meaning tasks are executed on a schedule without your intervention.

?> When installing or changing the version, a single request is sent to Google Forms to get an idea of how many users are actively using goofy.

## Differences from Smarter Playlists

The main difference lies in the way the algorithm is constructed. Smarter Playlists uses a visual language, a diagram. In the case of goofy, a programming language is used.

An example of the following algorithm in Smarter Playlists: take tracks from two playlists, perform a random sort, save the first 50 tracks in a new playlist.

![Example of creating a playlist in Smarter Playlists](/img/SmarterPlaylistsExample1.png)

Now the same with goofy:
```js
let tracks = Source.getTracks([
  { name: 'Mix of the Day 1', id: '123' },
  { name: 'Mix of the Day 2', id: '456' },
]);

Order.shuffle(tracks);

Playlist.saveAsNew({
  name: 'Personal Mix of the Day',
  tracks: Selector.sliceFirst(tracks, 50),
});
```

## Listening History

goofy automatically tracks your listening history. When the limit (60,000) is reached, new listens are still saved by deleting the oldest ones. The tracking process starts immediately after setup is complete. Listens that occurred before setup will not be included in the list. However, there is a way to add them manually if you have last.fm.

?> You can [add](https://support.last.fm/t/how-to-add-scrobbles-history-from-spotify-to-last-fm/40038) listening history to a new last.fm account that existed before the account was created.

Spotify API has a function to get listening history. But *a maximum* of the last 50 tracks that have been listened to for more than 30 seconds. Podcasts and tracks listened to in private mode are not included in the history.

goofy can track history thanks to the Apps Script platform and its access to Google Drive. Every 15 minutes, goofy contacts Spotify and updates the file on the drive with new data.

Theoretically, the history limit can be increased to 100,000. But there is a question of performance within the limits of the Apps Script platform, disk space availability, and overall feasibility of such an array. Since in most cases, such a history is needed to remove tracks from newly created playlists. Tasks for compiling a top list are easily solved by other means if you have Last.fm.

Last.fm can track Spotify listens itself (connect in [profile](https://www.last.fm/settings/applications)). But all of the above does not allow you to intercept quick skips of tracks. There are two solutions for this:

- The first is detailed [on the forum](https://github.com/Chimildic/goofy/discussions/53).
- The second is to disable Last.fm tracking and use third-party programs for PC and smartphone that allow you to set an interval of a few seconds after which the track is saved to the history. For example, [Pano Scrobbler](https://4pda.to/forum/index.php?showtopic=887068).

In practice, the Spotify API works inconsistently. A track after 30 seconds may return with a delay or be lost altogether. The problem is on Spotify's side and is not resolved. However, together with Last.fm, this becomes quite insignificant.

If you often listen to downloaded tracks without an internet connection, use third-party scrobblers as in the example above. They allow you to save listens locally and remove the dependency on offline and Spotify failures. If offline listening is a rare scenario, connecting through the profile is sufficient.

## Restrictions 

?> Some details may be unclear at first glance

The library is subject to platform limitations. Below is a description of specific metrics and their impact based on reference information provided by the platforms.

### Apps Script {docsify-ignore}
- Script execution (6 minutes / one execution)

  - The total maximum duration of *one* script run. Generally, lightweight templates complete in a matter of seconds. Approaching a minute or more is possible in the case of a large volume of input and/or output data.
  - For example, the [getFollowedTracks](/reference/source?id=getfollowedtracks) function for the user [spotify](https://open.spotify.com/user/spotify) and the `owned` argument typically runs for 4 minutes. During this time, it retrieves 1.4 thousand playlists and 102 thousand tracks. After removing duplicates, 78 thousand remain.
  - If you call [rangeTracks](/reference/filter?id=rangetracks) for 78 thousand tracks, the 6-minute limit will be exceeded. However, by discarding unsuitable tracks in advance, for example, using [rangeDateRel](/reference/filter?id=rangedaterel), [match](/reference/filter?id=match), and others, you can significantly and quickly reduce the number of tracks.

- Number of requests (20 thousand / day)

  - Typically, 1 request to Spotify retrieves 50 playlists or 50 tracks. In some cases, 100.
  - The example above retrieved 1.4 thousand playlists and 102 thousand tracks with 1,735 requests.
  - Retrieving 11 thousand tracks from a playlist takes 110 requests and 25 seconds. Approximately the same amount of time is needed to create a playlist with that many tracks.
  - Retrieving 10 thousand favorite tracks takes 200 requests.
  - Overall, it is difficult to imagine a function requiring 20 thousand requests due to the 6-minute execution limit. For this reason, it is not possible to bypass all playlists of robot-users with thousands of playlists. But a personal profile or medium-sized authors can be handled.

- Trigger execution (90 minutes / day)

  - The total maximum duration of trigger execution. The only way to reach the limit is to call a 6-minute function 15 times in one day. It is hard to imagine a task that would require this and justify itself.

- Number of triggers (20 / user / script)
  
  - Roughly speaking, this is 20 playlists created on completely *different* schedules.
  - In practice, several functions can be called from one other function, allowing the creation of N playlists with one trigger. More details [here](/best-practices?id=Trigger-Economy).
  - Additionally, you can create another copy of the library and also get a quota for 20 triggers.
  
    > If you need to create another copy, you can reuse the CLIENT_ID and CLIENT_SECRET values and not create a new application on the Spotify side.

Other Apps Script limitations do not apply to the library. They are related to mail, spreadsheets, and other services. Or they are unattainable due to Spotify Web API limitations. More details [here](https://developers.google.com/apps-script/guides/services/quotas).

### Web API Spotify {docsify-ignore}
- Local files are ignored. [The API does not allow](https://developer.spotify.com/documentation/general/guides/local-files-spotify-playlists/) adding such tracks to new playlists and they practically do not contain data for filtering or sorting.
  

- Number of tracks 
  - Up to 11,000  tracks can be added to a playlist.
  - Up to 11,000 tracks can be retrieved from a single playlist.
  - Up to 20,000 favorite tracks.
  - The number of tracks for filtering, sorting, and selection is unlimited. But within the Apps Script quota.
- Number of playlists
  - Theoretically up to 11,000, but the Apps Script quota will not be enough to retrieve tracks from them. The real value is within 2,0000. It depends on the total number of tracks.
- Number of requests
  - There is no exact number. With too many requests in a short period, errors 500, 503, and similar may appear. They pass after a pause.
  
### Google Drive {docsify-ignore}
- The size of one text file is limited to 50 MB. To reduce the volume, you can use the [Cache.compressTracks](/reference/cache?id=compresstracks) function. Experimentally, it was possible to create a file with 100 thousand **compressed** tracks and fit within 50 MB.
