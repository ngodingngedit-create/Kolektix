import React, { useEffect, useMemo, useState } from 'react';
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
  const [_data, setData] = useState<VenueProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedCity, setSelectedCity] = useState<string>('Semua');
  const [selectedSport, setSelectedSport] = useState<string>('Semua');
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

  const data = useMemo(() => {
    let filtered = _data;

    if (selectedCategory !== 'Semua' && selectedCategory !== undefined) {
      filtered = filtered.filter((item) => item.has_venue_category?.name === selectedCategory);
    }

    if (selectedCity !== 'Semua') {
      filtered = filtered.filter((item) => item.location_name?.toLowerCase().includes(selectedCity.toLowerCase()));
    }

    if (selectedSport !== 'Semua') {
      filtered = filtered.filter((item) =>
        item.has_venue_category?.name === 'Olahraga' ||
        item.name.toLowerCase().includes(selectedSport.toLowerCase())
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
  }, [_data, selectedCategory, selectedCity, selectedSport, selectedPrice, searchQuery, sortBy]);

  return (
    <Container mih="90vh" mt={{ base: 40, md: 60 }} size="xl" className="px-4 md:px-8 pb-10">
      <Stack gap={30}>

        <div className="relative z-20 w-full max-w-5xl mx-auto mt-6 md:mt-12">
          {/* Main Search Bar Wrapper */}
          <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 lg:p-4 rounded-3xl shadow-[0_15px_50px_-10px_rgba(0,0,0,0.1)]">

            {/* Search Input Field */}
            <div className="flex-1 w-full flex items-center gap-3 bg-slate-50 px-5 py-3.5 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-base/5 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
              <Icon icon="solar:minimalistic-magnifer-linear" className="text-gray-400 text-[20px] shrink-0" />
              <input
                type="text"
                placeholder="Cari nama venue, lokasi, dll..."
                className="bg-transparent border-none outline-none text-[15px] font-medium text-gray-700 placeholder:text-gray-400 w-full h-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dropdown & Button Actions */}
            <div className="flex items-center w-full md:w-auto gap-3 shrink-0">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 px-5 py-3.5 rounded-2xl hover:bg-white hover:shadow-md transition-all w-full md:w-auto shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                <Icon icon="solar:sort-from-top-to-bottom-line-duotone" className="text-primary-base text-[20px] shrink-0" />
                <select
                  className="bg-transparent border-none outline-none text-[14px] font-bold text-gray-700 w-full md:w-[130px] cursor-pointer appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Rekomendasi">Rekomendasi</option>
                  <option value="Harga Terendah">Harga Terendah</option>
                  <option value="Harga Tertinggi">Harga Tertinggi</option>
                </select>
                <Icon icon="solar:alt-arrow-down-bold" className="text-gray-400 text-[12px] shrink-0 ml-1" />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 h-[52px] px-6 rounded-2xl font-bold transition-all text-[14px] shrink-0
                  ${showFilters
                    ? 'bg-black text-white shadow-xl shadow-black/25 ring-4 ring-black/5'
                    : 'bg-white text-gray-700 hover:bg-slate-50 shadow-md'
                  }`}
              >
                <Icon icon={showFilters ? "solar:close-circle-bold" : "solar:filter-bold-duotone"} className="text-[20px]" />
                <span>{showFilters ? 'Tutup' : 'Filter Lanjut'}</span>
              </button>
            </div>
          </div>

          {/* Expanded Filters Panel */}
          <Collapse in={showFilters}>
            <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] mt-6 overflow-hidden relative">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                <Icon icon="solar:tuning-square-2-bold-duotone" className="text-primary-base text-[28px]" />
                <h3 className="font-extrabold text-gray-800 text-[18px]">Filter Pencarian Spesifik</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* KOTA */}
                <div className="flex flex-col gap-3.5">
                  <span className="text-[11px] font-black text-gray-400 tracking-widest uppercase flex items-center gap-1.5">
                    <Icon icon="solar:map-point-bold-duotone" className="text-[14px]" /> Lokasi Kota
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {LocationOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedCity(opt)}
                        className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 
                          ${selectedCity === opt
                            ? 'bg-primary-base text-white shadow-lg shadow-primary-base/30'
                            : 'bg-slate-50 text-gray-600 hover:bg-white hover:shadow-md'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* JENIS OLAHRAGA */}
                <div className="flex flex-col gap-3.5">
                  <span className="text-[11px] font-black text-gray-400 tracking-widest uppercase flex items-center gap-1.5">
                    <Icon icon="solar:basketball-bold-duotone" className="text-[14px]" /> Jenis Olahraga
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {SportOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedSport(opt)}
                        className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 
                          ${selectedSport === opt
                            ? 'bg-primary-base text-white shadow-lg shadow-primary-base/30'
                            : 'bg-slate-50 text-gray-600 hover:bg-white hover:shadow-md'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HARGA */}
                <div className="flex flex-col gap-3.5">
                  <span className="text-[11px] font-black text-gray-400 tracking-widest uppercase flex items-center gap-1.5">
                    <Icon icon="solar:wallet-bold-duotone" className="text-[14px]" /> Rentang Harga
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {PriceOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedPrice(opt)}
                        className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 
                          ${selectedPrice === opt
                            ? 'bg-primary-base text-white shadow-lg shadow-primary-base/30'
                            : 'bg-slate-50 text-gray-600 hover:bg-white hover:shadow-md'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset Filters Option */}
              {(selectedCity !== 'Semua' || selectedSport !== 'Semua' || selectedPrice !== 'Semua') && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCity('Semua');
                      setSelectedSport('Semua');
                      setSelectedPrice('Semua');
                    }}
                    className="text-[13px] font-bold text-red-500 hover:text-red-700 underline decoration-red-500/30 underline-offset-4 transition-colors flex items-center gap-1"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" /> Reset Semua Filter
                  </button>
                </div>
              )}
            </div>
          </Collapse>
        </div>

        <Stack gap={6} className="mt-8">
          <Title size="h2" fw={800} className="text-gray-900 tracking-tight text-2xl md:text-3xl">Pilihan Kategori</Title>
          <Text size="md" c="dimmed" fw={500}>Temukan ruang acara, meeting room, olahraga, dan lainnya.</Text>
        </Stack>

        <Flex align="center" gap={16} className={`overflow-x-auto pb-6 scrollbar-hide px-1`}>
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
        </Flex>

        {data.length > 0 ? (
          <SimpleGrid className={`!grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4`}>
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