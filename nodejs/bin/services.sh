#!/bin/bash

(
(cd services/streams-service && node app.js) & \
(cd services/users-service && node app.js)
)
