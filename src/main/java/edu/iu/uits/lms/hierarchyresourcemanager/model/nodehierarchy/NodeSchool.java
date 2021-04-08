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
public class NodeSchool implements Serializable, Comparable<NodeSchool> {
    @XmlElement(nillable=true)
    private String school;

    @XmlElement(nillable=true)
    private List<String> departments;

    public int compareTo(NodeSchool o1) {

        if (this.getSchool()== null && o1.getSchool() == null) {
            return 0;
        }
        if (this.getSchool() == null) {
                return -1;
        } else {
            if (o1.getSchool() == null) {
                return 1;
            }
        }

        return this.getSchool().compareTo(o1.getSchool());

    }
}
