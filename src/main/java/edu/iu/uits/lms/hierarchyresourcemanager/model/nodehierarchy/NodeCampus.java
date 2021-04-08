package edu.iu.uits.lms.hierarchyresourcemanager.model.nodehierarchy;

/**
 * Created by tnguyen on 2/2/16.
 */
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.ToString;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.util.List;

@JsonIgnoreProperties (ignoreUnknown=true)
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
@ToString
@Data
public class NodeCampus implements Serializable {
    @XmlElement(nillable=true)
    private String campus;

    @XmlElement(nillable=true)
    private List<NodeSchool> schools;

}
