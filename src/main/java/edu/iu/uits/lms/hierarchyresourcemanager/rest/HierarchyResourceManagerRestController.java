package edu.iu.uits.lms.hierarchyresourcemanager.rest;

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

import edu.iu.uits.lms.hierarchyresourcemanager.amqp.CourseTemplateMessageSender;
import edu.iu.uits.lms.hierarchyresourcemanager.services.HierarchyResourceException;
import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeManagerService;
import edu.iu.uits.lms.iuonly.model.HierarchyResource;
import edu.iu.uits.lms.iuonly.model.StoredFile;
import edu.iu.uits.lms.iuonly.repository.FileStorageRepository;
import edu.iu.uits.lms.iuonly.repository.HierarchyResourceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;

@RestController("hrmRestController")
@RequestMapping({"/rest/hrm"})
@Tag(name = "HierarchyResourceManagerRestController", description = "Some tool specific interactions with the HierarchyResource table")
public class HierarchyResourceManagerRestController {

    @Autowired
    private HierarchyResourceRepository hierarchyResourceRepository;

    @Autowired
    private FileStorageRepository fileStorageRepository;

    @Autowired
    private NodeManagerService hierarchyResourceService;

    @Autowired
    private CourseTemplateMessageSender courseTemplateMessageSender;

    @GetMapping("/iuSiteId/{iuSiteId}")
    @Operation(summary = "Get a HierarchyResource (template) that is in the closest node based on the course's SIS ID")
    public ResponseEntity getNodeFromIuSiteId(@PathVariable String iuSiteId) {
        try {
            HierarchyResource hierarchyResource = hierarchyResourceService.getClosestDefaultTemplateForSisCourse(iuSiteId);
            return ResponseEntity.status(HttpStatus.OK).body(hierarchyResource);
        } catch (HierarchyResourceException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/canvasCourseId/{canvasCourseId}")
    @Operation(summary = "Get a HierarchyResource (template) that is in the closest node based on the course's Canvas ID")
    public ResponseEntity getNodeFromCanvasCourseId(@PathVariable String canvasCourseId) {
        try {
            HierarchyResource hierarchyResource = hierarchyResourceService.getClosestDefaultTemplateForCanvasCourse(canvasCourseId);
            return ResponseEntity.status(HttpStatus.OK).body(hierarchyResource);
        } catch (HierarchyResourceException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/canvasCourseId/{canvasCourseId}/node")
    @Operation(summary = "Get a HierarchyResource (template) that is in the closest node based on the course's Canvas ID.  Mask out the file content.")
    public ResponseEntity getNodeFromCanvasCourseIdScrubbed(@PathVariable String canvasCourseId) {
        try {
            HierarchyResource hierarchyResource = hierarchyResourceService.getClosestDefaultTemplateForCanvasCourse(canvasCourseId);
            //Mask out the file content
            hierarchyResource.setStoredFile(null);
            return ResponseEntity.status(HttpStatus.OK).body(hierarchyResource);
        } catch (HierarchyResourceException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/canvasCourseId/{canvasCourseId}")
    @Operation(summary = "Apply a template to a course by the its Canvas ID")
    public ResponseEntity applyTemplateToCourse(@PathVariable String canvasCourseId, Principal principal) {
        String username = null;
        if (principal instanceof JwtAuthenticationToken) {
            username = ((JwtAuthenticationToken) principal).getToken().getClaimAsString("user_name");
        }
        return hierarchyResourceService.applyTemplateToCourse(canvasCourseId, "HRM_REST_APPLY", username);
    }

    @PostMapping(value="/upload")
    @Operation(summary = "Upload a new template file")
    public String uploadNewTemplateFile(@RequestParam("templateFile") MultipartFile templateFile) throws IOException {
        StoredFile storedFile = new StoredFile();
        storedFile.setContent(templateFile.getBytes());
        storedFile.setDisplayName(templateFile.getOriginalFilename());

        fileStorageRepository.save(storedFile);

        return "Template uploaded successfully";
    }
}
