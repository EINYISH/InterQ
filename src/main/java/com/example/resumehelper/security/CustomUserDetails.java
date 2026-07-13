package com.example.resumehelper.security;

import com.example.resumehelper.domain.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security가 요구하는 UserDetails 규격에 맞춰
 * 우리 JPA User 엔티티를 감싸는 어댑터.
 *
 * 컨트롤러에서 @AuthenticationPrincipal CustomUserDetails principal 로 주입받으면
 * principal.getId() 로 "지금 로그인한 사람의 진짜 userId"를 얻을 수 있다.
 * 클라이언트가 요청 본문에 실어 보내는 userId는 더 이상 신뢰하지 않는다.
 */
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    public Long getId() {
        return user.getId();
    }

    public String getNickname() {
        return user.getNickname();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
