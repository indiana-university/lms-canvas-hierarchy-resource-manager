package edu.iu.uits.lms.hierarchyresourcemanager.handler;

import edu.iu.uits.lms.hierarchyresourcemanager.amqp.ApplyCourseTemplateMessage;
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
public class ApplyCourseTemplateMessageHandler {

   @Autowired
   private CourseTemplatingService courseTemplatingService;

   @Autowired
   private NodeManagerService nodeManagerService;

   public boolean handleMessage(Serializable message) {
      log.debug("Message received: " + message);
      ApplyCourseTemplateMessage courseMessage = (ApplyCourseTemplateMessage)message;
      String courseId = courseMessage.getCourseId();
      String sisTermId = courseMessage.getSisTermId();
      String accountId = courseMessage.getAccountId();
      String sisCourseId = courseMessage.getSisCourseId();
      Long templateId = courseMessage.getTemplateId();

      try {
         HierarchyResource templateForCourse = nodeManagerService.getTemplate(templateId);
         String url = nodeManagerService.getUrlToFile(templateForCourse.getStoredFile());
         log.debug("Course template url: " + url);
         courseTemplatingService.checkAndDoImsCcImport(courseId, sisTermId, accountId, sisCourseId, url, courseMessage.isForceApply());
      } catch (HierarchyResourceException e) {
         log.error("Unable to apply template to course - " + sisCourseId, e);
         return false;
      }

      return true;
   }

   public Class handlesClass() {
      return ApplyCourseTemplateMessage.class;
   }
}
