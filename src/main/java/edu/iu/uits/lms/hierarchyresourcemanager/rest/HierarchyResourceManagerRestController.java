package edu.iu.uits.lms.hierarchyresourcemanager.rest;

import edu.iu.uits.lms.canvas.services.CourseService;
import edu.iu.uits.lms.hierarchyresourcemanager.amqp.CourseTemplateMessageSender;
import edu.iu.uits.lms.hierarchyresourcemanager.services.HierarchyResourceException;
import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeManagerService;
import edu.iu.uits.lms.iuonly.model.HierarchyResource;
import edu.iu.uits.lms.iuonly.model.StoredFile;
import edu.iu.uits.lms.iuonly.repository.FileStorageRepository;
import edu.iu.uits.lms.iuonly.repository.HierarchyResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping({"/rest/hrm"})
//@LmsSwaggerDocumentation
public class HierarchyResourceManagerRestController {

    @Autowired
    private HierarchyResourceRepository hierarchyResourceRepository;

    @Autowired
    private FileStorageRepository fileStorageRepository;

    @Autowired
    private NodeManagerService hierarchyResourceService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private CourseTemplateMessageSender courseTemplateMessageSender;

    @RequestMapping(value = "/all", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public List<HierarchyResource> getAllNodes() {
        List<HierarchyResource> hierarchyResources = (List<HierarchyResource>) hierarchyResourceRepository.findAll();
        return hierarchyResources;
    }

    @RequestMapping(value = "/resourceId/{id}", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public HierarchyResource getNodeFromId(@PathVariable Long id) {
        return hierarchyResourceRepository.findById(id).orElse(null);
    }

    @RequestMapping(value = "/{nodeName}", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public List<HierarchyResource> getNodeFromNodeName(@PathVariable String nodeName) {
        return hierarchyResourceRepository.findByNode(nodeName);
    }

    @RequestMapping(value = "/iuSiteId/{iuSiteId}", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity getNodeFromIuSiteId(@PathVariable String iuSiteId) {
        try {
            HierarchyResource hierarchyResource = hierarchyResourceService.getClosestDefaultTemplateForSisCourse(iuSiteId);
            return ResponseEntity.status(HttpStatus.OK).body(hierarchyResource);
        } catch (HierarchyResourceException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @RequestMapping(value = "/canvasCourseId/{canvasCourseId}", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity getNodeFromCanvasCourseId(@PathVariable String canvasCourseId) {
        try {
            HierarchyResource hierarchyResource = hierarchyResourceService.getClosestDefaultTemplateForCanvasCourse(canvasCourseId);
            return ResponseEntity.status(HttpStatus.OK).body(hierarchyResource);
        } catch (HierarchyResourceException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/canvasCourseId/{canvasCourseId}/node")
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
    public ResponseEntity applyTemplateToCourse(@PathVariable String canvasCourseId) {
        return hierarchyResourceService.applyTemplateToCourse(canvasCourseId);
    }

    @RequestMapping(value="/upload", method=RequestMethod.POST)
    public String uploadNewTemplateFile(@RequestParam("templateFile") MultipartFile templateFile) throws IOException {
        StoredFile storedFile = new StoredFile();
        storedFile.setContent(templateFile.getBytes());
        storedFile.setDisplayName(templateFile.getOriginalFilename());

        fileStorageRepository.save(storedFile);

        return "Template uploaded successfully";
    }
}
