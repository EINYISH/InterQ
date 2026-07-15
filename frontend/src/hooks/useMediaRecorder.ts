import { useRef, useState, useCallback } from 'react'

export function useMediaRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // 웹캠 미리보기용 - 녹화 시작 전에도 화면에 보여주기 위해 별도로 분리
  const startPreview = useCallback(async () => {
    const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    setStream(media)
    return media
  }, [])

  const startRecording = useCallback((media: MediaStream) => {
    chunksRef.current = []
    const recorder = new MediaRecorder(media, { mimeType: 'video/webm' })

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start()
    recorderRef.current = recorder
    setIsRecording(true)
  }, [])

  // ✅ 영상+음성이 합쳐진 하나의 webm blob을 돌려준다.
  //    같은 blob을 오디오 업로드(/api/upload/audio)와 영상 업로드(/api/videos/upload)에 각각 보내도 된다 -
  //    ffmpeg가 오디오 트랙만 뽑아서 wav로 변환해주기 때문.
  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current
      if (!recorder) return

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setIsRecording(false)
        resolve(blob)
      }
      recorder.stop()
    })
  }, [])

  const stopPreview = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop())
    setStream(null)
  }, [stream])

  return { isRecording, stream, startPreview, startRecording, stopRecording, stopPreview }
}
