package edu.iu.uits.lms.hierarchyresourcemanager.model;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class CourseTemplatesWrapper implements Serializable {
   private String courseId;
   private boolean coursePublished;
   private List<HierarchyResource> templates;
}
