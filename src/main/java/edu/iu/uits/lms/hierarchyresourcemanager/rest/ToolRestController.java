package edu.iu.uits.lms.hierarchyresourcemanager.rest;

import edu.iu.uits.lms.canvas.model.CanvasTerm;
import edu.iu.uits.lms.canvas.services.TermService;
import edu.iu.uits.lms.hierarchyresourcemanager.config.BaseCache;
import edu.iu.uits.lms.hierarchyresourcemanager.config.ToolConfig;
import edu.iu.uits.lms.hierarchyresourcemanager.controller.HierarchyResourceManagerController;
import edu.iu.uits.lms.hierarchyresourcemanager.model.CourseTemplatesWrapper;
import edu.iu.uits.lms.hierarchyresourcemanager.model.DecoratedResource;
import edu.iu.uits.lms.hierarchyresourcemanager.model.DecoratedSyllabus;
import edu.iu.uits.lms.hierarchyresourcemanager.model.SyllabusSupplement;
import edu.iu.uits.lms.hierarchyresourcemanager.model.form.SyllabusSupplementForm;
import edu.iu.uits.lms.hierarchyresourcemanager.services.HierarchyResourceException;
import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeHierarchyRealtimeService;
import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeManagerService;
import edu.iu.uits.lms.iuonly.model.HierarchyResource;
import edu.iu.uits.lms.iuonly.model.StoredFile;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
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
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/app/tool")
@Slf4j
public class ToolRestController extends HierarchyResourceManagerController {

   @Autowired
   private NodeManagerService nodeManagerService;

   @Autowired
   private NodeHierarchyRealtimeService nodeHierarchyRealtimeService;

   @Autowired
   private TermService termService;

