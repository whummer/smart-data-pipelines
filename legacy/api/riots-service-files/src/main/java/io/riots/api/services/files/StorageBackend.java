package io.riots.api.services.files;

import java.io.IOException;
import java.io.InputStream;

import javax.ws.rs.core.MediaType;

public interface StorageBackend {
	
	FileData retrieve(String id) throws IOException;
	
	void store(String id, MediaType mediaType, InputStream in) throws IOException;
	
	void delete(String id) throws IOException;

}