package edu.iu.uits.lms.hierarchyresourcemanager.config;

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

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

import java.time.Duration;

@Profile("redis-cache")
@Configuration
@EnableCaching
@Slf4j
public class RedisCacheConfig extends BaseCache {
    @Autowired
    private ToolConfig toolConfig;

    @Autowired
    private LettuceConnectionFactory redisConnectionFactory;

    @Bean(name = "HierarchyResourceManagerRedisCacheConfiguration")
    public RedisCacheConfiguration cacheConfiguration() {
        final int ttlMinutes = 30;
        return RedisCacheConfiguration.defaultCacheConfig()
              .entryTtl(Duration.ofMinutes(ttlMinutes))
              .disableCachingNullValues()
              .prefixCacheNameWith(toolConfig.getEnv() + "-hrm");
    }

    @Bean(name = "HierarchyResourceManagerCacheManager")
    @Primary
    public CacheManager cacheManager() {
        log.debug("cacheManager()");
        log.debug("Redis hostname: {}", redisConnectionFactory.getHostName());
        //TODO: Redis can't easily be used for CACHE_DRIVE_SERVICE since it's not serializable, so switching back to ehcache only
        return RedisCacheManager.builder(redisConnectionFactory)
              .withCacheConfiguration(CACHE_NAME, cacheConfiguration())
              .build();
    }
}
