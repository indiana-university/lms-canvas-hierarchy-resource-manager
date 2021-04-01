package edu.iu.uits.lms.hierarchyresourcemanager.amqp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

@Data
@JsonIgnoreProperties(ignoreUnknown=true)
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
@AllArgsConstructor
@NoArgsConstructor
public class ApplyCourseTemplateMessage implements Serializable {

   @XmlElement
   private String courseId;

   @XmlElement
   private String sisTermId;

   @XmlElement
   private String accountId;

   @XmlElement
   private String sisCourseId;

   @XmlElement
   private boolean forceApply;

   @XmlElement
   private Long templateId;

}
