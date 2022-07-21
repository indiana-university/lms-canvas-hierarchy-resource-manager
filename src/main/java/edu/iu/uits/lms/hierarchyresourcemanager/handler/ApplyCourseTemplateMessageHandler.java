package edu.iu.uits.lms.hierarchyresourcemanager.handler;

import edu.iu.uits.lms.hierarchyresourcemanager.model.HierarchyResource;
import edu.iu.uits.lms.hierarchyresourcemanager.services.HierarchyResourceException;
import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeManagerService;
import edu.iu.uits.lms.iuonly.services.CourseTemplatingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ApplyCourseTemplateMessageHandler {

   @Autowired
   private CourseTemplatingService courseTemplatingService;

   @Autowired
   private NodeManagerService nodeManagerService;

   public boolean handleMessage(String courseId, String sisTermId, String accountId, String sisCourseId, boolean forceApply, Long templateId) {
      log.debug("Message received: CourseId: {}, SisTermId: {}, AccountId: {}, SisCourseId: {}, ForceApply: {}, TemplateId: {}",
            courseId, sisCourseId, accountId, sisCourseId, forceApply, templateId);

      try {
         HierarchyResource templateForCourse = nodeManagerService.getTemplate(templateId);
         String url = nodeManagerService.getUrlToFile(templateForCourse.getStoredFile());
         log.debug("Course template url: " + url);
         courseTemplatingService.checkAndDoImsCcImport(courseId, sisTermId, accountId, sisCourseId, url, forceApply);
      } catch (HierarchyResourceException e) {
         log.error("Unable to apply template to course - " + sisCourseId, e);
         return false;
      }

      return true;
   }
}
