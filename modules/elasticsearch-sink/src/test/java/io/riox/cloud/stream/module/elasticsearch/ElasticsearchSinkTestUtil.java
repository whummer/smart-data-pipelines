package io.riox.cloud.stream.module.elasticsearch;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;

/**
 * @author Oliver Moser
 */
@Component
public class ElasticsearchSinkTestUtil {

	@Autowired
	ApplicationContext context;

	public String getFileContent(String filename) throws IOException {
		File tweetFile = context.getResource("classpath:" + filename).getFile();
		return FileUtils.readFileToString(tweetFile);
	}

	public String getSampleDocumentWithId(String filename, String documentId) throws IOException {
		String fileContent = getFileContent(filename);
		return StringUtils.replace(fileContent, "%ID%", documentId);
	}
}
