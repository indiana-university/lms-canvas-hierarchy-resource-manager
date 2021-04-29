package edu.iu.uits.lms.hierarchyresourcemanager.rest;

import edu.iu.uits.lms.hierarchyresourcemanager.controller.HierarchyResourceManagerController;
import edu.iu.uits.lms.hierarchyresourcemanager.model.CourseTemplatesWrapper;
import edu.iu.uits.lms.hierarchyresourcemanager.model.DecoratedResource;
import edu.iu.uits.lms.hierarchyresourcemanager.model.DecoratedSyllabus;
import edu.iu.uits.lms.hierarchyresourcemanager.model.HierarchyResource;
import edu.iu.uits.lms.hierarchyresourcemanager.model.StoredFile;
import edu.iu.uits.lms.hierarchyresourcemanager.model.SyllabusSupplement;
import edu.iu.uits.lms.hierarchyresourcemanager.model.form.SyllabusSupplementForm;
import edu.iu.uits.lms.hierarchyresourcemanager.services.HierarchyResourceException;
import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeManagerService;
import edu.iu.uits.lms.lti.security.LtiAuthenticationToken;
import iuonly.client.generated.api.NodeHierarchyApi;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/app/tool")
@Slf4j
public class ToolRestController extends HierarchyResourceManagerController {

   @Autowired
   private NodeManagerService nodeManagerService;

   @Autowired
   private NodeHierarchyApi nodeHierarchyApi;

   @GetMapping("/hierarchy")
   public List<HierarchyOption> getNodes() {
      getTokenWithoutContext();

      List<String> hierarchy = nodeHierarchyApi.getFlattenedHierarchy();
      List<HierarchyOption> results = hierarchy.stream().map(HierarchyOption::new).collect(Collectors.toList());
      return results;
   }

   @GetMapping("/hierarchy/{courseId}")
   public CourseTemplatesWrapper getTemplatesForCourse(@PathVariable String courseId) {
      CourseTemplatesWrapper templatesWrapper = null;
      try {
         templatesWrapper = nodeManagerService.getAvailableTemplatesForCanvasCourse(courseId);
      } catch (HierarchyResourceException e) {
         log.error("unable to get templates for this course", e);
      }
      return templatesWrapper;
   }

   @GetMapping("/template/nodes/{nodeName}")
   public List<DecoratedResource> getNodesFromNodeName(@PathVariable String nodeName) {
      getTokenWithoutContext();
      List<DecoratedResource> decoratedResources = new ArrayList<>();
      List<HierarchyResource> resources = nodeManagerService.getTemplatesForNode(nodeName);
      for (HierarchyResource resource : resources) {
         StoredFile storedFile = resource.getStoredFile();
         DecoratedResource decoratedResource = new DecoratedResource(resource.getId(), storedFile.getDisplayName(),
                 nodeManagerService.getUrlToFile(storedFile), resource.getDisplayName(), resource.getCanvasCommonsUrl(),
                 resource.getContactUsername(), resource.getContactName(), resource.getDescription(), resource.isDefaultTemplate());
         decoratedResources.add(decoratedResource);
         decoratedResources.sort(Comparator.comparing(DecoratedResource::getDisplayName));
      }
      return decoratedResources;
   }

   @GetMapping("/syllabus/node/{nodeName}")
   public DecoratedSyllabus getSyllabusFromNodeName(@PathVariable String nodeName) {
      getTokenWithoutContext();
      SyllabusSupplement syllabusSupplement = nodeManagerService.getSyllabusSupplementForNode(nodeName);

      if (syllabusSupplement != null) {
         DecoratedSyllabus decoratedSyllabus = new DecoratedSyllabus(syllabusSupplement);
         return decoratedSyllabus;
      }

      return new DecoratedSyllabus();
   }

