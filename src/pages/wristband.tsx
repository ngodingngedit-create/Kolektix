import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from "@iconify/react/dist/iconify.js";
import Footer from '../components/FooterComponent';
import bg1 from '../assets/images/Foto=1.png';
import bg2 from '../assets/images/Foto=4.png';

type WristbandType = {
    id: string;
    name: string;
    desc: string;
    price: number;
    icon: string;
};

type OrderItem = {
    id: string;
    type: WristbandType;
    size: string;
    qty: number;
    subtotal: number;
};

const wristbandTypes: WristbandType[] = [
    { id: 'silicone', name: 'Silicone', desc: 'Tahan air & lentur', price: 5000, icon: 'material-symbols:water-drop-rounded' },
    { id: 'tyvek', name: 'Tyvek', desc: 'Ringan & sekali pakai', price: 3000, icon: 'material-symbols:article-rounded' },
    { id: 'fabric', name: 'Fabric / Kain', desc: 'Premium & nyaman', price: 7000, icon: 'material-symbols:texture-rounded' },
    { id: 'plastic', name: 'Plastik', desc: 'Ekonomis & praktis', price: 2500, icon: 'material-symbols:category-rounded' },
];

const sizes = ['S', 'M', 'L', 'XL', 'Custom'];

const Wristband = () => {
    const [activeItem, setActiveItem] = useState<string>('tentang-gelang');

    // Order state
    const [selectedType, setSelectedType] = useState<WristbandType>(wristbandTypes[0]);
    const [selectedSize, setSelectedSize] = useState<string>('M');
    const [qty, setQty] = useState<number>(0);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

    const totalQty = orderItems.reduce((s, i) => s + i.qty, 0);
    const totalPrice = orderItems.reduce((s, i) => s + i.subtotal, 0);

    // Auto-close detail drawer when cart becomes empty
    useEffect(() => {
        if (orderItems.length === 0) {
            setShowDetail(false);
        }
    }, [orderItems]);

    const formatRp = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const handleAddOrder = () => {
        const existing = orderItems.find(
            (o) => o.type.id === selectedType.id && o.size === selectedSize
        );
        if (existing) {
            setOrderItems((prev) =>
                prev.map((o) =>
                    o.type.id === selectedType.id && o.size === selectedSize
                        ? { ...o, qty: o.qty + qty, subtotal: (o.qty + qty) * o.type.price }
                        : o
                )
            );
        } else {
            const newItem: OrderItem = {
                id: `${selectedType.id}-${selectedSize}-${Date.now()}`,
                type: selectedType,
                size: selectedSize,
                qty,
                subtotal: qty * selectedType.price,
            };
            setOrderItems((prev) => [...prev, newItem]);
        }
        setQty(0); // reset qty to 0 after adding
        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 1500);
    };

    const handleRemoveItem = (id: string) => {
        setOrderItems((prev) => prev.filter((o) => o.id !== id));
    };

    const handleQtyChange = (id: string, delta: number) => {
        setOrderItems((prev) =>
            prev
                .map((o) =>
                    o.id === id
                        ? { ...o, qty: o.qty + delta, subtotal: (o.qty + delta) * o.type.price }
                        : o
                )
                .filter((o) => o.qty > 0)
        );
    };

    const benefits = [
        { icon: 'material-symbols:integration-instructions-rounded', label: 'Terintegrasi dengan sistem tiket di Kolektix' },
        { icon: 'material-symbols:palette-rounded', label: 'Bebas pilih design' },
        { icon: 'material-symbols:layers-rounded', label: 'Banyak pilihan material' },
        { icon: 'material-symbols:sell-rounded', label: 'Harga terjangkau' },
        { icon: 'material-symbols:local-shipping-rounded', label: 'Pengiriman cepat' },
    ];

    const stats = [
        { icon: 'mdi:partnership-outline', value: '100+', label: 'Event Partner' },
        { icon: 'majesticons:ticket-check-line', value: '100+', label: 'Ticket Handling' },
        { icon: 'cuida:map-pin-outline', value: '30+', label: 'Event Cities' },
    ];

    const sections = [
        {
            id: 'tentang-gelang',
            title: 'Cetak Tiket Gelang di Kolektix',
            content: (
                <div className="space-y-8">
                    <div className="flex flex-col-reverse md:flex-row gap-6 md:gap-10 items-center">
                        <div className="flex-1 space-y-4">
                            <p className="text-[16px] text-slate-600 leading-relaxed tracking-wide">
                                Solusi lengkap untuk para Event Creator dalam pengelolaan tiket event. Mengingat
                                banyaknya hal yang harus diperhatikan selama proses pembuatan event, dengan ini
                                Kolektix menawarkan kemudahan. Mulai dari penjualan hingga pencetakan tiket gelang,
                                semua sudah bisa di Kolektix. Dicetak dengan bahan berkualitas dan tahan lama,
                                tiket gelang dirancang untuk tahan lama sepanjang acara.
                            </p>
                            <div className="grid grid-cols-3 gap-3 pt-2">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="flex flex-col items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 rounded-2xl py-4 px-2 text-center hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-200">
                                        <Icon icon={stat.icon} className="text-[28px] text-[#0B387C]" />
                                        <span className="text-[#02255A] font-extrabold text-lg leading-none">{stat.value}</span>
                                        <span className="text-slate-400 text-[11px] font-medium leading-tight">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-[260px] shrink-0">
                            <div className="relative w-full aspect-[3/3.5] rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200">
                                <img src={bg1.src ?? '#'} alt="Tiket Gelang Kolektix" className="w-full h-full object-cover" />
                                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[11px] font-semibold text-[#02255A]">Berkualitas & Tahan Lama</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'keuntungan',
            title: 'Keuntungan Cetak Tiket Gelang',
            content: (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                        <div className="flex-1">
                            <div className="space-y-3">
                                {benefits.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm transition-all duration-200 group">
                                        <div className="w-9 h-9 rounded-xl bg-[#02255A]/5 group-hover:bg-[#0B387C]/10 flex items-center justify-center shrink-0 transition-colors">
                                            <Icon icon={item.icon} className="text-[20px] text-[#0B387C]" />
                                        </div>
                                        <span className="text-[14.5px] text-slate-700 font-medium leading-snug">{item.label}</span>
                                        <div className="ml-auto shrink-0">
                                            <Icon icon="material-symbols:check-circle-rounded" className="text-[20px] text-emerald-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-[260px] shrink-0 hidden md:block">
                            <div className="relative w-full aspect-[5/4] rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200">
                                <img src={bg2.src ?? '#'} alt="Keuntungan Tiket Gelang" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'order',
            title: 'Order Tiket Gelang',
            content: (
                <div className="space-y-6">
                    {/* Type Selection */}
                    <div>
                        <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Pilih Material</p>
                        <div className="grid grid-cols-2 gap-2">
                            {wristbandTypes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedType(t)}
                                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-150 ${selectedType.id === t.id
                                        ? 'border-[#0B387C] bg-blue-50/60 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedType.id === t.id ? 'bg-[#0B387C]/10' : 'bg-slate-100'}`}>
                                        <Icon icon={t.icon} className={`text-[18px] ${selectedType.id === t.id ? 'text-[#0B387C]' : 'text-slate-400'}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-[12.5px] font-bold leading-tight truncate ${selectedType.id === t.id ? 'text-[#02255A]' : 'text-slate-700'}`}>{t.name}</p>
                                        <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{t.desc}</p>
                                        <p className={`text-[11px] font-semibold mt-0.5 ${selectedType.id === t.id ? 'text-[#0B387C]' : 'text-slate-500'}`}>{formatRp(t.price)}/pcs</p>
                                    </div>
                                    {selectedType.id === t.id && (
                                        <Icon icon="material-symbols:check-circle-rounded" className="text-[16px] text-[#0B387C] shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    {/* <div>
                        <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Pilih Ukuran</p>
                        <div className="flex gap-2 flex-wrap">
                            {sizes.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSelectedSize(s)}
                                    className={`px-5 py-2 rounded-xl text-[13.5px] font-semibold border-2 transition-all duration-150 ${selectedSize === s
                                        ? 'border-[#0B387C] bg-[#0B387C] text-white shadow-sm'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div> */}

                    {/* Quantity */}
                    <div>
                        <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Jumlah Gelang (pcs)</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setQty((q) => Math.max(0, q - 1))}
                                    className="w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-xl font-bold"
                                >−</button>
                                <span className="w-14 text-center text-[15px] font-bold text-[#02255A]">{qty}</span>
                                <button
                                    onClick={() => setQty((q) => q + 1)}
                                    className="w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-xl font-bold"
                                >+</button>
                            </div>
                            <div className="text-slate-500 text-[13.5px]">
                                Subtotal: <span className="font-bold text-[#02255A]">{formatRp(qty * selectedType.price)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleAddOrder}
                        className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-all duration-200 flex items-center justify-center gap-2 ${addedFeedback
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#02255A] hover:bg-[#0B387C] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                    >
                        {addedFeedback ? (
                            <><Icon icon="material-symbols:check-circle-rounded" className="text-[20px]" /> Ditambahkan!</>
                        ) : (
                            <><Icon icon="material-symbols:add-shopping-cart-rounded" className="text-[20px]" /> Tambah ke Pesanan</>
                        )}
                    </button>
                </div>
            ),
        },
        {
            id: 'hubungi-kami',
            title: 'Hubungi Kami',
            content: (
                <div className="space-y-6">
                    <p className="text-[15.5px] text-slate-600 leading-relaxed tracking-wide">
                        Tertarik untuk mencetak tiket gelang bersama Kolektix? Hubungi tim kami dan dapatkan
                        penawaran terbaik untuk event Anda.
                    </p>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#02255A] via-[#0B387C] to-[#1a56b0] p-8 text-white shadow-xl shadow-blue-900/20">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <p className="text-blue-100/80 text-sm font-medium mb-1">Siap bekerja sama?</p>
                                <h3 className="text-white text-xl font-bold leading-snug">
                                    Cetak tiket gelang event Anda<br className="hidden sm:block" /> bersama Kolektix sekarang!
                                </h3>
                            </div>
                            <a
                                href="https://wa.me/628119990445"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 inline-flex items-center gap-2.5 bg-white text-[#02255A] font-bold text-[15px] px-6 py-3 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <Icon icon="bi:whatsapp" className="text-[20px] text-green-600" />
                                Hubungi Kami
                            </a>
                        </div>
                    </div>
                </div>
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
                        if (distance < minDistance) { minDistance = distance; currentActiveId = section.id; }
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
                        if (distance < minDistance) { minDistance = distance; currentActiveId = section.id; }
                    }
                }
            }
            if (currentActiveId !== activeItem) setActiveItem(currentActiveId);
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
                <title>Tiket Gelang | Kolektix</title>
            </Head>
            <div className="bg-[#02255A] font-sans w-full pt-[72px] flex flex-col">

                {/* Hero Banner */}
                {/* <div className="bg-gradient-to-r from-[#02255A] via-[#0B387C] to-[#184a96] py-6 px-5 md:py-8 md:px-8 relative overflow-hidden shrink-0 shadow-md z-10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl translate-y-1/3"></div>
                    <div className="w-full mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 px-0 md:px-12">
                        <div>
                            <h1 className="text-[28px] md:text-4xl font-extrabold text-white mb-2 tracking-tight">Tiket Gelang Kolektix</h1>
                            <p className="text-blue-100/90 max-w-xl text-[15px] md:text-[16px] font-light leading-relaxed">
                                Solusi cetak tiket gelang berkualitas dan terintegrasi untuk event Anda bersama Kolektix.
                            </p>
                        </div>
                        <div className="text-blue-100/80 text-xs md:text-sm bg-white/10 px-5 py-2 md:px-6 md:py-2.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg shrink-0 self-start md:self-auto">
                            Terakhir diperbarui: <span className="text-white font-semibold">21 Mei 2018</span>
                        </div>
                    </div>
                </div> */}

                {/* Main Content */}
                <div className="flex-1 w-full bg-white flex flex-col md:flex-row border-t-4 border-[#02255A]">

                    {/* Sidebar */}
                    <aside className="w-full md:w-1/3 lg:w-[28%] bg-white md:bg-slate-50 sticky top-[65px] md:top-[72px] md:self-start border-b border-slate-200 md:border-b-0 flex-none md:flex-shrink-0 h-auto no-scrollbar z-20 shadow-[0_-8px_0_8px_white,0_2px_6px_rgba(0,0,0,0.06)] md:shadow-none">
                        <div className="py-4 px-5 md:pt-7 md:pb-8 md:px-12">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 md:mb-6">Daftar Isi</h3>
                            <div className="hidden md:block">
                              <ul
                                className="flex flex-col gap-1 relative list-none m-0 p-0 sidebar-nav-scroll"
                                style={{ maxHeight: sections.length > 3 ? 'calc(3 * 40px + 2 * 4px)' : 'none', overflowY: sections.length > 3 ? 'auto' : 'visible' }}
                              >
                                {sections.map((item) => (
                                    <li key={item.id} className="relative z-10">
                                        <button
                                            onClick={() => scrollToSection(item.id)}
                                            className={`w-full text-left py-2 px-4 pl-8 transition-all rounded-xl text-[14px] flex items-center relative overflow-hidden group ${activeItem === item.id ? 'text-[#0B387C] font-bold bg-blue-50/80 shadow-sm ring-1 ring-blue-100' : 'text-slate-500 hover:text-[#0B387C] hover:bg-slate-100/50 font-medium'}`}
                                        >
                                            {activeItem === item.id && <div className="absolute left-3 w-[8px] h-[8px] rounded-full bg-[#0B387C]"></div>}
                                            {item.title}
                                        </button>
                                    </li>
                                ))}
                              </ul>
                            </div>
                            <div className="md:hidden">
                                <select
                                    value={activeItem}
                                    onChange={(e) => scrollToSection(e.target.value)}
                                    className="w-full p-3.5 border-2 border-slate-200 rounded-xl text-slate-700 font-bold bg-white focus:border-[#0B387C] focus:outline-none text-[14px] appearance-none cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23334155'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em 1.2em' }}
                                >
                                    {sections.map((item) => (<option key={item.id} value={item.id}>{item.title}</option>))}
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main id="main-scroll-container" className="flex-1 w-full relative bg-white">
                        {/* Extra bottom padding so content isn't hidden behind sticky bar */}
                        <div className="py-6 px-5 md:py-8 md:px-16 lg:px-24 pb-28">
                            <div className="max-w-[800px] mx-auto">
                                {sections.map((item, index) => (
                                    <div key={item.id} id={item.id} className={`scroll-mt-[40px] ${index !== sections.length - 1 ? 'mb-12' : 'mb-6'}`}>
                                        <h2 className="text-2xl md:text-[28px] font-bold text-[#02255A] mb-4 flex flex-col gap-2 relative">
                                            {item.title}
                                            <div className="w-12 h-[3px] bg-gradient-to-r from-[#0B387C] to-blue-400 rounded-full"></div>
                                        </h2>
                                        <div className="text-[15.5px] leading-loose text-slate-600">{item.content}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── BOTTOM BAR — fixed, above mobile site nav ── */}
                        <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 z-[60] bg-[#e8edf6] border-t border-blue-200/60 shadow-[0_-4px_20px_rgba(2,37,90,0.10)]">
                            <div className="w-full px-6 py-2.5 flex items-center justify-between gap-3">
                                {/* Left: totals */}
                                <div className="min-w-0 leading-tight">
                                    {totalQty > 0 ? (
                                        <>
                                            <p className="text-[11px] text-slate-500 leading-none whitespace-nowrap">{totalQty} Gelang</p>
                                            <p className="text-[15px] md:text-[17px] font-extrabold text-[#02255A] leading-tight mt-0.5 whitespace-nowrap">{formatRp(totalPrice)}</p>
                                        </>
                                    ) : (
                                        <p className="text-[13px] text-slate-400 font-medium">Tambahkan gelang ke pesanan</p>
                                    )}
                                </div>

                                {/* Right: Detail + Beli */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {totalQty > 0 && (
                                        <button
                                            id="detail-btn"
                                            onClick={() => setShowDetail((v) => !v)}
                                            className="flex items-center gap-1 text-[#0B387C] font-semibold text-[13px] hover:text-[#02255A] transition-colors"
                                        >
                                            Detail
                                            <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                                                {orderItems.length}
                                            </span>
                                            <Icon
                                                icon={showDetail ? 'material-symbols:keyboard-arrow-down-rounded' : 'material-symbols:keyboard-arrow-up-rounded'}
                                                className="text-[16px] text-[#0B387C]"
                                            />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (orderItems.length === 0) {
                                                scrollToSection('order');
                                            } else {
                                                alert('Fitur pembelian akan segera hadir!');
                                            }
                                        }}
                                        className="px-4 py-2 md:px-5 md:py-2.5 bg-[#0B387C] hover:bg-[#02255A] text-white text-[13px] md:text-[14px] font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                                    >
                                        Beli Gelang
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── DETAIL DRAWER (slides up from bottom bar) ── */}
                        <div
                            className={`fixed left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-8px_32px_rgba(2,37,90,0.15)] transition-all duration-300 ease-in-out ${showDetail ? 'bottom-[60px] opacity-100' : '-bottom-full opacity-0 pointer-events-none'
                                }`}
                            style={{ maxHeight: '60vh', overflowY: 'auto' }}
                        >
                            <div className="max-w-[800px] mx-auto px-5 md:px-16 pt-4 pb-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[15px] font-bold text-[#02255A]">
                                        Detail Pesanan
                                        {orderItems.length > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-[#0B387C] text-[11px] font-semibold rounded-full">
                                                {orderItems.length} item
                                            </span>
                                        )}
                                    </h3>
                                    <button onClick={() => setShowDetail(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                                        <Icon icon="material-symbols:close-rounded" className="text-[18px] text-slate-500" />
                                    </button>
                                </div>

                                {orderItems.length === 0 ? (
                                    <div className="py-8 flex flex-col items-center gap-2 text-slate-400">
                                        <Icon icon="material-symbols:shopping-cart-off-rounded" className="text-[40px]" />
                                        <p className="text-[13.5px]">Belum ada pesanan ditambahkan</p>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Items list — max 2 visible, scrollable */}
                                        <div style={{ maxHeight: '144px', overflowY: 'auto' }} className="no-scrollbar">
                                            {orderItems.map((o, idx) => (
                                                <div
                                                    key={o.id}
                                                    className={`py-2.5 transition-colors ${idx !== orderItems.length - 1 ? 'border-b border-slate-100' : ''}`}
                                                >
                                                    {/* Top row: icon + name + price + delete */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-[#0B387C]/10 flex items-center justify-center shrink-0">
                                                            <Icon icon={o.type.icon} className="text-[12px] text-[#0B387C]" />
                                                        </div>
                                                        <p className="flex-1 text-[13px] font-semibold text-[#02255A] truncate">{o.type.name}</p>
                                                        <p className="text-[12px] font-bold text-[#02255A] shrink-0 ml-2">{formatRp(o.subtotal)}</p>
                                                        <button
                                                            onClick={() => handleRemoveItem(o.id)}
                                                            className="w-5 h-5 flex items-center justify-center rounded-full opacity-40 hover:opacity-100 hover:bg-red-50 transition-all shrink-0"
                                                        >
                                                            <Icon icon="material-symbols:close-rounded" className="text-[13px] text-red-500" />
                                                        </button>
                                                    </div>
                                                    {/* Bottom row: desc + qty pill */}
                                                    <div className="flex items-center justify-between mt-1.5 pl-8">
                                                        <p className="text-[10.5px] text-slate-400">Ukuran {o.size} · {formatRp(o.type.price)}/pcs</p>
                                                        <div className="flex items-center gap-1 bg-slate-100 rounded-full px-1 py-0.5">
                                                            <button
                                                                onClick={() => handleQtyChange(o.id, -1)}
                                                                className="w-5 h-5 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-[#02255A] font-bold transition-all text-xs leading-none"
                                                            >−</button>
                                                            <span className="w-5 text-center text-[11px] font-extrabold text-[#02255A] select-none">{o.qty}</span>
                                                            <button
                                                                onClick={() => handleQtyChange(o.id, 1)}
                                                                className="w-5 h-5 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-[#02255A] font-bold transition-all text-xs leading-none"
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total row */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                                            <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">Total</span>
                                            <span className="text-[15px] font-extrabold text-[#02255A]">{formatRp(totalPrice)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Backdrop for detail drawer */}
                        {showDetail && (
                            <div
                                className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
                                onClick={() => setShowDetail(false)}
                            />
                        )}
                    </main>
                </div>
                <div className="pb-[120px] md:pb-[54px]">
                  <Footer />
                </div>
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

export default Wristband;
