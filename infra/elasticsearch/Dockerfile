FROM kubernetes/elasticsearch:1.0

MAINTAINER Waldemar Hummer

# adjust permissions, required to run as non-privileged user
RUN chmod 777 -R /elasticsearch*

# Run the container as user "nobody" to ensure that 
# we don't require any privileged permissions
# (required, e.g., for Raiffeisen kubernetes hosting)
USER nobody
