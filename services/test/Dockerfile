FROM riox/hyperriox:latest
MAINTAINER Waldemar Hummer

# add code dirs
ADD ./services/ /code/services/
ADD ./riox-shared/ /code/riox-shared/

ADD ./web-ui/lib/app/ /code/web-ui/lib/app/
ADD ./web-ui/lib/config/ /code/web-ui/lib/config/
ADD ./web-ui/lib/index*.html /code/web-ui/lib/
ADD ./web-ui/lib/*.js /code/web-ui/lib/

# Finish by making production build of Web UI code. Note: need to set
# a high stack size, due to: https://github.com/mishoo/UglifyJS2/issues/414
#RUN node --stack-size=10000 `which gulp` ui:build:prod
