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

**Errors**

| Code | Description                               |
| ---- | ----------------------------------------- |
| 409  | The given username has already been taken |

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
| 400  | User is requesting to follow someone they already follow                       |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | User not found                                                                 |

`POST /unfollow/:id`

Unfollows the current user from the given one

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description                         |
| ---- | --------- | ------ | ----------------------------------- |
| id   | Yes       | String | The ID of the user being unfollowed |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 400  | User is requesting to unfollow someone they don't yet follow                   |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | User not found                                                                 |

`GET /timeline`

Get a user's timeline

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**Body Params**

| Name   | Required? | Type    | Description                                          |
| ------ | --------- | ------- | ---------------------------------------------------- |
| limit  | No        | Integer | The limit to how many results to return. Default: 10 |
| offset | No        | Integer | The index of the first result to return. Default: 0  |

**Response Format**

| Name     | Type            | Description                                |
| -------- | --------------- | ------------------------------------------ |
| timeline | Array(Workouts) | Sorted array of workouts of users followed |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 400  | User passed invalid body params, or something went wrong finding workouts      |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | User not found                                                                 |

### Workouts

All workout endpoints are prepended by `/workouts`

`GET /:id`

Get a specific workout

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description                     |
| ---- | --------- | ------ | ------------------------------- |
| id   | Yes       | String | The ID of the requested workout |

**Response Format**

| Name    | Type           | Description                    |
| ------- | -------------- | ------------------------------ |
| workout | Workout object | The workout that was requested |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | Workout not found                                                              |

`GET /user/:id`

Get all workouts associated with a user

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description        |
| ---- | --------- | ------ | ------------------ |
| id   | Yes       | String | The ID of the user |

**Response Format**

| Name     | Type                  | Description                                      |
| -------- | --------------------- | ------------------------------------------------ |
| workouts | Array[Workout object] | The workouts associtated with the requested user |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | Workouts associated with given user not found                                  |

`POST /add`

Add a workout

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**Body Params**

| Name        | Required? | Type   | Description                                                         |
| ----------- | --------- | ------ | ------------------------------------------------------------------- |
| name        | Yes       | String | The user-decided name of the workout                                |
| description | No        | String | The user-decided description of the workout                         |
| date        | No        | Date   | The day on which the workout was done. Defaults to the current date |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 400  | Invalid request                                                                |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |

`POST /like/:id`

Like a workout

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description                       |
| ---- | --------- | ------ | --------------------------------- |
| id   | Yes       | String | The ID of the workout being liked |

**Errors**

| Code | Description                                                                              |
| ---- | ---------------------------------------------------------------------------------------- |
| 400  | Invalid request, or attempting to like a workout that has already been liked by the user |
| 401  | Authorization has not been provided                                                      |
| 403  | The authorized user does not have the proper permissions to execute the action           |
| 404  | Workout not found                                                                        |

`POST /unlike/:id`

Unlike a workout

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description                         |
| ---- | --------- | ------ | ----------------------------------- |
| id   | Yes       | String | The ID of the workout being unliked |

**Errors**

| Code | Description                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------- |
| 400  | Invalid request, or attempting to unlike a workout that has not already been liked by the user |
| 401  | Authorization has not been provided                                                            |
| 403  | The authorized user does not have the proper permissions to execute the action                 |
| 404  | Workout not found                                                                              |

`POST /comment/:id`

Comment on a workout

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description                              |
| ---- | --------- | ------ | ---------------------------------------- |
| id   | Yes       | String | The ID of the workout being commented on |

**Body Params**

| Name    | Required? | Type   | Description        |
| ------- | --------- | ------ | ------------------ |
| comment | Yes       | String | The comment itself |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 400  | Invalid request                                                                |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | Workout not found                                                              |

`PUT /update/:id`

Update a workout

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

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

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 400  | Invalid request                                                                |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | Workout not found                                                              |

`DELETE /:id`

Deletes a workout

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description                         |
| ---- | --------- | ------ | ----------------------------------- |
| id   | Yes       | String | The ID of the workout being deleted |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | Workout not found                                                              |

`DELETE /exercise/:id`

Deletes an exercise

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description                          |
| ---- | --------- | ------ | ------------------------------------ |
| id   | Yes       | String | The ID of the exercise being deleted |

**Body Params**

| Name      | Required? | Type   | Description                                                   |
| --------- | --------- | ------ | ------------------------------------------------------------- |
| workoutId | Yes       | String | The ID of the workout that the exercise is being removed from |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 400  | Invalid request                                                                |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | Workout or exercise not found                                                  |

### Exercises

All exercise endpoints are prepended by `/exercises`

`GET /:id`

Returns the requested exercise

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**URL Params**

| Name | Required? | Type   | Description                      |
| ---- | --------- | ------ | -------------------------------- |
| id   | Yes       | String | The ID of the requested exercise |

**Response Format**

| Name     | Type            | Description            |
| -------- | --------------- | ---------------------- |
| exercise | Exercise object | The exercise requested |

**Errors**

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | The given exercise was not found                                               |

`POST /add`

Adds a new exercise

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

**Body Params**

| Name        | Required? | Type              | Description                                               |
| ----------- | --------- | ----------------- | --------------------------------------------------------- |
| workoutId   | Yes       | String            | The ID of the workout that the exercise is being added to |
| name        | Yes       | String            | The user-decided name of the exercise                     |
| description | No        | String            | The user-decided description of the exercise              |
| sets        | Yes       | Array[Set object] | The sets completed of the exercise                        |

**Errors**

| Code | Description                                                                          |
| ---- | ------------------------------------------------------------------------------------ |
| 400  | Invalid request, or attempting to add exercise already included in specified workout |
| 401  | Authorization has not been provided                                                  |
| 403  | The authorized user does not have the proper permissions to execute the action       |
| 404  | The given workout was not found                                                      |

`PUT /update/:id`

Updates a given exercise

**Header Fields**

| Name          | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| Authorization | A valid access token recieved from one of either the `/login` or `/register` endpoints |

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

| Code | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| 400  | Invalid request                                                                |
| 401  | Authorization has not been provided                                            |
| 403  | The authorized user does not have the proper permissions to execute the action |
| 404  | The given exercise was not found                                               |
