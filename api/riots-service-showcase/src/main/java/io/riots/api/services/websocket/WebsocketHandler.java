package io.riots.api.services.websocket;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * Class for handling Websocket communication.
 * @author whummer
 */
@Component
public class WebsocketHandler extends TextWebSocketHandler {
	@Override
	public void afterConnectionEstablished(WebSocketSession session)
			throws Exception {
		System.out.println("WebSocket connection established! "  + session.getHandshakeHeaders());
		super.afterConnectionEstablished(session);

		// TODO remove
		new Thread(){
			public void run() {
				for(int i = 0; i < 100; i ++) {
					try {
						session.sendMessage(new TextMessage(
								"{\"time\": " + System.currentTimeMillis() + 
								", \"data\": " + Math.random() + "}")
						);
						try {
							Thread.sleep(1000);
						} catch (InterruptedException e) {}
					} catch (IOException e) {
						break;
					}
				}
			}
		}.start();
	}

	@Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
		System.out.println("WebSocket text message!");
        System.out.println(session + " - " + message);
    }
}
