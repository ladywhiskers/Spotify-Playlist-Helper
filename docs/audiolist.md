# Audiolist

Starting from version `2.1`, goofy can accept requests from the [Audiolist Android app](https://play.google.com/store/apps/details?id=ru.chimildic.audiolist) and return a response if necessary.

## Setup

### goofy

1. Update goofy to the latest version ([library file](https://github.com/Chimildic/goofy/blob/main/library.js)). To migrate from version `1.x` to `2.x`, use the [migration guide](/migrate2).
2. In the code editor, click _start deployment_ > _new deployment_. Make sure the configuration with the web application and access for everyone is selected. Click _start deployment_.

    ![New Deployment](/img/new-deploy-audiolist.png ':size=60%')

3. Copy the `deployment identifier` and transfer it to the device with Audiolist installed in a convenient way.

    !> Do not share the identifier with other users. They will be able to run your functions.

### Audiolist

1. Create a program in Audiolist and add the `goofy function` command from the general list.
2. When filling out the command form, leave the fields with variables empty. Enter the `deployment identifier` obtained during the goofy setup. For example, use `Audiolist.hello` as the _function name_.

  ![Goofy Function Command](/img/goofy-command-audiolist.jpg ':size=60%')

3. Exit the program editor and run the program. If everything is done correctly, a message from goofy will appear in the logs.

## Usage

To ensure everything runs smoothly, three things are important:

1. The correct function name in the command settings. The case of the letters matters.
2. Returning the result. Audiolist uses a typed programming language and expects a relatively strict response format.
3. Updating the deployment with any changes to the goofy code. Deployment is an isolated copy. If you add/change a function and do not update the deployment, Audiolist will not be able to access it.

### Empty Response

```js
function doSomething() {
     // Your function's algorithm
     // ...

     // Return the result
     return Audiolist.response()
}
```

### Returning Text

In addition to text, you can specify the type: normal, warning, error. The type determines the color of the message in the logs. The program will not be interrupted.

```js
function doSomethingMessage() {
     // Your function's algorithm
     // ...

     let text = "This text will appear in the Audiolist logs"
     return Audiolist.responseMessage(text, Audiolist.MESSAGE_TYPES.WARNING)
}
```

### Returning Tracks

For Audiolist to convert an array of elements from goofy into a format it understands, you need to specify one of the `Audiolist.VARIABLE_TYPES`. The code example below returns 20 favorite Spotify tracks. However, in practice, such a function is pointless. Audiolist has its own commands for collecting tracks. It's easier to get the same favorite tracks without using goofy. But it will be useful for importing other sources (cache, radio, etc.).

```js
function doSomethingItems() {
     let tracks = Source.getSavedTracks(20)
     // ...

     return Audiolist.responseItems(tracks, Audiolist.VARIABLE_TYPES.SPOTIFY_TRACK)
}
```

### Complex Example

If you specify a data source for the "Goofy Function" command, Audiolist will send it to the specified function. At the same time, you can respond with both text and tracks.

```js
function complexExample(data) {
     let tracksFromAudiolist = data.items
     // ...

     let tracks = // ...

     return Audiolist.response({
          message: 'Message for logs',
          messageType: Audiolist.MESSAGE_TYPES.DEFAULT,
          variableType: Audiolist.VARIABLE_TYPES.SPOTIFY_TRACK,
          items: tracks,
     })
}
```

## Updating Deployment

Click _start deployment_ > _manage deployments_. In the left list, select Audiolist, click the edit button. Select _new version_ from the list and click _start deployment_.

Sometimes Apps Script resets deployment names (seems like a bug). You need to update the deployment whose identifier is specified in the "Goofy Function" command.

    ![New Deployment](/img/update-deploy-audiolist.png ':size=60%')

### Deployment Archive

Old deployment versions go to the archive. Apps Script sets a limit on the number of deployments (~200). If you reach the limit or just have many unnecessary versions, select _version history_ in the left menu of Apps Script. A _project history_ list will appear on the right. At the bottom of the list, there is a _bulk delete versions_ button. The current version will not be deleted.
