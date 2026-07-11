let stream = null;

export async function startCameraAndAudio() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true
            }
        });

        const videoElement = document.getElementById("camera");
        videoElement.srcObject = stream;
        videoElement.muted = true;

        console.log("📸 [LOG] 카메라 및 마이크 스트림 시작됨.");
    } catch (error) {
        console.error("❌ [ERROR] 카메라 및 마이크 활성화 실패:", error);
        alert("카메라 및 마이크 권한을 허용해주세요.");
    }
}

export function stopCameraAndAudio() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;

        const videoElement = document.getElementById("camera");
        videoElement.srcObject = null;

        console.log("🛑 [LOG] 카메라 및 마이크 스트림 종료됨.");
    }
}

export function getStream() {
    return stream;
}