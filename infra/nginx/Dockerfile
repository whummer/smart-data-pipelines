# based on https://github.com/CBarraford/docker-redx

FROM ubuntu:latest
MAINTAINER Waldemar Hummer

# Set environment.
ENV DEBIAN_FRONTEND noninteractive

RUN \

	# Update apt
	apt-get update && \
	apt-get install -y build-essential curl libreadline-dev libncurses5-dev libpcre3-dev libssl-dev libperl-dev lua5.2 luarocks perl wget git openssl dnsmasq supervisor psmisc && \

	# Compile openresty from source.
	wget http://openresty.org/download/ngx_openresty-1.7.2.1.tar.gz && \
	tar -xzvf ngx_openresty-*.tar.gz && \
	rm -f ngx_openresty-*.tar.gz && \
	cd ngx_openresty-* && \
	./configure --with-pcre-jit --with-ipv6 --with-http_perl_module && \
	make && \
	make install && \
	make clean && \
	cd .. && \
	rm -rf ngx_openresty-*&& \
	ln -s /usr/local/openresty/nginx/sbin/nginx /usr/local/bin/nginx && \
	ldconfig && \

	# Install luarocks modules
	luarocks install luasec 0.4-4 OPENSSL_LIBDIR=/usr/lib/x86_64-linux-gnu && \
	luarocks install lua-cjson 2.1.0-1 && \
	luarocks install busted 1.9.0-1 && \
	luarocks install lapis 1.0.4-1 && \
	luarocks install moonscript 0.2.4-1 && \
	luarocks install inspect 1.2-2 && \

	# clean up
	apt-get remove -y build-essential libreadline-dev libncurses5-dev libpcre3-dev libssl-dev libperl-dev && apt-get autoremove -y && apt-get clean && \
	rm -rf /var/lib/apt/lists/* /tmp/*

# copy redx nginx file
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

# create redx config file
ADD configure.bash .
ADD entrypoint.bash .

# install redx
RUN git clone https://github.com/whummer/redx.git /opt/redx

# expose ports
EXPOSE 80 443 8082

# Set the entry point script
ENTRYPOINT ["./entrypoint.bash"]


ADD	./nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
ADD ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD ./addDevHosts.sh /root/addDevHosts.sh

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
