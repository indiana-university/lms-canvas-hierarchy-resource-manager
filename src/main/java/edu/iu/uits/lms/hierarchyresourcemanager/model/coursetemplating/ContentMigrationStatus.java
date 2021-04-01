package edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating;

import canvas.helpers.ContentMigrationHelper;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "CONTENT_MIGRATION_STATUSES")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
@EqualsAndHashCode(exclude = {"templatedCourse"})
@ToString(exclude = {"templatedCourse"})
public class ContentMigrationStatus extends BaseObject {

   @Id
   @Column(name = "CONTENT_MIGRATION_ID")
   @NonNull
   private String contentMigrationId;

   private int sequence;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "COURSE_ID", foreignKey = @ForeignKey(name = "fk_contmigstat_templcourses"))
   @JsonBackReference
   private TemplatedCourse templatedCourse;

   @Enumerated(EnumType.STRING)
   @NonNull
   protected STATUS status;

   public ContentMigrationStatus(String contentMigrationId, String migrationStatus) {
      this.contentMigrationId = contentMigrationId;
      this.status = translateStatus(migrationStatus);
   }

   /**
    * Translate Canvas's status value into our internal representation
    * @param canvasMigrationStatus Canvas workflow_state
    * @return Internal status representation
    */
   public static STATUS translateStatus(String canvasMigrationStatus) {
      STATUS result = STATUS.PENDING;
      switch (canvasMigrationStatus) {
         case ContentMigrationHelper.STATUS_COMPLETED:
            result = STATUS.COMPLETE;
            break;
         case ContentMigrationHelper.STATUS_FAILED:
            result = STATUS.ERROR;
            break;
      }
      return result;
   }

}
