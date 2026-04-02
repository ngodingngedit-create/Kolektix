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

interface VenueBookingOrder {
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

    const submitForm = async () => {
        if (!isFormValid) {
            notifications.show({ color: 'red', message: 'Tolong lengkapi data pemesan dan pilih setidaknya 1 jadwal.' });
            return;
        }
        
        let start_date = checkoutSlots[0]?.dateFull || new Date().toISOString().split('T')[0];
        let end_date = checkoutSlots[checkoutSlots.length - 1]?.dateFull || start_date;
        
        setLoading(true);
        
        try {
            // Incorporating notes from each slot
            const compiledNotes = checkoutSlots.map(s => s.note).join(' | ');

            const payload = {
                user_id: user?.id ?? 0,
                event_name: `Booking Lapangan ${venueDetail?.name}`,
                total_qty: displayTotalCount,
                total_price: grandtotal,
                venue_id: venueDetail?.id,
                grandtotal: grandtotal,
                payment_method: 'xendit', // By default
                start_date: start_date,
                end_date: end_date,
                nama_pemesan: namaPemesan,
                email_pemesan: emailPemesan,
                phone_pemesan: phonePemesan,
                notes: compiledNotes // or whatever the backend expects
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
        <div className="bg-primary-light pb-[100px] min-h-screen">
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 10px;
                }
            `}</style>
            
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 mt-8 gap-x-7 pt-[80px] md:pt-[100px] px-4 md:px-0">
                <h2 className="col-span-5 mb-4 text-2xl font-bold">Informasi Pemesanan</h2>
                
                {/* LEFT COLUMN: Data Pemesan & Jadwal Pilihan */}
                <div className="col-span-3 flex flex-col gap-3">
                    
                    {/* Data Pemesan Card */}
                    <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm mb-2">
                        <div className="px-5 py-4 flex items-center justify-between cursor-pointer" onClick={() => setCollapseDataPemesan(!collapseDataPemesan)}>
                            <p className="font-semibold text-[15px]">Data Pemesan</p>
                            <button className="text-grey">
                                <FontAwesomeIcon icon={faChevronUp} className={`${collapseDataPemesan ? "rotate-0" : "rotate-180"} transition-transform duration-200`} />
                            </button>
                        </div>
                        <div className={`px-5 pt-1 pb-5 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${collapseDataPemesan ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
                            <div className="flex flex-col gap-4 border-t border-primary-light-200 pt-5">
                                <div>
                                    <label className="text-[13px] font-base text-grey block mb-[6px]">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        className="block w-full rounded-lg border border-primary-light-200 bg-white/5 py-2.5 px-3 text-[13px] text-dark focus:outline-none focus:border-primary-200" 
                                        placeholder="Nama Lengkap"
                                        value={namaPemesan}
                                        onChange={(e) => setNamaPemesan(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="text-[13px] font-base text-grey block mb-[6px]">Email</label>
                                    <input 
                                        type="email" 
                                        className="block w-full rounded-lg border border-primary-light-200 bg-white/5 py-2.5 px-3 text-[13px] text-dark focus:outline-none focus:border-primary-200" 
                                        placeholder="Contoh: example@example.com"
                                        value={emailPemesan}
                                        onChange={(e) => setEmailPemesan(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[13px] font-base text-grey block mb-[6px]">No Telepon</label>
                                    <div className="flex gap-2 items-center">
                                        <select className="bg-gray-50 border border-primary-light text-dark text-[13px] rounded-lg block w-[80px] py-2.5 px-2 focus:outline-none focus:border-primary-200 h-full">
                                            <option value="+62">+62</option>
                                        </select>
                                        <input 
                                            type="tel" 
                                            className="flex-1 block w-full rounded-lg border border-primary-light-200 bg-white/5 py-2.5 px-3 text-[13px] text-dark focus:outline-none focus:border-primary-200" 
                                            placeholder="Contoh: 81234567890" 
                                            value={phonePemesan}
                                            maxLength={13}
                                            onChange={(e) => setPhonePemesan(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* JADWAL YANG DIPILIH CARD */}
                    <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm">
                        <div className="border-b border-primary-light-200 px-5 py-4 flex items-center justify-between">
                            <p className="font-semibold text-[15px]">Jadwal yang Dipilih</p>
                            {checkoutSlots.length > 0 && (
                                <button className="text-red-500 text-[12px] font-semibold hover:text-red-600 transition-colors" onClick={handleDeleteAll}>
                                    Hapus Semua
                                </button>
                            )}
                        </div>

                        {checkoutSlots.length > 0 ? (
                            <div className={`${checkoutSlots.length > 4 ? 'max-h-[350px] overflow-y-auto custom-scrollbar' : ''}`}>
                                {checkoutSlots.map((slot, idx) => (
                                    <div key={idx} className="border-b border-primary-light-200 py-4 px-5 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="px-2 py-1 flex items-center justify-center border rounded-md border-primary-light h-[36px] bg-gray-50 shrink-0">
                                                    <Icon icon="mdi:calendar-clock-outline" className="text-[#194e9e] text-[20px]" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="font-semibold text-[13px]">Lapangan 0{slot.court} | {slot.date}</p>
                                                    <p className="text-[12px] text-grey">Sewa 1 Jam (Pukul {slot.time} WIB) x Rp {basePrice.toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteSlot(idx)} 
                                                className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 p-1.5 rounded-full"
                                                title="Hapus Jadwal"
                                            >
                                                <Icon icon="ic:round-close" className="text-[18px]" />
                                            </button>
                                        </div>
                                        <div className="mt-1">
                                            <input 
                                                type="text" 
                                                className="block w-full rounded-md border border-primary-light-200 bg-gray-50 py-2 px-3 text-[12px] text-dark focus:outline-none focus:border-primary-300 transition-colors" 
                                                placeholder="Catatan tambahan (Opsional)"
                                                value={slot.note}
                                                onChange={(e) => handleNoteChange(idx, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 px-5 text-center flex flex-col items-center justify-center text-grey">
                                <Icon icon="mdi:calendar-blank-outline" className="text-4xl text-gray-300 mb-2" />
                                <p className="text-[13px]">Belum ada jadwal yang dipilih.</p>
                                <button className="mt-4 text-[#194e9e] text-[13px] font-medium border border-[#194e9e] px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors" onClick={() => router.push('/venue')}>
                                    Cari Jadwal
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Summary & Vouchers */}
                <div className="col-span-2 flex flex-col gap-4 mt-6 md:mt-0">
                    
                    {/* Event Detail Card */}
                    <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm p-4 flex items-center gap-4">
                        <div className="border rounded-md border-primary-light flex-shrink-0 overflow-hidden">
                            {venueDetail?.creator?.image_url || venueDetail?.creator?.image ? (
                                <img src={venueDetail?.creator?.image_url || venueDetail?.creator?.image} alt="Creator Logo" className="w-[45px] h-[45px] object-cover" />
                            ) : venueDetail?.venue_gallery?.[0]?.image_url ? (
                                <img src={venueDetail?.venue_gallery[0].image_url} alt="Venue Logo Fallback" className="w-[45px] h-[45px] object-cover" />
                            ) : (
                                <div className="w-[45px] h-[45px] bg-gray-200" />
                            )}
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold mb-1 leading-tight">{venueDetail?.creator?.name || venueDetail?.has_creator?.name || "Nama Kreator"}</p>
                            <p className="text-[12px] text-grey">{venueDetail?.name || "Nama Venue"}</p>
                        </div>
                    </div>

                    {/* Voucher Section */}
                    <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:ticket-percent-outline" className="text-[#194E9E] text-[20px]" />
                            <h3 className="font-semibold text-[15px]">Voucher</h3>
                        </div>
                        <div className="flex gap-2 items-center w-full">
                            <input 
                                type="text" 
                                className="border border-primary-light-200 text-sm py-2 px-3 flex-1 rounded-lg focus:outline-none" 
                                placeholder="Masukan Kode Voucher 1" 
                            />
                        </div>
                        <div>
                            <button className="bg-gray-100/80 text-gray-400 text-[12px] px-6 py-1.5 rounded-full font-medium" disabled>Submit</button>
                        </div>
                        <button className="w-full border border-[#194e9e] text-[#194e9e] text-[13px] py-1.5 rounded-full font-semibold mt-1 hover:bg-blue-50 transition-colors">
                            + Tambah Voucher
                        </button>
                    </div>

                    {/* Ringkasan Pesanan Section */}
                    <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm">
                        <div className="border-b border-b-primary-light-200 p-4">
                            <p className="font-semibold text-[15px]">Ringkasan Pesanan</p>
                        </div>

                        <div className={`${checkoutSlots.length > 4 ? 'max-h-[350px] overflow-y-auto custom-scrollbar' : ''}`}>
                            {checkoutSlots.map((slot, idx) => (
                                <div key={idx} className="border-b px-5 py-4 border-primary-light-200 flex gap-4">
                                    <div className="px-3 flex items-center justify-center border rounded-md border-primary-light h-[36px] mt-1 shrink-0 bg-gray-50">
                                        <Icon icon="mdi:calendar-clock-outline" className="text-[#194e9e] text-[22px]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[14px] mb-1 font-semibold">{slot.date} | Lapangan 0{slot.court}</p>
                                        <p className="text-[12px] text-grey">Sewa 1 Jam (Pukul {slot.time} WIB) x Rp {basePrice} = Rp {basePrice.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="py-2.5 px-5 flex justify-between items-center text-[13px] mt-3">
                            <p className="text-dark">Jumlah ({displayTotalCount} Slot)</p>
                            <p className="font-semibold text-dark">Rp {subtotal.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="py-2.5 px-5 flex justify-between items-center text-[13px]">
                            <p className="text-dark">Subtotal</p>
                            <p className="font-semibold text-dark">Rp {subtotal.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="py-2.5 px-5 flex justify-between items-center text-[13px]">
                            <p className="text-dark">Biaya Admin</p>
                            <p className="font-semibold text-dark">Rp {adminFee.toLocaleString('id-ID')}</p>
                        </div>
                        
                        <div className="py-4 px-5 flex justify-between items-center mt-2 border-t border-primary-light">
                            <p className="font-medium text-dark text-[14px]">Total Pembayaran</p>
                            <p className="font-bold text-dark text-[16px]">Rp {grandtotal.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    
                </div>
            </div>

            {/* STICKY BOTTOM BAR */}
            <div className="w-full fixed gap-3 bottom-0 bg-white border-t border-t-primary-light-200 z-50 p-4 px-4 md:px-2 lg:px-0">
                <div className="max-w-5xl mx-auto flex md:flex-row flex-col justify-between md:gap-0 gap-3 items-center">
                    
                    {/* Red Pill Notification / Countdown */}
                    <div className="hidden lg:flex items-center justify-center gap-0 md:gap-3 bg-[#EA4D3E] text-white px-3 py-2 rounded-md">
                        <Countdown date={countdownTarget} renderer={renderer} />
                        <div className="w-[1px] mx-1 md:mx-0 h-4 bg-white/60"></div>
                        <p className="text-xs">Segera selesaikan pesananmu</p>
                    </div>
                    
                    {/* For Mobile Red Pill */}
                    <div className="flex lg:hidden md:hidden justify-center items-center fixed top-16 right-0 left-0 gap-0 md:gap-3 bg-[#EA4D3E] text-white px-3 py-2 z-40 shadow-sm">
                        <Countdown date={countdownTarget} renderer={renderer} />
                        <div className="w-[1px] mx-1 md:mx-0 h-4 bg-white/60"></div>
                        <p className="text-xs">Segera selesaikan pesananmu</p>
                    </div>

                    <button 
                        disabled={!isFormValid || loading}
                        className={`font-semibold text-white px-10 py-[9px] rounded-full text-[14px] transition-all transition-colors w-full md:w-[160px] flex items-center justify-center
                            ${isFormValid && !loading 
                                ? 'bg-[#5981C5] hover:bg-[#466EA8]' 
                                : 'bg-[#5981C5]/70 opacity-70 cursor-not-allowed'}`}
                        onClick={submitForm}
                    >
                        {loading ? <span className="animate-pulse">Loading...</span> : "Selanjutnya"}
                    </button>
                    
                </div>
            </div>
        </div>
    );
}