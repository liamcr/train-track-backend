# Train-Track Backend

This is the backend repo containing the API used for the train-track app.

## Endpoints

### Users

All user endpoints are prepended by `/users`

`POST /register`

Registers a new user in the app

**Body Params**

| Name     | Required? | Type   | Description                  |
| -------- | --------- | ------ | ---------------------------- |
| username | Yes       | String | The username of the new user |
| password | Yes       | String | The password of the new user |

**Response Format**

| Name        | Type   | Description                    |
| ----------- | ------ | ------------------------------ |
| accessToken | String | The JWT for the logged-in user |

`POST /login`

Verifies login credentials of a user

**Body Params**

| Name     | Required? | Type   | Description                  |
| -------- | --------- | ------ | ---------------------------- |
| username | Yes       | String | The username of the new user |
| password | Yes       | String | The password of the new user |

**Response Format**

| Name        | Type   | Description                    |
| ----------- | ------ | ------------------------------ |
| accessToken | String | The JWT for the logged-in user |

**Errors**

| Code | Description                                                                  |
| ---- | ---------------------------------------------------------------------------- |
| 401  | The given username/password combination did not match a user in the database |

`POST /follow/:id`

Follows a user to another

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description                       |
| ---- | --------- | ------ | --------------------------------- |
| id   | Yes       | String | The ID of the user being followed |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | User not found                                                                 |

### Workouts

All workout endpoints are prepended by `/workouts`

`GET /:id`

Get a specific workout

**URL Params**

| Name | Required? | Type   | Description                     |
| ---- | --------- | ------ | ------------------------------- |
| id   | Yes       | String | The ID of the requested workout |

**Response Format**

| Name    | Type           | Description                    |
| ------- | -------------- | ------------------------------ |
| workout | Workout object | The workout that was requested |

`GET /user/:id`

Get all workouts associated with a user

**URL Params**

| Name | Required? | Type   | Description        |
| ---- | --------- | ------ | ------------------ |
| id   | Yes       | String | The ID of the user |

**Response Format**

| Name     | Type                  | Description                                      |
| -------- | --------------------- | ------------------------------------------------ |
| workouts | Array[Workout object] | The workouts associtated with the requested user |

`POST /add`

Add a workout

**Body Params**

| Name        | Required? | Type   | Description                                                         |
| ----------- | --------- | ------ | ------------------------------------------------------------------- |
| userId      | Yes       | String | The ID of the user that is creating the workout                     |
| name        | Yes       | String | The user-decided name of the workout                                |
| description | No        | String | The user-decided description of the workout                         |
| date        | No        | Date   | The day on which the workout was done. Defaults to the current date |

`POST /like/:id`

Like a workout

**URL Params**

| Name | Required? | Type   | Description                       |
| ---- | --------- | ------ | --------------------------------- |
| id   | Yes       | String | The ID of the workout being liked |

**Body Params**

| Name   | Required? | Type   | Description                           |
| ------ | --------- | ------ | ------------------------------------- |
| userId | Yes       | String | The ID of the user liking the workout |

`POST /comment/:id`

Comment on a workout

**URL Params**

| Name | Required? | Type   | Description                              |
| ---- | --------- | ------ | ---------------------------------------- |
| id   | Yes       | String | The ID of the workout being commented on |

**Body Params**

| Name    | Required? | Type   | Description                                  |
| ------- | --------- | ------ | -------------------------------------------- |
| userId  | Yes       | String | The ID of the user commenting on the workout |
| comment | Yes       | String | The comment itself                           |

`PUT /update/:id`

Update a workout

**URL Params**

| Name | Required? | Type   | Description                         |
| ---- | --------- | ------ | ----------------------------------- |
| id   | Yes       | String | The ID of the workout being updated |

**Body Params**

| Name        | Required? | Type   | Description                                                         |
| ----------- | --------- | ------ | ------------------------------------------------------------------- |
| name        | No        | String | The user-decided name of the workout                                |
| description | No        | String | The user-decided description of the workout                         |
| date        | No        | Date   | The day on which the workout was done. Defaults to the current date |

`DELETE /:id`

Deletes a workout

**URL Params**

| Name | Required? | Type   | Description                         |
| ---- | --------- | ------ | ----------------------------------- |
| id   | Yes       | String | The ID of the workout being deleted |

### Exercises

All exercise endpoints are prepended by `/exercises`

`GET /:id`

Returns the requested exercise

**URL Params**

| Name | Required? | Type   | Description                      |
| ---- | --------- | ------ | -------------------------------- |
| id   | Yes       | String | The ID of the requested exercise |

**Response Format**

| Name     | Type            | Description            |
| -------- | --------------- | ---------------------- |
| exercise | Exercise object | The exercise requested |

`POST /add`

Adds a new exercise

**Body Params**

| Name        | Required? | Type              | Description                                               |
| ----------- | --------- | ----------------- | --------------------------------------------------------- |
| workoutId   | Yes       | String            | The ID of the workout that the exercise is being added to |
| name        | Yes       | String            | The user-decided name of the exercise                     |
| description | No        | String            | The user-decided description of the exercise              |
| sets        | Yes       | Array[Set object] | The sets completed of the exercise                        |

`PUT /update/:id`

Updates a given exercise

**URL Params**

| Name | Required? | Type   | Description                          |
| ---- | --------- | ------ | ------------------------------------ |
| id   | Yes       | String | The ID of the exercise to be updated |

**Body Params**

| Name        | Required? | Type              | Description                                  |
| ----------- | --------- | ----------------- | -------------------------------------------- |
| name        | No        | String            | The user-decided name of the exercise        |
| description | No        | String            | The user-decided description of the exercise |
| sets        | No        | Array[Set object] | The sets completed of the exercise           |

`DELETE /:id`

Deletes a given exercise

**URL Params**

| Name | Required? | Type   | Description                          |
| ---- | --------- | ------ | ------------------------------------ |
| id   | Yes       | String | The ID of the exercise to be deleted |
