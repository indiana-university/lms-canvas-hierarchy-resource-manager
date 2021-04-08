package edu.iu.uits.lms.hierarchyresourcemanager.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * RestUser extends User, but changes the boolean field to Boolean so that the controller can check for
 * null on the update
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class RestUser extends User implements Serializable {

    private Boolean authorizedUser;
}
