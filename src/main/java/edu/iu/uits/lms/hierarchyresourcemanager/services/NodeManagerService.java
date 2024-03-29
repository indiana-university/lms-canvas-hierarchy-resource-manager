package edu.iu.uits.lms.hierarchyresourcemanager.services;

/*-
 * #%L
 * lms-lti-hierarchyresourcemanager
 * %%
 * Copyright (C) 2015 - 2022 Indiana University
 * %%
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the Indiana University nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 * #L%
 */

import edu.iu.uits.lms.canvas.helpers.CourseHelper;
import edu.iu.uits.lms.canvas.model.Account;
import edu.iu.uits.lms.canvas.model.Course;
import edu.iu.uits.lms.canvas.services.AccountService;
import edu.iu.uits.lms.canvas.services.CanvasService;
import edu.iu.uits.lms.canvas.services.CourseService;
import edu.iu.uits.lms.common.coursetemplates.CourseTemplateMessage;
import edu.iu.uits.lms.hierarchyresourcemanager.amqp.CourseTemplateMessageSender;
import edu.iu.uits.lms.hierarchyresourcemanager.config.ToolConfig;
import edu.iu.uits.lms.hierarchyresourcemanager.handler.ApplyCourseTemplateMessageHandler;
import edu.iu.uits.lms.hierarchyresourcemanager.model.CourseTemplatesWrapper;
import edu.iu.uits.lms.hierarchyresourcemanager.model.DecoratedSyllabus;
import edu.iu.uits.lms.hierarchyresourcemanager.model.SyllabusSupplement;
import edu.iu.uits.lms.hierarchyresourcemanager.repository.SyllabusSupplementRepository;
import edu.iu.uits.lms.iuonly.model.HierarchyResource;
import edu.iu.uits.lms.iuonly.model.StoredFile;
import edu.iu.uits.lms.iuonly.repository.HierarchyResourceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NodeManagerService {

   @Autowired
   private HierarchyResourceRepository hierarchyResourceRepository;

   @Autowired
   private SyllabusSupplementRepository syllabusSupplementRepository;

   @Autowired
   private CourseService courseService;

   @Autowired
   private AccountService accountService;

   @Autowired
   private CanvasService canvasService;

   @Autowired
   private ApplyCourseTemplateMessageHandler applyCourseTemplateMessageHandler;

   @Autowired
   private ToolConfig toolConfig;
  
   @Autowired
   private CourseTemplateMessageSender courseTemplateMessageSender;

   public HierarchyResource getTemplate(Long templateId) throws HierarchyResourceException {
      HierarchyResource hierarchyResource = hierarchyResourceRepository.findById(templateId).orElse(null);
      if (hierarchyResource == null) {
         throw new HierarchyResourceException("Could not find template with id " + templateId);
      }
      return hierarchyResource;
   }

   public CourseTemplatesWrapper getAvailableTemplatesForSisCourse(String sisCourseId) throws HierarchyResourceException {
      Course course = courseService.getCourse("sis_course_id:" + sisCourseId);
      return getAvailableTemplatesForCourse(course);
   }

   public CourseTemplatesWrapper getAvailableTemplatesForCanvasCourse(String canvasCourseId) throws HierarchyResourceException {
      Course course = courseService.getCourse(canvasCourseId);
      return getAvailableTemplatesForCourse(course);
   }

   private CourseTemplatesWrapper getAvailableTemplatesForCourse(Course course) throws HierarchyResourceException {
      String bodyText = "";
      CourseTemplatesWrapper courseTemplatesWrapper = new CourseTemplatesWrapper();
      List<HierarchyResource> hierarchyResources = new ArrayList<>();
      if (course != null) {
         Account account = accountService.getAccount(course.getAccountId());
         if (account != null) {
            // specific account doesn't exist in our table, let's see if there's a parent
            List<String> relatedAccountNames = new ArrayList<>();
            accountService.getParentAccounts(account.getId()).forEach(parentAccount -> relatedAccountNames.add(parentAccount.getName()));
            Collections.reverse(relatedAccountNames);

            for (String accountName : relatedAccountNames) {
               List<HierarchyResource> parentHierarchyResources = hierarchyResourceRepository.findByNode(accountName);
               if (parentHierarchyResources != null) {
                  hierarchyResources.addAll(parentHierarchyResources);
               }
            }

            List<HierarchyResource> hierarchyResourcesForNode = hierarchyResourceRepository.findByNode(account.getName());
            if (hierarchyResourcesForNode != null) {
               hierarchyResources.addAll(hierarchyResourcesForNode);
            }

            if (!hierarchyResources.isEmpty()) {
               courseTemplatesWrapper.setTemplates(hierarchyResources);
               courseTemplatesWrapper.setCourseId(course.getId());
               courseTemplatesWrapper.setCoursePublished(CourseHelper.isPublished(course));
               return courseTemplatesWrapper;
            }

            // if we're here, could not find a record in our table
            bodyText = "No node found for " + course.getId() + " (" + course.getSisCourseId() + ")";
         } else {
            bodyText = "Could not find account!";
         }
      } else {
         bodyText = "Course does not exist!";
      }

      // if we made it here, it did not find something along the way
      throw new HierarchyResourceException(bodyText);
   }

   public ResponseEntity applyTemplateToCourse(String canvasCourseId, Long templateId, String activityType, String activityUser) {
      //Make sure our params are good
      if (canvasCourseId == null || canvasCourseId.isEmpty()) {
         return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Canvas Course ID is required but was not provided");
      }

      if (templateId == null) {
         return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Template ID is required but was not provided");
      }

      //Make sure we have a course
      Course course = courseService.getCourse(canvasCourseId);
      if (course == null) {
         return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found: " + canvasCourseId);
      }

      //Make sure it is unpublished
      if (CourseHelper.isPublished(course)) {
         return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Canvas Course must be unpublished");
      }

      // Canvas work around to set the homepage to modules to make sure the template's home page is applied
      courseService.updateCourseFrontPage(canvasCourseId, "modules");

      try {
         //Trigger a content migration, which will setup the course from the template
         HierarchyResource templateForCourse = getTemplate(templateId);
         String url = getUrlToFile(templateForCourse.getStoredFile());

         boolean result = applyCourseTemplateMessageHandler.handleMessage(canvasCourseId, course.getTerm().getSisTermId(),
                 course.getAccountId(), course.getSisCourseId(), true, templateId, activityType, activityUser,
                 templateForCourse, url);
         if (result) {
            return ResponseEntity.status(HttpStatus.OK).body("Request has been sent for template processing");
         } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something bad happened");
         }
      } catch (HierarchyResourceException hierarchyResourceException) {
         log.error("Unable to find template - " + templateId, hierarchyResourceException);
         return null;
      }
   }

   public ResponseEntity<String> applyTemplateToCourse(String canvasCourseId, String activityType, String activityUser) {
      //Make sure our params are good
      if (canvasCourseId == null || canvasCourseId.isEmpty()) {
         return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Canvas Course ID is required but was not provided");
      }

      //Make sure we have a course
      Course course = courseService.getCourse(canvasCourseId);
      if (course == null) {
         return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found: " + canvasCourseId);
      }

      //Make sure it is unpublished
      if (CourseHelper.isPublished(course)) {
         return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Canvas Course must be unpublished");
      }

      //Trigger a content migration, which will setup the course from the template
      CourseTemplateMessage ctm = new CourseTemplateMessage(canvasCourseId, course.getTerm().getSisTermId(),
            course.getAccountId(), course.getSisCourseId(), true, activityType, activityUser);

      // Canvas work around to set the homepage to modules to make sure the template's home page is applied
      courseService.updateCourseFrontPage(canvasCourseId, "modules");

      courseTemplateMessageSender.send(ctm);

      return ResponseEntity.status(HttpStatus.OK).body("Request has been sent for template processing");
   }

   public HierarchyResource getClosestDefaultTemplateForCanvasCourse(String canvasCourseId) throws HierarchyResourceException {
      Course course = courseService.getCourse(canvasCourseId);
      return getClosestDefaultTemplateForCourse(course);
   }

   public HierarchyResource getClosestDefaultTemplateForSisCourse(String sisCourseId) throws HierarchyResourceException {
      Course course = courseService.getCourse("sis_course_id:" + sisCourseId);
      return getClosestDefaultTemplateForCourse(course);
   }

   /**
    * Get the closest template that is marked as a default
    * @param course
    * @return
    * @throws HierarchyResourceException
    */
   private HierarchyResource getClosestDefaultTemplateForCourse(Course course) throws HierarchyResourceException {
      String bodyText = "";
      if (course!=null) {
         Account account = accountService.getAccount(course.getAccountId());
         if (account!=null) {
            List<HierarchyResource> hierarchyResources = hierarchyResourceRepository.findByNodeAndDefaultTemplateTrue(account.getName());
            if (hierarchyResources != null && hierarchyResources.size() == 1) {
               return hierarchyResources.get(0);
            } else {
               // specific account doesn't exist in our table, let's see if there's a parent
               List<String> relatedAccountNames = new ArrayList<>();
               accountService.getParentAccounts(account.getId()).forEach(parentAccount -> relatedAccountNames.add(parentAccount.getName()));

               for (String accountName : relatedAccountNames) {
                  List<HierarchyResource> parentHierarchyResources = hierarchyResourceRepository.findByNodeAndDefaultTemplateTrue(accountName);
                  if (parentHierarchyResources != null && parentHierarchyResources.size() == 1) {
                     return parentHierarchyResources.get(0);
                  }
               }
            }

            // if we're here, could not find a record in our table
            bodyText = "No node found for " + course.getId() + " (" + course.getSisCourseId() + ")";
         } else {
            bodyText = "Could not find account!";
         }
      } else {
         bodyText = "Course does not exist!";
      }

      // if we made it here, it did not find something along the way
      throw new HierarchyResourceException(bodyText);
   }

   public String getUrlToFile(StoredFile storedFile) {
      String baseUrl = toolConfig.getTemplateHostingUrl();
      return MessageFormat.format("{0}/rest/iu/file/download/{1}/{2}", baseUrl, storedFile.getId(), storedFile.getDisplayName());
   }

   public List<HierarchyResource> getTemplatesForNode(String nodeName) {
      List<HierarchyResource> hierarchyResource = hierarchyResourceRepository.findByNode(nodeName);
      return hierarchyResource;
   }

   public HierarchyResource saveTemplate(HierarchyResource resource) {
      return hierarchyResourceRepository.save(resource);
   }

   public void deleteTemplate(HierarchyResource resource) {
      hierarchyResourceRepository.delete(resource);
   }

   public SyllabusSupplement getSyllabusSupplementForNode(String node, String strm) {
      return syllabusSupplementRepository.findByNodeAndStrm(node, strm);
   }

   public SyllabusSupplement saveSyllabusSupplement(SyllabusSupplement syllabusSupplement) {
      return syllabusSupplementRepository.save(syllabusSupplement);
   }

   public void deleteSyllabusSupplement(SyllabusSupplement syllabusSupplement) {
      syllabusSupplementRepository.delete(syllabusSupplement);
   }

   public List<DecoratedSyllabus> getSyllabusDataForCourse(String courseId) {
      List<DecoratedSyllabus> decoratedSyllabi = new ArrayList<>();
      Course course = courseService.getCourse(courseId);
      if (course != null) {
         Account account = accountService.getAccount(course.getAccountId());
         String termId = toolConfig.getDefaultTermId();

         // this will rarely happen, but adding as a safety valve
         if (course.getTerm() != null && course.getTerm().getSisTermId() != null) {
            termId = course.getTerm().getSisTermId();
         }

         List<String> relatedAccountNames = new ArrayList<>();
         relatedAccountNames.add(account.getName());

         accountService.getParentAccounts(account.getId()).forEach(parentAccount -> relatedAccountNames.add(parentAccount.getName()));

         List<SyllabusSupplement> items = new ArrayList<>();
         List<SyllabusSupplement> items2wow = new ArrayList<>();
         // get the defaults
         items = syllabusSupplementRepository.findByNodeInAndStrm(relatedAccountNames, toolConfig.getDefaultTermId());

         // if the termId is not 9999 and is all numbers, look up the specific nodes for a term
         if (!toolConfig.getDefaultTermId().equals(termId) && termId.matches("[0-9]+")) {
            items2wow = syllabusSupplementRepository.findByNodeInAndStrm(relatedAccountNames, termId);
         }

         // loop through the specific term results and if there is a nodeName match, remove it from the default list
         for (SyllabusSupplement ss : items2wow) {
            String node = ss.getNode();
            for (SyllabusSupplement defaultSyllabusSupplement : items) {
               if (defaultSyllabusSupplement.getNode().equals(node)) {
                  // found a match, so remove it
                  items.remove(defaultSyllabusSupplement);
                  break;
               }
            }
         }

         // combine the filtered defaults and term specifics into one list
         List<SyllabusSupplement> finalList = new ArrayList<>();
         finalList.addAll(items);
         finalList.addAll(items2wow);

         // convert the list to desired end result
         decoratedSyllabi = finalList.stream().map(DecoratedSyllabus::new).collect(Collectors.toList());

         decoratedSyllabi.sort(Comparator.comparing(item -> relatedAccountNames.indexOf(item.getNodeName())));
      }
      return decoratedSyllabi;
   }

   public void templateDefaultChange(String templateId, boolean isEnablingDefault) throws HierarchyResourceException {
      try {
         HierarchyResource baseHierarchyResource = getTemplate(Long.parseLong(templateId));

         if (isEnablingDefault) {
            // check to see if there's another template in the node that is set to default
            List<HierarchyResource> siblingHierarchyResources = hierarchyResourceRepository.findByNodeAndDefaultTemplateTrue(baseHierarchyResource.getNode());
            if (!siblingHierarchyResources.isEmpty()) {
               // if we're here, disable default on the sibling template
               // should only be one HierarchyResource in the list
               HierarchyResource hierarchyResourceWithDefault = siblingHierarchyResources.get(0);
               hierarchyResourceRepository.changeTemplateDefaultStatus(hierarchyResourceWithDefault.getId(), false);
            }
         }
         hierarchyResourceRepository.changeTemplateDefaultStatus(baseHierarchyResource.getId(), isEnablingDefault);
      } catch (HierarchyResourceException e) {
         throw new HierarchyResourceException("uh oh");
      }
   }
}
