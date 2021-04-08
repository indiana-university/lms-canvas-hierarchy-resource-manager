package edu.iu.uits.lms.hierarchyresourcemanager.controller;

import edu.iu.uits.lms.hierarchyresourcemanager.model.User;
import edu.iu.uits.lms.hierarchyresourcemanager.repository.UserRepository;
import edu.iu.uits.lms.lti.controller.LtiController;
import edu.iu.uits.lms.lti.security.LtiAuthenticationProvider;
import edu.iu.uits.lms.lti.security.LtiAuthenticationToken;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.tsugi.basiclti.BasicLTIConstants;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping({"/lti"})
@Slf4j
public class HierarchyResourceManagerLtiController extends LtiController {

    protected static final String CUSTOM_HRM_TOOL_ID = "custom_hrm_tool_id";

    @Autowired
    private UserRepository userRepository = null;

    private boolean openLaunchUrlInNewWindow = false;

    /**
     * Determine which tool we should be in
     * @param toolId
     * @return True if it's the Apply Template tool, false otherwise (manager tool)
     */
    private boolean isApplyTemplateTool(String toolId) {
        return "applyTemplate".equals(toolId);
    }

    @Override
    protected String getLaunchUrl(Map<String, String> launchParams) {
        String courseId = launchParams.get(CUSTOM_CANVAS_COURSE_ID);
        String toolId = launchParams.get(CUSTOM_HRM_TOOL_ID);

        String launchUrl;
        if (isApplyTemplateTool(toolId)) {
            launchUrl = "app/template/" + courseId;
        } else {
            launchUrl = "app/manager";
        }
        return launchUrl;
    }

    @Override
    protected Map<String, String> getParametersForLaunch(Map<String, String> payload, Claims claims) {
        Map<String, String> paramMap = new HashMap<String, String>(1);

        paramMap.put(CUSTOM_CANVAS_COURSE_ID, payload.get(CUSTOM_CANVAS_COURSE_ID));
        paramMap.put(BasicLTIConstants.ROLES, payload.get(BasicLTIConstants.ROLES));
        paramMap.put(CUSTOM_CANVAS_USER_LOGIN_ID, payload.get(CUSTOM_CANVAS_USER_LOGIN_ID));
        paramMap.put(CUSTOM_HRM_TOOL_ID, payload.get(CUSTOM_HRM_TOOL_ID));

        openLaunchUrlInNewWindow = Boolean.valueOf(payload.get(CUSTOM_OPEN_IN_NEW_WINDOW));

        return paramMap;
    }

    @Override
    protected void preLaunchSetup(Map<String, String> launchParams, HttpServletRequest request, HttpServletResponse response) {
        String userId = launchParams.get(CUSTOM_CANVAS_USER_LOGIN_ID);
        String toolId = launchParams.get(CUSTOM_HRM_TOOL_ID);
        String rolesString = "NotAuthorized";
        Object user = launchParams.get(CUSTOM_CANVAS_USER_LOGIN_ID);

        if (isApplyTemplateTool(toolId)) {
            //Use the legit roles
            rolesString = launchParams.get(BasicLTIConstants.ROLES);
        } else {
            //Check our auth table
            user = userRepository.findByUsername(userId);
            User theUser = (User)user;
            if (theUser != null && theUser.isAuthorizedUser()) {
                rolesString = "Instructor";
            }
        }

        String[] userRoles = rolesString.split(",");
        String authority = returnEquivalentAuthority(Arrays.asList(userRoles), getDefaultInstructorRoles());
        log.debug("LTI equivalent authority: " + authority);

        String systemId = launchParams.get(BasicLTIConstants.TOOL_CONSUMER_INSTANCE_GUID);
        String courseId = launchParams.get(CUSTOM_CANVAS_COURSE_ID);

        LtiAuthenticationToken token = new LtiAuthenticationToken(userId,
                courseId, systemId, AuthorityUtils.createAuthorityList(LtiAuthenticationProvider.LTI_USER_ROLE, authority), getToolContext());
        SecurityContextHolder.getContext().setAuthentication(token);
    }

    @Override
    protected String getToolContext() {
        return "lms_lti_hierarchyresourcemanager";
    }

    @Override
    protected LAUNCH_MODE launchMode() {
        if (openLaunchUrlInNewWindow)
            return LAUNCH_MODE.WINDOW;

        return LAUNCH_MODE.FORWARD;
    }
}
