package edu.iu.uits.lms.hierarchyresourcemanager.model.nodehierarchy;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.SerializationUtils;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * Created by chmaurer on 2/22/16.
 */
@Entity
@Table(name = "NODE_HIERARCHY")
@SequenceGenerator(name = "NODE_HIERARCHY_ID_SEQ", sequenceName = "NODE_HIERARCHY_ID_SEQ", allocationSize = 1)
@Data
@Slf4j
public class NodeWrapper implements Serializable {

    @Id
    @GeneratedValue(generator = "NODE_HIERARCHY_ID_SEQ")
    private Long id;

    @Lob
    @Column(name = "hierarchy_bytes", columnDefinition = "TEXT")
    private byte[] hierarchy;

    @Transient
    private List<NodeCampus> campusList;

    private Date created;
    private Date modified;

// probably want this again after SisImportServiceImpl gets a microservice conversion
//    public List<NodeCampus> getCampusList() {
//        return (List<NodeCampus>) SerializationUtils.deserialize(hierarchy);
//    }

    public List<NodeCampus> getCampusList() {
        try {
            HackedObjectInputStream hois = new HackedObjectInputStream(new ByteArrayInputStream(hierarchy));
            return (List<NodeCampus>) hois.readObject();
        } catch (ClassNotFoundException | IOException e) {
            log.error("uh oh", e);
        }
        return null;
    }

    public void setCampusList(List<NodeCampus> campusList) {
        this.campusList = campusList;
        this.hierarchy = SerializationUtils.serialize((Serializable) campusList);
    }

    @PreUpdate
    @PrePersist
    public void updateTimeStamps() {
        modified = new Date();
        if (created==null) {
            created = new Date();
        }
    }
}
