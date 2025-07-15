import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCentered, setIsCentered] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      setLoadingModels(false);
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (!loadingModels) {
      startVideo();
    }
  }, [loadingModels]);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Erro ao acessar a câmera:", err));
  };

  const handleVideoOnPlay = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const dims = faceapi.matchDimensions(
        canvasRef.current,
        videoRef.current,
        true
      );
      const resizedDetections = faceapi.resizeResults(detections, dims);

      canvasRef.current
        .getContext("2d")
        ?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

      if (resizedDetections.length > 0) {
        const box = resizedDetections[0].detection.box;
        const centerX = videoRef.current.videoWidth / 2;
        const centerY = videoRef.current.videoHeight / 2;

        const boxCenterX = box.x + box.width / 2;
        const boxCenterY = box.y + box.height / 2;

        const tolerance = 80;
        const centered =
          Math.abs(centerX - boxCenterX) < tolerance &&
          Math.abs(centerY - boxCenterY) < tolerance;
        setIsCentered(centered);
      } else {
        setIsCentered(false);
      }
    }, 300);

    return () => clearInterval(interval);
  };

  return (
    <div className="App">
      <h1>Face Detection com face-api.js</h1>
      {loadingModels ? (
        <p>Carregando modelos...</p>
      ) : (
        <div style={{ position: "relative", display: "inline-block" }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            width={640}
            height={480}
            onPlay={handleVideoOnPlay}
            style={{ borderRadius: 8 }}
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        </div>
      )}
      <p>
        {isCentered
          ? "✅ Rosto centralizado!"
          : "⚠️ Centralize o rosto na tela."}
      </p>
    </div>
  );
}

export default App;
