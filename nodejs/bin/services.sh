#!/bin/bash

(
(cd services/streams-service && nodemon app.js) & \
(cd services/users-service && nodemon app.js)
)
