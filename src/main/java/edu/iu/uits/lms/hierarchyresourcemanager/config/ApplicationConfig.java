package edu.iu.uits.lms.hierarchyresourcemanager.config;

import edu.iu.uits.lms.common.cors.LmsCorsInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.session.web.http.HeaderHttpSessionIdResolver;
import org.springframework.session.web.http.HttpSessionIdResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebMvc
@EnableGlobalMethodSecurity(securedEnabled = true, prePostEnabled = true)
@Slf4j
public class ApplicationConfig implements WebMvcConfigurer {

   public ApplicationConfig() {
      log.debug("ApplicationConfig()");
   }

   @Override
   // used to read in various directories to add resources for the templates to use
   public void addResourceHandlers(ResourceHandlerRegistry registry) {
      registry.addResourceHandler("/app/css/**").addResourceLocations("classpath:/static/css/");
      registry.addResourceHandler("/app/js/**").addResourceLocations("classpath:/static/js/");
      registry.addResourceHandler("/app/webjars/**").addResourceLocations("/webjars/").resourceChain(true);
      registry.addResourceHandler("/app/jsreact/**").addResourceLocations("classpath:/META-INF/resources/jsreact/").resourceChain(true);
      registry.addResourceHandler("/app/jsrivet/**").addResourceLocations("classpath:/META-INF/resources/jsrivet/").resourceChain(true);
   }

   @Override
   public void addInterceptors(InterceptorRegistry registry) {
      List<HttpMethod> allowedMethodList = new ArrayList<HttpMethod>();
      allowedMethodList.add(HttpMethod.GET);

      try {
         registry.addInterceptor(new LmsCorsInterceptor("/rest/syllabus/",
                 "*",
                 allowedMethodList,
                 null));
         registry.addInterceptor(new LmsCorsInterceptor("/rest/hrm/canvasCourseId/",
                 "*",
                 allowedMethodList,
                 null));
      } catch (Exception e) {
         log.error("uh oh", e);
      }
   }

   /**
    * Uses an x-auth-token header value instead of a cookie for tracking the session
    */
   @Bean
   public HttpSessionIdResolver httpSessionIdResolver() {
      return HeaderHttpSessionIdResolver.xAuthToken();
   }
}
