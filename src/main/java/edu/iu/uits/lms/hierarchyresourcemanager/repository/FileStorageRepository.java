package edu.iu.uits.lms.hierarchyresourcemanager.repository;

import edu.iu.uits.lms.iuonly.model.StoredFile;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Component;

@Component
public interface FileStorageRepository extends PagingAndSortingRepository<StoredFile, Long> {

}