   @PostMapping("/template/submit")
   public ResponseEntity templateSubmit(@RequestParam("templateFileInput") MultipartFile templateFile,
       @RequestParam("nodeName") String nodeName, @RequestParam("displayName") String displayName,
       @RequestParam("contactName") String contactName, @RequestParam("contactUsername") String contactUsername,
       @RequestParam("ccUrl") String ccUrl, @RequestParam("description") String description)  {

       LtiAuthenticationToken token = getTokenWithoutContext();
       log.debug(nodeName);

       HierarchyResource hierarchyResource = new HierarchyResource();
       hierarchyResource.setNode(nodeName);
       hierarchyResource.setDisplayName(displayName);
       hierarchyResource.setContactName(contactName);
       hierarchyResource.setContactUsername(contactUsername);
       hierarchyResource.setCanvasCommonsUrl(ccUrl);
       hierarchyResource.setDescription(description);
       hierarchyResource.setContactEmail(contactUsername + "@iu.edu");

       StoredFile storedFile = new StoredFile();

       HierarchyResource savedHierarchResource = new HierarchyResource();

       try {
           storedFile.setContent(templateFile.getBytes());
           storedFile.setDisplayName(templateFile.getOriginalFilename());

           hierarchyResource.setStoredFile(storedFile);

           savedHierarchResource = nodeManagerService.saveTemplate(hierarchyResource);
       } catch (IOException e) {
           String msg = "Unable to store uploaded template file";
           log.error(msg, e);
           return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(msg);
       }

       DecoratedResource decoratedResource = new DecoratedResource(savedHierarchResource.getId(), storedFile.getDisplayName(),
           nodeManagerService.getUrlToFile(storedFile), savedHierarchResource.getDisplayName(), savedHierarchResource.getCanvasCommonsUrl(),
           savedHierarchResource.getContactUsername(), savedHierarchResource.getContactName(), savedHierarchResource.getDescription(),
           savedHierarchResource.isDefaultTemplate());

       return ResponseEntity.status(HttpStatus.OK).body(decoratedResource);
   }

   @PostMapping("/template/{templateId}/update")
   public ResponseEntity templateUpdate(@PathVariable Long templateId, @RequestParam(value = "templateFileInput", required = false) MultipartFile templateFile,
                                        @RequestParam("nodeName") String nodeName, @RequestParam("displayName") String displayName,
                                        @RequestParam("contactName") String contactName, @RequestParam("contactUsername") String contactUsername,
                                        @RequestParam("ccUrl") String ccUrl, @RequestParam("description") String description)  {

      LtiAuthenticationToken token = getTokenWithoutContext();
      log.debug(nodeName + ": " + templateId);

      try {
         HierarchyResource hierarchyResource = nodeManagerService.getTemplate(templateId);

         hierarchyResource.setNode(nodeName);
         hierarchyResource.setDisplayName(displayName);
         hierarchyResource.setContactName(contactName);
         hierarchyResource.setContactUsername(contactUsername);
         hierarchyResource.setCanvasCommonsUrl(ccUrl);
         hierarchyResource.setDescription(description);
         hierarchyResource.setContactEmail(contactUsername + "@iu.edu");

         StoredFile storedFile = hierarchyResource.getStoredFile();

         //Only need to do this if there is a new file uploaded
         if (templateFile != null) {
            try {
               storedFile.setContent(templateFile.getBytes());
               storedFile.setDisplayName(templateFile.getOriginalFilename());
               hierarchyResource.setStoredFile(storedFile);
            } catch (IOException e) {
               String msg = "Unable to store uploaded template file";
               log.error(msg, e);
               return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(msg);
            }
         }

         HierarchyResource savedHierarchyResource = nodeManagerService.saveTemplate(hierarchyResource);

         DecoratedResource decoratedResource = new DecoratedResource(savedHierarchyResource.getId(), storedFile.getDisplayName(),
               nodeManagerService.getUrlToFile(storedFile), savedHierarchyResource.getDisplayName(), savedHierarchyResource.getCanvasCommonsUrl(),
               savedHierarchyResource.getContactUsername(), savedHierarchyResource.getContactName(), savedHierarchyResource.getDescription(),
               savedHierarchyResource.isDefaultTemplate());

         return ResponseEntity.status(HttpStatus.OK).body(decoratedResource);
      } catch (HierarchyResourceException e) {
         String msg = "Unable to find template with id " + templateId;
         log.error(msg, e);
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(msg);
      }
   }

