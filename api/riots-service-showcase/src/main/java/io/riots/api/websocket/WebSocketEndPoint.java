//package io.riots.api.websocket;
//
//import io.riots.core.model.PropertyValue;
//import io.riots.core.model.sim.SimulationRun;
//import io.riots.core.sim.SimulationListener;
//import io.riots.core.sim.SimulationManager;
//import io.riots.core.sim.SimulationManager.SimulationSubscription;
//
//import java.util.Map;
//import java.util.concurrent.atomic.AtomicReference;
//
//import org.springframework.web.socket.TextMessage;
//import org.springframework.web.socket.WebSocketSession;
//import org.springframework.web.socket.handler.TextWebSocketHandler;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//public class WebSocketEndPoint extends TextWebSocketHandler {
//
//	@SuppressWarnings("unchecked")
//	@Override
//	protected void handleTextMessage(WebSocketSession session,
//			TextMessage message) throws Exception {
//		super.handleTextMessage(session, message);
//		String json = message.getPayload();
//		ObjectMapper mapper = new ObjectMapper();
//		Map<String,Object> request = mapper.readValue(json, Map.class);
//
//		String simulationRunID = "" + request.get("simulationRunID");
//		final AtomicReference<SimulationSubscription> sub = new AtomicReference<>();
//		SimulationListener listener = new SimulationListener() {
//			public void updateValue(SimulationRun sim, PropertyValue<?> value) {
//				try {
//					String valueStr = mapper.writeValueAsString(value);
//					String response = "{"
//							+ "type: 'update',"
//							+ "simulationRunID: '" + sim.getId() + "',"
//							+ "property: '" + value.getProperty().getId() + "',"
//							+ "value: " + valueStr
//							+ "}";
//					//System.out.println(response);
//					TextMessage returnMessage = new TextMessage(response);
//					session.sendMessage(returnMessage);
//				} catch (Exception e) {
//					System.err.println("Unable to send message to websocket -> removing listener. " + e); // TODO logging
//					SimulationManager.unregisterListener(simulationRunID, sub.get());
//				}
//			}
//		};
//		SimulationSubscription subscr = SimulationManager.registerListener(simulationRunID, listener);
//		sub.set(subscr);
//	}
//
//}
