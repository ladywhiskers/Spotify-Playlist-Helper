# Intstallation

To use Spotify-Playlist-Helper, you need to create your own copy of the library. 

1. Go to the [Spotify Dashboard](https://developer.spotify.com/dashboard/) and click `Log in`.

2. Click the `create app` button and fill out the form as in the screenshot:

   ![Create an app](img/install-step-create-app.png ':size=40%')

3. Go to the [library in Apps Script](https://script.google.com/d/1EBdTR2yHrN2NHvLmcLQ76FFMBZrGTtURkFZclVfDRqMg8Rn-Hgo-1OKg/edit?usp=sharing). Sign in to your Google account if prompted.

4. Select `Overview` from the drop-down menu on the left.

![Open menu](/docs/img/general-property.gif ':size=60%')

On the page that opens, on the right, `Create a copy`. A copy created on your account will open. Rename it if necessary (click on the name at the top of the page).

![Create a copy](/docs/img/install-step-copy.png)

5. Go to the `config.gs` file. Insert `CLIENT_ID` and `CLIENT_SECRET` instead of `Your-Value`. Take the values ​​​​from the Spotify application you created in step 2 (the `Settings` button).

![Client ID and Client Secret](/docs/img/install-step-client-id2.png)

6. Specify values ​​for `PRIVATE_CLIENT_ID` and `PRIVATE_CLIENT_SECRET` obtained [here](https://script.google.com/macros/s/AKfycbwwDT25i71nYAk1aICxnrXfFVDzctcmhRMqzugjEkpqmUWjGATAbMOCL5aqvlPXOIq4/exec):

Save the change <kbd>Ctrl</kbd><kbd>S</kbd> or the floppy disk icon on the action bar

7. Run the `setProperties` function in the editor.

![run setProperties](/docs/img/install-run-setProperties.png)

You will see a pop-up message asking you to grant access rights. Agree to grant it.

![request for rights](/docs/img/install-permission-request.png ':size=50%')

Select the Google account you used to create the copy of the library.

![Select account](/docs/img/install-step-account.png)

Click `Additional settings`, then `Go to the "Copy of Goofy (Ver. 1)" page`

![Select account](/docs/img/install-step-warning.png ':size=50%')

Click the `Allow` button at the bottom of the window.

![Select account](/docs/img/install-step-grant-permissions.png)

8. The window will close. Select `Deploy` - `Test Deployment`

![Deploy Web App](/docs/img/install-step-webapp.png ':size=40%')

Follow the link from the `web app`.

9. Go back to the [Spotify Dashboad](https://developer.spotify.com/dashboard/). In your app's `settings`, scroll down and click the `edit` button

Paste the `https://ladywhiskers.github.io/Spotify-Playlist-Helper-auth/auth` link into the `Redirect URIs` field. Click the `ADD` button on the right, then the `Save` button at the bottom.

10. Switch to the tab from step 8 and refresh the page (`F5`). Grant access rights.

Installation and configuration are complete. Go to the [first playlist](/first-playlist).
