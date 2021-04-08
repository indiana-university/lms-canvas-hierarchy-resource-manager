package edu.iu.uits.lms.hierarchyresourcemanager.handler;

import canvas.client.generated.api.CanvasApi;
import edu.iu.uits.lms.hierarchyresourcemanager.amqp.ContentMigrationStatusUpdateMessage;
import edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating.TemplatedCourse;
import edu.iu.uits.lms.hierarchyresourcemanager.services.CourseTemplatingService;
import email.client.generated.api.EmailApi;
import email.client.generated.model.EmailDetails;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Component
@Slf4j
public class ContentMigrationStatusMessageHandler {

   @Autowired
   private CourseTemplatingService courseTemplatingService;

   @Autowired
   private EmailApi emailApi;

   @Autowired
   private CanvasApi canvasApi;

   public boolean handleMessage(Serializable message) {
      log.debug("Message received: " + message);
      ContentMigrationStatusUpdateMessage statusUpdateMessage = (ContentMigrationStatusUpdateMessage) message;

      Date startTime = new Date();

      String termId = statusUpdateMessage.getTermId();
      String sisCourseId = statusUpdateMessage.getSisCourseId();
      List<TemplatedCourse.STATUS> statuses = statusUpdateMessage.getStatuses();

      List<TemplatedCourse> courses = courseTemplatingService.getTemplatedCourses(termId, sisCourseId, statuses);
      courseTemplatingService.updateMigrationStatusForCourses(courses);

      Date endTime = new Date();

      StringBuilder emailMessage = new StringBuilder();

      DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd - H:mm:ss");

      emailMessage.append("Start time: ".concat(dateFormat.format(startTime)));
      emailMessage.append("\nEnd time:   ".concat(dateFormat.format(endTime)));
      emailMessage.append("\n\nRunning for the following inputs: ");

      if (termId != null) {
         emailMessage.append("\n - TermId: ".concat(termId));
      }

      if (sisCourseId != null) {
         emailMessage.append("\n - SisCourseId: ".concat(sisCourseId));
      }

      if (statuses != null && !statuses.isEmpty()) {
         emailMessage.append("\n - Statuses: ".concat(StringUtils.join(statuses, ",")));
      }
      emailMessage.append("\n\nCourse dataset: ".concat(String.valueOf(courses.size())));

      sendResultsEmail(emailMessage.toString());
      return true;
   }

   public Class handlesClass() {
      return ContentMigrationStatusUpdateMessage.class;
   }

   private void sendResultsEmail(String bodyMessage) {
      String subject = emailApi.getStandardHeader() + " ContentMigrationStatus Update on " + canvasApi.getBaseUrl();

      EmailDetails emailDetails = new EmailDetails();
      emailDetails.setSubject(subject);
      emailDetails.setBody(bodyMessage);

      emailApi.sendEmail(emailDetails, true);
   }
}
