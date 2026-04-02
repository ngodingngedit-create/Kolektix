import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import VenueCard from '@/components/Card/VenueCard';
import { Get } from '@/utils/REST';
import { VenueProps } from '@/utils/globalInterface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Button, Card, Container, Divider, Flex, SimpleGrid, Stack, Text, Title, UnstyledButton, Input, Collapse } from '@mantine/core';
import _ from 'lodash';
import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';

const dummyVenues = [
  {
    id: 1,
    slug: "gelora-bung-karno-main-stadium",
    name: "Gelora Bung Karno Main Stadium",
    location_name: "Senayan, Jakarta Pusat",
    starting_price: 15000000,
    has_venue_category: { name: "Olahraga", icon_menu: "bx:football" },
    venue_gallery: [{ image_url: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=600&auto=format&fit=crop" }]
  },
  {
    id: 2,
    slug: "jakarta-convention-center",
    name: "Jakarta Convention Center (JCC)",
    location_name: "Senayan, Jakarta Pusat",
    starting_price: 25000000,
    has_venue_category: { name: "Convention Hall", icon_menu: "mdi:domain" },
    venue_gallery: [{ image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop" }]
  },
  {
    id: 3,
    slug: "tengah-tengah-namroom",
    name: "Tengah Tengah by NamRoom",
    location_name: "Kebayoran Baru, Jakarta Selatan",
    starting_price: 3500000,
    has_venue_category: { name: "Meeting Room", icon_menu: "fluent:conference-room-20-regular" },
    venue_gallery: [{ image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop" }]
  },
  {
    id: 4,
    slug: "cornerstone-auditorium",
    name: "Cornerstone Auditorium",
    location_name: "Paskal, Bandung",
    starting_price: 12500000,
    has_venue_category: { name: "Auditorium", icon_menu: "material-symbols:theater-comedy-outline" },
    venue_gallery: [{ image_url: "https://images.unsplash.com/photo-1507676184212-d0330a15233c?q=80&w=600&auto=format&fit=crop" }]
  },
  {
    id: 5,
    slug: "cbn-hall-jakarta",
    name: "CBN Hall Jakarta",
    location_name: "Kuningan, Jakarta Selatan",
    starting_price: 30000000,
    has_venue_category: { name: "Hall", icon_menu: "lucide:building" },
    venue_gallery: [{ image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop" }]
  },
  {
    id: 6,
    slug: "padel-pro-kemang",
    name: "Padel Pro Kemang",
    location_name: "Kemang, Jakarta Selatan",
    starting_price: 350000,
    has_venue_category: { name: "Olahraga", icon_menu: "bx:football" },
    venue_gallery: [{ image_url: "https://images.unsplash.com/photo-1622396345638-3dc682ae12aa?q=80&w=600&auto=format&fit=crop" }]
  }
];

const LocationOptions = ['Semua', 'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Bali'];
const SportOptions = ['Semua', 'Futsal', 'Basket', 'Bulu Tangkis', 'Tenis', 'Gym', 'Renang'];
const PriceOptions = ['Semua', '< 1 Juta', '1 - 5 Juta', '> 5 Juta'];

const Venue = () => {
  const router = useRouter();
  const [_data, setData] = useState<VenueProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedCities, setSelectedCities] = useState<string[]>(['Semua']);
  const [selectedSports, setSelectedSports] = useState<string[]>(['Semua']);
  const [selectedPrice, setSelectedPrice] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Rekomendasi');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const getVenue = () => {
    Get('venue', {})
      .then((res: any) => {
        if (res?.data && res.data.length > 0) {
          setData(res.data);
        } else {
          setData(dummyVenues as any);
        }
      })
      .catch((err: any) => {
        setData(dummyVenues as any);
      });
  };

  useEffect(() => {
    getVenue();
  }, []);

  useEffect(() => {
    if (router.query.category) {
      setSelectedCategory(router.query.category as string);
    } else {
      setSelectedCategory('Semua');
    }

    if (router.query.sort) {
      setSortBy(router.query.sort as string);
    } else {
      setSortBy('Rekomendasi');
    }

    if (router.query.show_filters === 'true') {
      setShowFilters(true);
    } else {
      setShowFilters(false);
    }

    if (router.query.city) {
      setSelectedCities((router.query.city as string).split(','));
    } else {
      setSelectedCities(['Semua']);
    }

    if (router.query.sport) {
      setSelectedSports((router.query.sport as string).split(','));
    } else {
      setSelectedSports(['Semua']);
    }

    if (router.query.price) {
      setSelectedPrice(router.query.price as string);
    } else {
      setSelectedPrice('Semua');
    }
  }, [router.query.category, router.query.sort, router.query.show_filters, router.query.city, router.query.sport, router.query.price]);

  const data = useMemo(() => {
    let filtered = _data;

    if (selectedCategory !== 'Semua' && selectedCategory !== undefined) {
      filtered = filtered.filter((item) => item.has_venue_category?.name === selectedCategory);
    }

    if (selectedCities.length > 0 && !selectedCities.includes('Semua')) {
      filtered = filtered.filter((item) => 
        selectedCities.some(city => item.location_name?.toLowerCase().includes(city.toLowerCase()))
      );
    }

    if (selectedSports.length > 0 && !selectedSports.includes('Semua')) {
      filtered = filtered.filter((item) => 
        selectedSports.some(sport => 
          item.has_venue_category?.name === 'Olahraga' ||
          item.name.toLowerCase().includes(sport.toLowerCase())
        )
      );
    }

    if (selectedPrice !== 'Semua') {
      if (selectedPrice === '< 1 Juta') {
        filtered = filtered.filter((item) => item.starting_price < 1000000);
      } else if (selectedPrice === '1 - 5 Juta') {
        filtered = filtered.filter((item) => item.starting_price >= 1000000 && item.starting_price <= 5000000);
      } else if (selectedPrice === '> 5 Juta') {
        filtered = filtered.filter((item) => item.starting_price > 5000000);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item?.location_name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'Harga Terendah') {
      filtered = filtered.sort((a, b) => a.starting_price - b.starting_price);
    } else if (sortBy === 'Harga Tertinggi') {
      filtered = filtered.sort((a, b) => b.starting_price - a.starting_price);
    }

    return filtered;
  }, [_data, selectedCategory, selectedCities, selectedSports, selectedPrice, searchQuery, sortBy]);

  return (
    <Container mih="90vh" mt={{ base: 40, md: 60 }} size="xl" className="px-4 md:px-8 pb-10">
      <Stack gap={30}>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6 md:mt-12 relative z-20">
          <Stack gap={6}>
            {/* <Title size="h2" fw={800} className="text-gray-900 tracking-tight text-2xl md:text-3xl">Pilihan Kategori</Title>
            <Text size="md" c="dimmed" fw={500}>Temukan ruang acara, meeting room, olahraga, dan lainnya.</Text> */}
          </Stack>

          {/* Filtering & Sorting - Moved to FilterMenu */}
          {/* <div className="flex items-center w-full md:w-auto gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-white px-5 py-3.5 rounded-2xl hover:bg-slate-50 transition-all w-full md:w-auto shadow-sm border border-gray-100">
              <Icon icon="solar:sort-from-top-to-bottom-line-duotone" className="text-primary-base text-[20px] shrink-0" />
              <select
                className="bg-transparent border-none outline-none text-[13px] font-bold text-gray-700 w-full md:w-[130px] cursor-pointer appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Rekomendasi">Rekomendasi</option>
                <option value="Harga Terendah">Harga Terendah</option>
                <option value="Harga Tertinggi">Harga Tertinggi</option>
              </select>
              <Icon icon="solar:alt-arrow-down-bold" className="text-gray-400 text-[12px] shrink-0 ml-1" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 h-[52px] px-6 rounded-2xl font-black uppercase tracking-wider transition-all text-[12px] shrink-0
                ${showFilters
                  ? 'bg-black text-white shadow-xl shadow-black/25 ring-4 ring-black/5'
                  : 'bg-[#194e9e] text-white shadow-lg shadow-[#194e9e]/20 hover:bg-[#123e80]'
                }`}
            >
              <Icon icon={showFilters ? "solar:close-circle-bold" : "solar:filter-bold-duotone"} className="text-[18px]" />
              <span>{showFilters ? 'Tutup' : 'Filter Lanjut'}</span>
            </button>
          </div> */}
        </div>

        {/* Expanded Filters Panel Removed - Now integrated in FilterMenu */}
        <div className="mt-2" />

        {/* <Flex align="center" gap={16} className={`overflow-x-auto pb-6 scrollbar-hide px-1`}>
          {[{ name: 'Semua', icon_menu: 'solar:widget-3-bold-duotone' }, ...Array.from(new Set(_data.map(item => item.has_venue_category?.name))).filter(Boolean).map(name => {
            const item = _data.find(e => e.has_venue_category?.name === name);
            return { name, icon_menu: item?.has_venue_category?.icon_menu }
          })].map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(item.name as string)}
              className={`
                flex items-center justify-center gap-2.5 px-6 py-3 rounded-full transition-all duration-500 min-w-max outline-none
                ${item.name === selectedCategory
                  ? 'bg-primary-base text-white shadow-[0_10px_25px_-5px_rgba(25,78,158,0.4)] scale-105'
                  : 'bg-white text-gray-600 hover:bg-slate-50 hover:shadow-md'
                }
              `}
            >
              <Icon icon={item.icon_menu ?? ''} className={`text-[20px] ${item.name === selectedCategory ? 'scale-110 drop-shadow-md' : 'text-gray-400'}`} />
              <span className={`text-sm tracking-wide ${item.name === selectedCategory ? 'font-bold' : 'font-semibold'}`}>
                {item.name}
              </span>
            </button>
          ))}
        </Flex> */}

        {data.length > 0 ? (
          <SimpleGrid className={`!grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4`} spacing={{ base: 'xs', md: 'lg' }} verticalSpacing={{ base: 'md', md: 'xl' }}>
            {data.map((item) => (
              <VenueCard
                id={item.id}
                key={item.id}
                slug={item.slug}
                title={item.name}
                location={item?.location_name ?? ''}
                price={Math.round(item.starting_price)}
                image={item.venue_gallery.map(e => e.image_url)}
                category={item.has_venue_category?.name}
              />
            ))}
          </SimpleGrid>
        ) : (
          <div className='min-h-[80vh] flex flex-col gap-3 items-center justify-center'>
            <FontAwesomeIcon icon={faLocationDot} className='text-primary-base' size='2x' />
            <h3 className='text-grey'>Belum ada venue</h3>
          </div>
        )}

      </Stack>
    </Container>
  );
};

export default Venue;