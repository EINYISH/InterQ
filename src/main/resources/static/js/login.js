document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();

        if (username.length < 7) {
            alert("아이디는 7자 이상이어야 합니다.");
            return;
        }

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // ✅ 세션 유지 필수
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                // ✅ userId 저장 추가!
                if (result.userId) {
                    localStorage.setItem("userId", result.userId);
                    console.log("✅ userId 저장됨:", result.userId);
                } else {
                    console.warn("⚠️ 서버 응답에 userId가 없습니다.");
                }

                alert(result.message);
                window.location.href = "/index"; // 로그인 성공 시 이동
            } else {
                alert("로그인 실패: " + result.message);
            }
        } catch (error) {
            console.error("로그인 오류:", error);
            alert("서버 연결 실패");
        }
    });
});