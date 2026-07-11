document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // 기본 폼 제출 동작 막기

    const formData = new FormData(event.target);
    const data = {
        username: formData.get('username'),
        nickname: formData.get('nickname'),
        password: formData.get('password'),
    };

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data),
        });

        if (response.redirected) {
            window.location.href = response.url; // 성공 시 리다이렉트
        } else {
            const result = await response.text();
            console.error('회원가입 실패:', result);
        }
    } catch (error) {
        console.error('회원가입 중 오류 발생:', error);
    }
});
