package io.riots.api.services.streams;

import io.riots.api.services.streams.StreamPermission.PermissionStatus;
import io.riots.api.services.users.User;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.repositories.StreamPermissionRepository;
import io.riots.core.repositories.StreamRepository;
import io.riots.core.repositories.StreamRestrictionRepository;
import io.riots.core.util.ServiceUtil;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * @author whummer
 */
@Service
public class StreamsServiceImpl implements StreamsService {

	@Autowired
	StreamRepository streamRepo;

	@Autowired
	StreamPermissionRepository streamPermRepo;

	@Autowired
	StreamRestrictionRepository streamRestRepo;

	@Autowired
	AuthHeaders authHeaders;

	@Autowired
	HttpServletRequest req;

	@Override
	@Timed @ExceptionMetered
	public List<StreamPermission> queryPermissions(String streamID) {
		List<StreamPermission> result = streamPermRepo.findByStreamId(streamID);
		return result;
	}

	@Override
	@Timed @ExceptionMetered
	public List<Stream> listStreams() {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		List<Stream> result = streamRepo.findByCreatorId(user.getId());
		return result;
	}

	@Override
	@Timed @ExceptionMetered
	public List<Stream> searchPublicStreams(SearchQuery opts) {
		if(StringUtils.isEmpty(opts.query)) {
			opts.query = "*";
		}
		List<Stream> result = streamRepo.findByVisibleAndNameLike(true, opts.query);
		return result;
	}

	@Override
	@Timed @ExceptionMetered
	public Stream addStream(Stream t) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		t.setCreated(new Date());
		t.setCreatorId(user.getId());
		return streamRepo.save(t);
	}

	@Override
	@Timed @ExceptionMetered
	public Stream updateStream(Stream t) {
		return streamRepo.save(t);
	}

	@Override
	@Timed @ExceptionMetered
	public void removeStream(String id) {
		streamRepo.delete(id);
	}

	@Override
	@Timed @ExceptionMetered
	public StreamPermission requestPermission(String id, StreamPermission perm) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		perm.setStatus(PermissionStatus.REQUESTED);
		if(!StringUtils.isEmpty(perm.getUserId())) {
			perm.setUserId(user.getId());
		}
		perm.setCreated(new Date());
		perm.setCreatorId(user.getId());
		return streamPermRepo.save(perm);
	}

	@Override
	@Timed @ExceptionMetered
	public StreamPermission updatePermission(String id, StreamPermission perm) {
		if(StringUtils.isEmpty(perm.getId())) {
			User user = ServiceUtil.assertValidUser(authHeaders, req);
			perm.setCreated(new Date());
			perm.setCreatorId(user.getId());
		}
		if(perm.status != PermissionStatus.DENIED && perm.status != PermissionStatus.GRANTED) {
			throw new RuntimeException("Invalid permission status.");
		}
		perm = streamPermRepo.save(perm);
		return perm;
	}

	@Override
	@Timed @ExceptionMetered
	public List<StreamRestriction> queryRestrictions(String streamID) {
		List<StreamRestriction> result = streamRestRepo.findByStreamId(streamID);
		return result;
	}

	@Override
	@Timed @ExceptionMetered
	public StreamRestriction saveRestriction(String streamID, StreamRestriction r) {
		streamRestRepo.deleteByStreamIdAndThingIdAndPropertyName(
				streamID, r.thingId, r.propertyName);
		if(!r.isVisible()) {
			if(StringUtils.isEmpty(r.getStreamId())) {
				r.setStreamId(streamID);
			}
			if(!streamID.equals(r.getStreamId())) {
				throw new RuntimeException("Illegal stream identifier in request.");
			}
			r = streamRestRepo.save(r);
		}
		return r;
	}
}
