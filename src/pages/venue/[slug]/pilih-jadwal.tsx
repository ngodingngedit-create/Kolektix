import React, { useEffect, useMemo, useState } from 'react';
import foto from '../../../assets/images/Banner-amis.png';
import CreatorTitle from '@/components/Creator/CreatorTitle';
import Button from '@/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronLeft, faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { Chip, DateInput } from '@nextui-org/react';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';
import InputField from '@/components/Input';
import { useRouter } from 'next/router';
import fetch from '@/utils/fetch';
import { EventListResponse } from '../../dashboard/my-event/type';
import { useClickOutside, useListState, useSetState } from '@mantine/hooks';
import { ActionIcon, AspectRatio, Box, Button as ButtonM, Card, Flex, Image as ImageM, Modal, NumberFormatter, Stack, Text, UnstyledButton, Tooltip, Popover, Drawer } from '@mantine/core';
import { VenueListResponse } from '../../dashboard/venue/type';
import useLoggedUser from '@/utils/useLoggedUser';
import { Carousel } from '@mantine/carousel';
import Link from 'next/link';
import Chat from '@/components/chat';
import { DateInput as DateInputM, DatePickerInput, DatePicker } from '@mantine/dates';
import moment from 'moment';
import Cookies from 'js-cookie';
import { Icon } from '@iconify/react/dist/iconify.js';
import AuthModal from '@/components/AuthModal';

const facility = ['Free Wifi', 'Toilet', 'Ruangan Full AC', 'Kursi', 'Lighting', 'Stage', 'Parking Area', 'Rest Area', 'Sound System', 'Back Stage'];

export type FacilitiesList = { facility_name: string; facility_description: string };

// --- Generate 7-day date strip relative to base date ---
const generateDateStrip = (baseDate: Date) => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
};

// --- Generate time slots for a court (Google Calendar Style) ---
const generateTimeSlots = (courtNum: number, date: Date) => {
    // Basic variability: use the date to shift the booked slots
    const dayShift = date.getDate() % 3;
    const booked = courtNum === 1
        ? [6, 7, 8, 9, 10, 11, 12, 13].map(h => (h + dayShift) % 24)
        : courtNum === 2
            ? [8, 9, 14, 15].map(h => (h + dayShift) % 24)
            : [10, 11, 12].map(h => (h + dayShift) % 24);

    // Some courts might be "Closed" or "Fully Booked" on certain dates for simulation
    const isFullyBooked = (date.getDay() === 0 && courtNum === 3); // Sunday, Court 3 is closed

    const slots = [];
    for (let h = 0; h < 24; h++) {
        const start = `${String(h).padStart(2, '0')}:00`;
        const end = `${String(h + 1 < 24 ? h + 1 : 0).padStart(2, '0')}:00`;
        const isBooked = isFullyBooked || booked.includes(h);
        const isOffHours = h < 6 || h >= 22;
        slots.push({ start, end, isBooked, isOffHours, price: 95000 + (courtNum - 1) * 20000 });
    }
    return slots;
};

const daysIdShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const monthsIdShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const PilihJadwal = () => {
    const router = useRouter();
    const { slug } = router.query;
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [data, setData] = useState<VenueListResponse>();
    const [facilities, setFacilities] = useState<FacilitiesList[]>();
    const [loading, setLoading] = useListState<string>();
    const user = useLoggedUser();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [openChat, setOpenChat] = useState(false);
    const [modalBooking, setModalBooking] = useState(false);
    const [date, setDate] = useSetState({
        start: '',
        end: ''
    });
    const subNavRef = React.useRef<HTMLDivElement>(null);
    const sectionRefs = {
        info: React.useRef<HTMLDivElement>(null),
        lapangan: React.useRef<HTMLDivElement>(null),
        ulasan: React.useRef<HTMLDivElement>(null),
        lokasi: React.useRef<HTMLDivElement>(null),
    };
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [galleryActiveIdx, setGalleryActiveIdx] = useState(0);
    const [activeSection, setActiveSection] = useState('info');
    const [subNavSticky, setSubNavSticky] = useState(false);
    const [subNavOffsetTop, setSubNavOffsetTop] = useState(0);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([50000, 500000]);
    const [filterSport, setFilterSport] = useState<string[]>([]);
    const calendarRef = React.useRef<HTMLDivElement>(null);
    const filterRef = React.useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Detect mobile on mount and resize
    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    // Court/Schedule state
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const dateStrip = useMemo(() => generateDateStrip(selectedDate), [selectedDate.toDateString()]);
    const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
    // selectedSlots persists across dates/months — key format: "YYYY-MM-DD-courtNum-HH:MM"
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [expandedCourts, setExpandedCourts] = useState<number[]>([1, 2, 3]);
    const carouselApi = React.useRef<any>(null);

    const toggleCourt = (courtNum: number) => {
        setExpandedCourts(prev =>
            prev.includes(courtNum)
                ? prev.filter(c => c !== courtNum)
                : [...prev, courtNum]
        );
    };

    const toggleSlot = (slotKey: string) => {
        setSelectedSlots(prev =>
            prev.includes(slotKey)
                ? prev.filter(s => s !== slotKey)
                : [...prev, slotKey]
        );
    };

    // Group selected slots by date string first, then court number
    // Structure: Record<dateString, Record<courtNum, slotKeys[]>>
    const groupedSlotsByDate = useMemo(() => {
        return selectedSlots.reduce<Record<string, Record<number, string[]>>>((acc, key) => {
            const parts = key.split('-');
            const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`; // YYYY-MM-DD
            const courtNum = parseInt(parts[3]);

            if (!acc[dateStr]) acc[dateStr] = {};
            if (!acc[dateStr][courtNum]) acc[dateStr][courtNum] = [];

            acc[dateStr][courtNum].push(key);
            return acc;
        }, {});
    }, [selectedSlots]);

    const clickOutsideChat = useClickOutside(() => {
        if (Boolean(user?.id) && openChat) {
            setTimeout(() => {
                setOpenChat(false);
            }, 500);
        }
    });

    // Sub-navbar sticky: becomes sticky after scrolling past hero section
    useEffect(() => {
        const updateOffset = () => {
            if (subNavRef.current) {
                setSubNavOffsetTop(subNavRef.current.offsetTop);
            }
        };
        updateOffset();
        window.addEventListener('resize', updateOffset);
        return () => window.removeEventListener('resize', updateOffset);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const mainNavH = 64;
            const triggerOffset = 500; // Only show sticky bar after scrolling past hero
            setSubNavSticky(window.scrollY > triggerOffset);

            // Detect active section
            const sections = [
                { id: 'info', ref: sectionRefs.info },
                { id: 'lapangan', ref: sectionRefs.lapangan },
                { id: 'ulasan', ref: sectionRefs.ulasan },
                { id: 'lokasi', ref: sectionRefs.lokasi },
            ];
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = sections[i].ref.current;
                if (el && el.getBoundingClientRect().top <= 120) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close calendar/filter on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleArrowClick = (direction: 'left' | 'right') => {
        if (direction === 'left') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear((prevYear) => prevYear - 1);
            } else {
                setCurrentMonth((prevMonth) => prevMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear((prevYear) => prevYear + 1);
            } else {
                setCurrentMonth((prevMonth) => prevMonth + 1);
            }
        }
    };

    const eventList = useMemo(() => {
        return data?.has_booked_venue?.filter((e) => e?.start_date.slice(0, 7) == `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
    }, [currentMonth]);

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    useEffect(() => {
        if (Boolean(slug)) getData();
    }, [slug]);

    const getData = async () => {
        setLoading.append('getdata');

        // --- DUMMY FALLBACK DATA (Mirrors AYO.co.id Aesthetics) ---
        const dummyName = (slug as string)?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Nama Venue';
        const isPadel = dummyName.toLowerCase().includes('padel');

        const dummyVenue = {
            id: 999,
            slug: slug as string,
            name: dummyName,
            location: isPadel ? "Jl. KH. Ahmad Dahlan, Purwokerto" : "Jalan Pahlawan No. 45, Senayan, Jakarta",
            location_detail: "Lokasi persis di belakang area utama, area parkir sangat memadai.",
            description: isPadel
                ? "BEST PADEL COURT IN PURWOKERTO #1. Fasilitas premium dengan standar internasional. Dilengkapi dengan area tunggu yang nyaman, loker, dan kamar bilas yang bersih. Cocok untuk bermain bersama teman atau pertandingan kompetitif. Kami menyediakan penyewaan raket dan bola padel berkualitas tinggi. Ayo segera booking jadwalmu dan rasakan pengalaman bermain padel terbaik!"
                : "Gelora Bung Karno Main Stadium adalah venue olahraga ikonik bertaraf internasional yang menawarkan fasilitas premium untuk semua kebutuhan acara Anda. \n\nDilengkapi dengan rumput standar FIFA, sistem pencahayaan modern 3500 lux, dan tribun penonton megah berkapasitas puluhan ribu jiwa, venue ini sangat ideal untuk pertandingan olahraga maupun event berskala besar. Setiap area dirancang dengan cermat untuk memberikan kenyamanan maksimal bagi para atlet dan kepuasan visual bagi penonton.\n\nSelain itu, venue ini terintegrasi dengan akses transportasi umum yang sangat mudah, halte TransJakarta dan stasiun MRT berada tepat di seberang kawasan. Fasilitas pendukung seperti ruang ganti VVIP, ruang konferensi pers, dan area komersial menjadikan stadion ini pilihan utama penyelenggara acara profesional.",
            starting_price: isPadel ? 30000 : 150000,
            max_capacity: 50,
            seat_capacity: 50,
            venue_gallery: [
                { image_url: isPadel ? "https://images.unsplash.com/photo-1622396345638-3dc682ae12aa?q=80&w=1200" : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200" },
                { image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200" },
                { image_url: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1200" }
            ],
            facility: ["Opsi pembayaran DP (Down Payment)", "Reschedule jadwal booking", "Lebih banyak promo & voucher", "Kamar Mandi / Shower", "Parkir Luas"],
            creator: {
                name: "Gelora Bung Karno",
                image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200"
            },
            has_booked_venue: [
                { start_date: "2026-03-29", event_name: "Turnamen Regional", event_banner: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=400" },
            ]
        };

        setData(dummyVenue as any); // Display dummy data instantly for UX

        await fetch<any>({
            url: `venue/${slug}`,
            method: 'GET',
            success: (res) => {
                if (res?.data) {
                    setData(res.data);
                    res['dataFacilities'] && setFacilities(res['dataFacilities'] as FacilitiesList[]);
                }
            },
            complete: () => setLoading.filter((e) => e != 'getdata')
        });
    };

    const handleOrder = () => {
        if (data?.id && selectedSlots.length > 0) {
            Cookies.set('venue_order_data', JSON.stringify({
                id: data?.id,
                slug: data?.slug,
                selected_slots: selectedSlots
            }));
            setLoading.append('submit');
            router.push('/venue-order');
        }
    };

    const galleryImages = [
        data?.venue_gallery?.[0]?.image_url,
        data?.venue_gallery?.[1]?.image_url || data?.venue_gallery?.[0]?.image_url,
        data?.venue_gallery?.[2]?.image_url || data?.venue_gallery?.[0]?.image_url,
        data?.creator?.image_url || data?.venue_gallery?.[0]?.image_url,
    ].filter(Boolean) as string[];

    return (
        <>

            {/* PAGE BODY – Dark Blue Hero like Screenshot */}
            <div className="min-h-screen bg-[#F7F8FA] overflow-x-hidden">
                <div ref={clickOutsideChat} className={`${openChat ? '' : 'hidden'}`}>
                    <Chat toggleOpenTab={() => setOpenChat(!openChat)} openTab={openChat} creatorIdOpen={data?.creator_id} />
                    <AuthModal visible={openChat && !user?.id} onClose={() => setOpenChat(false)} />
                </div>

                {/* ── HERO SECTION: Dark Blue Container ── */}
                <div className="bg-[#194e9e] text-white pt-[60px] md:pt-[70px] pb-5 md:pb-7">
                    <div className="max-w-6xl mx-auto px-3 md:px-0">
                        {/* Header Info: Category + Title */}
                        <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between mb-4 md:mb-6 gap-3">
                            <div className="flex flex-col">
                                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Venue Olahraga</span>
                                <h1 className="text-white text-[20px] md:text-[24px] font-black tracking-tight leading-tight uppercase">
                                    {data?.name || 'Loading Venue...'}
                                </h1>
                            </div>
                        </div>

                        {/* Main Grid: Image (Left) + Details Card (Right) */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
                            {/* LEFT – Photo Collage & Social */}
                            <div className="flex-[2.2] flex flex-col gap-3">
                                <div className="relative group rounded-[24px] overflow-hidden shadow-2xl border border-white/10 bg-white/5 h-[200px] md:h-[320px] shrink-0">
                                    <div className="flex gap-1 h-[200px] md:h-[320px]">
                                        {/* Main large image */}
                                        <div className="relative flex-[1.6] overflow-hidden">
                                            <div className="absolute inset-0">
                                                <ImageM
                                                    src={data?.venue_gallery?.[0]?.image_url || ''}
                                                    h="100%" w="100%" fit="cover"
                                                    className="transition-transform duration-500 hover:scale-105 cursor-pointer"
                                                    onClick={() => { setGalleryActiveIdx(0); setShowGallery(true); }}
                                                />
                                            </div>
                                        </div>
                                        {/* Right 2x2 grid */}
                                        <div className="flex flex-col gap-1 flex-1">
                                            <div className="flex gap-1 flex-1 min-h-0">
                                                <div className="relative flex-1 overflow-hidden">
                                                    <div className="absolute inset-0">
                                                        <ImageM src={data?.venue_gallery?.[1]?.image_url || data?.venue_gallery?.[0]?.image_url || ''} h="100%" w="100%" fit="cover" className="transition-transform duration-500 hover:scale-105 cursor-pointer" onClick={() => { setGalleryActiveIdx(1); setShowGallery(true); }} />
                                                    </div>
                                                </div>
                                                <div className="relative flex-1 overflow-hidden">
                                                    <div className="absolute inset-0">
                                                        <ImageM src={data?.venue_gallery?.[2]?.image_url || data?.venue_gallery?.[0]?.image_url || ''} h="100%" w="100%" fit="cover" className="transition-transform duration-500 hover:scale-105 cursor-pointer" onClick={() => { setGalleryActiveIdx(2); setShowGallery(true); }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 flex-1 min-h-0">
                                                <div className="relative flex-1 overflow-hidden">
                                                    <div className="absolute inset-0">
                                                        <ImageM src={data?.creator?.image_url || data?.venue_gallery?.[0]?.image_url || ''} h="100%" w="100%" fit="cover" className="transition-transform duration-500 hover:scale-105 cursor-pointer" onClick={() => { setGalleryActiveIdx(3); setShowGallery(true); }} />
                                                    </div>
                                                </div>
                                                <div className="relative group/photo flex-1 overflow-hidden">
                                                    <div className="absolute inset-0">
                                                        <ImageM src={data?.venue_gallery?.[3]?.image_url || data?.venue_gallery?.[0]?.image_url || ''} h="100%" w="100%" fit="cover" className="transition-transform duration-500 hover:scale-105 group-hover/photo:brightness-[0.7] cursor-pointer" onClick={() => { setGalleryActiveIdx(0); setShowGallery(true); }} />
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300">
                                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/20">
                                                                <Icon icon="solar:gallery-wide-bold" className="text-white text-[14px]" />
                                                                <span className="text-white text-[11px] font-bold tracking-wide">Lihat Foto</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Floating see all photos button */}
                                    <button
                                        onClick={() => { setGalleryActiveIdx(0); setShowGallery(true); }}
                                        className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-2xl hover:scale-105 transition-all"
                                        style={{ background: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.18)', outline: '1px solid #e2e8f0' }}
                                    >
                                        <Icon icon="solar:gallery-minimalistic-bold" style={{ color: '#194e9e', fontSize: '16px' }} />
                                        <span style={{ color: '#0f172a', fontSize: '12px', fontWeight: 900 }}>Lihat semua {galleryImages.length} foto</span>
                                    </button>
                                </div>

                                {/* Social / Action Buttons */}
                                <div className="flex items-center justify-between mt-1 mb-2 md:mb-0 px-1 md:px-0">
                                    <button className="flex items-center gap-2.5 px-4 py-2.5">
                                        <Icon icon="mdi:instagram" className="text-white text-[18px]" />
                                        <span className="text-white text-[13px] tracking-wide">
                                            {data?.creator?.name ? data.creator.name.toLowerCase().replace(/\s+/g, '') : 'venue_official'}
                                        </span>
                                    </button>

                                    <button className="flex items-center justify-center w-10 h-10">
                                        <Icon icon="solar:share-bold" className="text-white text-[18px]" />
                                    </button>
                                </div>
                            </div>

                            {/* MOBILE HERO DETAILS (Hidden on Desktop) */}
                            <div className="flex flex-col md:hidden mt-2 gap-4 pb-2">
                                <h1 className="text-[18px] font-black text-white leading-tight uppercase tracking-tight">
                                    {data?.name || 'Loading Venue...'}
                                </h1>

                                <div className="flex flex-col gap-3 mt-1">
                                    <div className="flex items-center gap-3">
                                        <Icon icon="solar:wallet-bold-duotone" className="text-white/60 text-[20px] shrink-0" />
                                        <div className="flex items-baseline gap-1.5 flex-1 border-b border-white/10 pb-3">
                                            <span className="text-[14px] font-bold text-white/70 uppercase tracking-wide">Mulai Dari</span>
                                            <span className="text-[16px] font-black text-white pl-1">Rp{(data?.starting_price ?? 95000).toLocaleString('id')}</span>
                                            <span className="text-[12px] font-medium text-white/50">/ sesi</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Icon icon="solar:map-point-bold-duotone" className="text-white/60 text-[20px] shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-[14px] font-medium text-white/90 leading-snug">{data?.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px border-t border-dashed border-white/20 w-full my-2"></div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                                            {data?.creator?.image_url ? (
                                                <ImageM src={data.creator.image_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon icon="solar:user-bold" className="text-white/50 text-[20px]" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-medium text-white/60">Diselenggarakan Oleh</span>
                                            <span className="text-[14px] font-black text-white leading-tight mt-0.5">{data?.creator?.name}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setOpenChat(true)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors">
                                        <Icon icon="solar:chat-round-dots-bold" className="text-white text-[20px]" />
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT – Harga Mulai Dari + Kreator + Buttons */}
                            <div className="hidden md:flex flex-1 shrink-0 flex-col gap-2">
                                <div className="bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col border border-[#d1d1d1] h-full md:h-[320px]" style={{ color: '#0f172a' }}>
                                    {/* HARGA WIDGET */}
                                    <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] px-6 py-4 md:py-5 border-b border-[#d1d1d1] flex-1 flex flex-col justify-center">
                                        <p style={{ color: '#64748b' }} className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">HARGA MULAI DARI</p>
                                        <div className="flex items-baseline gap-1.5">
                                            <span style={{ color: '#0f172a' }} className="text-[24px] md:text-[28px] font-black leading-none tracking-tighter">
                                                Rp{(data?.starting_price ?? 95000).toLocaleString('id')}
                                            </span>
                                            <span style={{ color: '#64748b' }} className="text-[12px] font-bold">/ sesi</span>
                                        </div>
                                    </div>

                                    {/* Creator Section */}
                                    <div className="px-6 py-3.5 flex flex-col gap-2.5 shrink-0" style={{ color: '#0f172a' }}>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>Penyelenggara</span>
                                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl">
                                            <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm bg-gray-200 shrink-0 flex items-center justify-center">
                                                {data?.creator?.image_url ? (
                                                    <img src={data.creator.image_url} alt={data.creator.name || ''} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon icon="solar:user-bold" className="text-gray-400 text-[20px]" />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[13px] font-black tracking-tight truncate" style={{ color: '#0f172a' }}>{data?.creator?.name || 'Kreator'}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5" style={{ color: '#16a34a' }}>
                                                    <Icon icon="solar:verified-check-bold" /> Official
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-5 pt-1 flex flex-col gap-2.5 shrink-0">
                                        <button
                                            onClick={() => setOpenChat(true)}
                                            className="w-full py-3 rounded-xl font-black text-[12px] uppercase tracking-widest text-[#194e9e] bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 transition-all text-center flex items-center justify-center gap-2"
                                        >
                                            {/* <Icon icon="solar:chat-round-dots-bold" className="text-[18px]" /> */}
                                            Chat Host
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="mt-10 md:mt-24 border-b border-white/10">
                            <div className="flex items-center gap-3 md:gap-8 overflow-x-auto scrollbar-hide">
                                {[
                                    { id: 'info', label: 'Deskripsi' },
                                    { id: 'ulasan', label: 'Ulasan' },
                                    { id: 'lokasi', label: 'Lokasi' },
                                    { id: 'faq', label: 'Pertanyaan Umum' },
                                    { id: 'lapangan', label: 'Pilih Jadwal', active: true },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            if (tab.id === 'lapangan') return; // already here
                                            router.push(`/venue/${slug}`);
                                        }}
                                        className={`pb-4 text-[13px] md:text-[14px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap shrink-0 ${tab.active
                                            ? 'text-white'
                                            : 'text-white/40 hover:text-white/70'
                                            }`}
                                    >
                                        {tab.label}
                                        {tab.active && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-lg" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── STICKY SUB-NAVBAR ── */}
                <div
                    ref={subNavRef}
                    className={`fixed top-[64px] left-0 right-0 w-full bg-white z-40 transition-all duration-300 ${subNavSticky ? 'translate-y-0 opacity-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.12)]' : '-translate-y-full opacity-0 pointer-events-none'
                        }`}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                    <div className="max-w-6xl mx-auto px-4 md:px-0">
                        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
                            {[
                                { id: 'info', label: 'Deskripsi' },
                                { id: 'ulasan', label: 'Ulasan' },
                                { id: 'lokasi', label: 'Lokasi' },
                                { id: 'faq', label: 'Pertanyaan Umum' },
                                { id: 'lapangan', label: 'Pilih Jadwal', active: true },
                            ].map((sec) => (
                                <button
                                    key={sec.id}
                                    onClick={() => {
                                        if (sec.id === 'lapangan') {
                                            const ref = sectionRefs[sec.id as keyof typeof sectionRefs];
                                            ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            return;
                                        }
                                        router.push(`/venue/${slug}`);
                                    }}
                                    className={`flex items-center justify-center relative px-5 py-3.5 text-[13px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap shrink-0 ${sec.active
                                        ? 'text-[#194e9e]'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    {sec.label}
                                    {sec.active && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#194e9e] rounded-t-lg" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── MAIN CONTENT – Responsive 2-Column ── */}
                <div className="max-w-6xl w-full mx-auto px-3 md:px-0 py-4 md:py-6 pb-12 lg:pb-16">
                    <div ref={sectionRefs.lapangan} className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
                        {/* LEFT COLUMN: Main Scheduling UI */}
                        <div className="flex-1 w-full bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-[#d1d1d1] relative overflow-hidden">
                            <div className="w-full h-full overflow-y-auto max-h-[85vh] p-4 sm:p-6 lg:py-10 lg:pl-10 lg:pr-6 [&::-webkit-scrollbar]:w-[3px] lg:[&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d1d1d1] hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full pr-1.5 sm:pr-3">
                                <div className="flex flex-col md:flex-row gap-4 mb-6 sm:mb-8">
                                    <div>
                                        <div className="flex items-start sm:items-center justify-between sm:justify-start gap-3 mb-1.5">
                                            <h2 className="text-[20px] sm:text-2xl font-black text-gray-900 tracking-tight leading-tight sm:leading-none">
                                                Pilih Jadwal & Lapangan
                                            </h2>
                                            <div className="px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100 shrink-0 flex items-center justify-center">
                                                <span className="text-[12px] font-black text-[#194e9e] uppercase tracking-widest whitespace-nowrap">
                                                    {monthsIdShort[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[13px] sm:text-sm font-medium text-gray-500 leading-snug">Pilih tanggal dan slot waktu yang tersedia untuk booking.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:flex items-center gap-2">
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-white border-2 border-[#194e9e]"></div><span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tersedia</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f1f5f9 0, #f1f5f9 2px, transparent 2px, transparent 6px)' }}></div><span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Penuh</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#194e9e]"></div><span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pilihanmu</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Strip Layout */}
                                <div className="flex items-start w-full gap-2.5 sm:gap-3">
                                    {/* Scrollable Dates Area */}
                                    <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto flex-1 pb-4 [&::-webkit-scrollbar]:h-[3px] sm:[&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d1d1d1] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                                        {dateStrip.map((d, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedDate(d)}
                                                className={`flex flex-col items-center justify-center min-w-[60px] h-[70px] sm:min-w-[70px] sm:h-[80px] shrink-0 rounded-[14px] sm:rounded-[18px] border-2 transition-all outline-none ${selectedDate.getDate() === d.getDate()
                                                    ? 'border-[#194e9e] bg-[#194e9e] text-white shadow-[0_8px_20px_-6px_rgba(25,78,158,0.4)]'
                                                    : 'border-[#d1d1d1] bg-white text-gray-600 hover:border-[#194e9e] hover:bg-blue-50/20'
                                                    }`}
                                            >
                                                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-0.5 sm:mb-1 ${selectedDate.getDate() === d.getDate() ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {daysIdShort[d.getDay()]}
                                                </span>
                                                <span className="text-[18px] sm:text-[20px] font-black leading-none">{d.getDate()}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Static Divider & Calendar Button Fixed Right */}
                                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 h-[70px] sm:h-[80px]">
                                        <div className="w-[1.5px] h-[40px] sm:h-[50px] bg-[#d1d1d1] shrink-0 rounded-full"></div>

                                        <Popover opened={showCalendar} onChange={setShowCalendar} position="bottom-end" shadow="md" radius="xl">
                                            <Popover.Target>
                                                <button
                                                    onClick={() => setShowCalendar(!showCalendar)}
                                                    className={`min-w-[60px] h-[70px] sm:min-w-[70px] sm:h-[80px] shrink-0 rounded-[14px] sm:rounded-[18px] border-2 transition-all flex flex-col items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] outline-none ${showCalendar ? 'border-[#194e9e] text-[#194e9e]' : 'border-[#d1d1d1] bg-white text-gray-400'}`}
                                                >
                                                    <Icon icon="solar:calendar-bold" className="text-[20px] sm:text-2xl" />
                                                </button>
                                            </Popover.Target>
                                            <Popover.Dropdown p={10}>
                                                <DatePicker
                                                    value={selectedDate}
                                                    onChange={(val) => {
                                                        if (val) setSelectedDate(val);
                                                        setShowCalendar(false);
                                                    }}
                                                    minDate={new Date()}
                                                    locale="id"
                                                />
                                            </Popover.Dropdown>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-[#d1d1d1] my-4 sm:my-5"></div>

                                {/* Courts & Slots Grid */}
                                <div className="flex flex-col gap-6">
                                    {[1, 2, 3].map(courtNum => {
                                        const slots = generateTimeSlots(courtNum, selectedDate);
                                        const activeSlots = slots.filter(s => !s.isOffHours);
                                        const availableSlotsCount = activeSlots.filter(s => !s.isBooked).length;
                                        const isExpanded = expandedCourts.includes(courtNum);
                                        const dateKey = moment(selectedDate).format('YYYY-MM-DD');

                                        return (
                                            <div key={courtNum} className="bg-white rounded-[24px] border border-[#d1d1d1] overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md">
                                                {/* Top Header Card (Accordion Trigger & Info) */}
                                                <div className="flex flex-col sm:flex-row relative">
                                                    {/* Left Image */}
                                                    <div className="w-full sm:w-[320px] h-[180px] sm:h-auto shrink-0 relative bg-gray-100 border-b sm:border-b-0 sm:border-r border-[#d1d1d1]">
                                                        <ImageM
                                                            src={data?.venue_gallery && data.venue_gallery.length >= courtNum
                                                                ? data.venue_gallery[courtNum - 1].image_url
                                                                : (data?.venue_gallery?.[0]?.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc')}
                                                            w="100%" h="100%" fit="cover"
                                                        />
                                                        {/* Optional dark gradient to make it look premium */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40"></div>
                                                    </div>

                                                    {/* Right Content */}
                                                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="text-[22px] font-black text-gray-900 mb-3 tracking-tight">Lapangan 0{courtNum}</h3>
                                                            <div className="flex items-center gap-2 mb-6">
                                                                <span className="px-3.5 py-1.5 border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 bg-white shadow-sm">
                                                                    Premium
                                                                </span>
                                                                <span className="px-3.5 py-1.5 border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 bg-white shadow-sm">
                                                                    Indoor
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Accordion Toggle Button */}
                                                        <button
                                                            onClick={() => toggleCourt(courtNum)}
                                                            className="w-full flex items-center justify-between px-5 py-4 bg-[#194e9e] hover:bg-[#123e80] rounded-xl text-white transition-all active:scale-[0.99] shadow-lg shadow-[#194e9e]/20"
                                                        >
                                                            <span className="text-[14px] font-black tracking-wide">{availableSlotsCount} Jadwal Tersedia</span>
                                                            <Icon icon={isExpanded ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"} className="text-[18px]" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded Slots Area (Jadwal) */}
                                                {isExpanded && (
                                                    <div className="border-t border-[#d1d1d1] p-5 sm:p-6 bg-white">
                                                        {/* Grid Layout to evenly fill container */}
                                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                                            {activeSlots.map((slot, idx) => {
                                                                const slotKey = `${dateKey}-${courtNum}-${slot.start}`;
                                                                const isSelected = selectedSlots.includes(slotKey);
                                                                return (
                                                                    <button
                                                                        key={idx}
                                                                        disabled={slot.isBooked}
                                                                        onClick={() => toggleSlot(slotKey)}
                                                                        className={`flex flex-col p-3 sm:p-5 w-full h-auto rounded-[18px] sm:rounded-[24px] transition-all relative overflow-hidden group ${slot.isBooked
                                                                            ? 'border-0 cursor-not-allowed'
                                                                            : isSelected
                                                                                ? 'bg-blue-50 border border-[#194e9e] ring-1 ring-[#194e9e] shadow-[0_10px_25px_-5px_rgba(25,78,158,0.2)]'
                                                                                : 'bg-white border border-[#d1d1d1] hover:border-[#194e9e] hover:bg-white hover:shadow-md'
                                                                            }`}
                                                                        style={slot.isBooked ? { backgroundImage: 'repeating-linear-gradient(45deg, #f8fafc 0, #f8fafc 4px, #e2e8f0 4px, #e2e8f0 5px)' } : {}}
                                                                    >
                                                                        {slot.isBooked && (
                                                                            <div className="absolute inset-0 bg-white/60 pointer-events-none"></div>
                                                                        )}
                                                                        <div className="flex flex-col items-start w-full gap-2 relative z-10">
                                                                            <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
                                                                                <div className="flex items-center gap-1 sm:gap-1.5">
                                                                                    <Icon icon={parseInt(slot.start.split(':')[0]) < 15 ? "solar:sun-bold" : "solar:moon-bold"} className={`text-[12px] sm:text-[14px] ${slot.isBooked ? 'text-[#9c9c9c]' : isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                                                                                    <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] ${slot.isBooked ? 'text-[#9c9c9c]' : isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                                                                        {parseInt(slot.start.split(':')[0]) < 12 ? 'PAGI' : parseInt(slot.start.split(':')[0]) < 15 ? 'SIANG' : parseInt(slot.start.split(':')[0]) < 18 ? 'SORE' : 'MALAM'}
                                                                                    </span>
                                                                                </div>
                                                                                {isSelected && (
                                                                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#194e9e] shadow-[0_0_0_2px_white] mr-0.5"></div>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex flex-col w-full text-left min-w-0">
                                                                                <span className={`text-[13px] sm:text-[17px] whitespace-nowrap tracking-tighter sm:tracking-tight font-black leading-none mb-1 sm:mb-1.5 ${slot.isBooked ? 'text-[#9c9c9c]' : 'text-gray-900'}`}>
                                                                                    {slot.start.replace(':', '.')} - {slot.end.replace(':', '.')}
                                                                                </span>
                                                                                <div className="flex items-center justify-between w-full">
                                                                                    <span className={`text-[10px] sm:text-[12px] font-bold ${slot.isBooked ? 'text-[#9c9c9c]' : 'text-gray-500'}`}>WIB</span>
                                                                                    <span className={`text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 ${slot.isBooked ? 'bg-transparent text-[#9c9c9c] px-0' : 'bg-gray-100 text-gray-500'}`}>60 MENIT</span>
                                                                                </div>
                                                                            </div>

                                                                            <div className={`w-full mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 flex items-center justify-between ${slot.isBooked ? '' : `border-t ${isSelected ? 'border-blue-200' : 'border-[#d1d1d1]'}`}`}>
                                                                                {slot.isBooked ? (
                                                                                    <div className="flex items-center justify-center w-full py-0.5">
                                                                                        <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.15em] text-[#9c9c9c]">BOOKED</span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="flex flex-col text-left shrink-0">
                                                                                            <span className="text-[13px] sm:text-[15px] font-black tracking-tighter sm:tracking-normal text-[#194e9e] leading-none whitespace-nowrap">Rp{slot.price.toLocaleString('id-ID')}</span>
                                                                                        </div>
                                                                                        <div className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full flex items-center justify-center bg-gray-50`}>
                                                                                            <Icon icon="solar:user-bold" className={`text-[12px] sm:text-[14px] text-gray-400`} />
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div> {/* End Left Column */}

                        {/* RIGHT COLUMN: Sticky Sidebar CTA - Hidden on Mobile, replaced by Detail Drawer */}
                        <div className="hidden lg:flex w-full lg:w-[380px] shrink-0 lg:sticky lg:top-[120px] flex-col gap-4">
                            <div className="bg-white rounded-[24px] p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-[#d1d1d1]">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[14px] font-black tracking-[0.05em] text-[#194e9e] uppercase">LAPANGAN & JADWAL TERPILIH</h3>
                                    {selectedSlots.length > 0 && (
                                        <button
                                            onClick={() => setSelectedSlots([])}
                                            className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all border border-red-100"
                                            title="Hapus Semua"
                                        >
                                            <Icon icon="solar:close-circle-bold" className="text-[18px]" />
                                        </button>
                                    )}
                                </div>

                                {selectedSlots.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                                        <Icon icon="solar:calendar-add-bold-duotone" className="text-[48px] text-gray-200" />
                                        <p className="text-[13px] font-bold text-gray-400">Pilih jadwal untuk memulai</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-[#d1d1d1] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full shadow-inner-top-bottom">
                                        <div className="flex flex-col gap-8">
                                            {Object.keys(groupedSlotsByDate).sort().map((dateStr) => {
                                                const dateObj = new Date(dateStr);
                                                const courtGroups = groupedSlotsByDate[dateStr];

                                                return (
                                                    <div key={dateStr} className="flex flex-col gap-4">
                                                        {/* DATE HEADER */}
                                                        <div className="flex items-center gap-2.5 py-1.5 px-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                                            <Icon icon="solar:calendar-bold" className="text-[14px] text-[#194e9e]" />
                                                            <span className="text-[12px] font-black text-[#194e9e]">
                                                                {daysIdShort[dateObj.getDay()]}, {dateObj.getDate()} {monthsIdShort[dateObj.getMonth()]} {dateObj.getFullYear()}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col gap-5 pl-1">
                                                            {Object.keys(courtGroups).map((courtStr) => {
                                                                const courtNum = parseInt(courtStr);
                                                                const slots = courtGroups[courtNum];
                                                                return (
                                                                    <div key={courtNum} className="flex flex-col gap-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                                                <Icon icon="solar:basketball-bold" className="text-[14px]" />
                                                                            </div>
                                                                            <span className="text-[12px] font-black text-gray-700 uppercase tracking-wide">LAPANGAN 0{courtNum}</span>
                                                                        </div>
                                                                        <div className="flex flex-col gap-2 pl-2">
                                                                            {slots.map(slotKey => {
                                                                                const parts = slotKey.split('-');
                                                                                const time = parts[4]; // parts are YYYY-MM-DD-courtNum-HH:MM
                                                                                const hour = parseInt(time.split(':')[0]);
                                                                                const period = hour < 12 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam';

                                                                                // Calculate end time
                                                                                const eHour = hour + 1;
                                                                                const eTime = `${eHour.toString().padStart(2, '0')}:00`;

                                                                                return (
                                                                                    <div key={slotKey} className="flex items-center justify-between group">
                                                                                        <div className="flex items-center gap-3 ml-2">
                                                                                            <Icon icon="solar:clock-circle-bold" className="text-gray-400 text-[14px]" />
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="text-[13px] font-bold text-gray-900">{time} - {eTime}</span>
                                                                                                <span className="text-[11px] font-medium text-gray-400">({period})</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <button
                                                                                            onClick={() => toggleSlot(slotKey)}
                                                                                            className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 border border-transparent hover:border-red-100 transition-colors"
                                                                                        >
                                                                                            <Icon icon="solar:trash-bin-trash-bold" className="text-[14px]" />
                                                                                        </button>
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-[#d1d1d1] flex flex-col gap-4">
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-[18px] border border-blue-100">
                                        <div className="w-10 h-10 rounded-full bg-[#194e9e] flex items-center justify-center text-white shrink-0">
                                            <Icon icon="solar:shield-check-bold" className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-[#194e9e] uppercase tracking-wider">Garansi Keamanan</p>
                                            <p className="text-[10px] font-bold text-blue-400">Pembayaran aman & instan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> {/* End Right Column */}
                    </div>
                </div>

                <div ref={sectionRefs.lokasi} className="pb-2 bg-[#F7F8FA]"></div>
            </div>{/* end min-h-screen */}
            {/* ── BOTTOM BOOKING BAR – Only Visible when scrolling past hero ── */}
            <div className={`w-full fixed flex items-center justify-between gap-3 sm:gap-4 bottom-0 bg-white z-50 py-3 sm:py-4 px-4 sm:px-6 md:px-12 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] border-t border-[#dbdbdb] transition-all duration-500 ${subNavSticky ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
                }`}>
                {/* Left: price info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                    {selectedSlots.length > 0 ? (
                        <div className="flex flex-col leading-tight min-w-0">
                            <span className="text-[9px] sm:text-[11px] font-extrabold text-[#ABABAB] uppercase tracking-widest mb-0.5 sm:mb-1">Total {selectedSlots.length} Jadwal</span>
                            <span className="text-[13px] sm:text-2xl font-black text-gray-900 leading-none block whitespace-nowrap">
                                Rp{(selectedSlots.length * (data?.starting_price ?? 95000)).toLocaleString('id')}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col leading-tight">
                            <Text fw={800} size="xs" c="dimmed" className="uppercase tracking-widest text-[9px] sm:text-[11px]">Mulai dari</Text>
                            <div className="flex items-baseline gap-1 mt-0.5 sm:mt-1">
                                <span className="text-[16px] xl:text-[20px] font-black text-gray-900 leading-none flex items-center truncate">
                                    {(data?.starting_price ?? 95000) >= 10000000 ? (
                                        <>
                                            Rp{((data?.starting_price ?? 95000) / 1000).toLocaleString('id')}
                                            <span className="ml-[3px] mt-[1px] text-[8px] sm:text-[9px] font-black tracking-widest uppercase bg-green-50 text-green-600 px-[6px] py-[3px] rounded-md border border-green-200/50 shadow-sm leading-none flex items-center gap-1">
                                                <Icon icon="solar:wallet-bold-duotone" className="text-[10px] hidden sm:block" /> MILLION
                                            </span>
                                        </>
                                    ) : (
                                        `Rp${(data?.starting_price ?? 95000).toLocaleString('id')}`
                                    )}
                                </span>
                                <span className="text-[10px] sm:text-[12px] font-bold text-gray-400 self-end">/sesi</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: CTA */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {selectedSlots.length > 0 && (
                        <>
                            <button
                                onClick={() => setShowMobileDetail(true)}
                                className="flex sm:hidden h-[44px] px-4 rounded-[14px] font-bold text-[12px] uppercase tracking-wider text-[#194e9e] bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all items-center justify-center shrink-0"
                            >
                                Detail
                            </button>
                        </>
                    )}
                    <button
                        disabled={selectedSlots.length === 0}
                        onClick={() => {
                            if (selectedSlots.length > 0) handleOrder();
                            else sectionRefs.lapangan.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`h-[44px] sm:h-[48px] px-5 sm:px-8 rounded-[14px] sm:rounded-xl font-black text-[12px] sm:text-[13px] uppercase tracking-widest transition-all shrink-0 ${selectedSlots.length > 0
                            ? 'bg-[#194e9e] text-white shadow-xl shadow-[#194e9e]/30 hover:bg-[#123e80] active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        Booking
                    </button>
                </div>
            </div>

            {/* Mobile Jadwal Detail Bottom Sheet */}
            <Drawer
                opened={showMobileDetail}
                onClose={() => setShowMobileDetail(false)}
                position="bottom"
                size="auto"
                radius="24px 24px 0 0"
                padding="xl"
                title={<Text fw={900} className="text-gray-900 text-[16px] uppercase tracking-wider">Tiket Dipilih</Text>}
                styles={{
                    header: { borderBottom: '1px solid #D1D1D1', marginBottom: '20px', paddingBottom: '15px' },
                    content: { maxHeight: '85vh' }
                }}
            >
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto stylish-scrollbar pr-1">
                        {selectedSlots.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                                <Icon icon="solar:calendar-broken" className="text-5xl text-gray-300" />
                                <p className="text-[13px] font-bold text-gray-400">Belum ada jadwal yang dipilih</p>
                            </div>
                        ) : (
                            Object.keys(groupedSlotsByDate).sort().map((dateStr) => {
                                const dateObj = new Date(dateStr);
                                const courtGroups = groupedSlotsByDate[dateStr];
                                return (
                                    <div key={dateStr} className="flex flex-col gap-4 mb-2">
                                        {/* DATE HEADER */}
                                        <div className="flex items-center gap-2.5 py-1.5 px-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                            <Icon icon="solar:calendar-bold" className="text-[14px] text-[#194e9e]" />
                                            <span className="text-[12px] font-black text-[#194e9e]">
                                                {daysIdShort[dateObj.getDay()]}, {dateObj.getDate()} {monthsIdShort[dateObj.getMonth()]} {dateObj.getFullYear()}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-5 pl-1">
                                            {Object.keys(courtGroups).map((courtStr) => {
                                                const courtNum = parseInt(courtStr);
                                                const slots = courtGroups[courtNum];
                                                return (
                                                    <div key={courtNum} className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#194e9e]">
                                                                <Icon icon="solar:ticket-bold" className="text-[18px]" />
                                                            </div>
                                                            <span className="text-[13px] font-black text-gray-800 uppercase tracking-wide">LAPANGAN 0{courtNum}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSlots(prev => prev.filter(s => !s.includes(`-${courtNum}-`)));
                                                                }}
                                                                className="ml-auto w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-all border border-red-100"
                                                                title="Hapus Semua"
                                                            >
                                                                <Icon icon="solar:close-circle-bold" className="text-[18px]" />
                                                            </button>
                                                        </div>
                                                        <div className={`flex flex-col gap-2 pl-1 pr-1 stylish-scrollbar ${slots.length > 3 ? 'max-h-[220px] overflow-y-auto' : ''}`}>
                                                            {slots.map(slotKey => {
                                                                const parts = slotKey.split('-');
                                                                const time = parts[4];
                                                                const hour = parseInt(time.split(':')[0]);
                                                                const eHour = hour + 1;
                                                                const eTime = `${eHour.toString().padStart(2, '0')}:00`;
                                                                return (
                                                                    <div key={slotKey} className="flex items-center justify-between border-b border-[#D1D1D1] pb-2 last:border-0">
                                                                        <div className="flex items-center gap-3">
                                                                            <Icon icon="solar:clock-circle-bold" className="text-gray-400 text-[16px]" />
                                                                            <span className="text-[14px] font-bold text-gray-600">{time} - {eTime} WIB</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-4">
                                                                            <span className="text-[14px] font-black text-gray-900 line-clamp-1">Rp{(data?.starting_price ?? 95000).toLocaleString('id')}</span>
                                                                            <button
                                                                                onClick={() => toggleSlot(slotKey)}
                                                                                className="text-red-500 hover:text-red-600 transition-colors p-1"
                                                                            >
                                                                                <Icon icon="solar:trash-bin-trash-bold" className="text-[20px]" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <div className="pt-5 border-t border-[#D1D1D1] flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[15px] font-bold text-gray-600">Total ({selectedSlots.length} Jadwal)</span>
                            <span className="text-[18px] font-black text-gray-900 tracking-tight">
                                Rp{(selectedSlots.length * (data?.starting_price ?? 95000)).toLocaleString('id')}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setShowMobileDetail(false);
                                handleOrder();
                            }}
                            className="w-full py-4 rounded-[18px] bg-[#194e9e] text-white font-black text-[14px] uppercase tracking-widest shadow-xl shadow-[#194e9e]/30 active:scale-[0.98] transition-all"
                        >
                            Beli Tiket
                        </button>
                    </div>
                </div>
            </Drawer>

            {/* Booking Modal removed */}

            {/* ── GALLERY LIGHTBOX ── fullscreen overlay, no card border ── */}
            {showGallery && (
                <div className="fixed inset-0 z-[9999] bg-black flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) setShowGallery(false); }}>
                    {/* Counter top center */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-white text-[13px] font-bold bg-black/40 px-3 py-1 rounded-full">
                        {galleryActiveIdx + 1} / {galleryImages.length}
                    </div>
                    {/* Close button top right */}
                    <button
                        onClick={() => setShowGallery(false)}
                        className="absolute top-4 right-5 z-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                        <Icon icon="mdi:close" className="text-[24px]" />
                    </button>
                    {/* Main Image */}
                    <div className="flex-1 flex items-center justify-center relative px-16">
                        <img
                            src={galleryImages[galleryActiveIdx]}
                            alt={`Foto ${galleryActiveIdx + 1}`}
                            className="max-h-full max-w-full object-contain select-none"
                            draggable={false}
                        />
                        {/* Prev button */}
                        <button
                            onClick={() => setGalleryActiveIdx(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                            className="absolute left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-all"
                        >
                            <Icon icon="solar:alt-arrow-left-bold" className="text-[22px]" />
                        </button>
                        {/* Next button */}
                        <button
                            onClick={() => setGalleryActiveIdx(i => (i + 1) % galleryImages.length)}
                            className="absolute right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-all"
                        >
                            <Icon icon="solar:alt-arrow-right-bold" className="text-[22px]" />
                        </button>
                    </div>
                    {/* Thumbnail strip bottom */}
                    <div className="flex items-center justify-center gap-2.5 py-4 bg-black/50">
                        {galleryImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setGalleryActiveIdx(idx)}
                                className={`w-14 h-14 rounded-xl overflow-hidden transition-all ${idx === galleryActiveIdx ? 'ring-2 ring-white opacity-100 scale-105' : 'opacity-40 hover:opacity-70'
                                    }`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── TENTANG VENUE MODAL ── */}
            <Modal
                opened={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={<Text fw={700} className="text-[20px] text-gray-900 tracking-tight">Tentang Venue</Text>}
                centered
                size="600px"
                radius={isMobile ? 0 : 16}
                fullScreen={isMobile}
                withCloseButton
                closeButtonProps={{ iconSize: 24, className: "text-gray-900 hover:bg-gray-100" }}
                styles={{
                    inner: isMobile ? { padding: '0 !important' } : undefined,
                    content: { boxShadow: isMobile ? 'none' : '0 10px 40px -10px rgba(0, 0, 0, 0.2)' },
                    header: { padding: '24px 24px 16px 24px' },
                    title: { width: '100%' },
                    body: { padding: '0px 24px 32px 24px' }
                }}
            >
                <div className={`flex flex-col gap-6 overflow-y-auto stylish-scrollbar pr-2 mt-2 ${isMobile ? 'flex-1 h-full' : 'max-h-[75vh]'}`}>
                    
                    {/* DESKRIPSI */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-3">Deskripsi</h3>
                        <p className="text-[14px] text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                            {data?.description || 'Tidak ada deskripsi tersedia.'}
                        </p>
                    </div>

                    {/* ATURAN VENUE */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-3">Aturan Venue</h3>
                        <ol className="list-decimal pl-4 space-y-2.5 text-[14px] text-gray-700 mt-1">
                            <li>Gunakan sepatu olahraga indoor yang bersih saat di lapangan</li>
                            <li>Jaga kebersihan area lapangan ruang olahraga</li>
                            <li>Harap datang 15 menit sebelum jadwal dimulai</li>
                            <li>Dilarang merokok, membawa minuman keras, atau obat-obatan terlarang</li>
                            <li>Perubahan jadwal maksimal dilakukan 24 jam sebelumnya</li>
                            <li>Lapangan hanya digunakan sesuai dengan aktivitas yang dipesan</li>
                        </ol>
                    </div>

                    {/* FASILITAS VENUE */}
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-3 mt-1">Fasilitas</h3>
                        <div className="flex flex-col gap-3">
                            {data?.facility?.map((f, i) => {
                                const facilityIcons: Record<string, string> = {
                                    'DP': 'solar:card-bold', 'Down Payment': 'solar:card-bold',
                                    'Reschedule': 'solar:calendar-date-bold',
                                    'promo': 'solar:tag-bold', 'voucher': 'solar:tag-bold',
                                    'Kamar Mandi': 'solar:bath-bold', 'Shower': 'solar:bath-bold',
                                    'Parkir': 'solar:parking-bold', 'Wifi': 'solar:wifi-bold',
                                    'AC': 'solar:wind-bold',
                                };
                                const icon = Object.keys(facilityIcons).find(k => f.toLowerCase().includes(k.toLowerCase()));
                                return (
                                    <div key={i} className="flex items-center gap-4 w-full">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-100">
                                            <Icon icon={icon ? facilityIcons[icon] : 'solar:check-circle-bold'} className="text-gray-600 text-[18px]" />
                                        </div>
                                        <span className="text-[14px] font-medium text-gray-700">{f}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default PilihJadwal;