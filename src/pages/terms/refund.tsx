import { useState, useEffect } from 'react';
import Head from 'next/head';
import Footer from '../../components/FooterComponent';

const ReturnPolicy = () => {
  const [activeItem, setActiveItem] = useState<string>('kebijakan-pengembalian');

  const sections = [
    {
      id: 'kebijakan-pengembalian',
      title: 'Kebijakan Pengembalian Uang',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Berikut adalah kebijakan pengembalian dana kami, setiap pembelian atau transaksi akan
            mencapai persyaratan yang berbeda. Silahkan baca dengan cermat ketentuan dibawah ini:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-600 leading-relaxed">
            <li>Seluruh tiket pembeli yang telah dibeli tidak bisa diuangkan kembali.</li>
            <li>
              Pengembalian dana hanya untuk pembeli yang memiliki kendala dalam proses pembayaran,
              contoh seperti sistem bank dalam proses perbaikan atau error.
            </li>
            <li>
              Kami menghimbau kamu untuk tidak menjual tiketmu ke orang lain. Setiap kendala atau
              masalah yang disebabkan dari aktivitas tersebut bukan tanggung jawab kami.
            </li>
            <li>
              Jika kamu ingin menjual tiketmu, kamu sebaiknya mengkonfirmasikan terlebih dahulu kepada
              event creator atau kami.
            </li>
            <li>
              Kami dapat mengembalikan danamu jika ada bukti transaksi. Jika tidak, tidak kami layani.
            </li>
            <li>Bukti transaksi dapat berupa struk transfer atau mutasi rekening.</li>
            <li>
              Setiap pengembalian dana yang disebabkan oleh Force Majeure akan diatur oleh event
              creator. Ketentuan yang berlaku pada proses tersebut adalah ketentuan yang ada pada
              pihak event creator, dan diluar dari tanggung jawab kami.
            </li>
          </ul>
        </>
      ),
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      let currentActiveId = activeItem;
      let minDistance = Infinity;

      if (isMobile) {
        const scrollY = window.scrollY;
        const offset = 65 + 72;
        for (const section of sections) {
          const element = document.getElementById(section.id);
          if (element) {
            const elementTop = element.getBoundingClientRect().top + scrollY;
            const distance = Math.abs(scrollY + offset - elementTop);
            if (distance < minDistance) {
              minDistance = distance;
              currentActiveId = section.id;
            }
          }
        }
      } else {
        const container = document.getElementById('main-scroll-container');
        if (!container) return;
        const containerTop = container.getBoundingClientRect().top;
        for (const section of sections) {
          const element = document.getElementById(section.id);
          if (element) {
            const distance = Math.abs(element.getBoundingClientRect().top - containerTop - 100);
            if (distance < minDistance) {
              minDistance = distance;
              currentActiveId = section.id;
            }
          }
        }
      }

      if (currentActiveId !== activeItem) {
        setActiveItem(currentActiveId);
      }
    };

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      const container = document.getElementById('main-scroll-container');
      if (container) {
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }
  }, [activeItem, sections]);

  const scrollToSection = (id: string) => {
    setActiveItem(id);
    const element = document.getElementById(id);
    const isMobile = window.innerWidth < 768;

    if (element) {
      if (isMobile) {
        const stickyOffset = 65 + 72;
        const elementTop = element.getBoundingClientRect().top + window.scrollY - stickyOffset;
        window.scrollTo({ top: elementTop, behavior: 'smooth' });
      } else {
        const container = document.getElementById('main-scroll-container');
        if (container) {
          const containerTop = container.getBoundingClientRect().top;
          const elementTop = element.getBoundingClientRect().top;
          const currentScrollTop = container.scrollTop;
          const targetScroll = currentScrollTop + (elementTop - containerTop) - 40;
          container.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Kebijakan Pengembalian Uang | Kolektix</title>
      </Head>
      <div className="bg-[#02255A] font-sans w-full pt-[72px] flex flex-col">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#02255A] via-[#0B387C] to-[#184a96] py-6 px-5 md:py-8 md:px-8 relative overflow-hidden shrink-0 shadow-md z-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl translate-y-1/3"></div>
          <div className="w-full mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 px-0 md:px-12">
            <div>
              <h1 className="text-[28px] md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                Kebijakan Pengembalian Uang
              </h1>
              <p className="text-blue-100/90 max-w-xl text-[15px] md:text-[16px] font-light leading-relaxed">
                Silakan baca dengan cermat ketentuan pengembalian dana berikut ini sebelum melakukan transaksi di KOLEKTIX.
              </p>
            </div>
            <div className="text-blue-100/80 text-xs md:text-sm bg-white/10 px-5 py-2 md:px-6 md:py-2.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg shrink-0 self-start md:self-auto">
              Terakhir diperbarui: <span className="text-white font-semibold">21 Mei 2018</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full bg-white flex flex-col md:flex-row border-t-4 border-[#02255A]">

          {/* Sidebar */}
          <aside className="w-full md:w-1/3 lg:w-[28%] bg-white md:bg-slate-50 sticky top-[65px] md:top-[72px] md:self-start border-b border-slate-200 md:border-b-0 flex-none md:flex-shrink-0 h-auto no-scrollbar z-20 shadow-[0_-8px_0_8px_white,0_2px_6px_rgba(0,0,0,0.06)] md:shadow-none">
            <div className="py-4 px-5 md:pt-7 md:pb-8 md:px-12">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 md:mb-6">Daftar Isi</h3>

              {/* Desktop Nav */}
              <div className="hidden md:block">
                <ul
                  className="flex flex-col gap-1 relative list-none m-0 p-0 sidebar-nav-scroll"
                  style={{ maxHeight: sections.length > 3 ? 'calc(3 * 40px + 2 * 4px)' : 'none', overflowY: sections.length > 3 ? 'auto' : 'visible' }}
                >
                  {sections.map((item) => (
                    <li key={item.id} className="relative z-10">
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left py-2 px-4 pl-8 transition-all rounded-xl text-[14px] flex items-center relative overflow-hidden group ${activeItem === item.id
                            ? 'text-[#0B387C] font-bold bg-blue-50/80 shadow-sm ring-1 ring-blue-100'
                            : 'text-slate-500 hover:text-[#0B387C] hover:bg-slate-100/50 font-medium'
                          }`}
                      >
                        {activeItem === item.id && (
                          <div className="absolute left-3 w-[8px] h-[8px] rounded-full transition-colors bg-[#0B387C]"></div>
                        )}
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile Select */}
              <div className="md:hidden">
                <select
                  value={activeItem}
                  onChange={(e) => scrollToSection(e.target.value)}
                  className="w-full p-3.5 border-2 border-slate-200 rounded-xl text-slate-700 font-bold bg-white focus:border-[#0B387C] focus:outline-none text-[14px] appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23334155'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em 1.2em' }}
                >
                  {sections.map(item => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <main id="main-scroll-container" className="flex-1 w-full relative bg-white">
            <div className="py-6 px-5 md:py-8 md:px-16 lg:px-24">
              <div className="max-w-[800px] mx-auto">
                {sections.map((item, index) => (
                  <div key={item.id} id={item.id} className={`scroll-mt-[40px] ${index !== sections.length - 1 ? 'mb-10' : 'mb-6'}`}>
                    <h2 className="text-2xl md:text-[28px] font-bold text-[#02255A] mb-3 flex flex-col gap-2 relative">
                      {item.title}
                      <div className="w-12 h-[3px] bg-gradient-to-r from-[#0B387C] to-blue-400 rounded-full"></div>
                    </h2>
                    <div className="text-[15.5px] prose prose-slate prose-a:text-[#0B387C] leading-loose text-slate-600">
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .sidebar-nav-scroll::-webkit-scrollbar { width: 7px; }
        .sidebar-nav-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}</style>
    </>
  );
};

export default ReturnPolicy;

