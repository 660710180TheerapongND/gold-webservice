export default function Docs() {
  return (
    <main className="p-10 text-left bg-[#FDFAF4] min-h-screen">
      <h1 className="font-serif text-4xl font-black mb-8 border-b-2 border-[#C8922A] pb-4">API Documentation</h1>
      
      <section className="space-y-12 max-w-4xl">
        <div>
          <h2 className="text-xl font-bold text-[#1A1410] mb-2">1. Authentication</h2>
          <p className="text-sm text-gray-600 mb-4">ส่ง API Key ของคุณผ่าน HTTP Header เพื่อเข้าถึงข้อมูล</p>
          <div className="bg-[#1A1410] p-4 rounded-lg font-mono text-xs text-[#E8B84B]">
            Header: x-api-key: YOUR_API_KEY
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1A1410] mb-2">2. Endpoints</h2>
          <div className="space-y-4">
            <div className="border border-orange-200/30 p-4 rounded-xl bg-white">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold mr-2">GET</span>
              <code className="text-sm">/api/prices/latest</code>
              <p className="mt-2 text-xs text-gray-500 italic">ดึงราคาทองคำล่าสุด (อัปเดตทุก 10 วินาที)</p>
            </div>
            {/* เพิ่ม Endpoint อื่นๆ ตรงนี้ */}
          </div>
        </div>
      </section>
    </main>
  );
}