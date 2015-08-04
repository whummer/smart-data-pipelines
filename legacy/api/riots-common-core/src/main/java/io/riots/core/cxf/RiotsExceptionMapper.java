package io.riots.core.cxf;

import io.riots.core.docs.DocumentationProvider;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;

import org.springframework.beans.factory.annotation.Autowired;

/**
 * @author omoser
 */

//@Provider
//@Component
public class RiotsExceptionMapper implements ExceptionMapper<Exception> {

    @Autowired
    DocumentationProvider documentationProvider;

    @Override
    public Response toResponse(Exception exception) {
/*
       if (exception instanceof NoSuchAppIdException) {
            return Response
                    .status(NOT_FOUND)
                    .type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(new ErrorResponse()
                            .withCode(NOT_FOUND.getStatusCode())
                            .withMessage("No artifact/metadata found for given arguments.")
                            .withDocumentationUri(documentationProvider.buildUri(NOT_FOUND.getStatusCode())))
                    .build();
        } else if (exception instanceof ArtifactMetadataValidatorException) {
            return Response
                    .status(BAD_REQUEST)
                    .type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(new ErrorResponse()
                            .withCode(BAD_REQUEST.getStatusCode())
                            .withMessage("Artifact metadata validation failed: " + exception.getMessage())
                            .withDocumentationUri(documentationProvider.buildUri(BAD_REQUEST.getStatusCode())))
                    .build();
        }*/

        return Response.serverError().entity("Internal Error").build();
    }

    /*class ErrorResponse {

        private int code;

        private String message;

        private String documentationUri;

        @JsonProperty("error-code")
        public int getCode() {
            return code;
        }

        @JsonProperty("error-message")
        public String getMessage() {
            return message;
        }

        @JsonProperty("documentation-uri")
        public String getDocumentationUri() {
            return documentationUri;
        }

        public ErrorResponse withDocumentationUri(final String documentationUri) {
            this.documentationUri = documentationUri;
            return this;
        }

        public ErrorResponse withCode(final int code) {
            this.code = code;
            return this;
        }

        public ErrorResponse withMessage(final String message) {
            this.message = message;
            return this;
        }


    }*/
}
