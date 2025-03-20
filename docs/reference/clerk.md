# Clerk {docsify-ignore}

Methods for executing multiple functions at different times in a single trigger. More details in [best practices](/best-practices?id=Advanced-trigger)

| Method | Result type | Brief description |
|-------|----------------|------------------|
| [runOnceAfter](/reference/clerk?id=runonceafter) | Boolean | Run the task every day after the specified time. |
| [runOnceAWeek](/reference/clerk?id=runonceaweek) | Boolean | Run the task on a specific day of the week. |

## runOnceAfter

Run the task every day after the specified time.

### Arguments :id=runonceafter-arguments {docsify-ignore}

| Name | Type | Description |
|-----|-----|----------|
| `timeStr` | String | Time after which the task is run once. |
| `callback` | Function | The function to run. The function name must be unique among all functions called by _Clerk_. |

### Return :id=runonceafter-return {docsify-ignore}

`isRun` (boolean) - if `true` the function was run, if `false` the function was not run.

### Examples :id=runonceafter-examples {docsify-ignore}

1. Run three functions at different times in one trigger

```js
// Trigger every hour
function updatePlaylists() {
updateEveryHour() // every hour
Clerk.runOnceAfter('15:00', updateInDay) // once a day
Clerk.runOnceAfter('21:00', updateInEvening) // once a day

function updateEveryHour() {
// ...
}

function updateInDay() {
// ...
}

function updateInEvening() {
// ...
}
}
```

## runOnceAWeek

Run a task on a specific day of the week.

### Arguments :id=runonceaweek-arguments {docsify-ignore}

| Name | Type | Description |
|-----|-----|----------|
| `dayStr` | String | Day of the week in English. |
| `timeStr` | String | Time after which the task is run once. |
| `callback` | Function | The function to run. The function name must be unique among all functions called by _Clerk_. |

### Return :id=runonceaweek-return {docsify-ignore}

`isRun` (boolean) - if `true` the function was run, if `false` the function was not run.

### Examples :id=runonceaweek-examples {docsify-ignore}

1. Run three functions at different times in one trigger

```js
// Trigger every 15 minutes
function updatePlaylists() {
update15() // every 15 minutes
Clerk.runOnceAWeek('monday', '12:00', updateMonday) // every Monday after 12
Clerk.runOnceAWeek('saturday', '16:00', updateSaturday) // every Saturday after 16

function update15() {
// ...
}

function updateMonday() {
// ...
}

function updateSaturday() {
// ...
}
}
```