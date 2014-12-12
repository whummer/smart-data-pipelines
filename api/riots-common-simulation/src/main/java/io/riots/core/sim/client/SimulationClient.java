package io.riots.core.sim.client;

import io.riots.core.model.sim.Simulation;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;

import org.apache.log4j.Logger;
import org.glassfish.tyrus.client.ClientManager;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Simulation client which communicates with the simulation 
 * backend (e.g., via WebSockets).
 * @author whummer
 */
public class SimulationClient {

	private static Logger logger = Logger.getLogger(SimulationClient.class);
	private static ObjectMapper mapper = new ObjectMapper();

	private WebSocketClient c = new StandardWebSocketClient(new ClientManager());
	private WebSocketSession sess;
	private String urlPattern;
	private LinkedBlockingQueue<Object> inQueue = new LinkedBlockingQueue<>();

	public SimulationClient(String url) {
		this.urlPattern = url;
		if(!url.contains("<id>")) {
			logger.warn("URL pattern should contain a placeholder '<id>' for the simulation ID.");
		}
		initConnection();
	}

	/* BEGIN JSON MESSAGE TYPES*/

	public static class JSONMessage {
		@JsonProperty
		protected String id;

		public String toJSON() {
			try {
				return mapper.writeValueAsString(this);
			} catch (JsonProcessingException e) {
				throw new RuntimeException(e);
			}
		}
		@Override
		public String toString() {
			return getClass().getSimpleName() + ":" + toJSON();
		}
		public TextMessage toTextMessage() {
			return new TextMessage(toJSON());
		}
	}

	public static class WebSocketRequest extends JSONMessage {
		@JsonProperty
		protected String type;
	}
	public static class ReqCreateSimulation extends WebSocketRequest {
		{
			type = "new";
		}
	}
	public static class ReqUpdateSimulation extends WebSocketRequest {
		{
			type = "update";
		}
		@JsonProperty
		protected String code;
	}
	public static class ReqTickSimulation extends WebSocketRequest {
		{
			type = "tick";
		}
	}

	public static class Thing {
		public Map<String,Object> properties = new HashMap<String, Object>();
		public String id;
		@Override
		public String toString() {
			return "Thing[" + id + "]" + properties;
		}
	}
	public static class WebSocketResponse extends JSONMessage {
	}
	public static class ResResult extends WebSocketResponse {
		@JsonProperty
		protected String result;
		@JsonProperty
		protected Object output;
	}
	public static class ResSuccess extends ResResult {
		@JsonProperty
		protected String status;
	}
	public static class ResThingUpdate extends WebSocketResponse {
		@JsonProperty
		public long tick_count;
		@JsonProperty
		public String simulation_id;
		@JsonProperty
		public double timestamp;
		@JsonProperty
		public Thing thing = new Thing();
	}

	/* END JSON MESSAGE TYPES*/

	public String createSimulationRun(String code) {
		return createSimulationRun(null, code);
	}
	public String createSimulationRun(Simulation sim, String code) {
		ReqCreateSimulation req = new ReqCreateSimulation();
		sendMessage(req);
		WebSocketResponse r = receiveMessage(ResResult.class);
		ReqUpdateSimulation req2 = new ReqUpdateSimulation();
		req2.code = code;
		req2.id = r.id;
		sendMessage(req2);
		System.out.println("created/updated simulation " + r.id);
		return r.id;
	}

	public List<ResThingUpdate> runNextTick(String simulationRunID) {
		ReqTickSimulation req = new ReqTickSimulation();
		req.id = simulationRunID;
		sendMessage(req);
		List<ResThingUpdate> updates = new LinkedList<>();
		while(true) {
			WebSocketResponse r = receiveMessage(
					ResSuccess.class, ResThingUpdate.class);
			//System.out.println("--> " + r);
			if(r instanceof ResSuccess) {
				break;
			}
			updates.add((ResThingUpdate)r);
		}
		return updates;
	}

	public void sendUpdates(String simulationRunID, ResThingUpdate ... updates) {
		System.out.println("sendUpdates " + updates);
		StringBuilder code = new StringBuilder();
		for(ResThingUpdate up : updates) {
			//System.out.println("Sending update " + up);
			String prefix = "simulation.simulation_context.things(id: '" + up.thing.id + "').first";
			System.out.println("up " + up);
			for(String prop : up.thing.properties.keySet()) {
				try {
					String value = mapper.writeValueAsString(up.thing.properties.get(prop));
					code.append(prefix + "." + prop + " = " + value);
					code.append("\n");
				} catch (Exception e) {
					logger.warn(e);
				}
			}
		}
		System.out.println("sendUpdates 1 " + code);
		ReqUpdateSimulation up = new ReqUpdateSimulation();
		up.id = simulationRunID;
		up.code = code.toString();
		System.out.println(up.code);
		sendMessage(up);
		System.out.println("receiving message...");
		receiveMessage();
	}

	/* Websocket communication helper methods */

	private <T extends JSONMessage> T receiveMessage(Class<T> clazz) {
		try {
			return mapper.readValue(inQueue.take().toString(), clazz);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	@SuppressWarnings("unchecked")
	private <T extends JSONMessage> T receiveMessage(Class<?> ... clazzes) {
		try {
			String value = inQueue.take().toString();
			for(Class<?> clazz : clazzes) {
				try {
					return (T)mapper.readValue(value, clazz);
				} catch (Exception e) {
					/* swallow */
				}
			}
			if(clazzes.length > 0) {
				logger.warn("Could not parse message " + value +
					" as either of these types: " + Arrays.asList(clazzes));
			}
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
		return null;
	}

	private void sendMessage(JSONMessage msg) {
		try {
			//System.out.println("Sending message...");
			sess.sendMessage(msg.toTextMessage());
			//System.out.println("Sent msg...");
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	private void initConnection() {
		try {
			sess = c.doHandshake(new WebSocketHandler() {
				public boolean supportsPartialMessages() {
					return false;
				}
				public void handleTransportError(WebSocketSession session,
						Throwable exception) throws Exception {
				}
				public void handleMessage(WebSocketSession session,
						WebSocketMessage<?> message) throws Exception {
					//System.out.println("handle message " + message);
					inQueue.put(message.getPayload());
				}
				public void afterConnectionEstablished(WebSocketSession session)
						throws Exception {
				}
				public void afterConnectionClosed(WebSocketSession session,
						CloseStatus closeStatus) throws Exception {
				}
			}, urlPattern.replace("<id>", "")).get();
		} catch (Exception e) {
			logger.warn("Unable to initiate websocket connection", e);
		}
	}
}
