package com.example.resumehelper.security;

import com.example.resumehelper.domain.User;
import com.example.resumehelper.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * AuthenticationManager가 로그인 시도를 검증할 때 호출하는 지점.
 * "이 username을 가진 사용자를 DB에서 찾아서 UserDetails로 돌려줘"라는
 * 역할 하나만 담당한다. 비밀번호 비교는 여기서 하지 않는다 (PasswordEncoder가 담당).
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("존재하지 않는 사용자입니다: " + username));
        return new CustomUserDetails(user);
    }
}
