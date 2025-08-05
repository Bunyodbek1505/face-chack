import { useState } from "react";
import { Camera } from "lucide-react";
import CameraModal from "./components/CameraModal";
import { toast, ToastContainer } from "react-toastify";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  console.log(result);

  const handleImageCapture = async (base64Image: string) => {
    try {
      const response = await fetch("https://192.168.5.24:5000/face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) throw new Error("Server xatosi");

      const data = await response.json();
      setResult(data.result);
      toast.success("Ma'lumot muvaffaqiyatli yuborildi!");
      setShowModal(false);
    } catch (error) {
      console.error("Yuborishda xatolik:", error);
      toast.error("Xatolik yuz berdi. Qayta urinib ko‘ring.");
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Yuz Aniqlash
          </h1>

          <div className="space-y-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Camera size={20} />
              <span>Kamerani Ochish</span>
            </button>
          </div>

          <p className="text-gray-600 mt-6">
            Yuz aniqlash uchun kamerani yoqing
          </p>
        </div>
        {result !== null && (
          <div className="mt-6 text-center bg-white p-4 rounded shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Natija:
            </h2>
            <p className="text-gray-700">{result}</p>
          </div>
        )}

        {showModal && (
          <CameraModal
            onClose={() => setShowModal(false)}
            onCapture={handleImageCapture}
          />
        )}
      </div>

      <ToastContainer />
    </>
  );
}

export default App;
