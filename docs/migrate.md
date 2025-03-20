# Migration

## Version 2.0

The new Spotify API policy has restricted access to important features. More details [here](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api).
To regain access in goofy 2.0, requests are split between two applications: yours and a private one. Currently, the private application continues to respond to requests to the closed part of the API.

1. Go to [Spotify Dashboard](https://developer.spotify.com/dashboard)
2. Select the application for goofy
3. Click the `Settings` button
4. Check the status in the `App Status` field (you will need this later)
5. Scroll down and add a new link to `Redirect URLs`: `https://chimildic.github.io/spotify/auth`
6. Open the project in Apps Script
7. Go to the `config` file and add two new lines to the `setProperties` function. Example of how it should look [here](https://github.com/Chimildic/goofy/blob/main/config.js).

```js
UserProperties.setProperty("PRIVATE_CLIENT_ID", "yourValue");
UserProperties.setProperty("PRIVATE_CLIENT_SECRET", "yourValue");
```

- If your status is `Development mode`, follow [this link](https://script.google.com/macros/s/AKfycbwwDT25i71nYAk1aICxnrXfFVDzctcmhRMqzugjEkpqmUWjGATAbMOCL5aqvlPXOIq4/exec) to get values for the private application.

- If your status is `Granted quota extension`, duplicate your values from the `CLIENT_ID` and `CLIENT_SECRET` lines. You can also help others gain access to the closed API. Report your status in the [Telegram chat](https://t.me/forum_goofy).

8. Copy the following function into the `config` file and run it.

```js
function reset() {
  Admin.reset();
  setProperties();
}
```

9. [Update](https://ladywhiskers.github.io/Spotify-Playlist-Helper/#/tuning?id=Обновить-библиотеку) the main library code as before (by default, the `library` file)
10. Update access rights: `start deployment` > `test deployments` > follow the link `web application` and follow the instructions that appear
