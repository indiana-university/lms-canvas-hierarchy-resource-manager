package edu.iu.uits.lms.hierarchyresourcemanager.handler;

import edu.iu.uits.lms.common.coursetemplates.CourseTemplateMessage;
import edu.iu.uits.lms.hierarchyresourcemanager.model.HierarchyResource;
import edu.iu.uits.lms.hierarchyresourcemanager.services.CourseTemplatingService;
import edu.iu.uits.lms.hierarchyresourcemanager.services.HierarchyResourceException;
import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeManagerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@Slf4j
public class CourseTemplateMessageHandler {
   @Autowired
   private CourseTemplatingService courseTemplatingService;

   @Autowired
   private NodeManagerService nodeManagerService;

   public boolean handleMessage(Serializable message) {
      log.debug("Message received: " + message);
      CourseTemplateMessage courseMessage = (CourseTemplateMessage)message;
      String courseId = courseMessage.getCourseId();
      String sisTermId = courseMessage.getSisTermId();
      String accountId = courseMessage.getAccountId();
      String sisCourseId = courseMessage.getSisCourseId();

      try {
         HierarchyResource templateForCourse = nodeManagerService.getClosestDefaultTemplateForCanvasCourse(courseId);
         String url = nodeManagerService.getUrlToFile(templateForCourse.getStoredFile());
         log.debug("Course template (" + templateForCourse.getId() + ") url: " + url);
         courseTemplatingService.checkAndDoImsCcImport(courseId, sisTermId, accountId, sisCourseId, url, courseMessage.isForceApply());
      } catch (HierarchyResourceException e) {
         log.error("Unable to apply template to course - " + sisCourseId, e);
         return false;
      }

      return true;
   }

   public Class handlesClass() {
      return CourseTemplateMessage.class;
   }
}
