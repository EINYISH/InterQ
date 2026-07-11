document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/session-info")
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("로그인되지 않음");
            }
        })
        .then(data => {
            document.getElementById("auth-buttons").innerHTML = `
                <button onclick="logout()">로그아웃</button>
            `;
        })
        .catch(error => {
            console.log("로그인되지 않음:", error);
            document.getElementById("auth-buttons").innerHTML = `
                <a href="/login">로그인</a>
            `;
        });
});

function logout() {
    fetch("/api/logout")
        .then(() => {
            window.location.reload();
        });
}