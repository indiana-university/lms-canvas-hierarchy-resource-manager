package edu.iu.uits.lms.hierarchyresourcemanager.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DecoratedSyllabus {
   private String syllabusTitle = "";
   private String syllabusContent = "";
   private String nodeName;
   private String contactUsername = "";
   private String contactEmail = "";

   public DecoratedSyllabus(SyllabusSupplement syllabusSupplement) {
      this.syllabusTitle = syllabusSupplement.getTitle();
      this.syllabusContent = syllabusSupplement.getContent();
      this.nodeName = syllabusSupplement.getNode();
      this.contactUsername = syllabusSupplement.getContactUsername();
      this.contactEmail = syllabusSupplement.getContactEmail();
   }
}
