package edu.iu.uits.lms.hierarchyresourcemanager.controller;

import edu.iu.uits.lms.lti.LTIConstants;
import edu.iu.uits.lms.lti.controller.LtiAuthenticationTokenAwareController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@Slf4j
@RequestMapping("/app")
public class HierarchyResourceManagerController extends LtiAuthenticationTokenAwareController {

    @RequestMapping(value = "/manager")
    @Secured(LTIConstants.INSTRUCTOR_AUTHORITY)
    public String index(Model model) {
        getTokenWithoutContext();
        return "react";
    }

    @RequestMapping(value = "/template/{context}")
    @Secured(LTIConstants.INSTRUCTOR_AUTHORITY)
    public String templates(@PathVariable("context") String context, Model model) {
        getValidatedToken(context);
        model.addAttribute("courseId", context);
        return "react";
    }

    @RequestMapping(value = "/accessDenied")
    public String accessDenied() {
        return "accessDenied";
    }
}
