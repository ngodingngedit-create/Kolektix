import { useState, useEffect } from 'react';
import Head from 'next/head';
import Footer from '../../components/FooterComponent';

const PrivacyPolicyPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('introduction');

  const sections = [
    {
      id: 'introduction',
      title: '1. Defenisi',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Kebijakan Privasi berikut ini menjelaskan bagaimana Kami, (PT. KOLEKTIX MAJU BERSAMA,
            afiliasi-afiliasi Kami, dan pihak yang bekerja sama dengan Kami secara khusus untuk
            menyediakan layanan, produk dan/atau jasa kepada Anda, untuk selanjutnya disebut
            &quot;Kami&quot;) mengumpulkan, menyimpan, menggunakan, mengolah, menguasai, mentransfer,
            mengungkapkan dan melindungi Informasi Pribadi Anda.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Kebijakan Privasi ini berlaku bagi setiap pelanggan dan/atau pengguna (&#8220;Pelanggan&#8221;)
            dan penyedia tiket sebagai pemilik tiket dan/atau yang menyediakan tiket (&#8220;Penyedia
            Tiket&#8221;) pada situs kolektix (https://www.kolektix.com) (&quot;Platform&quot;), kecuali diatur
            pada kebijakan privasi yang terpisah.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Mohon baca Kebijakan Privasi ini dengan seksama untuk memastikan bahwa Anda memahami
            bagaimana proses pengumpulan, penggunaan, dan pengolahan data Kami.
          </p>
        </>
      ),
    },
    {
      id: 'data-collection',
      title: '2. Pengumpulan Data',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Kami mengumpulkan informasi yang mengidentifikasikan atau dapat digunakan untuk
            mengidentifikasi, menghubungi, atau menemukan orang atau perangkat yang terkait dengan
            informasi tersebut (&quot;Informasi Pribadi&quot;). Kami dapat mengumpulkan informasi dalam
            berbagai macam bentuk dan tujuan, termasuk tujuan yang diizinkan berdasarkan peraturan
            perundang-undangan yang berlaku.
          </p>
          <ul className='list-disc ml-6 text-gray-600 space-y-2 mb-4 leading-relaxed'>
            <li>Pengumpulan Informasi Pribadi Pelanggan</li>
            <li>Pengumpulan Informasi Pribadi Penyedia Tiket</li>
            <li>Informasi yang Kami Kumpulkan Secara Langsung</li>
            <li>Informasi yang Dikumpulkan Setiap Kali Anda Menggunakan Platform</li>
            <li>Penggunaan Cookies</li>
            <li>Informasi Lokasi</li>
            <li>Informasi dari Pihak Ketiga</li>
            <li>Informasi Tentang Pihak Ketiga yang Anda Berikan</li>
          </ul>
        </>
      ),
    },
    {
      id: 'data-usage',
      title: '3. Penggunaan Data',
      content: (
        <>
          <p className="text-gray-600 mb-4 leading-relaxed tracking-wide">
            Anda setuju untuk memberikan Informasi Pribadi kepada Kami, dan Kami dapat menggunakan
            informasi tersebut untuk tujuan berikut, serta tujuan lain yang diizinkan oleh
            peraturan perundang-undangan yang berlaku:
          </p>
          <ul className='list-disc ml-6 text-gray-600 space-y-2 mb-4 leading-relaxed'>
            <li>Identifikasi dan pendaftaran sebagai Pengguna serta administrasi akun.</li>
            <li>Verifikasi informasi, termasuk proses Mengenal Pelanggan (Know Your Customer).</li>
            <li>Fasilitasi penggunaan layanan, produk, dan akses ke Platform.</li>
            <li>Pengolahan pesanan dan pembayaran melalui Platform.</li>
            <li>Penyampaian informasi pengiriman produk dan dukungan konsumen.</li>
            <li>Verifikasi dan transaksi keuangan.</li>
            <li>Pemberitahuan pembaruan pada Platform atau layanan.</li>
            <li>Penelitian tentang demografi dan perilaku Pengguna.</li>
            <li>Pemeliharaan dan pengembangan Platform.</li>
            <li>Penyediaan komunikasi pemasaran dan materi promosi.</li>
            <li>Pengolahan pertanyaan dan saran Pengguna.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'data-sharing',
      title: '4. Tempat Kami Menyimpan Informasi Pribadi Anda',
      content: (
        <>
          <p className='text-gray-600 mb-4 leading-relaxed tracking-wide'>
            Informasi Pribadi dari Anda yang Kami kumpulkan dapat disimpan, ditransfer, atau
            diolah oleh Penyedia Tiket pihak ketiga. Kami akan menggunakan semua upaya yang wajar
            untuk memastikan bahwa semua Penyedia Tiket pihak ketiga tersebut memberikan tingkat
            perlindungan yang sebanding dengan komitmen Kami berdasarkan Kebijakan Privasi ini.
          </p>
          <p className='text-gray-600 mb-4 leading-relaxed tracking-wide'>
            Informasi Pribadi Anda juga dapat disimpan atau diproses di luar negara Anda oleh
            pihak yang bekerja untuk Kami di negara lain, atau oleh Penyedia Tiket pihak ketiga,
            vendor, pemasok, mitra, kontraktor, atau afiliasi Kami. Dalam hal tersebut, Kami akan
            memastikan bahwa Informasi Pribadi tersebut tetap menjadi subjek dari tingkat
            perlindungan yang sebanding dengan apa yang disyaratkan dalam hukum negara Anda (dan,
            dalam hal apapun, sejalan dengan komitmen Kami dalam Kebijakan Privasi ini).
          </p>
        </>
      ),
    },
    {
      id: 'user-rights',
      title: '5. Pengakuan dan Persetujuan',
      content: (
        <>
          <p className='text-gray-600 mb-4 leading-relaxed tracking-wide'>
            Dengan menyetujui Kebijakan Privasi, Anda mengakui bahwa Anda telah membaca dan
            memahami Kebijakan Privasi ini dan menyetujui segala ketentuannya. Secara khusus, Anda
            setuju dan memberikan persetujuan kepada Kami untuk mengumpulkan, menggunakan,
            membagikan, mengungkapkan, menyimpan, mentransfer, dan/atau mengolah Informasi Pribadi
            Anda sesuai dengan Kebijakan Privasi ini.
          </p>
          <p className='text-gray-600 mb-4 leading-relaxed tracking-wide'>
            Dalam keadaan di mana Anda memberikan kepada Kami Informasi Pribadi yang berkaitan
            dengan individu lain (seperti Informasi Pribadi yang berkaitan dengan pasangan Anda,
            anggota keluarga, teman, atau pihak lain), Anda menyatakan dan menjamin bahwa Anda
            telah memperoleh persetujuan dari individu tersebut untuk, dan dengan ini menyetujui
            atas nama individu tersebut untuk, pengumpulan, penggunaan, pengungkapan dan
            pengolahan Informasi Pribadi mereka oleh Kami.
          </p>
          <p className='text-gray-600 mb-4 leading-relaxed tracking-wide'>
            Anda dapat menarik persetujuan Anda untuk setiap atau segala pengumpulan, penggunaan
            atau pengungkapan Informasi Pribadi Anda kapan saja dengan memberikan kepada Kami
            pemberitahuan yang wajar secara tertulis menggunakan rincian kontak yang disebutkan di
            bawah ini. Anda juga dapat menarik persetujuan pengiriman komunikasi dan informasi
            tertentu dari Kami melalui fasilitas &quot;opt-out&quot; atau pilihan &quot;berhenti berlangganan&quot;
            yang tersedia dalam pesan Kami kepada Anda. Tergantung pada keadaan dan sifat
            persetujuan yang Anda tarik, Anda harus memahami dan mengakui bahwa setelah penarikan
            persetujuan tersebut, Anda mungkin tidak lagi dapat menggunakan Platform atau layanan.
            Penarikan persetujuan Anda dapat mengakibatkan penghentian Akun Anda atau hubungan
            kontraktual Anda dengan Kami, dengan semua hak dan kewajiban yang muncul sepenuhnya
            harus dipenuhi. Setelah menerima pemberitahuan untuk menarik persetujuan untuk
            pengumpulan, penggunaan atau pengungkapan Informasi Pribadi Anda, Kami akan
            menginformasikan Anda tentang konsekuensi yang mungkin terjadi dari penarikan tersebut
            sehingga Anda dapat memutuskan apakah Anda tetap ingin menarik persetujuan.
          </p>
        </>
      ),
    },
    {
      id: 'policy-changes',
      title: '6. Platform Pihak Ketiga',
      content: (
        <>
          <p className='text-gray-600 mb-4 leading-relaxed tracking-wide'>
            Platform, situs web, dan Materi Pemasaran dapat berisi tautan ke situs web yang
            dioperasikan oleh pihak ketiga. Kami tidak mengendalikan atau menerima
            pertanggungjawaban atau tanggung jawab untuk situs web ini dan untuk pengumpulan,
            penggunaan, pemeliharaan, berbagi, atau pengungkapan data dan informasi oleh pihak
            ketiga tersebut. Silakan baca syarat dan ketentuan dan kebijakan privasi dari situs
            web pihak ketiga tersebut untuk mengetahui bagaimana mereka mengumpulkan dan
            menggunakan Informasi Pribadi Anda.
          </p>
          <p className='text-gray-600 mb-4 leading-relaxed tracking-wide'>
            Iklan yang terdapat pada Platform dan Materi Pemasaran Kami berfungsi sebagai tautan
            ke situs web pengiklan dan dengan demikian segala informasi yang mereka kumpulkan
            berdasarkan klik Anda pada tautan itu akan dikumpulkan dan digunakan oleh pengiklan
            yang relevan sesuai dengan kebijakan privasi pengiklan tersebut.
          </p>
        </>
      ),
    },
    {
      id: 'contact-us',
      title: '7. Cara Untuk Menghubungi Kami',
      content: (
        <>
          <p className='text-gray-600 mb-4 leading-relaxed tracking-wide'>
            Jika Anda ingin menarik persetujuan Anda dalam penggunaan informasi pribadi, meminta
            akses dan / atau koreksi dari Informasi Pribadi Anda, memiliki pertanyaan, komentar
            atau masalah, atau memerlukan bantuan mengenai hal-hal teknis, jangan ragu untuk
            hubungi Kami di:
          </p>
          <div className="bg-blue-50 p-6 rounded-2xl mt-8 border border-blue-100/50">
            <h4 className='text-[#02255A] font-bold text-lg mb-4'>PT Kolektix Maju Bersama</h4>
            <div className="flex flex-col gap-4 text-gray-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#0B387C] mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <p>Pasar Kita Pintu barat 2 Blok K17/18 Pamulang Barat, Kec. pamulang, kota tanggerang selatan banten 15417</p>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#0B387C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <a href='mailto:teman@kolektix.com' className='hover:text-[#0B387C] font-medium transition-colors'>teman@kolektix.com</a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#0B387C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <a href='tel:+628119990445' className='hover:text-[#0B387C] font-medium transition-colors'>+62 811 9990 445</a>
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
        // Mobile: scroll terjadi di window
        const scrollY = window.scrollY;
        const offset = 65 + 72; // tinggi navbar + sticky select bar
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
        // Desktop: scroll terjadi di container
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
        // Mobile: scroll window, offset = navbar + sticky select bar
        const stickyOffset = 65 + 72;
        const elementTop = element.getBoundingClientRect().top + window.scrollY - stickyOffset;
        window.scrollTo({ top: elementTop, behavior: 'smooth' });
      } else {
        // Desktop: scroll container
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
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Syarat & Ketentuan | Kolektix</title>
      </Head>
      <div className="bg-[#02255A] font-sans w-full pt-[72px] flex flex-col">

        {/* Banner Hero Panjang Full Width (Kini menjadi bagian statis di atas) */}
        <div className="bg-gradient-to-r from-[#02255A] via-[#0B387C] to-[#184a96] py-6 px-5 md:py-8 md:px-8 relative overflow-hidden shrink-0 shadow-md z-10">
          {/* Element dekoratif abstrak agar terlihat modern */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl translate-y-1/3"></div>

          <div className="w-full mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 px-0 md:px-12">
            <div>
              <h1 className="text-[28px] md:text-4xl font-extrabold text-white mb-2 tracking-tight">Syarat & Ketentuan</h1>
              <p className="text-blue-100/90 max-w-xl text-[15px] md:text-[16px] font-light leading-relaxed">
                Silakan baca dengan saksama kebijakan dan privasi di bawah ini untuk memahami layanan kami.
              </p>
            </div>
            <div className="text-blue-100/80 text-xs md:text-sm bg-white/10 px-5 py-2 md:px-6 md:py-2.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg shrink-0 self-start md:self-auto">
              Terakhir diperbarui: <span className="text-white font-semibold">21 Mei 2018</span>
            </div>
          </div>
        </div>

        {/* Konten Utama Edge-to-Edge */}
        <div className="flex-1 w-full bg-white flex flex-col md:flex-row border-t-4 border-[#02255A]">

          {/* Navigasi Sidebar - STICKY di mobile agar tetap kelihatan saat konten di-scroll, fixed panel di desktop */}
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

          {/* Area Konten */}
          <main id="main-scroll-container" className="flex-1 w-full relative bg-white">
            <div className="py-6 px-5 md:py-8 md:px-16 lg:px-24">
              <div className="max-w-[800px] mx-auto">
                {sections.map((item, index) => (
                  <div key={item.id} id={item.id} className={`scroll-mt-[40px] ${index !== sections.length - 1 ? 'mb-10' : 'mb-6'}`}>
                    <h2 className='text-2xl md:text-[28px] font-bold text-[#02255A] mb-3 flex flex-col gap-2 relative'>
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
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none;    /* Firefox */
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

