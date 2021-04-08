package edu.iu.uits.lms.hierarchyresourcemanager.model.form;

import edu.iu.uits.lms.hierarchyresourcemanager.model.DecoratedSyllabus;
import lombok.Data;

@Data
public class SyllabusSupplementForm {

   private String nodeName;
   private DecoratedSyllabus syllabus;
}
