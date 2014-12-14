//package io.riots.api.websocket;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.socket.WebSocketHandler;
////import org.springframework.messaging.simp.config.MessageBrokerRegistry;
//import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
//import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
//import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
//import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
//
//@Configuration
//@EnableWebSocketMessageBroker
//public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {
//
//    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
////    	System.out.println("registerWebSocketHandlers" + 
////    			((SimpleUrlHandlerMapping)((ServletWebSocketHandlerRegistry)
////    					registry).getHandlerMapping()).getHandlerMap());
////        registry.addHandler(websocketHandler(), "/websocket").withSockJS();
////    	System.out.println("registerWebSocketHandlers" + 
////    			((SimpleUrlHandlerMapping)((ServletWebSocketHandlerRegistry)
////    					registry).getHandlerMapping()).getHandlerMap());
////    	System.out.println("registerWebSocketHandlers" + 
////    			((SimpleUrlHandlerMapping)((ServletWebSocketHandlerRegistry)
////    					registry).getHandlerMapping()).getUrlMap());
//    }
//
//    @Bean
//    public WebSocketHandler websocketHandler() {
//        return new WebSocketEndPoint();
//    }
//
//	@Override
//	public void registerStompEndpoints(StompEndpointRegistry registry) {
//		registry.addEndpoint("/websocket").withSockJS();
//	}
//}
