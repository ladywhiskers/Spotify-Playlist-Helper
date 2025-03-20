# Player

Player control methods.

| Method | Result Type | Brief Description |
|--------|-------------|-------------------|
| [addToQueue](/reference/player?id=addtoqueue) | - | Add tracks to the playback queue. |
| [getAvailableDevices](/reference/player?id=getavailabledevices) | Array | Get a list of available devices. |
| [getPlayback](/reference/player?id=getplayback) | Object | Get player data, including the currently playing track. |
| [next](/reference/player?id=next) | - | Skip to the next track in the queue. |
| [pause](/reference/player?id=pause) | - | Pause the current player. |
| [previous](/reference/player?id=previous) | - | Skip to the previous track in the queue. |
| [resume](/reference/player?id=resume) | - | Resume playback of the current queue or create a new queue. |
| [setRepeatMode](/reference/player?id=setrepeatmode) | - | Set the repeat mode. |
| [toggleShuffle](/reference/player?id=toggleshuffle) | - | Toggle shuffle mode for the queue. |
| [transferPlayback](/reference/player?id=transferplayback) | - | Transfer the current playback to another device. |

## addToQueue

Add tracks to the playback queue. Equivalent to _play next_ in the Spotify interface.

### Arguments :id=addtoqueue-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `items` | Array/Object | Array of tracks or a track object to add to the queue. Only the _id_ is significant. |
| `deviceId` | String | Device identifier. Optional if playback is active. |

### Return :id=addtoqueue-return {docsify-ignore}

No return value.

### Examples :id=addtoqueue-examples {docsify-ignore}

1. Play the last added liked track next.

```js
let tracks = Source.getSavedTracks(1);
Player.addToQueue(tracks[0]);
```

## getAvailableDevices

Get a list of available devices (currently connected to Spotify). Use to get the device _id_. The value from `getPlayback` becomes empty quickly when paused.

### Arguments :id=getavailabledevices-arguments {docsify-ignore}

No arguments.

### Return :id=getavailabledevices-return {docsify-ignore}

`devices` (array) - available devices. [Example array](https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-a-users-available-devices).

### Examples :id=getavailabledevices-examples {docsify-ignore}

1. Select a device by type. `Smartphone` for phone, `Computer` for PC.

```js
let device = Player.getAvailableDevices().find(d => d.type == 'Smartphone');
// device.id
```

## getPlayback

Get player data, including the currently playing track. Becomes empty quickly when paused.

### Arguments :id=getplayback-arguments {docsify-ignore}

No arguments.

### Return :id=getplayback-return {docsify-ignore}

`playback` (object) - player data. [Example object](https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-information-about-the-users-current-playback).

### Examples :id=getplayback-examples {docsify-ignore}

[Example usage](https://github.com/Chimildic/goofy/discussions/102)

## next

Skip to the next track in the queue.

### Arguments :id=next-arguments {docsify-ignore}

No arguments.

### Return :id=next-return {docsify-ignore}

No return value.

## pause

Pause the current player.

### Arguments :id=pause-arguments {docsify-ignore}

No arguments.

### Return :id=pause-return {docsify-ignore}

No return value.

## previous

Skip to the previous track in the queue.

### Arguments :id=previous-arguments {docsify-ignore}

No arguments.

### Return :id=previous-return {docsify-ignore}

No return value.

## resume

Resume playback of the current queue or create a new queue.

### Arguments :id=resume-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `params` | Object | Queue parameters. |

#### Queue Parameters :id=resume-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `deviceId` | String | Device identifier. Optional if playback is active. |
| `context_uri` | String | Play by URI, such as a playlist or album. |
| `tracks` | Array | Create a new queue with tracks. Either `context_uri` or `tracks` is used. |
| `position_ms` | Number | Set track progress in milliseconds. |
| `offset` | Number | Set the active track in the queue `{ "position": 5 }`. Zero-based. |

### Return :id=resume-return {docsify-ignore}

No return value.

### Examples :id=resume-examples {docsify-ignore}

1. Resume playback after a pause.

```js
Player.pause();
Utilities.sleep(5000);
Player.resume();
```

2. Create a queue from favorite tracks

```js
let tracks = Source.getSavedTracks();
Player.resume({
    tracks: tracks
});
```

3. Play a playlist by URI

```js
let playlistId = '37i9dQZF1DWYmDNATMglFU';
Player.resume({
    context_uri: `spotify:playlist:${playlistId}`,
});
```

## setRepeatMode

Set the repeat mode.

### Arguments :id=setrepeatmode-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `state` | String | `track` to repeat the current track, `context` to repeat the current queue, `off` to disable. |
| `deviceId` | String | Device identifier. Optional if playback is active. |

### Return :id=setrepeatmode-return {docsify-ignore}

No return value.

## toggleShuffle

Toggle shuffle mode for the queue.

### Arguments :id=toggleshuffle-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `state` | String | `true` to enable shuffle, `false` to disable. |
| `deviceId` | String | Device identifier. Optional if playback is active. |

### Return :id=toggleshuffle-return {docsify-ignore}

No return value.

## transferPlayback

Transfer the current playback to another device (i.e., queue and playing track, [getPlayback](/reference/player?id=getplayback)).

### Arguments :id=transferplayback-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `deviceId` | String | _id_ of the new device. Available values can be obtained, for example, through [getAvailableDevices](/reference/player?id=getavailabledevices). |
| `isPlay` | Boolean | `true` to start playback on the new device. If not specified or `false`, the state will remain the same as on the previous device. |

### Return :id=transferplayback-return {docsify-ignore}

No return value.

### Examples :id=transferplayback-examples {docsify-ignore}

[Example usage](https://github.com/Chimildic/goofy/discussions/126)
