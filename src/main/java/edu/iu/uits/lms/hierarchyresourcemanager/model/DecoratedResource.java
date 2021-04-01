package edu.iu.uits.lms.hierarchyresourcemanager.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DecoratedResource {
   private Long id;
   private String fileName;
   private String fileUrl;
   private String displayName;
   private String canvasCommonsUrl;
   private String contactUsername;
   private String contactName;
   private String description;
   private boolean defaultTemplate;
}
