package edu.iu.uits.lms.hierarchyresourcemanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "LMS_FILE_STORAGE")
@SequenceGenerator(name = "LMS_FILE_STORAGE_ID_SEQ", sequenceName = "LMS_FILE_STORAGE_ID_SEQ", allocationSize = 1)
@Data
@NoArgsConstructor
public class StoredFile extends BaseObject {

   @Id
   @GeneratedValue(generator = "LMS_FILE_STORAGE_ID_SEQ")
   private Long id;

   @Column(name = "displayname")
   private String displayName;

   @Basic(fetch = FetchType.LAZY, optional = false)
   @JsonIgnore
   private byte[] content;

}
