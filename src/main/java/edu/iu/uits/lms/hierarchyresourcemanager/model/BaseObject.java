package edu.iu.uits.lms.hierarchyresourcemanager.model;

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

   @JsonFormat(pattern= DateFormatUtil.JSON_DATE_FORMAT)
   @Column(name="createdon")
   private Date createdOn;
   @JsonFormat(pattern= DateFormatUtil.JSON_DATE_FORMAT)
   @Column(name="modifiedon")
   private Date modifiedOn;


   @PreUpdate
   @PrePersist
   public void updateTimeStamps() {
      modifiedOn = new Date();
      if (createdOn==null) {
         createdOn = new Date();
      }
   }

}
