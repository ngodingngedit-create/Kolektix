import React, { useEffect, useMemo, useState } from 'react';
import foto from '../../assets/images/Banner-amis.png';
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
import { EventListResponse } from '../dashboard/my-event/type';
import { useClickOutside, useListState, useSetState } from '@mantine/hooks';
import { ActionIcon, AspectRatio, Box, Button as ButtonM, Card, Flex, Image as ImageM, Modal, NumberFormatter, Stack, Text, UnstyledButton, Tooltip } from '@mantine/core';
import { VenueListResponse } from '../dashboard/venue/type';
import useLoggedUser from '@/utils/useLoggedUser';
import { Carousel } from '@mantine/carousel';
import Link from 'next/link';
import Chat from '@/components/chat';
import { DateInput as DateInputM, DatePickerInput } from '@mantine/dates';
import moment from 'moment';
import Cookies from 'js-cookie';
import { VenueBookingOrder } from '../venue-order';
import { Icon } from '@iconify/react/dist/iconify.js';
import AuthModal from '@/components/AuthModal';

const facility = ['Free Wifi', 'Toilet', 'Ruangan Full AC', 'Kursi', 'Lighting', 'Stage', 'Parking Area', 'Rest Area', 'Sound System', 'Back Stage'];

export type FacilitiesList = { facility_name: string; facility_description: string };

// --- Generate 7-day date strip starting today ---
const generateDateStrip = () => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
};

// --- Generate time slots for a court (Google Calendar Style) ---
const generateTimeSlots = (courtNum: number) => {
    const booked = courtNum === 1
        ? [6, 7, 8, 9, 10, 11, 12, 13]
        : courtNum === 2
            ? [8, 9, 14, 15]
            : [10, 11, 12];
    const slots = [];
    for (let h = 0; h < 24; h++) {
        const start = `${String(h).padStart(2, '0')}:00`;
        const end = `${String(h + 1 < 24 ? h + 1 : 0).padStart(2, '0')}:00`;
        const isBooked = booked.includes(h);
        const isOffHours = h < 6 || h >= 22;
        slots.push({ start, end, isBooked, isOffHours, price: 95000 + (courtNum - 1) * 20000 });
    }
    return slots;
};

const dateStrip = generateDateStrip();

const daysIdShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const monthsIdShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const VenueDetail = () => {
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
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewInput, setReviewInput] = useState("");
    const [reviewStars, setReviewStars] = useState(0);

    // Court/Schedule state
    const [selectedDate, setSelectedDate] = useState<Date>(dateStrip[0]);
    const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
    // selectedSlots persists across courts — key format: "{courtNum}-{HH:MM}"
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const carouselApi = React.useRef<any>(null);

    const toggleSlot = (slotKey: string) => {
        setSelectedSlots(prev =>
            prev.includes(slotKey)
                ? prev.filter(s => s !== slotKey)
                : [...prev, slotKey]
        );
    };

    // Group selected slots by court number
    const groupedSlots = selectedSlots.reduce<Record<number, string[]>>((acc, key) => {
        const courtNum = parseInt(key.split('-')[0]);
        if (!acc[courtNum]) acc[courtNum] = [];
        acc[courtNum].push(key);
        return acc;
    }, {});

    const clickOutsideChat = useClickOutside(() => {
        if (Boolean(user?.id) && openChat) {
            setTimeout(() => {
                setOpenChat(false);
            }, 500);
        }
    });

    // Detect mobile on mount and resize
    useEffect(() => {
        setMounted(true);
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

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
            description: isPadel ? "BEST PADEL COURT IN PURWOKERTO #1. WE COME. WE PLAY. WE WIN.... NO TIME TO LOSE" : "Venue olahraga premium terbaik di kelasnya. Memiliki fasilitas yang sangat lengkap dengan standarisasi profesional.",
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
        if (data?.id) {
            Cookies.set('venue_order_data', JSON.stringify({
                id: data?.id,
                slug: data?.slug,
                selected_slots: selectedSlots
            } as VenueBookingOrder));
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
            <div className="min-h-screen bg-[#F7F8FA]">
                <div ref={clickOutsideChat} className={`${openChat ? '' : 'hidden'}`}>
                    <Chat toggleOpenTab={() => setOpenChat(!openChat)} openTab={openChat} creatorIdOpen={data?.creator_id} />
                    <AuthModal visible={openChat && !user?.id} onClose={() => setOpenChat(false)} />
                </div>

                {/* ── HERO SECTION: Dark Blue Container ── */}
                <div className="bg-[#194e9e] text-white pt-[80px] md:pt-[100px] pb-8 md:pb-12">
                    <div className="max-w-6xl mx-auto px-3 md:px-0">
                        {/* Header Info: Category + Title + Countdown */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 md:mb-6 gap-3">
                            <div className="flex flex-col">
                                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Venue Olahraga</span>
                                <h1 className="text-white text-lg md:text-3xl font-black tracking-tight leading-tight uppercase">
                                    {data?.name || 'Loading Venue...'}
                                </h1>
                            </div>
                        </div>

                        {/* Main Grid: Image (Left) + Details Card (Right) */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
                            {/* LEFT – Airbnb-style Photo Collage (takes ~60% width) */}
                            <div className="relative group rounded-[24px] overflow-hidden shadow-2xl flex-[2.2] border border-white/10 bg-white/5">
                                <div className="flex gap-1.5 h-[320px] md:h-[420px] p-1.5">
                                    {/* Main large image */}
                                    <div className="relative flex-[1.6] overflow-hidden rounded-l-[20px]">
                                        <ImageM
                                            src={data?.venue_gallery?.[0]?.image_url || ''}
                                            h="100%" w="100%" fit="cover"
                                            className="transition-transform duration-500 hover:scale-105 cursor-pointer"
                                            onClick={() => { setGalleryActiveIdx(0); setShowGallery(true); }}
                                        />
                                    </div>
                                    {/* Right 2x2 grid */}
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <div className="flex gap-1.5 flex-1">
                                            <div className="relative flex-1 overflow-hidden">
                                                <ImageM src={data?.venue_gallery?.[1]?.image_url || data?.venue_gallery?.[0]?.image_url || ''} h="100%" w="100%" fit="cover" className="transition-transform duration-500 hover:scale-105 cursor-pointer" onClick={() => { setGalleryActiveIdx(1); setShowGallery(true); }} />
                                            </div>
                                            <div className="relative flex-1 overflow-hidden rounded-tr-[20px]">
                                                <ImageM src={data?.venue_gallery?.[2]?.image_url || data?.venue_gallery?.[0]?.image_url || ''} h="100%" w="100%" fit="cover" className="transition-transform duration-500 hover:scale-105 cursor-pointer" onClick={() => { setGalleryActiveIdx(2); setShowGallery(true); }} />
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 flex-1">
                                            <div className="relative flex-1 overflow-hidden">
                                                <ImageM src={data?.creator?.image_url || data?.venue_gallery?.[0]?.image_url || ''} h="100%" w="100%" fit="cover" className="transition-transform duration-500 hover:scale-105 cursor-pointer" onClick={() => { setGalleryActiveIdx(3); setShowGallery(true); }} />
                                            </div>
                                            <div className="relative flex-1 overflow-hidden rounded-br-[20px]">
                                                <ImageM src={data?.venue_gallery?.[3]?.image_url || data?.venue_gallery?.[0]?.image_url || ''} h="100%" w="100%" fit="cover" className="transition-transform duration-500 hover:scale-105 brightness-[0.7] cursor-pointer" onClick={() => { setGalleryActiveIdx(0); setShowGallery(true); }} />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div className="w-11 h-11 bg-white/20 backdrop-blur-xl border border-gray-300/50 rounded-full flex items-center justify-center shadow-xl">
                                                            <Icon icon="solar:gallery-wide-bold" className="text-white text-[20px]" />
                                                        </div>
                                                        <span className="text-white text-[10px] font-black tracking-wide">Lihat Foto</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Floating see all photos button */}
                                <button
                                    onClick={() => { setGalleryActiveIdx(0); setShowGallery(true); }}
                                    className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-2xl hover:scale-105 transition-all"
                                    style={{ background: 'white', boxShadow: '0 8px 30px rgba(0,0,0,0.18)', outline: '1px solid #e2e8f0' }}
                                >
                                    <Icon icon="solar:gallery-minimalistic-bold" style={{ color: '#194e9e', fontSize: '16px' }} />
                                    <span style={{ color: '#0f172a', fontSize: '12px', fontWeight: 900 }}>Lihat semua {galleryImages.length} foto</span>
                                </button>
                            </div>

                            {/* RIGHT – Harga Mulai Dari + Kreator + Chat Host — DESKTOP ONLY */}
                            {mounted && !isMobile && (
                                <div className="flex-1 shrink-0 flex flex-col gap-4">
                                    <div className="bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col border border-[#d1d1d1] h-full" style={{ color: '#0f172a' }}>
                                        {/* HARGA WIDGET */}
                                        <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] px-6 py-6 md:py-8 border-b border-[#d1d1d1] flex-1 flex flex-col justify-center">
                                            <p style={{ color: '#64748b' }} className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">HARGA MULAI DARI</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span style={{ color: '#0f172a' }} className="text-[32px] md:text-[36px] font-black leading-none tracking-tighter">
                                                    Rp{(data?.starting_price ?? 95000).toLocaleString('id')}
                                                </span>
                                                <span style={{ color: '#64748b' }} className="text-[14px] font-bold">/ sesi</span>
                                            </div>
                                        </div>

                                        {/* Creator Section */}
                                        <div className="px-6 py-4 md:py-5 flex flex-col gap-2.5 shrink-0" style={{ color: '#0f172a' }}>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>Penyelenggara</span>
                                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                                <div className="w-11 h-11 rounded-xl overflow-hidden shadow-sm bg-gray-200 shrink-0 flex items-center justify-center">
                                                    {data?.creator?.image_url ? (
                                                        <img src={data.creator.image_url} alt={data.creator.name || ''} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Icon icon="solar:user-bold" className="text-gray-400 text-[20px]" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[13px] md:text-[14px] font-black tracking-tight truncate" style={{ color: '#0f172a' }}>{data?.creator?.name || 'Kreator'}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5" style={{ color: '#16a34a' }}>
                                                        <Icon icon="solar:verified-check-bold" /> Official
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6 pt-1 flex flex-col gap-3 shrink-0">
                                            <button
                                                onClick={() => setOpenChat(true)}
                                                className="w-full py-3.5 md:py-4 rounded-xl font-black text-[12px] md:text-[13px] uppercase tracking-widest text-[#194e9e] bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 transition-all text-center flex items-center justify-center gap-2"
                                            >
                                                {/* <Icon icon="solar:chat-round-dots-bold" className="text-[18px]" /> */}
                                                Chat Host
                                            </button>
                                            <button
                                                onClick={() => router.push(`/venue/${slug}/pilih-jadwal`)}
                                                className="w-full py-3.5 md:py-4 rounded-xl font-black text-[12px] md:text-[13px] uppercase tracking-widest bg-[#194e9e] text-white shadow-xl shadow-[#194e9e]/30 hover:bg-[#123e80] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
                                            >
                                                Pilih Jadwal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Tabs (below image/card) */}
                        <div className="mt-10 border-b border-white/10">
                            <div className="flex items-center gap-3 md:gap-8 overflow-x-auto scrollbar-hide">
                                {[
                                    { id: 'info', label: 'Deskripsi' },
                                    { id: 'ulasan', label: 'Ulasan' },
                                    { id: 'lokasi', label: 'Lokasi' },
                                    { id: 'faq', label: 'Pertanyaan Umum' },
                                    { id: 'lapangan', label: 'Lihat Jadwal' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            if (tab.id === 'lapangan') {
                                                router.push(`/venue/${slug}/pilih-jadwal`);
                                                return;
                                            }
                                            const ref = sectionRefs[tab.id as keyof typeof sectionRefs];
                                            ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start', offset: -100 } as any);
                                        }}
                                        className={`pb-4 text-[13px] md:text-[14px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap shrink-0 ${activeSection === tab.id
                                            ? 'text-white'
                                            : 'text-white/40 hover:text-white/70'
                                            }`}
                                    >
                                        {tab.label}
                                        {activeSection === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-lg" />}
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
                                { id: 'lapangan', label: 'Lihat Jadwal' },
                            ].map((sec) => (
                                <button
                                    key={sec.id}
                                    onClick={() => {
                                        if (sec.id === 'lapangan') {
                                            router.push(`/venue/${slug}/pilih-jadwal`);
                                            return;
                                        }
                                        const ref = sectionRefs[sec.id as keyof typeof sectionRefs];
                                        ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className={`flex items-center justify-center relative px-5 py-3.5 text-[13px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap shrink-0 ${activeSection === sec.id
                                        ? 'text-[#194e9e]'
                                        : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    {sec.label}
                                    {activeSection === sec.id && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#194e9e] rounded-t-lg" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── MAIN CONTENT – Full Width ── */}
                <div className="max-w-6xl mx-auto px-3 md:px-0 py-4 md:py-6">
                    <div className="flex flex-col text-dark gap-6">
                        {/* ── FULL WIDTH CONTENT ── */}
                        <div ref={sectionRefs.info} className="w-full flex flex-col gap-0">

                            {/* PROPERTY TITLE CARD */}
                            {/* PROPERTY TITLE CARD - REDESIGNED */}
                            <div className="bg-white rounded-[32px] p-6 md:p-10 mb-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] relative overflow-hidden">
                                <h1 className="font-extrabold text-2xl md:text-3xl text-gray-900 capitalize leading-tight mb-3 tracking-tight">{data?.name}</h1>

                                {/* Rating & Location Row */}
                                <div className="flex flex-col gap-1.5 mb-6">
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => <Icon key={s} icon="solar:star-bold" className="text-yellow-400 text-[16px]" />)}
                                        </div>
                                        <span className="text-[14px] font-black text-gray-800">4.94</span>
                                        <span className="text-[13px] text-gray-400 font-medium">(120+ ulasan)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="solar:map-point-bold-duotone" className="text-primary-base text-[15px]" />
                                        <span className="text-[13px] text-gray-500 font-semibold line-clamp-1">{data?.location}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-8">
                                    <h6 className="text-[13px] font-black text-[#194e9e] uppercase tracking-[0.15em] mb-3">Deskripsi Venue</h6>
                                    <p className="leading-relaxed text-gray-600 font-medium text-[14px] whitespace-pre-line">
                                        {data?.description}
                                    </p>
                                </div>

                                {/* Aturan */}
                                <div className="mb-8">
                                    <h6 className="text-[13px] font-black text-[#194e9e] uppercase tracking-[0.15em] mb-3">Aturan Venue</h6>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-4">
                                        {[
                                            'Dilarang membawa makanan dari luar',
                                            'Menggunakan sepatu olahraga yang sesuai',
                                            'Check-in 15 menit sebelum waktu mulai',
                                            'Menjaga kebersihan area lapangan',
                                            'Dilarang merokok di area olahraga',
                                            'Jaga dan amankan barang bawaan masing-masing',
                                        ].map((rule, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                                                <span className="w-4 h-4 rounded-full border border-[#194e9e]/40 bg-[#194e9e]/5 flex items-center justify-center shrink-0">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#194e9e]/60"></span>
                                                </span>
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Facilities */}
                                <div>
                                    <h6 className="text-[13px] font-black text-[#194e9e] uppercase tracking-[0.15em] mb-3">Fasilitas Venue</h6>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4">
                                        {(data?.facility || []).map((el, idx) => {
                                            const facilityIcons: Record<string, string> = {
                                                'DP': 'solar:card-bold',
                                                'Down Payment': 'solar:card-bold',
                                                'Reschedule': 'solar:calendar-date-bold',
                                                'promo': 'solar:tag-bold',
                                                'voucher': 'solar:tag-bold',
                                                'Kamar Mandi': 'solar:bath-bold',
                                                'Shower': 'solar:bath-bold',
                                                'Parkir': 'solar:parking-bold',
                                                'Wifi': 'solar:wifi-bold',
                                                'AC': 'solar:wind-bold',
                                                'Toilet': 'solar:bath-bold',
                                                'Kantin': 'solar:shop-bold',
                                                'Makan': 'solar:shop-bold',
                                                'Sewa': 'solar:tag-bold',
                                                'Loker': 'solar:safe-square-bold',
                                            };
                                            const icon = Object.keys(facilityIcons).find(k => el.toLowerCase().includes(k.toLowerCase()));
                                            return (
                                                <div key={idx} className="flex items-center gap-2.5 group">
                                                    <Icon icon={icon ? facilityIcons[icon] : 'solar:check-circle-bold'} className="text-[18px] text-gray-500 group-hover:text-[#194e9e] transition-colors shrink-0" />
                                                    <span className="text-[13px] font-medium tracking-tight text-gray-600 leading-tight">{el}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Baca selengkapnya button */}
                                    <button
                                        onClick={() => setShowDetailModal(true)}
                                        className="mt-4 flex items-center gap-1.5 text-primary-base text-[13px] font-semibold hover:underline"
                                    >
                                        Baca selengkapnya
                                        <Icon icon="solar:alt-arrow-right-linear" className="text-[13px]" />
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-black/5 -mx-6 my-2"></div>

                            {/* Pilih Lapangan section dipindah ke page berbeda */}

                            <div ref={sectionRefs.ulasan} className="mt-8 bg-white rounded-[24px] p-6 md:p-8 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.08)] border border-[#e5e7eb]">
                                {/* Section header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#194e9e] text-white text-[14px] font-black shrink-0">
                                            <Icon icon="solar:star-bold" className="text-white text-[16px]" />
                                        </div>
                                        <h3 className="text-[18px] font-black text-gray-900 tracking-tight uppercase">Ulasan Pengunjung</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setShowReviewModal(true)} className="px-4 py-2 bg-[#194e9e] text-white text-[11px] md:text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-[#123e80] shadow-md shadow-[#194e9e]/10 transition-all shrink-0">Tulis Ulasan</button>
                                        <button className="text-[13px] font-semibold text-[#194e9e] hover:underline whitespace-nowrap">Lihat Semua</button>
                                    </div>
                                </div>

                                {/* Horizontal scrollable review cards – no rating bars */}
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {[
                                        { name: "Rizky Pratama", initial: 'R', color: 'bg-red-100 text-red-600', date: "12 Mar 2026", stars: 5, review: "Fasilitas lengkap, AC dingin, dan pencahayaan lapangan oke banget. Recommended!", tag: "Futsal" },
                                        { name: "Ayu Lestari", initial: 'A', color: 'bg-blue-100 text-blue-600', date: "8 Mar 2026", stars: 5, review: "Tempatnya bersih, staffnya ramah, dan booking-nya gampang banget lewat Kolektix. 10/10!", tag: "Padel" },
                                        { name: "Hendra S.", initial: 'H', color: 'bg-green-100 text-green-600', date: "2 Mar 2026", stars: 5, review: "Lapangannya luas dan terawat. Harga terjangkau untuk kualitas sebagus ini. Pasti balik lagi!", tag: "Basket" },
                                        { name: "Dita Rahayu", initial: 'D', color: 'bg-purple-100 text-purple-600', date: "28 Feb 2026", stars: 5, review: "Venue sangat profesional. Sistem booking online-nya mudah dan konfirmasi cepat banget!", tag: "Badminton" },
                                        { name: "Fajar Nugroho", initial: 'F', color: 'bg-yellow-100 text-yellow-700', date: "24 Feb 2026", stars: 4, review: "Overall bagus, harga kompetitif. Parkiran luas dan aman. Cocok untuk latihan rutin!", tag: "Futsal" },
                                        { name: "Sinta Dewi", initial: 'S', color: 'bg-pink-100 text-pink-600', date: "20 Feb 2026", stars: 5, review: "Lapangan terawat, ganti sepatu tersedia, dan kamar mandinya bersih. Sangat rekomended!", tag: "Tenis" },
                                        { name: "Budi Santoso", initial: 'B', color: 'bg-teal-100 text-teal-600', date: "16 Feb 2026", stars: 5, review: "Staff sangat membantu dan fast response. Venue premium dengan harga yang worth it banget.", tag: "Padel" },
                                        { name: "Mega Sari", initial: 'M', color: 'bg-indigo-100 text-indigo-600', date: "12 Feb 2026", stars: 4, review: "Pencahayaan lapangan sempurna, cocok untuk bermain malam hari. Akan kembali lagi!", tag: "Basket" },
                                        { name: "Arif Wibowo", initial: 'A', color: 'bg-orange-100 text-orange-600', date: "9 Feb 2026", stars: 5, review: "Suasana venue enak dan nyaman. Akses transportasi mudah, dekat stasiun MRT juga.", tag: "Futsal" },
                                        { name: "Lia Kusuma", initial: 'L', color: 'bg-cyan-100 text-cyan-600', date: "5 Feb 2026", stars: 5, review: "Booking via Kolektix sangat mudah. Venue selalu bersih dan terawat setiap berkunjung!", tag: "Badminton" },
                                    ].map((rv, i) => (
                                        <div key={i} className="bg-white rounded-[16px] p-4 border min-w-[280px] md:min-w-[320px] flex-shrink-0" style={{ borderColor: 'rgb(209,209,209)' }}>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-9 h-9 rounded-full ${rv.color} flex items-center justify-center font-black text-[13px] shrink-0`}>
                                                        {rv.initial}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <p className="text-[13px] font-bold text-gray-800 truncate">{rv.name}</p>
                                                        <p className="text-[11px] text-gray-400 font-medium">{rv.date}</p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-0.5 bg-blue-50 text-[#194e9e] text-[10px] font-bold rounded-md shrink-0 border border-blue-100">{rv.tag}</span>
                                            </div>
                                            <div className="flex gap-0.5 mb-2">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Icon key={s} icon={s <= rv.stars ? 'solar:star-bold' : 'solar:star-linear'} className={`text-[12px] ${s <= rv.stars ? 'text-yellow-400' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className="text-[13px] text-gray-500 font-medium leading-relaxed line-clamp-3">
                                                {rv.review}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* No separate right sidebar – moved to hero section */}
                    </div>
                </div>{/* end max-w-6xl */}

                {/* ── LOKASI & PEMANDU ARAH SECTION ── */}
                <div className="max-w-6xl mx-auto px-4 md:px-0">
                    <div ref={sectionRefs.lokasi} className="pb-0 pt-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#194e9e] text-white shrink-0">
                                <Icon icon="solar:map-point-bold" className="text-white text-[16px]" />
                            </div>
                            <div>
                                <h6 className="text-[20px] font-black text-gray-900 tracking-tight">Lokasi &amp; Pemandu Arah</h6>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-[#d1d1d1] flex flex-col md:flex-row gap-3">
                            <div className="flex-[2] min-h-[350px] md:min-h-[400px] rounded-[24px] overflow-hidden relative">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.239516341929!2d106.82918257586827!3d-6.232123761033168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e8cbb9e497%3A0xc9b90fc0ac3963bc!2sMenara%20Kadin%20Indonesia%2C%20Jl.%20H.%20R.%20Rasuna%20Said%20Blok%20X-5%20No.Kav.%202-3%2C%20RT.1%2FRW.2%2C%20Kuningan%2C%20Kuningan%20Tim.%2C%20Kecamatan%20Setiabudi%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2012950!5e0!3m2!1sid!2sid!4v1721144578839!5m2!1sid!2sid"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                                    allowFullScreen={false}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>

                            <div className="flex-1 p-5 lg:p-6 flex flex-col gap-3">
                                <div>
                                    <h6 className="text-[14px] font-black text-[#194e9e] mb-2 uppercase tracking-widest">Alamat Lengkap</h6>
                                    <p className="text-[14px] text-gray-700 font-semibold leading-relaxed">
                                        {data?.location && !data.location.startsWith('http') ? data.location : "Jalan Pahlawan No. 45, Senayan, Jakarta"}
                                    </p>
                                    {!!data?.location_detail && <p className="text-[13px] text-gray-500 mt-2 font-medium">{data?.location_detail}</p>}
                                </div>

                                <div className="h-px bg-gray-100 w-full" />

                                <div className="flex-1">
                                    <h6 className="text-[14px] font-black text-gray-900 mb-3 tracking-wide">Transportasi UMKM Terdekat</h6>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { name: "Kereta MRT / KRL / LRT", dist: "350m", type: "Stasiun Terdekat", icon: "solar:tram-bold", color: "text-blue-500", bg: "bg-blue-50" },
                                            { name: "Busway / JakLingko", dist: "450m", type: "Halte Terdekat", icon: "solar:bus-bold", color: "text-green-500", bg: "bg-green-50" },
                                            { name: "Kendaraan Pribadi", dist: "Lihat Rute", type: "Akses Jalan & Tol", icon: "mdi:car", color: "text-orange-500", bg: "bg-orange-50" },
                                        ].map((transport, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-all border border-[#d1d1d1] hover:border-[#999999]">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${transport.bg}`}>
                                                        <Icon icon={transport.icon} className={`text-[24px] ${transport.color}`} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <h6 className="text-[15px] font-black text-gray-900 truncate">{transport.name}</h6>
                                                        <p className="text-[12px] text-gray-500 font-bold mt-0.5">{transport.type} • <span className="text-[#194e9e] font-black">{transport.dist}</span></p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => window.open(`https://google.com/maps/search/${encodeURIComponent((data?.name || '') + ' ' + (data?.location || ''))}`, '_blank')}
                                                    className="shrink-0 whitespace-nowrap flex items-center justify-center gap-2 px-5 py-2.5 text-[#194e9e] bg-[#194e9e]/5 hover:bg-[#194e9e]/15 rounded-[12px] text-[12px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <Icon icon="solar:routing-2-bold" className="text-[18px]" />
                                                    Cek Rute
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── PERTANYAAN UMUM SECTION ── */}
                <div className="max-w-6xl mx-auto px-4 md:px-0">
                    <div className="pb-36 pt-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#194e9e] text-white shrink-0">
                                <Icon icon="solar:chat-square-bold" className="text-white text-[16px]" />
                            </div>
                            <div>
                                <h6 className="text-[20px] font-black text-gray-900 tracking-tight">Pertanyaan Umum</h6>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { q: 'Apakah bisa menyewa raket atau bola di lokasi?', a: 'Ya, kami menyediakan penyewaan alat dengan harga terjangkau di lobby sebelum masuk lapangan.' },
                                { q: 'Bagaimana jika hujan saat jadwal main saya?', a: 'Sebagian besar lapangan kami semi-indoor/indoor, namun jika cuaca memburuk dan lapangan outdoor tidak dapat digunakan, Anda dapat meminta reschedule.' },
                                { q: 'Apakah ada fasilitas kamar mandi & loker?', a: 'Tentu. Tersedia toilet pria & wanita, kamar bilas air hangat, dan loker gratis (harap bawa gembok sendiri).' },
                                { q: 'Bolehkah membawa pelatih balap dari luar?', a: 'Boleh, selama tidak mengganggu pengguna lapangan lain dan wajib menjaga kebersihan venue.' },
                                { q: 'Apakah bisa melakukan reschedule jadwal booking?', a: 'Ya, Anda dapat melakukan reschedule jadwal maksimal 24 jam sebelum waktu booking dimulai. Hubungi host melalui fitur Chat Host atau ajukan permohonan reschedule melalui halaman riwayat booking di akun Anda.' },
                                { q: 'Berapa kali bisa reschedule dalam satu booking?', a: 'Setiap booking dapat direschedule maksimal 1 kali sesuai kebijakan penyelenggara. Pastikan jadwal baru tersedia dan tidak bentrok dengan booking lain sebelum mengajukan perubahan.' }
                            ].map((faq, i) => (
                                <div key={i} className="bg-white p-5 rounded-[24px] border border-[#d1d1d1] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all">
                                    <h6 className="text-[14px] font-black text-gray-900 mb-2 leading-snug tracking-tight">{faq.q}</h6>
                                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>{/* end min-h-screen */}

            {/* ── BOTTOM BOOKING BAR – Always visible ── */}
            <div className="w-full fixed flex items-center justify-between gap-3 bottom-0 bg-white z-50 px-4 py-4 md:px-12 border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                {/* Left: price info */}
                <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mulai dari</span>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-[18px] md:text-[20px] font-black text-gray-900 leading-none flex items-center">
                            {(data?.starting_price ?? 95000) >= 10000000 ? (
                                <>
                                    Rp{((data?.starting_price ?? 95000) / 1000).toLocaleString('id')}
                                    <span className="ml-[3px] mt-[1px] text-[8px] md:text-[9px] font-black tracking-widest uppercase bg-green-50 text-green-600 px-[6px] py-[3px] rounded-md border border-green-200/50 shadow-sm leading-none flex items-center gap-1">
                                        <Icon icon="solar:wallet-bold-duotone" className="text-[10px] hidden md:block" /> MILLION
                                    </span>
                                </>
                            ) : (
                                `Rp${(data?.starting_price ?? 95000).toLocaleString('id')}`
                            )}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400 self-end">/sesi</span>
                    </div>
                </div>
                {/* Right: CTA */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/venue/${slug}/pilih-jadwal`)}
                        className="h-[46px] px-6 md:px-8 rounded-xl font-black text-[12px] md:text-[13px] uppercase tracking-widest bg-[#194e9e] text-white hover:bg-[#123e80] active:scale-95 transition-all shadow-lg shadow-[#194e9e]/20"
                    >
                        Pilih Jadwal
                    </button>
                    <button
                        onClick={() => setOpenChat(true)}
                        className="w-[46px] h-[46px] flex items-center justify-center shrink-0 rounded-xl font-black text-[12px] uppercase tracking-wider text-[#194e9e] border border-[#194e9e]/20 bg-blue-50/50 hover:bg-blue-50 transition-all"
                    >
                        <Icon icon="solar:chat-round-dots-bold" className="text-[20px]" />
                    </button>
                </div>
            </div>

            {/* Booking Modal */}
            <Modal opened={modalBooking} onClose={() => setModalBooking(false)} title="Pilih Tanggal Booking" centered radius="lg">
                <Stack gap={15}>
                    <DatePickerInput
                        type="range"
                        label="Tanggal Sewa"
                        placeholder="Pilih Tanggal Booking Berupa Kalender"
                        value={[date.start ? new Date(date.start) : null, date.end ? new Date(date.end) : null]}
                        onChange={(val) => setDate({
                            start: val[0] ? moment(val[0]).format('YYYY-MM-DD') : '',
                            end: val[1] ? moment(val[1]).format('YYYY-MM-DD') : ''
                        })}
                        minDate={new Date()}
                        valueFormat="DD MMMM YYYY"
                        w="100%"
                        size="md"
                        leftSection={<Icon icon="solar:calendar-bold" className="text-gray-500 text-lg" />}
                    />
                    <ButtonM
                        loading={loading.includes('submit')}
                        disabled={!date.start || !date.end}
                        onClick={handleOrder}
                        color="#194e9e"
                        radius="xl"
                        fullWidth
                        size="lg"
                        className="!font-extrabold"
                    >
                        Booking Sekarang
                    </ButtonM>
                </Stack>
            </Modal>

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
                        <Icon icon="solar:close-bold" className="text-[20px]" />
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

            {/* ── DETAIL & ATURAN MODAL ── */}
            <Modal
                opened={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={<Text fw={900} className="uppercase tracking-[0.1em] text-primary-base">Detail & Aturan Venue</Text>}
                centered
                size="700px"
                radius="24px"
                styles={{
                    content: { overflow: 'hidden' },
                    body: { padding: '24px' }
                }}
            >
                <div className="flex flex-col gap-6">
                    <div>
                        <Text fw={900} className="text-lg text-gray-900 mb-3">Fasilitas Venue</Text>
                        <div className="grid grid-cols-2 gap-3">
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
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Icon icon={icon ? facilityIcons[icon] : 'solar:check-circle-bold'} className="text-primary-base text-lg" />
                                        <Text size="sm" fw={700} className="text-gray-700">{f}</Text>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="h-px bg-black/5"></div>

                    <div>
                        <Text fw={900} className="text-lg text-gray-900 mb-3">Aturan Main</Text>
                        <Stack gap={10}>
                            {[
                                { text: 'Gunakan sepatu olahraga indoor yang bersih', icon: 'solar:running-bold' },
                                { text: 'Dilarang merokok di area lapangan', icon: 'solar:forbidden-circle-bold' },
                                { text: 'Harap datang 15 menit sebelum jadwal dimulai', icon: 'solar:clock-circle-bold' },
                                { text: 'Menjaga kebersihan dan ketertiban area', icon: 'solar:trash-bin-minimalistic-bold' },
                                { text: 'Perubahan jadwal maksimal 24 jam sebelumnya', icon: 'solar:calendar-date-bold' },
                            ].map((rule, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <Icon icon={rule.icon} className="text-orange-400 text-[18px] mt-0.5 shrink-0" />
                                    <Text size="sm" fw={600} className="text-gray-600">{rule.text}</Text>
                                </div>
                            ))}
                        </Stack>
                    </div>

                    <div className="h-px bg-black/5"></div>

                    <div>
                        <Text fw={900} className="text-lg text-gray-900 mb-3">Lokasi Strategis</Text>
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="solar:map-point-bold" className="text-primary-base text-lg" />
                                <Text size="sm" fw={700} className="text-gray-700 line-clamp-1">{data?.location}</Text>
                            </div>
                            <button
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data?.location || '')}`, '_blank')}
                                className="px-4 py-2 bg-white rounded-xl border border-blue-200 text-primary-base text-xs font-black shadow-sm"
                            >
                                GOOGLE MAPS
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* ── TULIS ULASAN MODAL ── */}
            <Modal
                opened={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                title={<Text fw={900} className="uppercase tracking-[0.1em] text-primary-base">Berikan Ulasan</Text>}
                centered
                radius="24px"
                styles={{
                    content: { overflow: 'hidden' },
                    body: { padding: '24px' }
                }}
            >
                <div className="flex flex-col gap-5">
                    <Text size="sm" c="dimmed">Bagaimana pengalaman Anda beraktivitas di venue ini? Penilaian Anda akan sangat membantu.</Text>
                    <div className="flex items-center justify-center gap-2 my-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setReviewStars(star)} className="hover:scale-110 active:scale-90 transition-all">
                                <Icon icon={star <= reviewStars ? "solar:star-bold" : "solar:star-linear"} className={`text-[40px] ${star <= reviewStars ? 'text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </div>
                    <div>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-[14px] outline-none focus:ring-2 focus:ring-[#194e9e]/20 focus:border-[#194e9e] transition-all"
                            rows={4}
                            placeholder="Ceritakan pengalaman Anda di sini (opsional)..."
                            value={reviewInput}
                            onChange={(e) => setReviewInput(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            setShowReviewModal(false);
                            setReviewInput("");
                            setReviewStars(0);
                        }}
                        className="w-full py-3 rounded-xl font-black text-[13px] uppercase tracking-widest bg-[#194e9e] text-white shadow-lg shadow-[#194e9e]/30 hover:bg-[#123e80] active:scale-95 transition-all"
                    >
                        KIrim Ulasan
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default VenueDetail;