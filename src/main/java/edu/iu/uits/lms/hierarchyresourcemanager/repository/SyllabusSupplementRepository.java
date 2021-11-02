package edu.iu.uits.lms.hierarchyresourcemanager.repository;

import edu.iu.uits.lms.hierarchyresourcemanager.model.SyllabusSupplement;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface SyllabusSupplementRepository extends PagingAndSortingRepository<SyllabusSupplement, Long> {
   SyllabusSupplement findByNodeAndStrm(String nodeName, int strm);
   List<SyllabusSupplement> findByNodeIn(List<String> nodeName);
   List<SyllabusSupplement> findByNodeInAndStrm(List<String> nodeName, int strm);
}
