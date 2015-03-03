package io.riots.api.services.streams;

import io.riots.api.services.users.User;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.repositories.StreamRepository;
import io.riots.core.util.ServiceUtil;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author whummer
 */
@Service
public class StreamsServiceImpl implements StreamsService {

	@Autowired
	StreamRepository streamRepo;

	@Autowired
	AuthHeaders authHeaders;
	@Autowired
	HttpServletRequest req;

	@Override
	public List<Stream> listStreams() {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		return (List<Stream>)streamRepo.findByCreatorId(user.getId());
	}

	@Override
	public Stream addStream(Stream t) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		t.setCreated(new Date());
		t.setCreatorId(user.getId());
		return streamRepo.save(t);
	}

	@Override
	public Stream updateStream(Stream t) {
		return streamRepo.save(t);
	}

	@Override
	public void removeStream(String id) {
		streamRepo.delete(id);
	}

}
