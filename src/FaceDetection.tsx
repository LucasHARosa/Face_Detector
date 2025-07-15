import * as faceapi from "face-api.js";
import { useEffect } from "react";

export function FaceDetection() {
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);

      console.log("Modelos carregados!");
    };

    loadModels();
  }, []);

  return <div>Carregando modelos...</div>;
}
