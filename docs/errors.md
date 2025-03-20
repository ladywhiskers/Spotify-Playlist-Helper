# Errors

If your error is not listed on this page, write to [Telegram](https://t.me/forum_goofy) or the [forum](https://github.com/Chimildic/goofy/discussions). Describe your actions in detail and include the code.

## Apps Script

| Error | Solution |
|-|-|
| Access not granted or expired | No access to Spotify. Often occurs due to a password change. Reauthorize (`start deployment` - `test deployment` - `web application`). |
| Exceeded maximum execution time | The function execution time [exceeded 6 minutes](/details?id=Limitations). If each run takes several minutes, review the algorithm, optimize according to the documentation notes and [best practices](/best-practices). Rarely observed in functions that usually complete in seconds. Currently explained by platform lag, as the error cannot be reproduced for debugging. |
| Limit exceeded | One of the platform limits has been exceeded. The classic limitations are described [here](/details?id=Limitations). If experimenting with other platform capabilities, there are [other limits](https://developers.google.com/apps-script/guides/services/quotas). |
| Service invoked too many times </br> Service using too much computer time for one day | A specific case of the previously described errors. The exact difference is unknown. In the best case, it will pass after a short pause. In the worst case, upon quota renewal, i.e., after a day. |
| Client ID is required | The saved parameters do not contain the Client ID from Spotify. Call the `setProperties` function from the `config` file. The `CLIENT_ID` and `CLIENT_SECRET` parameters should have values from the Spotify developer dashboard (not the text `yourValue`). |
| Address unavailable | The cause is unknown. When it occurs, a pause is automatically taken and the request is retried. Usually, the error does not occur on the second attempt. |
| Service error: Disk | The cause is unknown. Since version 1.5.4, an attempt is made to catch the error and retry the operation. |
| ReferenceError: Cheerio is not defined | Add the [Cheerio](https://github.com/Chimildic/goofy/discussions/91#discussioncomment-1931923) library. |

## Requests

| Status | Description |
|-|-|
| 400 | The server received an incorrect request. Write to the forum or Telegram if the error consistently reproduces. |
| 401 </br> 403 | The request is correctly formatted, but access is missing. [Update access rights](/tuning?id=Update-access-rights). Note that [Player](/reference/player) functions are only available with an active subscription (Spotify restriction). |
| 404 | The requested data was not found. For example, a non-existent playlist `id` was specified. |
| 413 | Known to occur when uploading a playlist cover. The data size exceeded 256 KB during encoding, so Spotify rejected the request. Use a different cover. With `randomCover` set to `update`, the cover will be updated next time. |
| 429 | Too many requests were made in a short period. The server stopped responding with content. Usually, a pause of a few seconds is automatically taken and the process resumes. |
| 500 </br> 503 | Internal error on the Spotify or Last.fm server side. Typically disappears after a few minutes. During critical failures, it may continue indefinitely. Nothing can be fixed on your side. |
| 504 | The server response time was exceeded. A retry attempt will be made. |