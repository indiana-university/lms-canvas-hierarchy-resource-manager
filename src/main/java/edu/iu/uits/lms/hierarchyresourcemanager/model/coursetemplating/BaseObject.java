package edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating;

import com.fasterxml.jackson.annotation.JsonFormat;
import edu.iu.uits.lms.common.date.DateFormatUtil;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import java.util.Date;

@Getter
@Setter
@MappedSuperclass
public class BaseObject {

   public enum STATUS {
      PENDING,
      ERROR,
      COMPLETE
   }

   @Column(name = "date_created")
   @JsonFormat(pattern= DateFormatUtil.JSON_DATE_FORMAT)
   private Date dateCreated;

   @Column(name = "date_modified")
   @JsonFormat(pattern= DateFormatUtil.JSON_DATE_FORMAT)
   private Date dateModified;

   @PreUpdate
   @PrePersist
   public void updateTimeStamps() {
      if (dateCreated==null) {
         dateCreated = new Date();
      }
      dateModified = new Date();
   }

}
