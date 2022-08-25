package edu.iu.uits.lms.hierarchyresourcemanager.config;

import edu.iu.uits.lms.hierarchyresourcemanager.model.User;
import edu.iu.uits.lms.hierarchyresourcemanager.repository.UserRepository;
import edu.iu.uits.lms.lti.controller.InvalidTokenContextException;
import edu.iu.uits.lms.lti.repository.DefaultInstructorRoleRepository;
import edu.iu.uits.lms.lti.service.LmsDefaultGrantedAuthoritiesMapper;
import edu.iu.uits.lms.lti.service.OidcTokenUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import uk.ac.ox.ctl.lti13.security.oauth2.client.lti.authentication.OidcAuthenticationToken;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Slf4j
public class CustomRoleMapper extends LmsDefaultGrantedAuthoritiesMapper {
    private UserRepository userRepository;

    public CustomRoleMapper(DefaultInstructorRoleRepository defaultInstructorRoleRepository, UserRepository userRepository) {
      super(defaultInstructorRoleRepository);
      this.userRepository = userRepository;
   }

   @Override
   public Collection<? extends GrantedAuthority> mapAuthorities(Collection<? extends GrantedAuthority> authorities) {
       List<GrantedAuthority> remappedAuthorities = new ArrayList<>();
       remappedAuthorities.addAll(authorities);
       for (GrantedAuthority authority : authorities) {
           OidcUserAuthority userAuth = (OidcUserAuthority) authority;
           OidcTokenUtils oidcTokenUtils = new OidcTokenUtils(userAuth.getAttributes());
           log.debug("LTI Claims: {}", userAuth.getAttributes());

           if (Boolean.parseBoolean(oidcTokenUtils.getCustomValue("is_apply_template_security_mode"))) {
               log.debug("Apply template mode");
               // Use the legit roles
               return super.mapAuthorities(authorities);
           } else {
               log.debug("Node Manager mode");
               String userId = oidcTokenUtils.getUserLoginId();

               String rolesString = "NotAuthorized";

               User user = userRepository.findByUsername(userId);

               if (user != null && user.isAuthorizedUser()) {
                   rolesString = "Instructor";
               }

               String[] userRoles = rolesString.split(",");

               String newAuthString = returnEquivalentAuthority(userRoles, getDefaultInstructorRoles());
               OidcUserAuthority newUserAuth = new OidcUserAuthority(newAuthString, userAuth.getIdToken(), userAuth.getUserInfo());

               remappedAuthorities.add(newUserAuth);
           }
       }

       return remappedAuthorities;
   }
}
