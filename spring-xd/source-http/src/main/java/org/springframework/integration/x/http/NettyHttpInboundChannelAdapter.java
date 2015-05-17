/*
 * Copyright 2013-2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.springframework.integration.x.http;

import static org.jboss.netty.handler.codec.http.HttpHeaders.isKeepAlive;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONNECTION;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_LENGTH;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.INTERNAL_SERVER_ERROR;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.OK;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.REQUEST_ENTITY_TOO_LARGE;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.NOT_FOUND;
import static org.jboss.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.InetSocketAddress;
import java.security.KeyStore;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLEngine;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jboss.netty.bootstrap.ServerBootstrap;
import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelDownstreamHandler;
import org.jboss.netty.channel.ChannelEvent;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.DefaultChannelPipeline;
import org.jboss.netty.channel.DownstreamMessageEvent;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelHandler;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory;
import org.jboss.netty.handler.codec.frame.TooLongFrameException;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpChunkAggregator;
import org.jboss.netty.handler.codec.http.HttpContentCompressor;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpRequestDecoder;
import org.jboss.netty.handler.codec.http.HttpResponse;
import org.jboss.netty.handler.codec.http.HttpResponseEncoder;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;
import org.jboss.netty.handler.execution.ExecutionHandler;
import org.jboss.netty.handler.execution.OrderedMemoryAwareThreadPoolExecutor;
import org.jboss.netty.handler.logging.LoggingHandler;
import org.jboss.netty.handler.ssl.SslHandler;
import org.jboss.netty.logging.CommonsLoggerFactory;
import org.jboss.netty.logging.InternalLoggerFactory;
import org.jboss.netty.util.internal.StringUtil;
import org.springframework.beans.factory.BeanInitializationException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.integration.endpoint.MessageProducerSupport;
import org.springframework.messaging.Message;
import org.springframework.messaging.converter.MessageConversionException;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

/**
 * @author Mark Fisher
 * @author Jennifer Hickey
 * @author Gary Russell
 * @author Marius Bogoevici
 * @author Waldemar Hummer
 */
public class NettyHttpInboundChannelAdapter extends MessageProducerSupport {

	private static Log logger = LogFactory
			.getLog(NettyHttpInboundChannelAdapter.class);

	/**
	 * Default max number of threads for the default {@link Executor}
	 */
	private static final int DEFAULT_CORE_POOL_SIZE = 16;

	/**
	 * Default max total size of queued events per channel for the default
	 * {@link Executor} (in bytes)
	 */
	private static final long DEFAULT_MAX_CHANNEL_MEMORY_SIZE = 1048576;

	/**
	 * Default max total size of queued events for the whole pool for the
	 * default {@link Executor} (in bytes)
	 */
	private static final long DEFAULT_MAX_TOTAL_MEMORY_SIZE = 1048576;

	/**
	 * Default max content length
	 */
	private static final int DEFAULT_MAX_CONTENT_LENGTH = 1048576;

	private final int port;

	/* begin whu */
	private final String path;

	private static final String KEY_MODULE_STATE = NettyHttpInboundChannelAdapter.class
			.getName() + ".moduleState";

	private static final String DEFAULT_PATH = "/";

	private Map<String, Object> pathsToProducers;

	class SenderEntry {
		public Object senderEntity;
		public Method senderMethod;
	}

	/* end whu */

	private final boolean ssl;

	private volatile ServerBootstrap bootstrap;

	private volatile ExecutionHandler executionHandler;

	private volatile Executor executor = new OrderedMemoryAwareThreadPoolExecutor(
			DEFAULT_CORE_POOL_SIZE, DEFAULT_MAX_CHANNEL_MEMORY_SIZE,
			DEFAULT_MAX_TOTAL_MEMORY_SIZE);

	private volatile MessageConverter messageConverter;

	private volatile int maxContentLength = DEFAULT_MAX_CONTENT_LENGTH;

	static {
		// Use commons-logging for Netty logging
		InternalLoggerFactory.setDefaultFactory(new CommonsLoggerFactory());
	}

	/**
	 * Properties file containing keyStore=[resource],
	 * keyStore.passPhrase=[passPhrase]
	 */
	private volatile Resource sslPropertiesLocation;

	private SSLContext sslContext;

	public NettyHttpInboundChannelAdapter(int port) {
		this(port, false);
	}

	public NettyHttpInboundChannelAdapter(int port, boolean ssl) {
		/* begin whu */
		this(port, DEFAULT_PATH, ssl);
		/* end whu */
	}

