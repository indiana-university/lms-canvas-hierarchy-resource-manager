package edu.iu.uits.lms.hierarchyresourcemanager.handler;

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

import edu.iu.uits.lms.hierarchyresourcemanager.services.HierarchyResourceException;
import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeManagerService;
import edu.iu.uits.lms.iuonly.model.HierarchyResource;
import edu.iu.uits.lms.iuonly.services.CourseTemplatingService;
import edu.iu.uits.lms.iuonly.services.TemplateAuditService;
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

   @Autowired
   private TemplateAuditService templateAuditService;

   public boolean handleMessage(String courseId, String sisTermId, String accountId, String sisCourseId, boolean forceApply,
                                Long templateId, String activityType, String activityUser) {
      log.debug("Message received: CourseId: {}, SisTermId: {}, AccountId: {}, SisCourseId: {}, ForceApply: {}, TemplateId: {}",
            courseId, sisCourseId, accountId, sisCourseId, forceApply, templateId);

      try {
         HierarchyResource templateForCourse = nodeManagerService.getTemplate(templateId);
         String url = nodeManagerService.getUrlToFile(templateForCourse.getStoredFile());
         log.debug("Course template url: " + url);
         courseTemplatingService.checkAndDoImsCcImport(courseId, sisTermId, accountId, sisCourseId, url, forceApply);
         templateAuditService.audit(courseId, templateForCourse, activityType, activityUser);
      } catch (HierarchyResourceException e) {
         log.error("Unable to apply template to course - " + sisCourseId, e);
         return false;
      }

      return true;
   }
}
