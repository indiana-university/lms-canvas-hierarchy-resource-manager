package edu.iu.uits.lms.hierarchyresourcemanager.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import edu.iu.uits.lms.common.date.DateFormatUtil;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import java.util.Date;

@Entity
@Table(name = "LMS_SYLLABUS_SUPPLEMENT", uniqueConstraints = @UniqueConstraint(name = "syl_node_u", columnNames = {"node"}))
@SequenceGenerator(name = "LMS_SYLLABUS_SUPPLEMENT_ID_SEQ", sequenceName = "LMS_SYLLABUS_SUPPLEMENT_ID_SEQ", allocationSize = 1)
@Data
@NoArgsConstructor
public class SyllabusSupplement {

   @Id
   @GeneratedValue(generator = "LMS_SYLLABUS_SUPPLEMENT_ID_SEQ")
   private Long id;

   @Column(nullable = false)
   private String node;

   @Column(name = "contactusername")
   private String contactUsername;

   @Column(name = "contactemail")
   private String contactEmail;

   @Column(nullable = false)
   private String title;

   @Lob
   @Type(type="text")
   @Column(nullable = false)
   private String content;

   @JsonFormat(pattern = DateFormatUtil.JSON_DATE_FORMAT)
   private Date created;

   @JsonFormat(pattern = DateFormatUtil.JSON_DATE_FORMAT)
   private Date modified;

   @PreUpdate
   @PrePersist
   public void updateTimeStamps() {
      modified = new Date();
      if (created == null) {
         created = new Date();
      }
   }
}
