package edu.iu.uits.lms.hierarchyresourcemanager.repository;

import edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating.TemplatedCourse;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("TemplatedCourseRepository")
public interface TemplatedCourseRepository extends PagingAndSortingRepository<TemplatedCourse, String> {

    List<TemplatedCourse> findByTermIdAndStatusIn(@Param("termId") String termId,
                                                  @Param("status") List<TemplatedCourse.STATUS> statuses);

    List<TemplatedCourse> findByCourseIdAndStatusIn(@Param("courseId") String courseId,
                                                    @Param("status") List<TemplatedCourse.STATUS> statuses);

    List<TemplatedCourse> findByCourseIdAndTermIdAndStatusIn(@Param("courseId") String courseId,
                                                             @Param("termId") String termId,
                                                             @Param("status") List<TemplatedCourse.STATUS> statuses);

    List<TemplatedCourse> findBySisCourseId(@Param("sisCourseId") String sisCourseId);
}
