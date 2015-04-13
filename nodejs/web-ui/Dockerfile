
# Pull base image.
FROM dockerfile/nodejs

# TODO: change to production once the code is fixed
ENV NODE_ENV test 
ENV PORT 8080

ENV APPDIR /var/riox/
ADD build/test $APPDIR
ADD node_modules $APPDIR
ADD package.json $APPDIR
WORKDIR $APPDIR

# TODO this is not properly cached by docker see - http://www.clock.co.uk/blog/a-guide-on-how-to-cache-npm-install-with-docker
RUN npm install 

EXPOSE ${PORT}
ENTRYPOINT node lib/server.js