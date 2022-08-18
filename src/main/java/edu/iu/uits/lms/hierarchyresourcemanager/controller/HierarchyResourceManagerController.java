package edu.iu.uits.lms.hierarchyresourcemanager.controller;

import edu.iu.uits.lms.hierarchyresourcemanager.services.NodeManagerService;
import edu.iu.uits.lms.lti.LTIConstants;
import edu.iu.uits.lms.lti.controller.OidcTokenAwareController;
import edu.iu.uits.lms.lti.service.OidcTokenUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestWrapper;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import uk.ac.ox.ctl.lti13.security.oauth2.client.lti.authentication.OidcAuthenticationToken;

import javax.servlet.http.HttpSession;

@Controller
@Slf4j
@RequestMapping("/app")
public class HierarchyResourceManagerController extends OidcTokenAwareController {

    @Autowired
    private NodeManagerService nodeManagerService;

    @RequestMapping(value = "/manager")
    @Secured(LTIConstants.INSTRUCTOR_AUTHORITY)
    public String index(Model model, HttpSession httpSession) {
        getTokenWithoutContext();
        //For session tracking
        model.addAttribute("customId", httpSession.getId());
        return "react";
    }

    @RequestMapping(value = "/template/launch")
    @Secured(LTIConstants.INSTRUCTOR_AUTHORITY)
    public String launchTemplate(Model model, SecurityContextHolderAwareRequestWrapper request) {
        OidcAuthenticationToken token = getTokenWithoutContext();

        OidcTokenUtils oidcTokenUtils = new OidcTokenUtils(token);

        String courseId = oidcTokenUtils.getCourseId();

        return templates(courseId, model, request.getSession());
    }

    @RequestMapping(value = "/template/{context}")
    @Secured(LTIConstants.INSTRUCTOR_AUTHORITY)
    public String templates(@PathVariable("context") String context, Model model, HttpSession httpSession) {
        getValidatedToken(context);
        //For session tracking
        model.addAttribute("customId", httpSession.getId());
        model.addAttribute("courseId", context);
        return "react";
    }

    @RequestMapping(value = "/reapply/launch")
    @Secured(LTIConstants.INSTRUCTOR_AUTHORITY)
    public ResponseEntity<String> launchReapplyTemplate(Model model, SecurityContextHolderAwareRequestWrapper request) {
        OidcAuthenticationToken token = getTokenWithoutContext();

        OidcTokenUtils oidcTokenUtils = new OidcTokenUtils(token);

        String courseId = oidcTokenUtils.getCourseId();

        return reapply(courseId, model, request.getSession());
    }

    @RequestMapping(value = "/reapply/{context}")
    @Secured(LTIConstants.INSTRUCTOR_AUTHORITY)
    @ResponseBody
    public ResponseEntity<String> reapply(@PathVariable("context") String context, Model model, HttpSession httpSession) {
        getValidatedToken(context);
        return nodeManagerService.applyTemplateToCourse(context);
    }

    @RequestMapping(value = "/accessDenied")
    public String accessDenied() {
        return "accessDenied";
    }
}
