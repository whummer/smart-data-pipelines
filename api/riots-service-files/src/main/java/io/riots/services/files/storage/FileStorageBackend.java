package io.riots.services.files.storage;

import io.riots.services.files.FileData;
import io.riots.services.files.IStorageBackend;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import javax.annotation.PostConstruct;
import javax.ws.rs.core.MediaType;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component("file-storage")
public class FileStorageBackend implements IStorageBackend {
	
	private static final String METADATA_EXT = ".metadata";
	
	@Value("${storage.directory}")
	private String directory;	
	
	@PostConstruct
	public void init() {
		new File(directory).mkdirs();
	}

	@Override
	public void store(String id, MediaType mediaType, InputStream in)
			throws IOException {
		FileUtils.copyInputStreamToFile(in, new File(directory, id));
		FileUtils.writeStringToFile(new File(directory, id + METADATA_EXT), mediaType.toString());
	}

	@Override
	public FileData retrieve(String id) throws IOException {		
		String contentType = FileUtils.readFileToString(new File(directory, id + METADATA_EXT));
		byte[] data = FileUtils.readFileToByteArray(new File(directory, id));
		return new FileData(contentType, data);
	}
	
	@Override
	public void delete(String id) throws IOException {
		new File(directory, id).delete();
		new File(directory, id + METADATA_EXT).delete();
	}


}
