package edu.iu.uits.lms.hierarchyresourcemanager.rest;

import edu.iu.uits.lms.hierarchyresourcemanager.amqp.ContentMigrationStatusUpdateMessage;
import edu.iu.uits.lms.hierarchyresourcemanager.amqp.ContentMigrationStatusUpdateMessageSender;
import edu.iu.uits.lms.hierarchyresourcemanager.model.RestTemplatedCourse;
import edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating.ContentMigrationStatus;
import edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating.TemplatedCourse;
import edu.iu.uits.lms.hierarchyresourcemanager.services.CourseTemplatingService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/rest/coursetemplate")
@Slf4j
public class CourseTemplatingSpringRestWebservice {

   private static final String TYPE_LIVE = "live";
   private static final String TYPE_QUEUE = "queue";

   @Autowired
   private CourseTemplatingService courseTemplatingService;

   @Autowired
   private ContentMigrationStatusUpdateMessageSender contentMigrationStatusUpdateMessageSender;

   @PostMapping("/find")
   public List<TemplatedCourse> findTemplatedCourses(@RequestBody RequestModel requestModel) {

      String termId = requestModel.getTermId();
      String courseId = requestModel.getCourseId();
      List<TemplatedCourse.STATUS> statuses = requestModel.getStatuses();

      List<TemplatedCourse> courses = courseTemplatingService.getTemplatedCourses(termId, courseId, statuses);
      return courses;
   }

   @PostMapping(value = "update/{runType}", produces = {MediaType.TEXT_PLAIN_VALUE})
   public ResponseEntity triggerStatusUpdate(@RequestBody RequestModel requestModel, @PathVariable String runType) {
      String statusText = "error";
      HttpStatus status = HttpStatus.NOT_FOUND;
      if (TYPE_QUEUE.equalsIgnoreCase(runType)) {
         ContentMigrationStatusUpdateMessage cmsum = new ContentMigrationStatusUpdateMessage(
                 requestModel.getCourseId(),
                 requestModel.getTermId(),
                 requestModel.getStatuses());
         contentMigrationStatusUpdateMessageSender.send(cmsum);
         statusText = "queued";
         status = HttpStatus.OK;
      } else if (TYPE_LIVE.equalsIgnoreCase(runType)) {
         courseTemplatingService.updateMigrationStatusForCourses(findTemplatedCourses(requestModel));
         statusText = "done";
         status = HttpStatus.OK;
      }
      return ResponseEntity.status(status).body(statusText);
   }

   @PostMapping
   public TemplatedCourse createTemplatedCourse(@RequestBody TemplatedCourse templatedCourse) {
      TemplatedCourse tc = new TemplatedCourse();
      tc.setCourseId(templatedCourse.getCourseId());
      tc.setSisCourseId(templatedCourse.getSisCourseId());
      tc.setTermId(templatedCourse.getTermId());
      tc.setStatus(templatedCourse.getStatus());
      tc.setIu_crseld_status_added(templatedCourse.isIu_crseld_status_added());

      if (templatedCourse.getContentMigrations() != null) {
         for (ContentMigrationStatus cms : templatedCourse.getContentMigrations()) {
            ContentMigrationStatus newCms = new ContentMigrationStatus(cms.getContentMigrationId(), cms.getStatus());
            tc.addContentMigrations(newCms);
         }
      }
      return courseTemplatingService.saveTemplatedCourse(tc);
   }

   @PutMapping("/{courseId}")
   public TemplatedCourse updateTemplatedCourse(@PathVariable String courseId, @RequestBody RestTemplatedCourse templatedCourse) {
      TemplatedCourse tc = courseTemplatingService.getTemplatedCourse(courseId);

      if (templatedCourse.getSisCourseId() != null) {
         tc.setSisCourseId(templatedCourse.getSisCourseId());
      }

      if (templatedCourse.getTermId() != null) {
         tc.setTermId(templatedCourse.getTermId());
      }

      if (templatedCourse.getStatus() != null) {
         tc.setStatus(templatedCourse.getStatus());
      }

      if (templatedCourse.getIu_crseld_status_added() != null) {
         tc.setIu_crseld_status_added(templatedCourse.getIu_crseld_status_added());
      }

      if (templatedCourse.getContentMigrations() != null) {
         tc.getContentMigrations().clear();
         for (ContentMigrationStatus cms : templatedCourse.getContentMigrations()) {
            ContentMigrationStatus newCms = new ContentMigrationStatus(cms.getContentMigrationId(), cms.getStatus());
            tc.addContentMigrations(newCms);
         }
      }

      return courseTemplatingService.saveTemplatedCourse(tc);
   }

   @DeleteMapping("/{courseId}")
   public ResponseEntity deleteTemplatedCourse(@PathVariable String courseId) {
      TemplatedCourse tc = courseTemplatingService.getTemplatedCourse(courseId);
      if (tc != null) {
         courseTemplatingService.deleteTemplatedCourse(tc);
         return ResponseEntity.ok("success");
      } else {
         return ResponseEntity.notFound().build();
      }
   }


   @Data
   @AllArgsConstructor
   @NoArgsConstructor
   public static class RequestModel {
      private String courseId;
      private String termId;
      private List<TemplatedCourse.STATUS> statuses;
   }

}
