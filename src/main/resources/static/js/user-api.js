// 사용자 정보를 불러오는 함수 내정보 수정 페이지
async function getUserInfo(username) {
    try {
        const response = await fetch(`/api/user-info?username=${username}`);
        if (response.ok) {
            return await response.json(); // 닉네임 정보 반환
        } else {
            throw new Error('사용자 정보를 불러올 수 없습니다.');
        }
    } catch (error) {
        console.error('getUserInfo 오류:', error);
        throw error;
    }
}

// 사용자 정보를 업데이트하는 함수
async function updateUser(username, nickname, password) {
    try {
        const response = await fetch('/api/update-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, nickname, password }),
        });

        if (response.ok) {
            return await response.text(); // 성공 메시지 반환
        } else {
            throw new Error('정보 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('updateUser 오류:', error);
        throw error;
    }
}

// 모듈 내보내기
export { getUserInfo, updateUser };
