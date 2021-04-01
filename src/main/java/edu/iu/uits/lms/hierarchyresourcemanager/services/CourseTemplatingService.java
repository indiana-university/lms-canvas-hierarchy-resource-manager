package edu.iu.uits.lms.hierarchyresourcemanager.services;

import canvas.client.generated.api.ContentMigrationApi;
import canvas.client.generated.model.ContentMigration;
import edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating.ContentMigrationStatus;
import edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating.TemplatedCourse;
import edu.iu.uits.lms.hierarchyresourcemanager.repository.TemplatedCourseRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CourseTemplatingService {

   @Autowired
   private ContentMigrationApi contentMigrationApi;

   @Autowired
   private TemplatedCourseRepository templatedCourseRepository;

   public void checkAndDoImsCcImport(String courseId, String termId, String accountId, String sisCourseId, String templateUrl, boolean forceApply) {
      TemplatedCourse templatedCourse = null;
      boolean templateRecordExists = templatedCourseRepository.existsById(courseId);
      if (templateRecordExists) {
         templatedCourse = templatedCourseRepository.findById(courseId).orElse(null);

         // Make sure the status is current before continuing
         updateMigrationStatusForCourse(templatedCourse);
      }

      // Only need to try and run a migration (applying template) if it has not ever been done for the course,
      // or if the previous attempt was an error
      // Or if the forceApply flag is set
      if (templatedCourse == null || TemplatedCourse.STATUS.ERROR.equals(templatedCourse.getStatus()) || forceApply) {
         log.info("Applying template to course " + courseId + " (" + sisCourseId + ")");
         ContentMigration cm = contentMigrationApi.importCCIntoCourse(courseId, null, templateUrl);
         ContentMigrationStatus cms = new ContentMigrationStatus(cm.getId(), cm.getWorkflowState());

         if (templatedCourse == null) {
            templatedCourse = new TemplatedCourse(courseId, sisCourseId, termId, TemplatedCourse.STATUS.PENDING);
         } else {
            templatedCourse.setStatus(TemplatedCourse.STATUS.PENDING);
         }
         templatedCourse.addContentMigrations(cms);
         templatedCourseRepository.save(templatedCourse);
      } else {
         log.info("Not applying template to course " + courseId + " (" + sisCourseId + ") because a template has previously been applied.");
      }
   }

   public void updateMigrationStatusForCourses(List<TemplatedCourse> templatedCourses) {
      templatedCourses.forEach(this::updateMigrationStatusForCourse);
   }

   public void updateMigrationStatusForCourse(TemplatedCourse templatedCourse) {
      // Get all migration statuses for the canvas course
      List<ContentMigration> migrationStatuses = contentMigrationApi.getMigrationStatuses(templatedCourse.getCourseId(), null);

      // Turn into a map so each individual one can be accessed
      Map<String, ContentMigration> statusMap = migrationStatuses.stream().collect(Collectors.toMap(ContentMigration::getId, status -> status, (a, b) -> b));

      List<ContentMigrationStatus> contentMigrationStatuses = templatedCourse.getContentMigrations();

      // if there are no migration statuses, don't bother doing any of this stuff since it will likely throw an error
      if (contentMigrationStatuses.size() > 0) {
         // Only care about the PENDING ones
         List<ContentMigrationStatus> filteredStatuses = contentMigrationStatuses.stream()
                 .filter(cms -> cms.getStatus().equals(ContentMigrationStatus.STATUS.PENDING))
                 .collect(Collectors.toList());

         boolean saveTemplatedCourse = false;
         for (ContentMigrationStatus status : filteredStatuses) {
            ContentMigration canvasContentMigration = statusMap.get(status.getContentMigrationId());
            if (canvasContentMigration != null) {
               // Get our internal status value from the canvas value
               ContentMigrationStatus.STATUS translatedCanvasStatus = ContentMigrationStatus.translateStatus(canvasContentMigration.getWorkflowState());
               status.setStatus(translatedCanvasStatus);
               saveTemplatedCourse = true;
            }
         }

         // if the id from the canvasContentMigration doesn't map, don't bother slowing things down with saves
         // this is likely only a scenario on test environments, but slows things down quite a bit!
         if (saveTemplatedCourse) {
            // Set the status on the templatedCourse to match the last one in the list (most recent attempt)
            templatedCourse.setStatus(contentMigrationStatuses.get(contentMigrationStatuses.size() - 1).getStatus());
            templatedCourseRepository.save(templatedCourse);
         }
      }
   }

   public List<TemplatedCourse> getTemplatedCourses(String termId, String courseId, List<TemplatedCourse.STATUS> statuses) {

      //If no statuses were passed in, set the list to include them all
      if (statuses == null || statuses.isEmpty()) {
         statuses = Arrays.asList(TemplatedCourse.STATUS.COMPLETE,
               TemplatedCourse.STATUS.PENDING,
               TemplatedCourse.STATUS.ERROR);
      }

      List<TemplatedCourse> courses;
      if (termId == null && courseId == null) {
         courses = new ArrayList<>();
      } else if (termId != null && courseId != null) {
         courses = templatedCourseRepository.findByCourseIdAndTermIdAndStatusIn(courseId, termId, statuses);
      } else if (termId == null) {
         courses = templatedCourseRepository.findByCourseIdAndStatusIn(courseId, statuses);
      } else {
         courses = templatedCourseRepository.findByTermIdAndStatusIn(termId, statuses);
      }

      return courses;
   }

   public TemplatedCourse getTemplatedCourse(String courseId) {
      return templatedCourseRepository.findById(courseId).orElse(null);
   }

   public TemplatedCourse saveTemplatedCourse(TemplatedCourse templatedCourse) {
      return templatedCourseRepository.save(templatedCourse);
   }

   public void deleteTemplatedCourse(TemplatedCourse templatedCourse) {
      templatedCourseRepository.delete(templatedCourse);
   }
}
