This is my version of <a target="_blank" href="https://github.com/Chimildic/goofy">Goofy, written by Chimildic</a>. Detail about how to use and install is best found there, and I'm sure my changes can be reverse engineered.
My configuration for this is in the examples folder, feel free to explore. There are some minor additions in the library file, but most of the heavy lifting is performed by `main`.

**NOTE:** Spotify has updated its API policy. Many API functions are no longer available for apps in the "in development" status, which any application created from this code will be.

**What was affected?**

- Any generated playlist or playlist authored by Spotify is no longer available, as well as playlists from categories.
- You cannot receive recommendations, both for tracks and for similar artists.
- You cannot receive track features (tempo, energy, danceability, etc.).
