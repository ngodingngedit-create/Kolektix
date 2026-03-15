import { useState, useEffect } from 'react';
import Head from 'next/head';
import Footer from '../../components/FooterComponent';

const PrivacyPolicyPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('intro');

  const sections = [
    {
      id: 'intro',
      title: '1. Pendahuluan',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Selamat datang di Kolektix. Kami berkomitmen untuk melindungi privasi Anda. Kebijakan
            Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan mengungkapkan
            informasi tentang Anda ketika Anda menggunakan situs web dan layanan kami.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Kebijakan Privasi ini berlaku bagi setiap pelanggan dan/atau pengguna
            (&ldquo;Pelanggan&rdquo;) dan penyedia tiket sebagai pemilik tiket dan/atau yang
            menyediakan tiket (&ldquo;Penyedia Tiket&rdquo;) pada situs kolektix
            (https://www.kolektix.com) (&quot;Platform&quot;), kecuali diatur pada kebijakan privasi
            yang terpisah.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Mohon baca Kebijakan Privasi ini dengan seksama untuk memastikan bahwa Anda memahami
            bagaimana proses pengumpulan, penggunaan, dan pengolahan data Kami.
          </p>
        </>
      ),
    },
    {
      id: 'info-collected',
      title: '2. Informasi yang Kami Kumpulkan',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Kami mengumpulkan informasi tentang Anda secara langsung dari Anda, dari pihak ketiga,
            dan secara otomatis melalui penggunaan situs web kami.
          </p>
          <h3 className="text-[#02255A] font-semibold text-base mb-2">Informasi yang Anda Berikan</h3>
          <p className="text-gray-600 mb-3 leading-relaxed tracking-wide">
            Kami mengumpulkan informasi yang Anda berikan langsung kepada kami, seperti saat Anda
            membuat akun, mengisi formulir, atau berkomunikasi dengan kami. Informasi ini dapat
            mencakup:
          </p>
          <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-4 leading-relaxed">
            <li>Nama lengkap</li>
            <li>Alamat email</li>
            <li>Nomor telepon</li>
            <li>Informasi kontak atau identifikasi lain yang Anda pilih untuk diberikan</li>
          </ul>
          <h3 className="text-[#02255A] font-semibold text-base mb-2 mt-4">Informasi yang Dikumpulkan Secara Otomatis</h3>
          <p className="text-gray-600 mb-3 leading-relaxed tracking-wide">
            Ketika Anda menggunakan situs web kami, kami dapat secara otomatis mengumpulkan
            informasi tentang Anda, termasuk:
          </p>
          <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-4 leading-relaxed">
            <li>Alamat IP</li>
            <li>Jenis browser</li>
            <li>Sistem operasi</li>
            <li>Halaman yang Anda lihat di situs kami</li>
            <li>Waktu dan tanggal kunjungan Anda</li>
            <li>URL perujuk</li>
          </ul>
        </>
      ),
    },
    {
      id: 'info-usage',
      title: '3. Penggunaan Informasi',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Kami menggunakan informasi yang kami kumpulkan untuk:
          </p>
          <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-4 leading-relaxed">
            <li>Menyediakan, memelihara, dan meningkatkan layanan kami</li>
            <li>Merespons komentar, pertanyaan, dan permintaan Anda</li>
            <li>Berkomunikasi dengan Anda tentang produk, layanan, dan acara</li>
            <li>Memantau dan menganalisis tren, penggunaan, dan aktivitas</li>
            <li>Mempersonalisasi pengalaman Anda di situs kami</li>
            <li>Memproses transaksi dan mengirimkan informasi terkait, termasuk konfirmasi pembelian dan faktur</li>
            <li>Memverifikasi identitas Anda dan mencegah penipuan</li>
          </ul>
        </>
      ),
    },
    {
      id: 'info-sharing',
      title: '4. Berbagi Informasi',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Kami dapat berbagi informasi Anda dengan pihak ketiga sebagai berikut:
          </p>
          <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-4 leading-relaxed">
            <li>Dengan persetujuan Anda atau atas arahan Anda</li>
            <li>
              Dengan penyedia layanan yang melakukan layanan atas nama kami (pembayaran, pengiriman
              email, analitik, dll.)
            </li>
            <li>
              Sebagai tanggapan atas permintaan informasi jika kami yakin pengungkapan sesuai dengan
              hukum, peraturan, atau proses hukum yang berlaku
            </li>
            <li>
              Jika kami yakin tindakan Anda tidak konsisten dengan perjanjian pengguna atau kebijakan
              kami, atau untuk melindungi hak, properti, dan keselamatan kami atau pihak lain
            </li>
            <li>
              Sehubungan dengan, atau selama negosiasi, merger, penjualan aset perusahaan,
              pembiayaan, atau akuisisi seluruh atau sebagian bisnis kami
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'cookies',
      title: '5. Cookie & Teknologi Pelacakan',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Kami menggunakan cookie dan teknologi pelacakan serupa untuk melacak aktivitas di
            layanan kami dan menyimpan informasi tertentu. Cookie adalah file dengan sejumlah kecil
            data yang dapat mencakup pengenal unik anonim.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Anda dapat menginstruksikan browser Anda untuk menolak semua cookie atau untuk
            menunjukkan kapan cookie dikirim. Namun, jika Anda tidak menerima cookie, Anda mungkin
            tidak dapat menggunakan beberapa bagian dari layanan kami.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Contoh cookie yang kami gunakan:
          </p>
          <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-4 leading-relaxed">
            <li><strong>Cookie Sesi</strong> — Kami menggunakan Cookie Sesi untuk mengoperasikan layanan kami.</li>
            <li><strong>Cookie Preferensi</strong> — Kami menggunakan Cookie Preferensi untuk mengingat preferensi dan pengaturan Anda.</li>
            <li><strong>Cookie Keamanan</strong> — Kami menggunakan Cookie Keamanan untuk tujuan keamanan.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'security',
      title: '6. Keamanan Data',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Kami mengambil langkah-langkah yang wajar untuk membantu melindungi informasi tentang
            Anda dari kehilangan, pencurian, penyalahgunaan, dan akses, pengungkapan, perubahan,
            serta penghancuran yang tidak sah.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Namun, ingat bahwa tidak ada metode transmisi melalui Internet, atau metode penyimpanan
            elektronik yang 100% aman. Meskipun kami berupaya menggunakan cara yang dapat diterima
            secara komersial untuk melindungi Informasi Pribadi Anda, kami tidak dapat menjamin
            keamanan mutlaknya.
          </p>
        </>
      ),
    },
    {
      id: 'your-choices',
      title: '7. Pilihan Anda',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Anda dapat memperbarui atau mengoreksi informasi tentang diri sendiri kapan saja dengan
            masuk ke akun Anda atau menghubungi kami. Anda juga dapat memilih untuk tidak menerima
            email promosi dari kami dengan mengikuti petunjuk dalam email tersebut.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Anda memiliki hak-hak berikut terkait informasi pribadi Anda:
          </p>
          <ul className="list-disc ml-6 text-gray-600 space-y-2 mb-4 leading-relaxed">
            <li>Hak untuk mengakses data pribadi yang kami miliki tentang Anda</li>
            <li>Hak untuk meminta koreksi data yang tidak akurat</li>
            <li>Hak untuk meminta penghapusan data Anda dalam keadaan tertentu</li>
            <li>Hak untuk menolak pemrosesan data Anda untuk tujuan pemasaran langsung</li>
          </ul>
        </>
      ),
    },
    {
      id: 'contact',
      title: '8. Hubungi Kami',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau cara kami menangani
            data pribadi Anda, silakan hubungi kami di:
          </p>
          <div className="bg-blue-50 p-6 rounded-2xl mt-8 border border-blue-100/50">
            <h4 className="text-[#02255A] font-bold text-lg mb-4">PT Kolektix Maju Bersama</h4>
            <div className="flex flex-col gap-4 text-gray-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#0B387C] mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <p>Pasar Kita Pintu barat 2 Blok K17/18 Pamulang Barat, Kec. pamulang, kota tanggerang selatan banten 15417</p>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#0B387C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <a href="mailto:teman@kolektix.com" className="hover:text-[#0B387C] font-medium transition-colors">teman@kolektix.com</a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#0B387C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <a href="tel:+628119990445" className="hover:text-[#0B387C] font-medium transition-colors">+62 811 9990 445</a>
              </div>
            </div>
          </div>
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
        <title>Kebijakan Privasi | Kolektix</title>
      </Head>
      <div className="bg-[#02255A] font-sans w-full pt-[72px] flex flex-col">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#02255A] via-[#0B387C] to-[#184a96] py-6 px-5 md:py-8 md:px-8 relative overflow-hidden shrink-0 shadow-md z-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl translate-y-1/3"></div>

          <div className="w-full mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 px-0 md:px-12">
            <div>
              <h1 className="text-[28px] md:text-4xl font-extrabold text-white mb-2 tracking-tight">Kebijakan Privasi</h1>
              <p className="text-blue-100/90 max-w-xl text-[15px] md:text-[16px] font-light leading-relaxed">
                Silakan baca dengan saksama kebijakan privasi di bawah ini untuk memahami bagaimana kami mengelola data Anda.
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
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 md:mb-6">Daftar Isi Kebijakan</h3>

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
                  className="w-full p-3.5 border-2 border-slate-200 rounded-xl text-slate-700 font-bold bg-white focus:border-[#0B387C] focus:outline-none text-[14px] shadow-none appearance-none cursor-pointer"
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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .sidebar-nav-scroll::-webkit-scrollbar {
          width: 7px;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </>
  );
};

export default PrivacyPolicyPage;

