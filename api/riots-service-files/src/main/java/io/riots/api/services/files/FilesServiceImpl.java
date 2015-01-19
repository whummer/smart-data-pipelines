package io.riots.api.services.files;

import io.riots.core.util.ServiceUtil;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URL;
import java.util.UUID;

import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.commons.codec.binary.Base64InputStream;
import org.apache.cxf.jaxrs.ext.MessageContext;
import org.apache.cxf.jaxrs.ext.multipart.Attachment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class FilesServiceImpl implements FilesService {

	static final Logger log = LoggerFactory.getLogger(FilesServiceImpl.class);

	// FIXME I don't want a qualifier, I want to load it based on the qualifier name in application.yml
	@Autowired
	@Qualifier("file-storage") 
	IStorageBackend storageBackend;

    @Context
    MessageContext context; 
    
	@Override
	public byte[] retrieve(String id) {		
		try {
			FileData data = storageBackend.retrieve(id);
			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_OK);
			ServiceUtil.setResponseContentType(context, data.getContentType());
			return data.getData();
		} catch (IOException e) {
			log.error("Error in GET request: ", e);
			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return null;
		}
	}

	@Override
	public String upload(String name, Attachment attr) {		
		String fileId = UUID.randomUUID().toString();
		try {
			storageBackend.store(fileId, attr.getContentType(), attr.getDataHandler().getInputStream());			
			URL location = ServiceUtil.getHref(String.format("files/%s", fileId));
			ServiceUtil.setLocationHeader(context, location);		
			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_CREATED);	
			return fileId;
		} catch (IOException e) {
			log.error("Error in POST request: ", e);
			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return null;
		}			
		
	}

	@Override
	public String create(FileData data) {
		String fileId = UUID.randomUUID().toString();
		try {			
			storageBackend.store(fileId, MediaType.valueOf(data.getContentType()), 
					new Base64InputStream(new ByteArrayInputStream(data.getImageBase64().getBytes())));
			URL location = ServiceUtil.getHref(String.format("files/%s", fileId));
			ServiceUtil.setLocationHeader(context, location);		
			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_CREATED);	
			return fileId;
		} catch (IOException e) {
			log.error("Error in POST request: ", e);
			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return null;
		}
	}

	@Override
	public void delete(String id) {
		try {						
			storageBackend.delete(id);
			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_NO_CONTENT);
		} catch (IOException e) {
			log.error("Error in DELETE request: ", e);
			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
	}

	
}