	/* begin whu */
	public NettyHttpInboundChannelAdapter(int port, String path) {
		this(port, path, false);
	}

	public NettyHttpInboundChannelAdapter(int port, String path, boolean ssl) {
		this.port = port;
		this.ssl = ssl;
		this.path = path;
	}

	/* end whu */

	/**
	 *
	 * @param executor
	 *            The {@link Executor} to use with the Netty
	 *            {@link ExecutionHandler} in the pipeline. This allows any
	 *            potential blocking operations done by message consumers to be
	 *            removed from the I/O thread. The default executor is an
	 *            {@link OrderedMemoryAwareThreadPoolExecutor}, which is highly
	 *            recommended because it guarantees order of execution within a
	 *            channel.
	 */
	public void setExecutor(Executor executor) {
		Assert.notNull(executor, "A non-null executor is required");
		this.executor = executor;
	}

	/**
	 * @param sslPropertiesLocation
	 *            A properties resource containing a resource with key
	 *            'keyStore' and a pass phrase with key 'keyStore.passPhrase'.
	 */
	public void setSslPropertiesLocation(Resource sslPropertiesLocation) {
		this.sslPropertiesLocation = sslPropertiesLocation;
	}

	/**
	 * Set the message converter; defaults to
	 * {@link NettyInboundMessageConverter}.
	 * 
	 * @param messageConverter
	 *            the converter.
	 */
	public void setMessageConverter(MessageConverter messageConverter) {
		this.messageConverter = messageConverter;
	}

	/**
	 * Set the max content length; default 1Mb.
	 * 
	 * @param maxContentLength
	 *            the max content length.
	 */
	public void setMaxContentLength(int maxContentLength) {
		this.maxContentLength = maxContentLength;
	}

	@Override
	protected void onInit() {
		try {
			if (this.ssl) {
				this.sslContext = initializeSSLContext();
			}
		} catch (Exception e) {
			throw new BeanInitializationException("failed to initialize", e);
		}
		super.onInit();
	}

	@Override
	protected void doStart() {
		/* begin whu */
		initModuleState();
		/* end whu */
		if (this.messageConverter == null) {
			this.messageConverter = new NettyInboundMessageConverter(
					getMessageBuilderFactory());
		}
		executionHandler = new ExecutionHandler(executor);
		/* begin whu */
		try {
			/* end whu */
			bootstrap = new ServerBootstrap(new NioServerSocketChannelFactory(
					Executors.newCachedThreadPool(),
					Executors.newCachedThreadPool()));
			bootstrap.setOption("child.tcpNoDelay", true);
			bootstrap.setPipelineFactory(new PipelineFactory());
			bootstrap.bind(new InetSocketAddress(this.port));
			/* begin whu */
		} catch (Exception e) {
			/* bind exception -> server already created by another channel */
			bootstrap = null;
		}
		/* end whu */
	}

	@Override
	protected void doStop() {
		if (bootstrap != null) {
			bootstrap.shutdown();
		}
		logger.debug("Removing channel adapter from map: " + port + ":" + path);
		Map<String, Object> pathToProducer = getPathsToProducers();
		pathToProducer.remove(path);
		System.gc();
	}

	private SSLContext initializeSSLContext() throws Exception {
		Assert.state(this.sslPropertiesLocation != null,
				"KeyStore and pass phrase properties file required");
		Properties sslProperties = new Properties();
		sslProperties.load(this.sslPropertiesLocation.getInputStream());
		PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
		String keyStoreName = sslProperties.getProperty("keyStore");
		Assert.state(StringUtils.hasText(keyStoreName),
				"keyStore property cannot be null");
		String keyStorePassPhrase = sslProperties
				.getProperty("keyStore.passPhrase");
		Assert.state(StringUtils.hasText(keyStorePassPhrase),
				"keyStore.passPhrase property cannot be null");
		Resource keyStore = resolver.getResource(keyStoreName);
		SSLContext sslContext = SSLContext.getInstance("TLS");
		KeyStore ks = KeyStore.getInstance("PKCS12");
		ks.load(keyStore.getInputStream(), keyStorePassPhrase.toCharArray());
		KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
		kmf.init(ks, keyStorePassPhrase.toCharArray());
		sslContext.init(kmf.getKeyManagers(), null, null);
		return sslContext;
	}

	private class PipelineFactory implements ChannelPipelineFactory {

