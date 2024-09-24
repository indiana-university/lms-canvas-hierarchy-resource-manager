package edu.iu.uits.lms.hierarchyresourcemanager.model;

/*-
 * #%L
 * lms-lti-hierarchyresourcemanager
 * %%
 * Copyright (C) 2015 - 2022 Indiana University
 * %%
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the Indiana University nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 * #L%
 */

import com.fasterxml.jackson.annotation.JsonFormat;
import edu.iu.uits.lms.common.date.DateFormatUtil;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "LMS_SYLLABUS_SUPPLEMENT", uniqueConstraints = @UniqueConstraint(name = "node_strm_u", columnNames = {"node","strm"}))
@SequenceGenerator(name = "LMS_SYLLABUS_SUPPLEMENT_ID_SEQ", sequenceName = "LMS_SYLLABUS_SUPPLEMENT_ID_SEQ", allocationSize = 1)
@Data
@NoArgsConstructor
public class SyllabusSupplement {

   @Id
   @GeneratedValue(generator = "LMS_SYLLABUS_SUPPLEMENT_ID_SEQ")
   private Long id;

   @Column(nullable = false)
   private String node;

   @Column(nullable = false)
   private String strm;

   @Column(name = "ui_disclosure_open_by_default")
   private boolean uiDisclosureOpenByDefault;

   @Column(name = "contactusername")
   private String contactUsername;

   @Column(name = "contactemail")
   private String contactEmail;

   @Column(nullable = false)
   private String title;

   @Lob
   @Column(nullable = false, columnDefinition = "text")
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
