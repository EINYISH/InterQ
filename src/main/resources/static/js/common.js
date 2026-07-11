document.addEventListener('DOMContentLoaded', async () => {
    const nicknameElement = document.querySelector('#header-nickname');
    const navBar = document.querySelector('nav');

    if (!nicknameElement || !navBar) return;

    try {
        const res = await fetch("/api/session-info", {
            method: "GET",
            credentials: "include"
        });

        if (res.ok) {
            const data = await res.json();
            const nickname = data.nickname;

            nicknameElement.innerText = `${nickname}님`;
            nicknameElement.style.display = 'inline';
            nicknameElement.style.cursor = 'pointer';

            const loginButton = document.querySelector("button[onclick*='/login']");
            if (loginButton) loginButton.remove();

            // 로그아웃 버튼 생성
            const logoutButton = document.createElement('button');
            logoutButton.innerText = 'logout';
            logoutButton.style.marginLeft = '10px';
            logoutButton.style.padding = '10px 15px';
            logoutButton.style.border = 'none';
            logoutButton.style.backgroundColor = '#001f3f';
            logoutButton.style.borderRadius = '5px';
            logoutButton.style.cursor = 'pointer';

            logoutButton.onmouseover = () => {
                logoutButton.style.backgroundColor = 'lightgrey';
                logoutButton.style.color = '#fff';
            };
            logoutButton.onmouseout = () => {
                logoutButton.style.backgroundColor = '#001f3f';
                logoutButton.style.color = '#fff';
            };

            logoutButton.onclick = () => {
                fetch("/api/logout", {
                    method: "GET",
                    credentials: "include"
                }).then(() => {
                    alert("로그아웃 되었습니다.");
                    window.location.href = "/";
                });
            };

            navBar.insertBefore(logoutButton, nicknameElement.nextSibling);

            // 드롭다운 메뉴 설정
            nicknameElement.addEventListener('click', (event) => {
                event.stopPropagation();

                let dropdownMenu = document.querySelector('#dropdown-menu');
                if (dropdownMenu) {
                    dropdownMenu.remove();
                    return;
                }

                dropdownMenu = document.createElement('div');
                dropdownMenu.id = 'dropdown-menu';

                Object.assign(dropdownMenu.style, {
                    position: 'absolute',
                    top: `${nicknameElement.getBoundingClientRect().bottom + window.scrollY + 20}px`,
                    left: `${nicknameElement.getBoundingClientRect().left}px`,
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    zIndex: '1000',
                    padding: '10px',
                    width: '120px',
                });

                dropdownMenu.innerHTML = `
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="padding: 5px 10px; cursor: pointer;" id="my-info">Settings</li>
                        <li style="padding: 5px 10px; cursor: pointer;" id="personal-page">My Page</li>
                    </ul>
                `;

                document.body.appendChild(dropdownMenu);

                document.getElementById('personal-page').addEventListener('click', () => {
                    window.location.href = '/mypersonal';
                });
                document.getElementById('my-info').addEventListener('click', () => {
                    window.location.href = '/settings';
                });

                document.addEventListener('click', () => {
                    dropdownMenu.remove();
                }, { once: true });
            });
        } else {
            nicknameElement.style.display = 'none';
        }
    } catch (error) {
        console.error("세션 상태 확인 실패:", error);
        nicknameElement.style.display = 'none';
    }
});

// 스타일 추가 함수
function addDropdownStyles() {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
        #dropdown-menu {
            position: absolute;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            padding: 10px;
            width: 100%;
        }
    `;
    document.head.appendChild(styleTag);
}

// DOMContentLoaded에서 스타일 함수 호출
document.addEventListener('DOMContentLoaded', () => {
    addDropdownStyles();

    const navBar = document.querySelector('nav');
    if (navBar) {
        Object.assign(navBar.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
        });
    }

    const nicknameElement = document.querySelector('#header-nickname');
    if (nicknameElement) {
        Object.assign(nicknameElement.style, {
            marginTop: '0',
            verticalAlign: 'middle',
            fontSize: '16px',
            color: 'white'
        });
    }

    // ✅ 자기소개 입력 시 자동 높이 조절
    const selfIntro = document.getElementById('self-introduction');
    if (selfIntro) {
        selfIntro.style.overflow = 'hidden'; // 스크롤 안 보이게
        selfIntro.style.minHeight = '100px'; // 초기 높이
        selfIntro.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
});