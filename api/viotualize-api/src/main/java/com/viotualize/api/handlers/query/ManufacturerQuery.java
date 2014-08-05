package com.viotualize.api.handlers.query;

import com.viotualize.core.domain.Manufacturer;
import com.viotualize.core.repositories.ManufacturerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import javax.ws.rs.NotFoundException;
import java.util.List;

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
