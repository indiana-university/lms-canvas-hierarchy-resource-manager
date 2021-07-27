package edu.iu.uits.lms.hierarchyresourcemanager.rest;

import edu.iu.uits.lms.hierarchyresourcemanager.model.StoredFile;
import edu.iu.uits.lms.hierarchyresourcemanager.repository.FileStorageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping({"/rest/file"})
//@LmsSwaggerDocumentation
public class FileAccessRestController {

   @Autowired
   private FileStorageRepository fileStorageRepository = null;

   @RequestMapping(value = "/download/{id}/{filename}", method = RequestMethod.GET)
   @Transactional
   public ResponseEntity download(@PathVariable(name = "id") Long resourceId, @PathVariable(name = "filename") String filename) {

      StoredFile storedFile = fileStorageRepository.findById(resourceId).orElse(null);

      if (storedFile != null) {

         byte[] fileBytes = storedFile.getContent();

         InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(fileBytes));

         HttpHeaders headers = new HttpHeaders();
         headers.setContentDispositionFormData("attachment", storedFile.getDisplayName());

         return ResponseEntity.ok()
               .headers(headers)
               .contentLength(fileBytes.length)
               .contentType(MediaType.APPLICATION_OCTET_STREAM)
               .body(resource);
      }
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cannot find file");
   }

}
