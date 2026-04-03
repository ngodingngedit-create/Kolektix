import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { notifications } from "@mantine/notifications";
import { Text, LoadingOverlay } from "@mantine/core";
import { Icon } from "@iconify/react/dist/iconify.js";
import useLoggedUser from "@/utils/useLoggedUser";
import fetch from "@/utils/fetch";
import useWindowSize from "@/utils/useWindowSize";
import Countdown, { CountdownRendererFn } from "react-countdown";

export interface VenueBookingOrder {
    id: number;
    slug: string;
    selected_slots: string[];
}

export default function VenueCheckout() {
    const router = useRouter();
    const user = useLoggedUser();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const { width } = useWindowSize();
    
    const [orderData, setOrderData] = useState<VenueBookingOrder | null>(null);
    const [venueDetail, setVenueDetail] = useState<any>(null);
    
    // Mutable Selected Slots State
    const [checkoutSlots, setCheckoutSlots] = useState<{raw: string, dateFull: string, date: string, court: number, time: string, note: string}[]>([]);
    
    // Form States
    const [namaPemesan, setNamaPemesan] = useState("");
    const [emailPemesan, setEmailPemesan] = useState("");
    const [phonePemesan, setPhonePemesan] = useState("");
    
    // Accordions state
    const [collapseDataPemesan, setCollapseDataPemesan] = useState(true);
    
    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // Auto-countdown 15 minutes
    const [countdownTarget] = useState(Date.now() + 15 * 60 * 1000);

    useEffect(() => {
        const orderStr = Cookies.get('venue_order_data');
        if (orderStr) {
            try {
                const parsed = JSON.parse(orderStr);
                setOrderData(parsed);
                
                // Convert raw slots into the mutable checkoutSlots state
                if (parsed.selected_slots) {
                    const mappedSlots = parsed.selected_slots.map((s: string) => {
                        const parts = s.split('-');
                        if (parts.length >= 5) {
                            const dateFull = `${parts[0]}-${parts[1]}-${parts[2]}`;
                            const dateObj = new Date(dateFull);
                            const date = isNaN(dateObj.getTime()) 
                                ? `${parts[2]}-${parts[1]}-${parts[0]}` 
                                : dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                            const court = parseInt(parts[3]);
                            const time = parts[4];
                            return { raw: s, dateFull, date, court, time, note: "" };
                        }
                        return null;
                    }).filter(Boolean);
                    setCheckoutSlots(mappedSlots);
                }
                
                fetchVenueData(parsed.slug);
            } catch (e) {
                router.push('/venue');
            }
        } else {
            router.push('/venue');
        }
    }, [router]);

    const fetchVenueData = async (slug: string) => {
        // --- DUMMY FALLBACK DATA FOR TESTING ---
        const dummyName = slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Nama Venue';
        const isPadel = dummyName.toLowerCase().includes('padel');

        const dummyVenue = {
            id: 999,
            slug: slug,
            name: dummyName,
            starting_price: isPadel ? 30000 : 95000,
            venue_gallery: [
                { image_url: isPadel ? "https://images.unsplash.com/photo-1622396345638-3dc682ae12aa?q=80&w=1200" : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200" }
            ],
            creator: {
                name: "Gelora Bung Karno",
                image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200"
            }
        };

        setVenueDetail(dummyVenue as any); // Display dummy data instantly for UX

        try {
            const res = await fetch<any>({
                url: `venue/${slug}`,
                method: 'GET'
            });
            if (res?.data) {
                setVenueDetail(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setPageLoading(false);
        }
    };
    
    const displayTotalCount = checkoutSlots.length;
    const basePrice = venueDetail?.starting_price ?? 95000;
    const adminFee = displayTotalCount > 0 ? (2000 * displayTotalCount) : 0;
    const subtotal = displayTotalCount * basePrice;
    const grandtotal = subtotal + adminFee; 
    
    const isFormValid = namaPemesan && emailPemesan && phonePemesan && checkoutSlots.length > 0;

    const handleDeleteSlot = (index: number) => {
        setCheckoutSlots(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteAll = () => {
        setCheckoutSlots([]);
    };

    const handleNoteChange = (index: number, text: string) => {
        setCheckoutSlots(prev => {
            const newArr = [...prev];
            newArr[index].note = text;
            return newArr;
        });
    };

    // Called when user clicks Selanjutnya — show confirmation modal first
    const handleSelanjutnya = () => {
        if (!isFormValid) {
            notifications.show({ color: 'red', message: 'Tolong lengkapi data pemesan dan pilih setidaknya 1 jadwal.' });
            return;
        }
        setShowConfirmModal(true);
    };

    const submitForm = async () => {
        setShowConfirmModal(false);
        if (!isFormValid) return;
        
        let start_date = checkoutSlots[0]?.dateFull || new Date().toISOString().split('T')[0];
        let end_date = checkoutSlots[checkoutSlots.length - 1]?.dateFull || start_date;
        
        setLoading(true);
        
        try {
            const compiledNotes = checkoutSlots.map(s => s.note).join(' | ');

            const payload = {
                user_id: user?.id ?? 0,
                event_name: `Booking Lapangan ${venueDetail?.name}`,
                total_qty: displayTotalCount,
                total_price: grandtotal,
                venue_id: venueDetail?.id,
                grandtotal: grandtotal,
                payment_method: 'xendit',
                start_date: start_date,
                end_date: end_date,
                nama_pemesan: namaPemesan,
                email_pemesan: emailPemesan,
                phone_pemesan: phonePemesan,
                notes: compiledNotes
            };
            
            const req = await fetch<any, any>({
                url: 'booking-venue',
                method: 'POST',
                data: payload,
            });
            
            if (req?.xendit_invoice) {
                router.push(req.xendit_invoice);
            } else {
                notifications.show({ position: 'top-right', color: 'green', message: 'Booking Berhasil Diajukan!' });
                setTimeout(() => router.push('/dashboard/venue/booking'), 1500);
            }
        } catch (e: any) {
            notifications.show({
                position: 'top-right',
                color: 'red',
                message: e?.response?.data?.message || 'Gagal membuat pesanan.'
            });
        } finally {
            setLoading(false);
        }
    };

    const renderer: CountdownRendererFn = ({ minutes, seconds }) => {
        return (
            <span className="font-bold tracking-widest text-[13px]">
                {String(minutes).padStart(2, "0")} : {String(seconds).padStart(2, "0")}
            </span>
        );
    };

    if (pageLoading) return <LoadingOverlay visible />;

    return (
        <div className="bg-gray-50 min-h-screen pb-[90px]">
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
            `}</style>

            {/* ── COUNTDOWN BANNER ── */}
            <div className="fixed top-[56px] md:top-[64px] left-0 right-0 z-40 flex items-center justify-center gap-2 bg-[#EA4D3E] text-white px-4 py-2 shadow-sm">
                <Countdown date={countdownTarget} renderer={renderer} />
                <div className="w-px h-4 bg-white/50 mx-1" />
                <p className="text-[12px] font-medium">Segera selesaikan pesananmu</p>
            </div>

            {/* ── PAGE CONTENT ── */}
            <div className="max-w-5xl mx-auto px-4 md:px-6 pt-[96px] md:pt-[112px]">
                <h2 className="text-[20px] md:text-[26px] font-black text-gray-900 tracking-tight mb-4 md:mb-6">Informasi Pemesanan</h2>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

                    {/* ── MOBILE: Kreator + Voucher + Ringkasan (shown first on mobile, right col on desktop) ── */}
                    <div className="w-full lg:order-2 lg:flex-[2] flex flex-col gap-3">

                        {/* Venue Info */}
                        <div className="bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3" style={{ borderColor: 'rgb(219,219,219)' }}>
                            <div className="rounded-xl border overflow-hidden shrink-0" style={{ borderColor: 'rgb(219,219,219)' }}>
                                {venueDetail?.creator?.image_url || venueDetail?.creator?.image ? (
                                    <img src={venueDetail?.creator?.image_url || venueDetail?.creator?.image} alt="Creator" className="w-[48px] h-[48px] object-cover" />
                                ) : venueDetail?.venue_gallery?.[0]?.image_url ? (
                                    <img src={venueDetail?.venue_gallery[0].image_url} alt="Venue" className="w-[48px] h-[48px] object-cover" />
                                ) : (
                                    <div className="w-[48px] h-[48px] bg-gray-100" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-gray-900 leading-tight truncate">{venueDetail?.creator?.name || venueDetail?.has_creator?.name || "Nama Kreator"}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight truncate">{venueDetail?.name || "Nama Venue"}</p>
                            </div>
                        </div>

                        {/* Voucher */}
                        <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-3" style={{ borderColor: 'rgb(219,219,219)' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-[#194e9e]/10 flex items-center justify-center shrink-0">
                                    <Icon icon="mdi:ticket-percent-outline" className="text-[#194e9e] text-[14px]" />
                                </div>
                                <h3 className="font-bold text-[14px] text-gray-900">Voucher</h3>
                            </div>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    className="border bg-gray-50 text-[13px] py-2.5 px-3.5 flex-1 rounded-xl focus:outline-none focus:border-[#194e9e] transition-colors"
                                    style={{ borderColor: 'rgb(219,219,219)' }}
                                    placeholder="Kode Voucher"
                                />
                                <button className="bg-gray-100 text-gray-400 text-[12px] px-4 py-2.5 rounded-xl font-semibold shrink-0 whitespace-nowrap" disabled>Submit</button>
                            </div>
                            <button className="w-full border border-[#194e9e] text-[#194e9e] text-[12px] py-2 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                                + Tambah Voucher
                            </button>
                        </div>

                        {/* Ringkasan Pesanan */}
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'rgb(219,219,219)' }}>
                            <div className="px-4 py-3.5 border-b flex items-center gap-2" style={{ borderColor: 'rgb(219,219,219)' }}>
                                <div className="w-7 h-7 rounded-lg bg-[#194e9e]/10 flex items-center justify-center shrink-0">
                                    <Icon icon="solar:bill-list-bold" className="text-[#194e9e] text-[14px]" />
                                </div>
                                <p className="font-bold text-[14px] text-gray-900">Ringkasan Pesanan</p>
                            </div>

                            <div className={`${checkoutSlots.length > 3 ? 'max-h-[250px] overflow-y-auto custom-scrollbar' : ''}`}>
                                {checkoutSlots.map((slot, idx) => (
                                    <div key={idx} className="border-b last:border-b-0 px-4 py-3 flex gap-3 items-start" style={{ borderColor: 'rgb(219,219,219)' }}>
                                        <div className="w-8 h-8 flex items-center justify-center border rounded-lg bg-gray-50 shrink-0 mt-0.5" style={{ borderColor: 'rgb(219,219,219)' }}>
                                            <Icon icon="mdi:calendar-clock-outline" className="text-[#194e9e] text-[16px]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{slot.date} · Lap. 0{slot.court}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Pukul {slot.time} WIB · Rp {basePrice.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                ))}
                                {checkoutSlots.length === 0 && (
                                    <div className="px-4 py-6 text-center text-[12px] text-gray-400">Belum ada jadwal</div>
                                )}
                            </div>

                            <div className="border-t px-4 py-3 space-y-2" style={{ borderColor: 'rgb(219,219,219)' }}>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Jumlah ({displayTotalCount} Slot)</span>
                                    <span className="font-semibold text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Biaya Admin</span>
                                    <span className="font-semibold text-gray-900">Rp {adminFee.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'rgb(219,219,219)' }}>
                                    <span className="font-bold text-gray-900 text-[14px]">Total</span>
                                    <span className="font-black text-[#194e9e] text-[16px]">Rp {grandtotal.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── MOBILE: Data Pemesan + Jadwal (shown after on mobile, left col on desktop) ── */}
                    <div className="w-full lg:order-1 lg:flex-[3] flex flex-col gap-3">

                        {/* Data Pemesan */}
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'rgb(219,219,219)' }}>
                            <div
                                className="px-4 py-3.5 flex items-center justify-between cursor-pointer select-none"
                                onClick={() => setCollapseDataPemesan(!collapseDataPemesan)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-[#194e9e]/10 flex items-center justify-center shrink-0">
                                        <Icon icon="solar:user-bold" className="text-[#194e9e] text-[14px]" />
                                    </div>
                                    <p className="font-bold text-[14px] text-gray-900">Data Pemesan</p>
                                </div>
                                <FontAwesomeIcon
                                    icon={faChevronUp}
                                    className={`text-gray-400 text-[12px] transition-transform duration-200 ${collapseDataPemesan ? "rotate-0" : "rotate-180"}`}
                                />
                            </div>
                            <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${collapseDataPemesan ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                                <div className="px-4 pb-4 flex flex-col gap-3 border-t pt-4" style={{ borderColor: 'rgb(219,219,219)' }}>
                                    <div>
                                        <label className="text-[12px] font-semibold text-gray-500 block mb-1.5">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            className="block w-full rounded-xl border bg-gray-50 py-2.5 px-3.5 text-[13px] text-gray-900 focus:outline-none focus:border-[#194e9e] focus:bg-white transition-colors"
                                            style={{ borderColor: 'rgb(219,219,219)' }}
                                            placeholder="Nama Lengkap"
                                            value={namaPemesan}
                                            onChange={(e) => setNamaPemesan(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-semibold text-gray-500 block mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            className="block w-full rounded-xl border bg-gray-50 py-2.5 px-3.5 text-[13px] text-gray-900 focus:outline-none focus:border-[#194e9e] focus:bg-white transition-colors"
                                            style={{ borderColor: 'rgb(219,219,219)' }}
                                            placeholder="Contoh: nama@email.com"
                                            value={emailPemesan}
                                            onChange={(e) => setEmailPemesan(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-semibold text-gray-500 block mb-1.5">No Telepon</label>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                className="bg-gray-50 border text-gray-900 text-[13px] rounded-xl block w-[72px] py-2.5 px-2 focus:outline-none focus:border-[#194e9e] shrink-0"
                                                style={{ borderColor: 'rgb(219,219,219)' }}
                                            >
                                                <option value="+62">+62</option>
                                            </select>
                                            <input
                                                type="tel"
                                                className="flex-1 block w-full rounded-xl border bg-gray-50 py-2.5 px-3.5 text-[13px] text-gray-900 focus:outline-none focus:border-[#194e9e] focus:bg-white transition-colors"
                                                style={{ borderColor: 'rgb(219,219,219)' }}
                                                placeholder="81234567890"
                                                value={phonePemesan}
                                                maxLength={13}
                                                onChange={(e) => setPhonePemesan(e.target.value.replace(/\D/g, ''))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Jadwal Dipilih */}
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'rgb(219,219,219)' }}>
                            <div className="px-4 py-3.5 flex items-center justify-between border-b" style={{ borderColor: 'rgb(219,219,219)' }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-[#194e9e]/10 flex items-center justify-center shrink-0">
                                        <Icon icon="solar:calendar-bold" className="text-[#194e9e] text-[14px]" />
                                    </div>
                                    <p className="font-bold text-[14px] text-gray-900">Jadwal Dipilih</p>
                                </div>
                                {checkoutSlots.length > 0 && (
                                    <button className="text-red-500 text-[12px] font-semibold hover:text-red-600 transition-colors" onClick={handleDeleteAll}>
                                        Hapus Semua
                                    </button>
                                )}
                            </div>

                            {checkoutSlots.length > 0 ? (
                                <div className={`${checkoutSlots.length > 4 ? 'max-h-[320px] overflow-y-auto custom-scrollbar' : ''}`}>
                                    {checkoutSlots.map((slot, idx) => (
                                        <div key={idx} className="border-b last:border-b-0 py-3 px-4 flex flex-col gap-2.5" style={{ borderColor: 'rgb(219,219,219)' }}>
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                    <div className="w-9 h-9 flex items-center justify-center border rounded-xl bg-gray-50 shrink-0" style={{ borderColor: 'rgb(219,219,219)' }}>
                                                        <Icon icon="mdi:calendar-clock-outline" className="text-[#194e9e] text-[18px]" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <p className="font-bold text-[13px] text-gray-900 leading-tight">Lap. 0{slot.court} · {slot.date}</p>
                                                        <p className="text-[11px] text-gray-500 leading-tight">Pukul {slot.time} · Rp {basePrice.toLocaleString('id-ID')}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSlot(idx)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 p-1.5 rounded-full shrink-0"
                                                >
                                                    <Icon icon="ic:round-close" className="text-[16px]" />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                className="block w-full rounded-xl border bg-gray-50 py-2 px-3 text-[12px] text-gray-800 focus:outline-none focus:border-[#194e9e] transition-colors"
                                                style={{ borderColor: 'rgb(219,219,219)' }}
                                                placeholder="Catatan tambahan (Opsional)"
                                                value={slot.note}
                                                onChange={(e) => handleNoteChange(idx, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                                    <Icon icon="mdi:calendar-blank-outline" className="text-4xl text-gray-200 mb-2" />
                                    <p className="text-[13px] text-gray-400">Belum ada jadwal yang dipilih.</p>
                                    <button
                                        className="mt-3 text-[#194e9e] text-[12px] font-semibold border border-[#194e9e] px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                        onClick={() => router.push('/venue')}
                                    >
                                        Cari Jadwal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── STICKY BOTTOM CTA ── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 pt-3 pb-5 md:py-4" style={{ borderColor: 'rgb(219,219,219)' }}>
                <div className="max-w-5xl mx-auto flex flex-row items-center justify-between gap-3">
                    {/* Total info */}
                    <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Total Pembayaran</span>
                        <span className="text-[20px] font-black text-[#194e9e] leading-tight">Rp {grandtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {/* Button */}
                    <button
                        disabled={loading}
                        onClick={handleSelanjutnya}
                        className={`shrink-0 h-[38px] px-5 rounded-lg font-bold text-[12px] uppercase tracking-wide text-white transition-all
                            ${!loading
                                ? 'bg-[#194e9e] hover:bg-[#123e80] active:scale-95 shadow-md shadow-[#194e9e]/20'
                                : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        {loading ? <span className="animate-pulse">Memproses...</span> : "Selanjutnya"}
                    </button>
                </div>
            </div>

            {/* ── CONFIRMATION FULL-SCREEN MODAL ── */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${showConfirmModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setShowConfirmModal(false)}
            />
            {/* Modal */}
            <div
                className={`fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-6 transition-all duration-300
                    ${showConfirmModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <div
                    className={`relative w-full md:max-w-md bg-white md:rounded-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out
                        ${showConfirmModal ? 'translate-y-0' : 'translate-y-8'}
                        h-full md:h-auto`}
                    style={{ maxHeight: '100dvh' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b shrink-0" style={{ borderColor: 'rgb(219,219,219)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <Icon icon="solar:shield-warning-bold" className="text-amber-500 text-[18px]" />
                            </div>
                            <h3 className="text-[17px] font-black text-gray-900 tracking-tight">Konfirmasi</h3>
                        </div>
                        {/* X button */}
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
                        >
                            <Icon icon="ic:round-close" className="text-gray-500 text-[18px]" />
                        </button>
                    </div>

                    {/* Scrollable content area */}
                    <div className="px-5 py-5 flex flex-col gap-4 flex-1 overflow-y-auto">
                        <p className="text-[14px] text-gray-600 font-medium">Pastikan data kamu sudah benar yaa!</p>

                        {/* Data summary */}
                        <div className="flex flex-col gap-3">
                            <div>
                                <p className="text-[12px] font-medium mb-0.5" style={{ color: 'rgb(199,199,199)' }}>Nama Lengkap</p>
                                <p className="text-[15px] font-black text-gray-900">{namaPemesan || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[12px] font-medium mb-0.5" style={{ color: 'rgb(199,199,199)' }}>Email</p>
                                <p className="text-[14px] font-black text-gray-900 break-all">{emailPemesan || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[12px] font-medium mb-0.5" style={{ color: 'rgb(199,199,199)' }}>No. Telepon / Handphone</p>
                                <p className="text-[15px] font-black text-gray-900">+62{phonePemesan || '—'}</p>
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="bg-[#f5f7fb] rounded-2xl p-4 flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#194e9e] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-white text-[11px] font-black">1</span>
                                </div>
                                <p className="text-[13px] text-gray-700 leading-relaxed font-medium">
                                    Invoice dan e-Tiket akan dikirim ke alamat email berikut:{' '}
                                    <span className="font-black text-gray-900">{emailPemesan || '—'}</span>
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#194e9e] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-white text-[11px] font-black">2</span>
                                </div>
                                <p className="text-[13px] text-gray-700 leading-relaxed font-medium">
                                    e-Tiket juga akan dikirim melalui whatsapp dengan nomor:{' '}
                                    <span className="font-black text-gray-900">62{phonePemesan || '—'}</span>
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#194e9e] flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-white text-[11px] font-black">3</span>
                                </div>
                                <p className="text-[13px] text-gray-700 leading-relaxed font-medium">
                                    Jika belum menerima notifikasi email setelah melakukan pembayaran hubungi:{' '}
                                    <span className="font-black text-gray-900">+62 813-2498-5355</span>
                                    {' '}<span className="font-black text-gray-900">teman@kolektix.com</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sticky footer buttons — always visible at bottom */}
                    <div className="px-5 py-4 flex gap-3 shrink-0 border-t" style={{ borderColor: 'rgb(219,219,219)' }}>
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1 h-[48px] rounded-xl border-2 border-[#194e9e] text-[#194e9e] font-black text-[14px] hover:bg-blue-50 transition-all"
                        >
                            Edit Data
                        </button>
                        <button
                            onClick={submitForm}
                            disabled={loading}
                            className={`flex-1 h-[48px] rounded-xl font-black text-[14px] text-white transition-all
                                ${!loading ? 'bg-[#194e9e] hover:bg-[#123e80] shadow-lg shadow-[#194e9e]/20' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            {loading ? <span className="animate-pulse">Memproses...</span> : 'Saya Mengerti'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}