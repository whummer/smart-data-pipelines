package io.riots.api.services.streams;

import io.riots.api.services.streams.StreamPermission.PermissionStatus;
import io.riots.api.services.users.User;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.repositories.StreamPermissionRepository;
import io.riots.core.repositories.StreamRepository;
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
	AuthHeaders authHeaders;
	@Autowired
	HttpServletRequest req;

	@Override
	@Timed @ExceptionMetered
	public List<Stream> listStreams() {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		List<Stream> result = streamRepo.findByCreatorId(user.getId());
		System.out.println("listStreams: " + result);
		return result;
	}

	@Override
	@Timed @ExceptionMetered
	public List<Stream> searchPublicStreams(String query, int page, int size) {
		if(StringUtils.isEmpty(query)) {
			query = "%";
		}
		List<Stream> result = streamRepo.findByVisibleAndNameLike(true, query);
		System.out.println("query: " + query + " - " + result);
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
		perm.status = PermissionStatus.REQUESTED;
		return streamPermRepo.save(perm);
	}

	@Override
	@Timed @ExceptionMetered
	public StreamPermission updatePermission(String id, StreamPermission perm) {
		if(perm.status != PermissionStatus.DENIED && perm.status != PermissionStatus.GRANTED) {
			throw new RuntimeException("Invalid permission status.");
		}
		return perm;
	}

}