    @PostMapping("/template/delete")
    public ResponseEntity templateDelete(@RequestParam("templateId") String templateId) {
        LtiAuthenticationToken token = getTokenWithoutContext();
        HierarchyResource hierarchyResource = null;
        try {
            hierarchyResource = nodeManagerService.getTemplate(Long.parseLong(templateId));
        } catch (HierarchyResourceException e) {
            log.error("Problem getting the template from the database", e);
        }
        if (hierarchyResource != null) {
            nodeManagerService.deleteTemplate(hierarchyResource);
            return ResponseEntity.ok("success");
        } else {
            return ResponseEntity.notFound().build();
        }
   }

   @PostMapping("/template/apply/{canvasCourseId}/{templateId}")
   public ResponseEntity applyTemplateToCourse(@PathVariable String canvasCourseId, @PathVariable Long templateId) {
      return nodeManagerService.applyTemplateToCourse(canvasCourseId, templateId);
   }

   @PostMapping("/syllabus/submit")
   public ResponseEntity syllabusSubmit(@RequestBody SyllabusSupplementForm form) {
      getTokenWithoutContext();

      String nodeName = form.getNodeName();
      log.debug(nodeName);

      SyllabusSupplement syllabusSupplement = nodeManagerService.getSyllabusSupplementForNode(nodeName);
      if (syllabusSupplement == null) {
         syllabusSupplement = new SyllabusSupplement();
         syllabusSupplement.setNode(nodeName);
      }

      syllabusSupplement.setTitle(form.getSyllabus().getSyllabusTitle());
      syllabusSupplement.setContent(form.getSyllabus().getSyllabusContent());
      syllabusSupplement.setContactUsername(form.getSyllabus().getContactUsername());
      syllabusSupplement.setContactEmail(form.getSyllabus().getContactEmail());

      nodeManagerService.saveSyllabusSupplement(syllabusSupplement);

      DecoratedSyllabus decoratedSyllabus = new DecoratedSyllabus(syllabusSupplement);
      return ResponseEntity.status(HttpStatus.OK).body(decoratedSyllabus);
   }

   @PostMapping("/syllabus/delete")
   public ResponseEntity syllabusDelete(@RequestBody SyllabusSupplementForm form) {
      LtiAuthenticationToken token = getTokenWithoutContext();
      SyllabusSupplement syllabusSupplement = nodeManagerService.getSyllabusSupplementForNode(form.getNodeName());
      if (syllabusSupplement != null) {
         nodeManagerService.deleteSyllabusSupplement(syllabusSupplement);
         return ResponseEntity.ok(new DecoratedSyllabus());
      } else {
         return ResponseEntity.notFound().build();
      }
   }

   @GetMapping("/syllabus/preview/{courseId}")
   public ResponseEntity syllabusPreview(@PathVariable String courseId) {
      return ResponseEntity.ok(nodeManagerService.getSyllabusDataForCourse(courseId));
   }

      @Data
   public static class HierarchyOption {
      private String value;
      private String label;

      public HierarchyOption(String nodeName) {
         this.value = nodeName;
         this.label = nodeName;
      }
   }

    @PostMapping("/template/defaultchange")
    public ResponseEntity templateDefaultChange(@RequestParam("templateId") String templateId, @RequestParam("enableDefault") boolean enableDefault) throws HierarchyResourceException {
       nodeManagerService.templateDefaultChange(templateId, enableDefault);
       return ResponseEntity.ok().build();
    }
}