		@Override
		public ChannelPipeline getPipeline() throws Exception {
			ChannelPipeline pipeline = new DefaultChannelPipeline();
			if (NettyHttpInboundChannelAdapter.this.ssl) {
				SSLEngine engine = sslContext.createSSLEngine();
				engine.setUseClientMode(false);
				pipeline.addLast("ssl", new SslHandler(engine));
			}
			LoggingHandler loggingHandler = new LoggingHandler();
			if (loggingHandler.getLogger().isDebugEnabled()) {
				pipeline.addLast("logger", loggingHandler);
			}
			pipeline.addLast("decoder", new HttpRequestDecoder());
			pipeline.addLast("aggregator", new HttpChunkAggregator(
					maxContentLength));
			pipeline.addLast("errorHandler", new SimpleChannelHandler() {

				@Override
				public void exceptionCaught(ChannelHandlerContext ctx,
						ExceptionEvent e) throws Exception {
					if (e.getCause() instanceof TooLongFrameException) {
						HttpResponse err = new DefaultHttpResponse(HTTP_1_1,
								REQUEST_ENTITY_TOO_LARGE);
						e.getChannel().write(err)
								.addListener(ChannelFutureListener.CLOSE);
					}
				}
			});
			pipeline.addLast("encoder", new HttpResponseEncoder());
			pipeline.addLast("compressor", new HttpContentCompressor() {

				/*
				 * Required because the content compressor rejects a reply when
				 * no request has yet been processed. Even through the exception
				 * is caused further down the pipleline, writes go through all
				 * handlers.
				 */
				@Override
				public void writeRequested(ChannelHandlerContext ctx,
						MessageEvent e) throws Exception {
					Object msg = e.getMessage();
					if (msg instanceof HttpResponse
							&& ((HttpResponse) e.getMessage()).getStatus()
									.equals(REQUEST_ENTITY_TOO_LARGE)) {
						ctx.sendDownstream(e);
					} else {
						super.writeRequested(ctx, e);
					}
				}

			});
			pipeline.addLast("executionHandler", executionHandler);
			/* begin whu */
			pipeline.addLast("corsHandlerOut", new ChannelDownstreamHandler() {
				@Override
				public void handleDownstream(
						ChannelHandlerContext ctx,
						ChannelEvent e) throws Exception {
					if(e instanceof DownstreamMessageEvent) {
						DownstreamMessageEvent dme = (DownstreamMessageEvent)e;
						Object msg = dme.getMessage();
						if(msg instanceof HttpResponse) {
							HttpResponse httpMsg = (HttpResponse)msg;
							httpMsg.addHeader(HttpHeaders.Names.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
							httpMsg.addHeader(HttpHeaders.Names.ACCESS_CONTROL_ALLOW_HEADERS,
									"origin, content-type, accept, authorization, x-requested-with");
							httpMsg.addHeader(HttpHeaders.Names.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
							httpMsg.addHeader(HttpHeaders.Names.ACCESS_CONTROL_ALLOW_METHODS, 
									"GET, POST, PUT, DELETE, OPTIONS, HEAD");
							httpMsg.addHeader(HttpHeaders.Names.ACCESS_CONTROL_MAX_AGE, "1209600");
							httpMsg.addHeader(HttpHeaders.Names.ACCESS_CONTROL_EXPOSE_HEADERS, "Location");
						}						
					}
					ctx.sendDownstream(e);
				}
			});
			/* end whu */
			pipeline.addLast("handler", new Handler(messageConverter));
			return pipeline;
		}
	}

	/* start whu */
	void wrapSendMessage(Message<?> message) {
		sendMessage(message);
	}

	private HttpResponseStatus sendMessageToResponsibleSender(HttpRequest request,
			Message<?> message) {
		Object sender = getResponsibleSender(request);
		if (sender == null) {
			logger.warn("Cannot find inbound HTTP channel for path: " + request.getUri());
			return NOT_FOUND;
		}
		try {
			Field f = sender.getClass().getDeclaredField("senderMethod");
			f.setAccessible(true);
			Method method = (Method) f.get(sender);
			method.setAccessible(true);
			Field f1 = sender.getClass().getDeclaredField("senderEntity");
			f1.setAccessible(true);
			Object entity = f1.get(sender);
			method.invoke(entity, message);
			return OK;
		} catch (Exception e) {
			logger.warn("Exception when sending message", e);
		}
		return INTERNAL_SERVER_ERROR;
	}

	private Object getResponsibleSender(HttpRequest request) {
		Object result = null;
		Map<String, Object> map = getPathsToProducers();
		String uri = request.getUri();
		result = map.get(uri);
		if (result == null) {
			result = map.get(DEFAULT_PATH);
		}
		return result;
	}

	@SuppressWarnings("unchecked")
	private void initModuleState() {
		synchronized (this.getClass()) {
			/* bit hacky, store module state in system properties */
			if (!System.getProperties().containsKey(KEY_MODULE_STATE)) {
				System.getProperties()
						.put(KEY_MODULE_STATE,
								new ConcurrentHashMap<Integer, Map<String, Object>>());
			}
			Map<Integer, Map<String, Object>> map = (Map<Integer, Map<String, Object>>) System
					.getProperties().get(KEY_MODULE_STATE);
			if (!map.containsKey(port)) {
				map.put(port, new ConcurrentHashMap<String, Object>());
			}
			pathsToProducers = map.get(port);
			if (pathsToProducers.containsKey(path)) {
				String msg = "Channel for HTTP port " + port + ", path '" + path + "' already exists.";
				logger.warn(msg);
				logger.info("Existing paths for port " + port + ": " + pathsToProducers.keySet());
				throw new RuntimeException(msg);
			}
			SenderEntry e = new SenderEntry();
			e.senderMethod = getSenderMethod(this);
			e.senderEntity = this;
			logger.debug("Putting channel adapter to map: " + port + ":" + path + " - " + e);
			pathsToProducers.put(path, e);
		}
	}

	private Method getSenderMethod(Object sender) {
		String name = "wrapSendMessage";
		for (Method m : sender.getClass().getDeclaredMethods()) {
			if (m.getName().equals(name)) {
				m.setAccessible(true);
				return m;
			}
		}
		throw new RuntimeException("Cannot find message sender method.");
	}

	private Map<String, Object> getPathsToProducers() {
		return pathsToProducers;
	}

	/* end whu */

	private class Handler extends SimpleChannelUpstreamHandler {

		private final MessageConverter messageConverter;

		public Handler(MessageConverter messageConverter) {
			Assert.notNull(messageConverter,
					"'messageConverter' must not be null");
			this.messageConverter = messageConverter;
		}

		@Override
		public void messageReceived(ChannelHandlerContext ctx, MessageEvent e)
				throws Exception {
			Assert.isInstanceOf(HttpRequest.class, e.getMessage());
			HttpRequest request = (HttpRequest) e.getMessage();
			if (logger.isDebugEnabled()) {
				logger.debug("Received HTTP request:\n"
						+ indent(e.getMessage().toString()));
			}
			HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
			Message<?> message = null;
			try {
				message = this.messageConverter.toMessage(request, null);
			} catch (MessageConversionException ex) {
				logger.error("Failed to convert message", ex);
				response = new DefaultHttpResponse(HTTP_1_1,
						INTERNAL_SERVER_ERROR);
			}
			if (message != null) {
				try {
					if (logger.isDebugEnabled()) {
						logger.debug("Sending message: " + message);
					}
					/* start whu */
					HttpResponseStatus status = sendMessageToResponsibleSender(
							request, message);
					response = new DefaultHttpResponse(HTTP_1_1, status);
					/* end whu */
					// sendMessage(message); // commented whu
				} catch (Exception ex) {
					logger.error("Error sending message", ex);
					response = new DefaultHttpResponse(HTTP_1_1,
							INTERNAL_SERVER_ERROR);
				}
			}
			writeResponse(request, response, e.getChannel());
		}

		@Override
		public void exceptionCaught(ChannelHandlerContext ctx, ExceptionEvent e)
				throws Exception {
			logger.error("Unhandled exception, closing channel", e.getCause());
			e.getChannel().close();
		}

		private void writeResponse(HttpRequest request, HttpResponse response,
				Channel channel) {
			boolean keepAlive = isKeepAlive(request);
			if (keepAlive) {
				response.setHeader(CONTENT_LENGTH, response.getContent()
						.readableBytes());
				response.setHeader(CONNECTION, HttpHeaders.Values.KEEP_ALIVE);
			}
			if (logger.isDebugEnabled()) {
				logger.debug("Sending HTTP response:\n"
						+ indent(response.toString()));
			}
			ChannelFuture future = channel.write(response);
			if (!keepAlive) {
				future.addListener(ChannelFutureListener.CLOSE);
			}
		}
	}

	/**
	 * Indents the content of a multi-line string - used mainly for allowing the
	 * pretty display of Netty {@code toString()} output/
	 */
	private static String indent(String s) {
		return "\t" + s.replace(StringUtil.NEWLINE, StringUtil.NEWLINE + "\t");
	}

}
