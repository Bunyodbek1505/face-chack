import { Camera, X } from "lucide-react";
import Webcam from "react-webcam";
import { useCountdown } from "usehooks-ts";
import { useRef, useState, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";

const WEBCAM_SIZE = 400;
// const FACE_DISTANCE_THRESHOLD = 0.1;
// const CENTER_THRESHOLD = 0.3;
const DETECTION_INTERVAL = 500;
const CAPTURE_COUNT = 10;

const videoConstraints = {
  width: WEBCAM_SIZE,
  height: WEBCAM_SIZE,
  facingMode: "user",
};

interface CameraModalProps {
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

const CameraModal = ({ onClose, onCapture }: CameraModalProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [facePositionMessage, setFacePositionMessage] = useState<string>(
    "Kamera ishga tushirilmoqda..."
  );
  const [isFaceCentered, setIsFaceCentered] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedCount, setCapturedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [hasError, setHasError] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart: 3,
    countStop: 0,
    intervalMs: 1000,
  });

  // Face-api modellarini yuklash
  useEffect(() => {
    const loadModels = async () => {
      try {
        // CDN dan face-api modellarini yuklash
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model"
        );
        setModelsLoaded(true);
        setFacePositionMessage("Yuzingizni kameraga ko'rsating");
      } catch (error) {
        console.error("Modellarni yuklashda xatolik:", error);
        setFacePositionMessage("Kamera ishga tushirishda xatolik");
      }
    };
    loadModels();
  }, []);

  // Yuz aniqlash funksiyasi
  const handleFaceDetection = useCallback(async () => {
    if (
      !webcamRef.current ||
      !webcamRef.current.video ||
      !modelsLoaded ||
      isCapturing
    ) {
      return;
    }

    const { video } = webcamRef.current;
    const detection = await faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detection) {
      setFacePositionMessage("Yuz aniqlandi. Tayyorlaning...");
      if (!isFaceCentered) {
        setIsFaceCentered(true);
        startCountdown();
      }
    } else {
      setFacePositionMessage("Yuz topilmadi. Kameraga qarang.");
      setIsFaceCentered(false);
      resetCountdown();
    }
  }, [
    modelsLoaded,
    isCapturing,
    isFaceCentered,
    startCountdown,
    resetCountdown,
  ]);

  // Yuz aniqlash intervalini o'rnatish
  useEffect(() => {
    if (!modelsLoaded) return;

    const intervalId = setInterval(handleFaceDetection, DETECTION_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [modelsLoaded, handleFaceDetection]);

  // Rasmlarni olish va yuborish
  const captureImages = useCallback(() => {
    if (!webcamRef.current || isCapturing || hasError) return;

    setIsCapturing(true);
    setIsLoading(true);
    setIsFaceCentered(false);

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setFacePositionMessage("Tasvirni olishda xatolik yuz berdi.");
      setIsCapturing(false);
      setIsLoading(false);
      return;
    }

    const base64Image = imageSrc.split(",")[1];

    try {
      onCapture(base64Image);
    } catch (error) {
      console.error("Yuborishda xatolik:", error);
      setFacePositionMessage("Yuborishda xatolik yuz berdi");
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsCapturing(false);
      setCapturedCount(0);
    }
  }, [isCapturing, hasError, onCapture]);

  // Taymer tugaganda rasmlarni olish
  useEffect(() => {
    if (count === 0 && isFaceCentered && !isCapturing && !hasError) {
      captureImages();
    }
  }, [count, isFaceCentered, isCapturing, captureImages, hasError]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-[500px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="text-white" size={24} />
            <h2 className="text-white font-bold text-lg">Yuz Aniqlash</h2>
          </div>
          <button
            onClick={() => {
              // So‘rovni bekor qilish
              if (abortControllerRef.current) {
                abortControllerRef.current.abort();
              }
              onClose();
            }}
            className="text-white hover:bg-white hover:bg-opacity-20 hover:text-black rounded-full p-1 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Kamera */}
        <div className="relative bg-gray-900 w-full h-[400px]">
          {!modelsLoaded ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              <p>Kamera ishga tushirilmoqda...</p>
            </div>
          ) : (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  border: `4px solid ${isFaceCentered ? "#22C55E" : "#FFA552"}`,
                  borderRadius: "8px",
                }}
              />

              {/* Ogohlantirish belgisi */}
              {!isFaceCentered && !isCapturing && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-20 h-20 bg-orange-500 bg-opacity-70 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-4xl font-bold">!</span>
                  </div>
                </div>
              )}

              {/* Taymer */}
              {isFaceCentered && count > 0 && !isCapturing && (
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500 bg-opacity-90 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse">
                    {count}
                  </div>
                </div>
              )}

              {/* Rasm olish jarayoni */}
              {isCapturing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                  <p className="text-lg font-semibold">
                    Rasmlar yuborilmoqda...
                  </p>
                  <p className="text-sm mt-2">
                    {capturedCount}/{CAPTURE_COUNT}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status va boshqaruv */}
        <div className="p-6 text-center">
          <p
            className={`text-sm ${
              facePositionMessage.includes("xatolik")
                ? "text-red-500"
                : isFaceCentered
                ? "text-green-600"
                : "text-orange-500"
            } font-medium`}
          >
            {facePositionMessage}
          </p>

          {isLoading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(capturedCount / CAPTURE_COUNT) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
