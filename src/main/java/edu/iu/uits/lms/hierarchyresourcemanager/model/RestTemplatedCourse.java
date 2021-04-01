package edu.iu.uits.lms.hierarchyresourcemanager.model;

import edu.iu.uits.lms.hierarchyresourcemanager.model.coursetemplating.TemplatedCourse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * RestTemplatedCourse extends TemplatedCourse, but changes the boolean field to Boolean so that the controller can check for
 * null on the update
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class RestTemplatedCourse extends TemplatedCourse implements Serializable {

   private Boolean iu_crseld_status_added;
}
