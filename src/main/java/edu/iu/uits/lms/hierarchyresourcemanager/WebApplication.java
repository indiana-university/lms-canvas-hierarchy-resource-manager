package edu.iu.uits.lms.hierarchyresourcemanager;

import canvas.config.EnableCanvasClient;
import edu.iu.uits.lms.common.samesite.EnableCookieFilter;
import edu.iu.uits.lms.common.server.GitRepositoryState;
import edu.iu.uits.lms.common.server.ServerInfo;
import edu.iu.uits.lms.common.server.ServerUtils;
import edu.iu.uits.lms.coursetemplating.EnableCourseTemplatingService;
import edu.iu.uits.lms.email.EnableEmailClient;
import edu.iu.uits.lms.hierarchyresourcemanager.config.ToolConfig;
import edu.iu.uits.lms.lti.config.EnableGlobalErrorHandler;
import edu.iu.uits.lms.lti.config.EnableLtiClient;
import edu.iu.uits.lms.redis.config.EnableRedisConfiguration;
import iuonly.config.EnableIuOnlyClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;

import java.util.Date;

@SpringBootApplication
@EnableGlobalErrorHandler
@PropertySource(value = {"classpath:env.properties",
      "${app.fullFilePath}/security.properties"}, ignoreResourceNotFound = true)
@Slf4j
@EnableRedisConfiguration
@EnableCookieFilter(ignoredRequestPatterns = {"/rest/**"})
@EnableLtiClient
@EnableCanvasClient
@EnableIuOnlyClient
@EnableEmailClient
@EnableCourseTemplatingService
@EnableConfigurationProperties(GitRepositoryState.class)
public class WebApplication {

    @Autowired
    private ToolConfig toolConfig;

    public static void main(String[] args) {
        SpringApplication.run(WebApplication.class, args);
    }

    @Autowired
    private GitRepositoryState gitRepositoryState;

    @Bean(name = ServerInfo.BEAN_NAME)
    ServerInfo serverInfo() {
        return ServerInfo.builder()
              .serverName(ServerUtils.getServerHostName())
              .environment(toolConfig.getEnv())
              .buildDate(new Date())
              .gitInfo(gitRepositoryState.getBranch() + "@" + gitRepositoryState.getCommitIdAbbrev())
              .artifactVersion(toolConfig.getVersion()).build();
    }

}
