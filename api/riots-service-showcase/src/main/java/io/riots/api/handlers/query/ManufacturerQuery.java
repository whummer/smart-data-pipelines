package io.riots.api.handlers.query;

import io.riots.api.model.Manufacturer;
import io.riots.core.repositories.ManufacturerRepository;

import java.util.List;

import javax.ws.rs.NotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class ManufacturerQuery {

    @Autowired
    ManufacturerRepository manufacturerRepository;

    public Manufacturer single(String manufacturerId) {
        Manufacturer manufacturer = manufacturerRepository.findOne(manufacturerId);
        if (manufacturer == null) {
            throw new NotFoundException("No Manufacturer with ID '" + manufacturerId + "' found");
        }

        return manufacturer;
    }


    // todo implement query
    public List<Manufacturer> query(String query, Paged paged) {
        List<Manufacturer> manufacturers = manufacturerRepository.findAll(
        		new PageRequest(paged.getPage(), paged.getSize())).getContent();
        if (manufacturers.isEmpty()) {
            throw new NotFoundException("No Manufacturers found");
        }

        return manufacturers;
    }
}
