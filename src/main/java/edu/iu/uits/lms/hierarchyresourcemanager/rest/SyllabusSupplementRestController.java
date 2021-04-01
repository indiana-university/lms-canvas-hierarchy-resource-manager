package edu.iu.uits.lms.hierarchyresourcemanager.rest;

import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/rest/syllabus"})
//@LmsSwaggerDocumentation
public class SyllabusSupplementRestController {

   @Autowired
   private NodeManagerService nodeManagerService = null;

   @GetMapping("/{courseId}")
   public ResponseEntity getSupplements(@PathVariable String courseId) {
      return ResponseEntity.ok(nodeManagerService.getSyllabusDataForCourse(courseId));
   }

}
