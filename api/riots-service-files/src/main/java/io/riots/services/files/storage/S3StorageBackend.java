package io.riots.services.files.storage;

import io.riots.services.files.FileData;
import io.riots.services.files.IStorageBackend;

import java.io.IOException;
import java.io.InputStream;

import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Component;

@Component("s3-storage")
public class S3StorageBackend implements IStorageBackend {

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
