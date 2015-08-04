package io.riots.api.services.files.storage;

import io.riots.api.services.files.FileData;
import io.riots.api.services.files.StorageBackend;

import java.io.IOException;
import java.io.InputStream;

import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Component;

@Component("s3Storage")
public class S3StorageBackend implements StorageBackend {

	@Override
	public void store(String id, MediaType mediaType, InputStream in)
			throws IOException {
		// TODO Auto-generated method stub
		throw new RuntimeException("not implemented");
	}

	@Override
	public FileData retrieve(String id) {
		// TODO Auto-generated method stub
		throw new RuntimeException("not implemented");
	}

	@Override
	public void delete(String id) throws IOException {
		throw new RuntimeException("not implemented");		
	}

}
