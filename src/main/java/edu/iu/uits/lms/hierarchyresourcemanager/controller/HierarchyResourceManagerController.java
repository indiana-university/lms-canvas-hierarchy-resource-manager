package edu.iu.uits.lms.hierarchyresourcemanager.controller;

/*-
 * #%L
 * lms-lti-hierarchyresourcemanager
 * %%
 * Copyright (C) 2015 - 2022 Indiana University
 * %%
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the Indiana University nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 * #L%
 */

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