   @Autowired
   private ToolConfig toolConfig;

//    @Cacheable(value = BaseCache.CACHE_NAME, cacheManager = "HierarchyResourceManagerCacheManager")
    @GetMapping("/hierarchy")
    public List<HierarchyOption> getNodes() {
        getTokenWithoutContext();

        List<HierarchyOption> results = null;

        List<String> hierarchy = nodeHierarchyRealtimeService.getFlattenedHierarchy();
        results = hierarchy.stream().map(HierarchyOption::new).collect(Collectors.toList());

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
                   resource.getContactUsername(), resource.getContactName(), resource.getDescription(), resource.isDefaultTemplate(),
                   resource.getSourceCourseId(), resource.getSponsor());
           decoratedResources.add(decoratedResource);
           decoratedResources.sort(Comparator.comparing(DecoratedResource::getDisplayName));
       }
       return decoratedResources;
   }

   @GetMapping("/syllabus/node/{nodeName}/{strm}")
   public DecoratedSyllabus getSyllabusFromNodeName(@PathVariable String nodeName, @PathVariable String strm) {
       getTokenWithoutContext();
       SyllabusSupplement syllabusSupplement = nodeManagerService.getSyllabusSupplementForNode(nodeName, strm);

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
       @RequestParam("ccUrl") String ccUrl, @RequestParam("description") String description,
       @RequestParam("sourceCourseId") String sourceCourseId, @RequestParam("sponsor") String sponsor) {

       getTokenWithoutContext();
       log.debug(nodeName);

       HierarchyResource hierarchyResource = new HierarchyResource();
       hierarchyResource.setNode(nodeName);
       hierarchyResource.setDisplayName(displayName);
       hierarchyResource.setContactName(contactName);
       hierarchyResource.setContactUsername(contactUsername);
       hierarchyResource.setCanvasCommonsUrl(ccUrl);
       hierarchyResource.setDescription(description);
       hierarchyResource.setContactEmail(contactUsername + "@iu.edu");
       hierarchyResource.setSourceCourseId(sourceCourseId);
       hierarchyResource.setSponsor(sponsor);

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
               savedHierarchResource.isDefaultTemplate(), savedHierarchResource.getSourceCourseId(), savedHierarchResource.getSponsor());

       return ResponseEntity.status(HttpStatus.OK).body(decoratedResource);
   }

   @PostMapping("/template/{templateId}/update")
   public ResponseEntity templateUpdate(@PathVariable Long templateId, @RequestParam(value = "templateFileInput", required = false) MultipartFile templateFile,
                                        @RequestParam("nodeName") String nodeName, @RequestParam("displayName") String displayName,
                                        @RequestParam("contactName") String contactName, @RequestParam("contactUsername") String contactUsername,
                                        @RequestParam("ccUrl") String ccUrl, @RequestParam("description") String description,
                                        @RequestParam("sourceCourseId") String sourceCourseId, @RequestParam("sponsor") String sponsor) {

       getTokenWithoutContext();
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
           hierarchyResource.setSourceCourseId(sourceCourseId);
           hierarchyResource.setSponsor(sponsor);

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
                   savedHierarchyResource.isDefaultTemplate(), savedHierarchyResource.getSourceCourseId(), savedHierarchyResource.getSponsor());

           return ResponseEntity.status(HttpStatus.OK).body(decoratedResource);
       } catch (HierarchyResourceException e) {
           String msg = "Unable to find template with id " + templateId;
           log.error(msg, e);
           return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(msg);
       }
   }

    @PostMapping("/template/delete")
    public ResponseEntity templateDelete(@RequestParam("templateId") String templateId) {
        getTokenWithoutContext();
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

       String strm = form.getStrm();
       log.debug("Term for submission: {}", strm);

       SyllabusSupplement syllabusSupplement = nodeManagerService.getSyllabusSupplementForNode(nodeName, strm);
       if (syllabusSupplement == null) {
           syllabusSupplement = new SyllabusSupplement();
           syllabusSupplement.setNode(nodeName);
           syllabusSupplement.setStrm(strm);
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
       getTokenWithoutContext();
       SyllabusSupplement syllabusSupplement = nodeManagerService.getSyllabusSupplementForNode(form.getNodeName(), form.getStrm());
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

    @GetMapping("/syllabus/terms")
    public List<TermOption> getSyllabusTerms() {
        List<CanvasTerm> enrollmentTerms = termService.getEnrollmentTerms();

        // use reverse order for the map to make it display in descending order in the UI
        Map<String, String> termMap = new TreeMap<>(Collections.reverseOrder());

        for (CanvasTerm term : enrollmentTerms) {
            // the "startsWith 4" bit will make sure to only get the 4 standard semesters (SP, SU, FA, WI)
            if (term.getSisTermId() != null && term.getSisTermId().startsWith("4")) {
                int termInt = Integer.parseInt(term.getSisTermId());
                // we only want semesters starting from Fall 2021 aka 4218
                if (termInt >= toolConfig.getStartingTermId()) {
                    termMap.put(term.getSisTermId(), term.getName());
                }
            }
        }

        // This code will give undesired results starting in Fall 2099 ;)
        // this block of code adds 2 future terms to our list
        if (!termMap.isEmpty()) {
            Optional<String> firstKey = termMap.keySet().stream().findFirst();
            String key = firstKey.get();
            if (key.endsWith("2")) {
                // Example: 4222 (Spring 2022) will add 4225 (Summer 2022) and 4228 (Fall 2022)
                termMap.put(key.substring(0,3) + "5", "Summer 20" + key.substring(1,3));
                termMap.put(key.substring(0,3) + "8", "Fall 20" + key.substring(1,3));
            } else if (key.endsWith("5")) {
                // Example: 4225 (Summer 2022) will add 4228 (Fall 2022) and 4229 (Winter 2022)
                termMap.put(key.substring(0,3) + "8", "Fall 20" + key.substring(1,3));
                termMap.put(key.substring(0,3) + "9", "Winter 20" + key.substring(1,3));
            } else if (key.endsWith("8")) {
                // Example: 4228 (Fall 2022) will add 4229 (Winter 2022) and 4232 (Spring 2023)
                termMap.put(key.substring(0,3) + "9", "Winter 20" + key.substring(1,3));
                // get the first 3 of the term id
                Integer termToInt = Integer.parseInt(key.substring(1,3));
                // e.g. if an id is 21, this should make it 22
                termToInt++;

                termMap.put("4" + termToInt + "2", "Spring 20" + termToInt);
            } else if (key.endsWith("9")) {
                // Example: 4229 (Winter 2022) will add 4232 (Spring 2023) and 4235 (Summer 2023)
                // get the 2 numbers in the middle of the 4 digit id
                Integer termToInt = Integer.parseInt(key.substring(1,3));
                // if an id is 21, this should make it 22
                termToInt++;

                termMap.put("4" + termToInt + "2", "Spring 20" + termToInt);
                termMap.put("4" + termToInt + "5", "Summer 20" + termToInt);
            }
        }

        // add the default option
        termMap.put(toolConfig.getDefaultTermId(), "Default");

        // if the termMap was empty, this will just return an empty dropdown, except for Default
        // this will make the syllabus supplement part partially unusable, but the other two tabs will be fine

        // convert our map to a list that our dropdown can read properly
        List<TermOption> termOptions = new ArrayList<>();
        termOptions.addAll(termMap.entrySet()
                .stream().map(e -> new TermOption(e.getKey(), e.getValue()))
                .collect(Collectors.toList()));

        return termOptions;
    }

    @Data
    public static class TermOption {
        private String value;
        private String label;

        public TermOption(String termId, String termName) {
            this.value = termId;
            this.label = termName;
        }
    }
}
