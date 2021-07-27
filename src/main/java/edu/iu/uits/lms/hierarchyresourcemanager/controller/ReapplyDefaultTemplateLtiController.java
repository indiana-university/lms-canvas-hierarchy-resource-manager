package edu.iu.uits.lms.hierarchyresourcemanager.controller;

import edu.iu.uits.lms.lti.security.LtiAuthenticationProvider;
import edu.iu.uits.lms.lti.security.LtiAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.tsugi.basiclti.BasicLTIConstants;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Map;

@Controller
@RequestMapping("/lti/reapply")
@Slf4j
public class ReapplyDefaultTemplateLtiController extends HierarchyResourceManagerLtiController {

   @Override
   protected String getToolContext() {
      return "lms_coursetemplate";
   }

   @Override
   protected String getLaunchUrl(Map<String, String> launchParams) {
      String courseId = launchParams.get(CUSTOM_CANVAS_COURSE_ID);
      return "/app/reapply/" + courseId;
   }

   @Override
   protected void preLaunchSetup(Map<String, String> launchParams, HttpServletRequest request, HttpServletResponse response) {
      String userId = launchParams.get(CUSTOM_CANVAS_USER_LOGIN_ID);
      String rolesString = launchParams.get(BasicLTIConstants.ROLES);

      String[] userRoles = rolesString.split(",");
      String authority = returnEquivalentAuthority(Arrays.asList(userRoles), getDefaultInstructorRoles());
      log.debug("LTI equivalent authority: " + authority);

      String systemId = launchParams.get(BasicLTIConstants.TOOL_CONSUMER_INSTANCE_GUID);
      String courseId = launchParams.get(CUSTOM_CANVAS_COURSE_ID);

      LtiAuthenticationToken token = new LtiAuthenticationToken(userId,
            courseId, systemId, AuthorityUtils.createAuthorityList(LtiAuthenticationProvider.LTI_USER_ROLE, authority), getToolContext());
      SecurityContextHolder.getContext().setAuthentication(token);
   }

}
