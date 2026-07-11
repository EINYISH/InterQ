import { getStream } from './camera.js';

let mediaRecorder = null;
let recordedChunks = [];

let videoMediaRecorder = null;
let videoChunks = [];

export function startRecording() {
    const stream = getStream();
    if (!stream) {
        console.error("❌ [ERROR] 스트림이 존재하지 않음.");
        return;
    }

    // 오디오 녹음 설정
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.push(event.data);
    };
    mediaRecorder.start();

    // 비디오 녹음 설정
    videoMediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    videoChunks = [];

    videoMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) videoChunks.push(event.data);
    };
    videoMediaRecorder.start();

    console.log("🎙️ [LOG] 오디오 & 비디오 녹화 시작");
}

export function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
            uploadAudioToServer(audioBlob);
        };
    }

    if (videoMediaRecorder && videoMediaRecorder.state !== "inactive") {
        videoMediaRecorder.stop();
        videoMediaRecorder.onstop = () => {
            const videoBlob = new Blob(videoChunks, { type: "video/webm" });
            uploadVideoToServer(videoBlob);
        };
    }

    console.log("🛑 [LOG] 녹화 종료 및 업로드 시작");
}

// 오디오 업로드
function uploadAudioToServer(audioBlob) {
    if (!audioBlob || audioBlob.size === 0) {
        console.error("❌ 오디오 파일이 없습니다.");
        return;
    }

    const userId = localStorage.getItem("userId");
    const formData = new FormData();
    formData.append("audio", audioBlob, "simulation.webm");
    formData.append("userId", userId);

    fetch("/api/upload/audio", {
        method: "POST",
        body: formData
    })
        .then(res => res.text())
        .then(text => console.log("✅ 오디오 업로드 완료:", text))
        .catch(err => console.error("❌ 오디오 업로드 실패:", err));
}

// 비디오 업로드
function uploadVideoToServer(videoBlob) {
    if (!videoBlob || videoBlob.size === 0) {
        console.error("❌ 비디오 파일이 없습니다.");
        return;
    }

    const userId = localStorage.getItem("userId");
    const timestamp = Date.now();
    const fileName = `simulation_${timestamp}.webm`;

    const formData = new FormData();
    formData.append("video", videoBlob, fileName);
    formData.append("userId", userId);

    fetch("/api/videos/upload", {
        method: "POST",
        body: formData
    })
        .then(res => res.text())
        .then(text => console.log("✅ 비디오 업로드 완료:", text))
        .catch(err => console.error("❌ 비디오 업로드 실패:", err));
}