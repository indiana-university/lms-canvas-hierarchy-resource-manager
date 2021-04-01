package edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OrderColumn;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import java.util.ArrayList;
import java.util.List;


/**
 * Representation of the SIS data used to populate the TEMPLATED_COURSES table. These courses have been
 * processed by the CourseTemplating job
 */
@Entity
@Table(name = "TEMPLATED_COURSES",
      uniqueConstraints = @UniqueConstraint(name = "course_id_u", columnNames = {"course_id"}))
@Data
@NoArgsConstructor
public class TemplatedCourse extends BaseObject {

   @Id
   @Column(name = "course_id")
   @NonNull
   private String courseId;

   @Column(name = "sis_course_id")
   private String sisCourseId;

   @Column(name = "term_id")
   @NonNull
   private String termId;

   @Enumerated(EnumType.STRING)
   @NonNull
   private STATUS status;

   @Column(name = "iu_crseld_status_added")
   @NonNull
   private boolean iu_crseld_status_added;

   public TemplatedCourse(String courseId, String sisCourseId, String termId, STATUS status) {
      this.courseId = courseId;
      this.sisCourseId = sisCourseId;
      this.termId = termId;
      this.status = status;
   }

   @OneToMany(cascade = CascadeType.ALL, targetEntity = ContentMigrationStatus.class, mappedBy = "templatedCourse", fetch = FetchType.EAGER, orphanRemoval = true)
   @OrderColumn(name = "sequence")
   @JsonManagedReference
   private List<ContentMigrationStatus> contentMigrations = new ArrayList<>();


   public void addContentMigrations(ContentMigrationStatus contentMigrationStatus) {
      contentMigrationStatus.setTemplatedCourse(this);
      contentMigrations.add(contentMigrationStatus);
   }

}
