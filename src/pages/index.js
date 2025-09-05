import { Noto_Sans_Thai } from "next/font/google";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Home() {
  return (
    <div
      className={`${notoSansThai.className} font-sans min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-white`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "0s",
          }}
        ></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-20 h-20 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "2s",
          }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-28 h-28 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "3s",
          }}
        ></div>
        <div
          className="absolute top-1/2 left-10 w-16 h-16 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "4s",
          }}
        ></div>
        <div
          className="absolute top-1/3 right-10 w-12 h-12 rounded-full animate-float"
          style={{
            background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
            animationDelay: "5s",
          }}
        ></div>
      </div>

      {/* Main Content */}
      <main className="text-center z-10 max-w-4xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-8 animate-fade-in-up">
          <h1
            className="text-6xl md:text-8xl font-bold mb-4 tracking-tight animate-pulse-slow"
            style={{
              background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            DAN
          </h1>
          <h2
            className="text-2xl md:text-3xl font-light text-gray-700 mb-2 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            Internet
          </h2>
          <div
            className="w-24 h-1 mx-auto rounded-full animate-scale-in"
            style={{
              background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
              animationDelay: "1s",
            }}
          ></div>
        </div>

        {/* Coming Soon Message */}
        <div className="mb-12">
          <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Coming Soon
          </h3>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-light">
            เรากำลังเตรียมสิ่งดีๆ ให้คุณ
          </p>
          <p className="text-lg text-gray-500 font-light">
            We&apos;re preparing something amazing for you
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-3xl mb-3">🚀</div>
            <h4 className="text-gray-800 font-semibold text-lg mb-2">
              เร็วและเสถียร
            </h4>
            <p className="text-gray-600 text-sm">
              การเชื่อมต่ออินเทอร์เน็ตความเร็วสูง
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="text-gray-800 font-semibold text-lg mb-2">
              ปลอดภัย
            </h4>
            <p className="text-gray-600 text-sm">ระบบรักษาความปลอดภัยขั้นสูง</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-3xl mb-3">💎</div>
            <h4 className="text-gray-800 font-semibold text-lg mb-2">
              พรีเมียม
            </h4>
            <p className="text-gray-600 text-sm">คุณภาพบริการระดับพรีเมียม</p>
          </div>
        </div>

        {/* Contact Info */}
        <div
          className="bg-gray-50 rounded-2xl p-8 border border-gray-200 max-w-md mx-auto shadow-lg animate-fade-in-up hover:shadow-xl transition-all duration-300"
          style={{ animationDelay: "4s" }}
        >
          <h4 className="text-gray-800 font-semibold text-lg mb-4">
            Stay Updated
          </h4>
          <p className="text-gray-600 text-sm mb-4">
            Get notified when we launch
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 focus:scale-105"
            />
            <button
              className="px-6 py-3 font-semibold rounded-lg transition-all duration-300 text-white hover:scale-105 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #B2CA2E 0%, #799B45 100%)",
              }}
            >
              Notify Me
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center my-8">
        <p className="text-gray-600 text-sm">
          © 2024 Dan Internet. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
