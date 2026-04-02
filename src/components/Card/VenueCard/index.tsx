import { Carousel } from '@mantine/carousel';
import { Card, NumberFormatter, Stack, Image, AspectRatio, Box, ActionIcon } from '@mantine/core';
import Link from 'next/link';
import notFoundImage from '../../../assets/images/icon-notfound.png';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';
import useLoggedUser from '@/utils/useLoggedUser';
import { useDidUpdate, useListState } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { BookmarkListResponse, BookmarkRequest } from '@/types/bookmark';
import fetch from '@/utils/fetch';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

interface VenueCardProps {
  id?: number;
  title: string;
  image: string[];
  location: string;
  price: number;
  slug: string;
  bookmark_id?: number;
  category?: string;
}
const VenueCard = ({ id, bookmark_id, slug, title, image, location, price, category }: VenueCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  const [loading, setLoading] = useListState<string>();
  const users = useLoggedUser();
  
  useDidUpdate(() => {
      if (users) {
        const bookmarked = (users?.bookmarked ?? [])?.find(e => e.venue_id == id);
        if (bookmarked != undefined) setBookmark(true);
      }
    }, [users]);

    const toggleBookmark = () => {
        if (!bookmark && !bookmark_id) {
          toggleBookmarkFetch();
          setBookmark(true);
        } else {
          modals.openConfirmModal({
            centered: true,
            title: 'Hapus dari bookmark',
            children: 'Apakah kamu yakin ingin menghapus venue ini dari bookmark?',
            labels: { cancel: 'Batal', confirm: 'Hapus' },
            onConfirm: () => {
              toggleBookmarkFetch(false);
              setBookmark(false);
            }
          })
        }
      }

      const toggleBookmarkFetch = async (status: boolean = true) => {
        if (!status) {
          const bookid = users?.bookmarked?.find(e => e?.venue_id == id)?.id;
          if (!bookid) {
            toast.error('Gagal Menghapus');
            return;
          }
    
          await fetch<any, any>({
            url: 'bookmark/' + (bookmark_id ?? bookid),
            method: 'DELETE',
            before: () => setLoading.append('bookmark'),
            success: () => {
              const data = JSON.parse(Cookies.get('bookmarked') ?? '[]') as BookmarkListResponse[];
              Cookies.set('bookmarked', JSON.stringify(data.filter(e => e.venue_id != id)));
              toast.info('Berhasil menghapus dari bookmark');
            },
            complete: () => setLoading.filter(e => e != 'bookmark'),
            error: () => toast.error('Gagal Menghapus')
          });
          return;
        }
    
        await fetch<BookmarkRequest, BookmarkListResponse>({
          url: 'bookmark-user',
          method: 'POST',
          data: {
            module_id: 5,
            type: 'Venue',
            venue_id: id as number
          },
          before: () => setLoading.append('bookmark'),
          success: ({ data: newData }) => {
            const data = JSON.parse(Cookies.get('bookmarked') ?? '[]') as BookmarkListResponse[];
            Cookies.set('bookmarked', JSON.stringify([...data, newData]));
            toast.info('Berhasil menambahkan ke bookmark')
          },
          complete: () => setLoading.filter(e => e != 'bookmark'),
        });
      }

  // Get short city name for the image overlay
  const shortCity = (location || '').split(',')[1]?.trim() || (location || '').split(',')[0] || 'Unknown';

  // Dynamic facility text based on category
  let fasilitasText = 'Multifungsi & Serbaguna';
  if (category === 'Olahraga') {
    const t = title.toLowerCase();
    if (t.includes('padel')) fasilitasText = 'Papan Padel & Fasilitas';
    else if (t.includes('futsal')) fasilitasText = 'Lapangan Futsal Terbaik';
    else if (t.includes('stadium') || t.includes('gelora')) fasilitasText = 'Stadion Sepak Bola & Atletik';
    else fasilitasText = 'Padel, Futsal, Badminton, dll.';
  } else if (category === 'Convention Hall' || category === 'Hall') {
    fasilitasText = 'Wedding, Concert & Event Serbaguna';
  } else if (category === 'Auditorium') {
    fasilitasText = 'Seminar, Teater & Conference';
  } else if (category === 'Meeting Room') {
    fasilitasText = 'Meeting, Workshop & Gathering';
  }

  // Dynamic icon based on category
  let iconFasilitas = "solar:cup-star-bold-duotone";
  if (category === 'Olahraga') iconFasilitas = "solar:volleyball-bold-duotone";
  else if (category === 'Meeting Room' || category === 'Auditorium') iconFasilitas = "solar:projector-bold-duotone";
  else if (category === 'Convention Hall' || category === 'Hall') iconFasilitas = "solar:buildings-bold-duotone";

  return (
    <div className="group relative flex flex-col bg-white rounded-md md:rounded-[32px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 h-full">
      {/* Invisible link overlay for the whole card */}
      <Link href={`/venue/${slug}`} className="absolute inset-0 z-10" />

      <div className="relative aspect-[4/5] md:aspect-[4/3] w-full overflow-hidden bg-slate-50">
        <Image
          src={image?.[0] || notFoundImage.src}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Top-left category tag (Desktop ONLY - Moved for mobile) */}
        {category && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-primary-base text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-md hidden md:block">
            {category}
          </div>
        )}

        {/* Bottom-left Location tag inside Image (Desktop ONLY) */}
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-full items-center gap-1.5 shadow-xl hidden md:flex">
            <Icon icon="solar:map-point-bold" className="text-white text-[14px]" />
            <span className="mb-[1px]">{shortCity}</span>
        </div>

        {/* Bookmark Button (z-20 so it's clickable above the link overlay) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark();
          }}
          disabled={loading.includes('setbookmark')}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-30 w-[30px] h-[30px] md:w-[38px] md:h-[38px] flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-xl text-gray-400 hover:text-red-500 hover:scale-110 transition-all disabled:opacity-50"
        >
          <Icon icon={bookmark ? "famicons:bookmark" : "famicons:bookmark-outline"} className="text-[16px] md:text-[20px] transition-colors" />
        </button>
      </div>

      <div className="flex flex-col p-2.5 md:p-6 flex-1 relative z-20 pointer-events-none">
        {/* Mobile Category & Rating Row */}
        <div className="flex items-center justify-between gap-1 mb-1 md:hidden">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-md text-[8px] font-extrabold text-primary-base uppercase tracking-tight">
            {category || 'Venue'}
          </div>
          <div className="flex items-center gap-1 text-gray-800">
            <Icon icon="solar:star-fall-bold" className="text-yellow-400 text-[10px]" />
            <span className="text-[9px] font-black">4.8</span>
          </div>
        </div>

        {/* Rating & Title */}
        <div className="mb-1 md:mb-4">
          <div className="hidden md:flex items-center gap-1.5 mb-2.5">
            <Icon icon="solar:star-fall-bold" className="text-yellow-400 text-[14px] drop-shadow-sm" />
            <span className="text-[12px] font-bold text-gray-800 tracking-wide">4.8</span>
            <span className="text-[11px] font-medium text-gray-400 tracking-tight">(120)</span>
          </div>
          <h3 className="font-black text-gray-900 text-[12.5px] md:text-[19px] leading-snug md:leading-tight group-hover:text-primary-base transition-colors line-clamp-2 title-tight">
            {title}
          </h3>
        </div>

        {/* Details Row (HIDDEN ON MOBILE for clean focus) */}
        <div className="hidden md:flex flex-col gap-2.5 mb-6">
            <div className="flex items-center gap-3 text-[13px] font-bold text-gray-500">
                <Icon icon={iconFasilitas} className="text-primary-base/60 text-[20px] shrink-0" />
                <span className="line-clamp-1">{fasilitasText}</span>
            </div>
            <div className="flex items-start gap-3 text-[13px] font-bold text-gray-500">
                <Icon icon="solar:map-point-bold-duotone" className="text-primary-base/60 text-[20px] shrink-0 mt-0.5" />
                <span className="line-clamp-1 leading-snug">{location}</span>
            </div>
        </div>

        {/* Footer Pricing & Button (BORDERLESS DIVIDER) */}
        <div className="mt-1.5 md:mt-auto bg-slate-50/50 -mx-2.5 -mb-2.5 md:-mx-6 md:-mb-6 px-2.5 py-2.5 md:px-6 md:py-5 flex items-center justify-between gap-1.5 md:gap-2">
          <div className="flex flex-col min-w-[0] overflow-hidden">
            <p className="text-[7px] font-black uppercase tracking-widest text-gray-400 mb-0.5 opacity-80 md:text-[10px]">Mulai dari</p>
            <p className={`font-extrabold text-gray-900 leading-none truncate ${price >= 1000000 ? 'text-[11.5px] md:text-[16.5px]' : 'text-[12px] md:text-[20px]'}`}>
              <NumberFormatter value={price} prefix="Rp" thousandSeparator="." decimalSeparator="," />
            </p>
          </div>
          <button className="hidden bg-primary-base text-white px-2 py-1.5 rounded-[8px] text-[9px] font-black shadow-lg shadow-primary-base/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 items-center gap-1 md:flex md:px-5 md:py-3 md:rounded-xl md:text-[12px]">
             Booking <Icon icon="solar:arrow-right-line-duotone" className="text-[11px] md:text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
