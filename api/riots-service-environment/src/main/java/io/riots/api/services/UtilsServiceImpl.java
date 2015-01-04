package io.riots.api.services;

import io.riots.core.auth.AuthHeaders;
import io.riots.core.util.geo.GeoPositionListener;
import io.riots.services.UtilsService;
import io.riots.services.users.User;
import io.riots.services.utils.GeoFence;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.WebApplicationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * @author whummer
 */
@Service
public class UtilsServiceImpl implements UtilsService {

	@Autowired
	AuthHeaders authHeaders;
	@Autowired
	HttpServletRequest req;

	@Autowired
	GeoPositionListener geoListener;

	/* GEO FENCES */

	@Override
	@Timed
	@ExceptionMetered
	public List<GeoFence> listGeoFences() {
		User user = authHeaders.getRequestingUser(req);
		if(user == null) {
			throw new WebApplicationException("Please provide valid authentication headers.");
		}
		List<GeoFence> list = geoListener.getGeoFences(user);
		return list;
	}

	@Override
	@Timed
	@ExceptionMetered
	public GeoFence setupGeoFence(GeoFence fence) {
		User user = authHeaders.getRequestingUser(req);
		fence.setCreated(new Date());
		fence.setCreatorId(user.getId());
		// TODO persist to DB?
		fence = geoListener.addGeoFence(fence);
		return fence;
	}

	@Override
	@Timed
	@ExceptionMetered
	public void removeGeoFence(String id) {
		geoListener.removeGeoFence(id);
	}
}
