export default function CTA() {
  return (
    <div className="container mx-auto px-4 py-20">
      <a 
        href="/shop" 
        className="block cs_radius_12 overflow-hidden relative text-center cs_white_color cs_fs_54 font-semibold uppercase py-16 px-8 hover:opacity-90 transition-opacity"
        style={{
          backgroundImage: "url('/images/cta_bg.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10">
          En Yeni <br />
          Trend Ürünleri Keşfedin
        </div>
      </a>
    </div>
  )
}



