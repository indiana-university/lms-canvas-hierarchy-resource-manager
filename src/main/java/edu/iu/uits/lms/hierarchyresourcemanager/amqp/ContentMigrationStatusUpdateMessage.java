package edu.iu.uits.lms.hierarchyresourcemanager.amqp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating.TemplatedCourse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown=true)
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
@AllArgsConstructor
@NoArgsConstructor
public class ContentMigrationStatusUpdateMessage implements Serializable {

   @XmlElement
   private String sisCourseId;

   @XmlElement
   private String termId;

   @XmlElement
   private List<TemplatedCourse.STATUS> statuses;
}
