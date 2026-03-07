// pages/cart.tsx
// import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
// import { Container, Group, Checkbox, Text, Title, Button, Paper, Stack, Image, Flex, Card, NumberFormatter, ActionIcon, Center, NumberInput, AspectRatio, Divider, Accordion, UnstyledButton, TextInput, Box, Modal, Select, Textarea, SimpleGrid, Loader, LoadingOverlay } from '@mantine/core';
// import { useListState, useSetState } from '@mantine/hooks';
// import { MerchListResponse } from '../dashboard/merch/type';
// import { Delete, Get } from '@/utils/REST';
// import useLoggedUser from '@/utils/useLoggedUser';
// import _ from 'lodash';
// import { Icon } from '@iconify/react/dist/iconify.js';
// import { useRouter } from 'next/router';
// import { useForm, zodResolver } from '@mantine/form';
// import Cookies from 'js-cookie';
// import fetch from '@/utils/fetch';
// import { AddressData, addressDataSchema, AddressUpdateRequest } from '../dashboard/profile/address';
// import { currencyFormat } from '@/utils/currencyFormat';
// import { z, ZodAny } from 'zod';
// import { VenueListResponse } from '../dashboard/venue/type';
// import moment from 'moment';
// import { DateInput } from '@mantine/dates';
// import { notifications } from '@mantine/notifications';
// import ImageInput from '@/components/ImageInput.tsx';


// type Province = {
//     id: number;
//     name: string;
// }

// type City = {
//     id: number;
//     province_id: number;
//     name: string;
//     province?: Province;
// }

// type Checkout = {
//     event_name: string;
//     event_banner?: Blob;
//     nama_pemesan: string;
//     email_pemesan: string;
//     phone_pemesan: string;
//     user_id: number;
//     total_qty: number;
//     total_price: number;
//     venue_id: number;
//     grandtotal: number;
//     payment_method: string;
//     start_date: string;
//     end_date: string;
// };

// type FormInput = Omit<Checkout, 'user_id' | 'payment_method' | 'grandtotal' | 'total_qty' | 'total_price' | 'venue_id'>;

// export const formStateSchema = z.object({
//     nama_pemesan: z.string().nonempty("Nama pemesan tidak boleh kosong.").optional().nullable(),
//     email_pemesan: z.string().email("Email pemesan tidak boleh kosong.").optional().nullable(),
//     receiver: z.object({
//         name: z.string().nonempty("Nama penerima tidak boleh kosong."),
//         address_name: z.string().nonempty("Nama alamat tidak boleh kosong."),
//         phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
//         province_id: z.number().int().positive("ID provinsi harus berupa bilangan bulat positif."),
//         city_id: z.number().int().positive("ID kota harus berupa bilangan bulat positif."),
//         pos_code: z.number().int().nonnegative("Kode pos harus berupa bilangan bulat non-negatif."),
//         detail: z.string().nonempty("Detail alamat tidak boleh kosong."),
//     }),
//     payment_method: z.string().nonempty("Metode Pembayaran tidak boleh kosong."),
//     courier: z.string().nonempty("Kurir tidak boleh kosong."),
// });

// export type VenueBookingOrder = {
//     id: number;
//     slug: string;
//     date_start: string;
//     date_end: string;
// }

// export default function Cart() {
//     const [isr, setIsr] = useState(false);
//     const [orderData, setOrderData] = useSetState<VenueBookingOrder>({
//         id: 0,
//         slug: '',
//         date_start: '',
//         date_end: ''
//     })
//     const [venue, setVenue] = useState<VenueListResponse>();
//     const [onEditDate, setOnEditDate] = useState(false);
//     const [loading, setLoading] = useListState<string>();
//     const [paymentOption, setPaymentOption] = useState<'all' | 'divide'>('all');
//     const user = useLoggedUser();
//     const router = useRouter();

//     const { setValues: setFormValues, values: fv, getInputProps: inputProps, errors: fe, validate: validateForm } = useForm<Checkout>({
//         onValuesChange: (val) => {
//             val.phone_pemesan = (val.phone_pemesan ?? '').replaceAll(/\D/g, '');
//             return val;
//         }
//     });

//     useEffect(() => {
//         setIsr(true);
//     }, []);

//     useEffect(() => {
//         getData();
//         try {
//             const _orderData: VenueBookingOrder = JSON.parse(Cookies.get('venue_order_data') ?? '[]');
//             if (!_orderData) router.push('/venue');
//             setOrderData(_orderData);
//             setFormValues({
//                 start_date: _orderData.date_start,
//                 end_date: _orderData.date_end,
//             });
//         } catch (error) {}
//     }, [isr]);

//     useEffect(() => {
//         getData();
//     }, [orderData]);

//     const getData = async () => {
//         if (!Boolean(venue)) {
//             await fetch<any, VenueListResponse>({
//                 url: `venue/${orderData?.slug}`,
//                 method: 'GET',
//                 before: () => setLoading.append('getdata'),
//                 success: ({ data }) => data && setVenue(data),
//                 complete: () => setLoading.filter(e => e != 'getdata'),
//             });
//         }
//     };

//     const orderSummary = useMemo(() => {
//         function getDaysBetweenDates(startDateString: string, endDateString: string): number {
//             const startDate = new Date(startDateString);
//             const endDate = new Date(endDateString);
//             const differenceInTime = endDate.getTime() - startDate.getTime();
//             const differenceInDays = differenceInTime / (1000 * 3600 * 24);
//             return Math.abs(differenceInDays);
//         }

//         const count = getDaysBetweenDates(orderData.date_start, orderData.date_end) + 1;
//         const subprice = Math.round((paymentOption == 'all' ? venue?.starting_price : venue?.minimum_price) ?? 0);
//         const price = paymentOption == 'all' ? count * subprice : subprice;
//         const admin = 2000;
//         const ppn = (price + admin) * 0.11;
//         const total = price + admin + ppn;
        
//         const subfullprice = count * Math.round(venue?.starting_price ?? 0);
//         const fullprice = (subfullprice + admin) * 1.11;

//         return {
//             array: [
//                 [`Booking ${count} Hari`, price],
//                 ["Biaya Admin", admin],
//                 ["PPN (11%)", ppn],
//                 ["Total Pembayaran", total],
//             ],
//             count, subprice, price, ppn, admin, total, fullprice
//         }
//     }, [venue, orderData, paymentOption]);

//     const handleCheckout = async () => {
//         const valid = validateForm();
//         if (valid.hasErrors) return;

//         await fetch<Checkout, any>({
//             url: 'booking-venue',
//             method: 'POST',
//             data: {
//                 user_id: user?.id ?? 0,
//                 event_name: fv.event_name,
//                 event_banner: fv.event_banner,
//                 total_qty: orderSummary.count,
//                 total_price: orderSummary.fullprice,
//                 venue_id: orderData?.id,
//                 grandtotal: orderSummary.total,
//                 payment_method: 'xendit',
//                 start_date: fv.start_date,
//                 end_date: fv.end_date,
//                 nama_pemesan: fv.nama_pemesan,
//                 email_pemesan: fv.email_pemesan,
//                 phone_pemesan: fv.phone_pemesan
//             },
//             before: () => setLoading.append('submit'),
//             success: (data) => {
//                 if (data['xendit_invoice']) {
//                     router.push(data['xendit_invoice'])
//                 } else {
//                     notifications.show({
//                         position: 'top-right',
//                         color: 'red',
//                         message: data['message'] ?? 'Gagal Checkout'
//                     });
//                     setTimeout(() => {
//                         router.reload();
//                     }, 2000);
//                 }
//             },
//             complete: () => setLoading.filter(e => e != 'submit'),
//             error: (err) => {
//                 notifications.show({
//                     position: 'top-right',
//                     color: 'red',
//                     message: err.response.data.message ?? 'Gagal Checkout'
//                 });
//                 setTimeout(() => {
//                     router.reload();
//                 }, 2000);
//             },
//         });
//     }

//     if (loading.includes('getdata')) return <LoadingOverlay visible />;

//     return (
//         <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//             <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px`}>
//                 <Stack gap={25} mb={40}>
//                     <Stack gap={0}>
//                         <Title order={1} size="h2">
//                             Booking Venue
//                         </Title>
//                         <Text size="sm" c="gray">
//                             Selesaikan Pembayaran untuk booking venue
//                         </Text>
//                     </Stack>

//                     <Divider />

//                     <Flex gap={20} w="100%" wrap="wrap" align="stretch">
//                         <Stack gap={15} className={`flex-grow`}>
//                             <DropdownComponent title="Data Event" icon="lucide:info" defaultOpened>
//                                 <Stack>
//                                     <TextInput
//                                         label="Nama Event"
//                                         placeholder="Masukan Nama Event"
//                                         {...inputProps('event_name')}
//                                     />

//                                     <ImageInput
//                                         dimension={[724, 340]}
//                                         label="Banner Event"
//                                         description='Ukuran gambar 724x340 px, Maks 2MB'
//                                         value={fv?.event_banner}
//                                         onChange={e => setFormValues({ event_banner: e ? e : undefined })}
//                                         error={fe?.event_banner}
//                                     />
//                                 </Stack>
//                             </DropdownComponent>

//                             <DropdownComponent title="Data Pemesan" icon="lucide:info" defaultOpened>
//                                 <Stack>
//                                     <TextInput
//                                         label="Nama Pemesan"
//                                         placeholder="Masukan Nama Pemesan"
//                                         {...inputProps('nama_pemesan')}
//                                     />
//                                     <TextInput
//                                         label="Email"
//                                         placeholder="Masukan Email Pemesan"
//                                         {...inputProps('email_pemesan')}
//                                     />
//                                     <TextInput
//                                         label="No. Telp Pemesan"
//                                         placeholder="Masukan No. Telp Pemesan"
//                                         {...inputProps('phone_pemesan')}
//                                     />
//                                     <Text size="xs" c="gray">*Pastikan data yang dimasukan sudah sesuai</Text>
//                                 </Stack>
//                             </DropdownComponent>

//                             <DropdownComponent title="Detail Booking" icon="lucide:info" defaultOpened>
//                                 <Stack>
//                                     <Flex justify="space-between" gap={20} align="center">
//                                         <Stack gap={0}>
//                                             <Text size="sm" c="gray">Venue</Text>
//                                             <Text>{venue?.name}</Text>
//                                         </Stack>
//                                         {Boolean(venue?.venue_gallery) && (
//                                             <Image src={venue?.venue_gallery[0].image_url ?? '#'} bg="gray.1" radius={7} w={50} h={50} />
//                                         )}
//                                     </Flex>
//                                     <Stack gap={0}>
//                                         <Text size="sm" c="gray">Lokasi</Text>
//                                         <Text>{venue?.location}</Text>
//                                     </Stack>
//                                     <Flex gap={10} className={`[&>*]:!flex-grow`} wrap="wrap">
//                                         <Stack gap={0}>
//                                             <Text size="sm" c="gray">Maks. Kapasitas</Text>
//                                             <Text><NumberFormatter prefix={''} value={venue?.max_capacity} /></Text>
//                                         </Stack>
//                                         <Stack gap={0}>
//                                             <Text size="sm" c="gray">Jumlah Kursi</Text>
//                                             <Text><NumberFormatter prefix={''} value={venue?.seat_capacity} /></Text>
//                                         </Stack>
//                                     </Flex>
//                                     <Flex justify="space-between" gap={20} align="center">
//                                         <Stack gap={0}>
//                                             <Text size="sm" c="gray">Tanggal Booking</Text>
//                                             {!onEditDate ? (
//                                                 <Text>{moment(fv?.start_date).format('DD MMM YYYY')} - {moment(fv?.end_date).format('DD MMM YYYY')}</Text>
//                                             ) : (
//                                                 <Flex gap={10} mt={5} wrap="wrap">
//                                                     <DateInput
//                                                         minDate={new Date()}
//                                                         maxDate={new Date(fv?.end_date)}
//                                                         value={fv?.start_date ? new Date(fv?.start_date) : undefined}
//                                                         onChange={e => setFormValues({ start_date: moment(e).format('YYYY-MM-DD')})}
//                                                         valueFormat='DD MMMM YYYY'
//                                                         placeholder="Dari Tanggal"
//                                                     />
//                                                     <DateInput
//                                                         minDate={new Date(fv?.start_date)}
//                                                         value={fv?.end_date ? new Date(fv?.end_date) : undefined}
//                                                         onChange={e => setFormValues({ end_date: moment(e).format('YYYY-MM-DD')})}
//                                                         valueFormat='DD MMMM YYYY'
//                                                         placeholder="Sampai Tanggal"
//                                                     />
//                                                 </Flex>
//                                             )}
//                                         </Stack>
//                                         <Button onClick={() => setOnEditDate(!onEditDate)} variant="transparent" color="#194e9e">
//                                             {onEditDate ? 'Simpan' : 'Edit'}
//                                         </Button>
//                                     </Flex>
//                                 </Stack>
//                             </DropdownComponent>

//                             <DropdownComponent title={'Opsi Pembayaran'} icon={'hugeicons:money-04'} defaultOpened>
//                                 <Stack>
//                                     <Flex component="label" justify="space-between" align="center" gap={15} className={`cursor-pointer`}>
//                                         <Stack gap={0}>
//                                             <Text>Pembayaran Penuh</Text>
//                                             <Text maw={400} c="gray">Bayar Total (<NumberFormatter value={Math.round(venue?.starting_price ?? 0)} />) sekarang.</Text>
//                                         </Stack>
//                                         <Checkbox checked={paymentOption == 'all'} onChange={e => e.target.checked ? setPaymentOption('all') : {}}/>
//                                         <Box pos="absolute" className={``} />
//                                     </Flex>
//                                     {(Boolean(venue?.minimum_price) || (venue?.minimum_price ?? 0) > 0) && (
//                                         <>
//                                             <Divider />
//                                             <Flex component="label" justify="space-between" align="center" gap={15} className={`cursor-pointer`}>
//                                                 <Stack gap={0}>
//                                                     <Text>Bayar Sebagian</Text>
//                                                     <Text maw={400} c="gray">Bayar sebagian (<NumberFormatter value={Math.round(venue?.minimum_price ?? 0)} />) sekarang. Lakukan pelunasan sebelum tanggal {moment(orderData?.date_start).format('DD MMMM YYYY')}.</Text>
//                                                 </Stack>
//                                                 <Checkbox checked={paymentOption == 'divide'} onChange={e => e.target.checked ? setPaymentOption('divide') : {}}/>
//                                             </Flex>
//                                         </>
//                                     )}
//                                 </Stack>
//                             </DropdownComponent>

//                             {/* <DropdownComponent title={'Metode Pembayaran'} icon={'si:money-line'} defaultOpened>

//                             </DropdownComponent> */}

//                             {/* <DropdownComponent title="Metode Pembayaran" icon="fluent:payment-16-filled">
//                                 <UnstyledButton>
//                                         <Card p={10} radius="md" bg="gray.1">
//                                             <Flex gap={20} align="center">
//                                                 <AspectRatio className={`shrink-0`}>
//                                                     <Image w={50} h={50} bg="gray.1" radius="sm" />
//                                                 </AspectRatio>

//                                                 <Text w="100%">PAYMENT_METHOD_NAME</Text>

//                                                 <Icon icon="uiw:circle-check" className={`text-[#194E9E] text-[24px] shrink-0 mr-[10px]`} />
//                                             </Flex>
//                                         </Card>
//                                     </UnstyledButton>
//                             </DropdownComponent> */}
//                         </Stack>

//                         <Stack gap={10} className={`!flex-grow md:!max-w-[400px]`}>
//                             <Card withBorder radius={10} p={20}>
//                                 <Stack gap={20}>
//                                     <Flex gap={10} align="center">
//                                         <Icon icon="lucide:info" className={`text-primary-base text-[20px]`}/>
//                                         <Text fw={600}>Detail Pembayaran</Text>
//                                     </Flex>

//                                     <Stack>
//                                         {orderSummary.array.map((e, i) => (
//                                             <Flex justify="space-between" key={i}>
//                                                 <Text fw={e[0] == "Total Pembayaran" ? 600 : 400}>{e[0]}</Text>
//                                                 <Text fw={e[0] == "Total Pembayaran" ? 600 : 400}><NumberFormatter value={e[1]}/></Text>
//                                             </Flex>
//                                         ))}
//                                     </Stack>
//                                 </Stack>
//                             </Card>
//                         </Stack>
//                     </Flex>
//                 </Stack>

//                 <Card pos="fixed" className={`bottom-0 left-0 w-[100vw] border-t !border-primary-light`} py={10} withBorder>
//                     <Container size="lg" w="100%">
//                         <Flex justify="end" w="100%">
//                             <Button
//                                 loading={loading.includes('submit')}
//                                 onClick={handleCheckout}
//                                 className={`uppercase`}
//                                 color="#194E9E"
//                                 rightSection={<Icon icon="uiw:check" />}
//                                 radius="xl">
//                                 Proses Pembayaran
//                             </Button>
//                         </Flex>
//                     </Container>
//                 </Card>
//             </Container>
//         </div>
//     );
// }

// const DropdownComponent = ({ defaultOpened, children, title, icon }: PropsWithChildren<{ defaultOpened?: boolean, title: string, icon: string }>) => {
//     const [opened, setOpened] = useState<boolean>(defaultOpened ?? false);

//     return (
//         <>
//             <Card bg="white" radius={10} withBorder>
//                 <Stack>
//                     <Flex justify="space-between" align="center" gap={20} onClick={() => setOpened(!opened)} className={`cursor-pointer`}>
//                         <Flex align="center" gap={10}>
//                             <Icon icon={icon} className={`text-[20px] text-[#194E9E]`} />
//                             <Text>{title}</Text>
//                         </Flex>

//                         <ActionIcon variant="transparent" c="gray">
//                             <Icon icon="uiw:down" className={`transition-transform ${opened ? '!rotate-180' : ''}`}/>
//                         </ActionIcon>
//                     </Flex>

//                     <Stack className={`${opened ? '' : '!hidden'}`} p={5}>
//                         <Divider />
//                         {children}
//                     </Stack>
//                 </Stack>
//             </Card>
//         </>
//     );
// };

import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Container, Group, Checkbox, Text, Title, Button, Paper, Stack, Image, Flex, Card, NumberFormatter, ActionIcon, Center, NumberInput, AspectRatio, Divider, Accordion, UnstyledButton, TextInput, Box, Modal, Select, Textarea, SimpleGrid, Loader, LoadingOverlay, ComboboxItem, OptionsFilter } from '@mantine/core';
import { useListState, useSetState } from '@mantine/hooks';
import { MerchListResponse } from '../dashboard/merch/type';
import { Delete, Get } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';
import _ from 'lodash';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import Cookies from 'js-cookie';
import fetch from '@/utils/fetch';
import { AddressData, addressDataSchema, AddressUpdateRequest } from '../dashboard/profile/address';
import { currencyFormat } from '@/utils/currencyFormat';
import { z, ZodAny } from 'zod';
import { VenueListResponse } from '../dashboard/venue/type';
import moment from 'moment';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import ImageInput from '@/components/ImageInput.tsx';
import axios from 'axios';

type Province = {
    id: number;
    name: string;
}

type City = {
    id: number;
    province_id: number;
    name: string;
    province?: Province;
}

// Sesuaikan tipe Event dengan response API
type Event = {
    id: number;
    creator_id: string;
    event_social_media_id: string | null;
    category_id: string | null;
    name: string; // Gunakan 'name' bukan 'title'
    // tambahkan field lain sesuai kebutuhan
    banner?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
}

type Checkout = {
    event_id: number | null;
    event_banner?: Blob;
    nama_pemesan: string;
    email_pemesan: string;
    phone_pemesan: string;
    user_id: number;
    total_qty: number;
    total_price: number;
    venue_id: number;
    grandtotal: number;
    payment_method: string;
    start_date: string;
    end_date: string;
};

type FormInput = Omit<Checkout, 'user_id' | 'payment_method' | 'grandtotal' | 'total_qty' | 'total_price' | 'venue_id'>;

export const formStateSchema = z.object({
    event_id: z.number().nullable(),
    nama_pemesan: z.string().nonempty("Nama pemesan tidak boleh kosong.").optional().nullable(),
    email_pemesan: z.string().email("Email pemesan tidak boleh kosong.").optional().nullable(),
    receiver: z.object({
        name: z.string().nonempty("Nama penerima tidak boleh kosong."),
        address_name: z.string().nonempty("Nama alamat tidak boleh kosong."),
        phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
        province_id: z.number().int().positive("ID provinsi harus berupa bilangan bulat positif."),
        city_id: z.number().int().positive("ID kota harus berupa bilangan bulat positif."),
        pos_code: z.number().int().nonnegative("Kode pos harus berupa bilangan bulat non-negatif."),
        detail: z.string().nonempty("Detail alamat tidak boleh kosong."),
    }),
    payment_method: z.string().nonempty("Metode Pembayaran tidak boleh kosong."),
    courier: z.string().nonempty("Kurir tidak boleh kosong."),
});

export type VenueBookingOrder = {
    id: number;
    slug: string;
    date_start: string;
    date_end: string;
}

// Buat instance axios dengan base URL dari environment variable
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_WS_URL,
});

export default function Cart() {
    const [isr, setIsr] = useState(false);
    const [orderData, setOrderData] = useSetState<VenueBookingOrder>({
        id: 0,
        slug: '',
        date_start: '',
        date_end: ''
    })
    const [venue, setVenue] = useState<VenueListResponse>();
    const [onEditDate, setOnEditDate] = useState(false);
    const [loading, setLoading] = useListState<string>();
    const [paymentOption, setPaymentOption] = useState<'all' | 'divide'>('all');
    const user = useLoggedUser();
    const router = useRouter();

    // State untuk events
    const [events, setEvents] = useState<Event[]>([]);
    const [eventsPage, setEventsPage] = useState(1);
    const [eventsTotalPages, setEventsTotalPages] = useState(1);
    const [eventsTotal, setEventsTotal] = useState(0);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [searchEvent, setSearchEvent] = useState('');
    const [dropdownOpened, setDropdownOpened] = useState(false);

    const { setValues: setFormValues, values: fv, getInputProps: inputProps, errors: fe, validate: validateForm } = useForm<Checkout>({
        initialValues: {
            event_id: null,
            event_banner: undefined,
            nama_pemesan: '',
            email_pemesan: '',
            phone_pemesan: '',
            user_id: 0,
            total_qty: 0,
            total_price: 0,
            venue_id: 0,
            grandtotal: 0,
            payment_method: '',
            start_date: '',
            end_date: ''
        },
        onValuesChange: (val) => {
            if (val.phone_pemesan) {
                val.phone_pemesan = val.phone_pemesan.replaceAll(/\D/g, '');
            }
            return val;
        }
    });

    useEffect(() => {
        setIsr(true);
    }, []);

    useEffect(() => {
        getData();
        try {
            const _orderData: VenueBookingOrder = JSON.parse(Cookies.get('venue_order_data') ?? 'null');
            if (!_orderData) {
                router.push('/venue');
                return;
            }
            setOrderData(_orderData);
            setFormValues({
                start_date: _orderData.date_start,
                end_date: _orderData.date_end,
            });
        } catch (error) {
            console.error('Error parsing order data:', error);
        }
    }, [isr]);

    useEffect(() => {
        getData();
    }, [orderData]);

    // Fetch events dari API menggunakan instance api
    useEffect(() => {
        if (dropdownOpened) {
            fetchEvents();
        }
    }, [eventsPage, searchEvent, dropdownOpened]);

    const getData = async () => {
        if (!venue && orderData?.slug) {
            await fetch<any, VenueListResponse>({
                url: `venue/${orderData.slug}`,
                method: 'GET',
                before: () => setLoading.append('getdata'),
                success: ({ data }) => data && setVenue(data),
                complete: () => setLoading.filter(e => e != 'getdata'),
                error: (err) => {
                    console.error('Error fetching venue:', err);
                    notifications.show({
                        position: 'top-right',
                        color: 'red',
                        message: 'Gagal mengambil data venue'
                    });
                }
            });
        }
    };

    const fetchEvents = async () => {
        if (!api.defaults.baseURL) {
            console.error('API Base URL is not defined');
            notifications.show({
                position: 'top-right',
                color: 'red',
                message: 'Konfigurasi API tidak ditemukan'
            });
            return;
        }

        try {
            setEventsLoading(true);
            
            const response = await api.get('/event', {
                params: {
                    page: eventsPage,
                    search: searchEvent || undefined,
                    limit: 12 // Sesuaikan dengan limit dari response (12)
                }
            });

            console.log('Events response:', response.data);

            // Handle response berdasarkan struktur yang diberikan
            if (response?.data) {
                // Response memiliki struktur: { message, data: [...], pagination }
                if (response.data.data && Array.isArray(response.data.data)) {
                    setEvents(response.data.data);
                    setEventsTotalPages(response.data.pagination?.last_page || 1);
                    setEventsTotal(response.data.pagination?.total || 0);
                } 
                // Jika response.data langsung array
                else if (Array.isArray(response.data)) {
                    setEvents(response.data);
                    setEventsTotalPages(1);
                } else {
                    setEvents([]);
                }
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
            notifications.show({
                position: 'top-right',
                color: 'red',
                message: 'Gagal mengambil data event'
            });
        } finally {
            setEventsLoading(false);
        }
    };

    const orderSummary = useMemo(() => {
        function getDaysBetweenDates(startDateString: string, endDateString: string): number {
            if (!startDateString || !endDateString) return 0;
            const startDate = new Date(startDateString);
            const endDate = new Date(endDateString);
            const differenceInTime = endDate.getTime() - startDate.getTime();
            const differenceInDays = differenceInTime / (1000 * 3600 * 24);
            return Math.abs(differenceInDays);
        }

        const count = getDaysBetweenDates(orderData.date_start, orderData.date_end) + 1;
        const subprice = Math.round((paymentOption == 'all' ? venue?.starting_price : venue?.minimum_price) ?? 0);
        const price = paymentOption == 'all' ? count * subprice : subprice;
        const admin = 2000;
        const ppn = (price + admin) * 0.11;
        const total = price + admin + ppn;
        
        const subfullprice = count * Math.round(venue?.starting_price ?? 0);
        const fullprice = (subfullprice + admin) * 1.11;

        return {
            array: [
                [`Booking ${count} Hari`, price],
                ["Biaya Admin", admin],
                ["PPN (11%)", ppn],
                ["Total Pembayaran", total],
            ],
            count, subprice, price, ppn, admin, total, fullprice
        }
    }, [venue, orderData, paymentOption]);

    const handleCheckout = async () => {
        const valid = validateForm();
        if (valid.hasErrors) return;

        if (!fv.event_id) {
            notifications.show({
                position: 'top-right',
                color: 'red',
                message: 'Pilih event terlebih dahulu'
            });
            return;
        }

        await fetch<Checkout, any>({
            url: 'booking-venue',
            method: 'POST',
            data: {
                user_id: user?.id ?? 0,
                event_id: fv.event_id,
                event_banner: fv.event_banner,
                total_qty: orderSummary.count,
                total_price: orderSummary.fullprice,
                venue_id: orderData?.id,
                grandtotal: orderSummary.total,
                payment_method: 'xendit',
                start_date: fv.start_date,
                end_date: fv.end_date,
                nama_pemesan: fv.nama_pemesan,
                email_pemesan: fv.email_pemesan,
                phone_pemesan: fv.phone_pemesan
            },
            before: () => setLoading.append('submit'),
            success: (data) => {
                if (data?.['xendit_invoice']) {
                    router.push(data['xendit_invoice']);
                } else {
                    notifications.show({
                        position: 'top-right',
                        color: 'red',
                        message: data?.['message'] ?? 'Gagal Checkout'
                    });
                }
            },
            complete: () => setLoading.filter(e => e != 'submit'),
            error: (err) => {
                notifications.show({
                    position: 'top-right',
                    color: 'red',
                    message: err?.response?.data?.message ?? 'Gagal Checkout'
                });
            },
        });
    }

    // Konversi events ke format Select options dengan aman - gunakan 'name' bukan 'title'
    const eventOptions = events.map(event => ({
        value: event.id?.toString() ?? '',
        label: event.name ?? 'Unknown Event', // Gunakan 'name' dari response
    }));

    // Cari event yang dipilih
    const selectedEvent = fv.event_id ? events.find(e => e.id === fv.event_id) : null;

    if (loading.includes('getdata')) return <LoadingOverlay visible />;

    return (
        <div className="bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]">
            <Container size="lg" mb="xl" className="mt-[85px] md:mt-[100px]">
                <Stack gap={25} mb={40}>
                    <Stack gap={0}>
                        <Title order={1} size="h2">
                            Booking Venue
                        </Title>
                        <Text size="sm" c="gray">
                            Selesaikan Pembayaran untuk booking venue
                        </Text>
                    </Stack>

                    <Divider />

                    <Flex gap={20} w="100%" wrap="wrap" align="stretch">
                        <Stack gap={15} className="flex-grow">
                            <DropdownComponent title="Data Event" icon="lucide:info" defaultOpened>
                                <Stack>
                                    <Select
                                        label="Pilih Event"
                                        placeholder="Cari dan pilih event"
                                        data={eventOptions}
                                        value={fv.event_id?.toString() || null}
                                        onChange={(value) => setFormValues({ event_id: value ? parseInt(value, 10) : null })}
                                        error={fe?.event_id}
                                        searchable
                                        clearable
                                        nothingFoundMessage="Event tidak ditemukan"
                                        rightSection={eventsLoading ? <Loader size="xs" /> : null}
                                        onDropdownOpen={() => {
                                            setDropdownOpened(true);
                                            setSearchEvent('');
                                            setEventsPage(1);
                                        }}
                                        onDropdownClose={() => {
                                            setDropdownOpened(false);
                                        }}
                                        onSearchChange={(search) => {
                                            setSearchEvent(search || '');
                                            setEventsPage(1);
                                        }}
                                    />

                                    {/* Tampilkan informasi event yang dipilih */}
                                    {selectedEvent && (
                                        <Card withBorder p="sm" radius="md" bg="gray.0">
                                            <Stack gap="xs">
                                                <Text size="sm" fw={500}>Event Terpilih:</Text>
                                                <Text size="sm" fw={600}>{selectedEvent.name}</Text>
                                                {selectedEvent.description && (
                                                    <Text size="sm">{selectedEvent.description}</Text>
                                                )}
                                                <Flex gap="md" wrap="wrap">
                                                    {selectedEvent.start_date && selectedEvent.end_date && (
                                                        <Text size="xs" c="dimmed">
                                                            Tanggal: {moment(selectedEvent.start_date).format('DD MMM YYYY')} - {moment(selectedEvent.end_date).format('DD MMM YYYY')}
                                                        </Text>
                                                    )}
                                                    {selectedEvent.location && (
                                                        <Text size="xs" c="dimmed">
                                                            Lokasi: {selectedEvent.location}
                                                        </Text>
                                                    )}
                                                </Flex>
                                                {selectedEvent.creator_id && (
                                                    <Text size="xs" c="dimmed">
                                                        Creator ID: {selectedEvent.creator_id}
                                                    </Text>
                                                )}
                                            </Stack>
                                        </Card>
                                    )}

                                    {/* Informasi pagination */}
                                    {eventsTotal > 0 && (
                                        <Text size="xs" c="dimmed" ta="center">
                                            Total {eventsTotal} event
                                        </Text>
                                    )}

                                    {/* Pagination untuk event */}
                                    {eventsTotalPages > 1 && (
                                        <Flex justify="center" gap={5} mt="xs">
                                            <Button 
                                                size="xs" 
                                                variant="subtle"
                                                disabled={eventsPage === 1}
                                                onClick={() => setEventsPage(p => Math.max(1, p - 1))}
                                            >
                                                Previous
                                            </Button>
                                            <Text size="sm" style={{ alignSelf: 'center' }}>
                                                Page {eventsPage} of {eventsTotalPages}
                                            </Text>
                                            <Button 
                                                size="xs" 
                                                variant="subtle"
                                                disabled={eventsPage === eventsTotalPages}
                                                onClick={() => setEventsPage(p => Math.min(eventsTotalPages, p + 1))}
                                            >
                                                Next
                                            </Button>
                                        </Flex>
                                    )}
                                </Stack>
                            </DropdownComponent>

                            <DropdownComponent title="Data Pemesan" icon="lucide:info" defaultOpened>
                                <Stack>
                                    <TextInput
                                        label="Nama Pemesan"
                                        placeholder="Masukan Nama Pemesan"
                                        {...inputProps('nama_pemesan')}
                                    />
                                    <TextInput
                                        label="Email"
                                        placeholder="Masukan Email Pemesan"
                                        {...inputProps('email_pemesan')}
                                    />
                                    <TextInput
                                        label="No. Telp Pemesan"
                                        placeholder="Masukan No. Telp Pemesan"
                                        {...inputProps('phone_pemesan')}
                                    />
                                    <Text size="xs" c="gray">*Pastikan data yang dimasukan sudah sesuai</Text>
                                </Stack>
                            </DropdownComponent>

                            <DropdownComponent title="Detail Booking" icon="lucide:info" defaultOpened>
                                <Stack>
                                    <Flex justify="space-between" gap={20} align="center">
                                        <Stack gap={0}>
                                            <Text size="sm" c="gray">Venue</Text>
                                            <Text>{venue?.name || '-'}</Text>
                                        </Stack>
                                        {venue?.venue_gallery?.[0]?.image_url && (
                                            <Image 
                                                src={venue.venue_gallery[0].image_url} 
                                                bg="gray.1" 
                                                radius={7} 
                                                w={50} 
                                                h={50} 
                                                alt={venue.name}
                                            />
                                        )}
                                    </Flex>
                                    <Stack gap={0}>
                                        <Text size="sm" c="gray">Lokasi</Text>
                                        <Text>{venue?.location || '-'}</Text>
                                    </Stack>
                                    <Flex gap={10} className="[&>*]:!flex-grow" wrap="wrap">
                                        <Stack gap={0}>
                                            <Text size="sm" c="gray">Maks. Kapasitas</Text>
                                            <Text><NumberFormatter value={venue?.max_capacity || 0} /></Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text size="sm" c="gray">Jumlah Kursi</Text>
                                            <Text><NumberFormatter value={venue?.seat_capacity || 0} /></Text>
                                        </Stack>
                                    </Flex>
                                    <Flex justify="space-between" gap={20} align="center">
                                        <Stack gap={0}>
                                            <Text size="sm" c="gray">Tanggal Booking</Text>
                                            {!onEditDate ? (
                                                <Text>
                                                    {fv?.start_date && fv?.end_date 
                                                        ? `${moment(fv.start_date).format('DD MMM YYYY')} - ${moment(fv.end_date).format('DD MMM YYYY')}`
                                                        : '-'
                                                    }
                                                </Text>
                                            ) : (
                                                <Flex gap={10} mt={5} wrap="wrap">
                                                    <DateInput
                                                        minDate={new Date()}
                                                        maxDate={fv?.end_date ? new Date(fv.end_date) : undefined}
                                                        value={fv?.start_date ? new Date(fv.start_date) : undefined}
                                                        onChange={e => setFormValues({ start_date: e ? moment(e).format('YYYY-MM-DD') : '' })}
                                                        valueFormat="DD MMMM YYYY"
                                                        placeholder="Dari Tanggal"
                                                        clearable
                                                    />
                                                    <DateInput
                                                        minDate={fv?.start_date ? new Date(fv.start_date) : undefined}
                                                        value={fv?.end_date ? new Date(fv.end_date) : undefined}
                                                        onChange={e => setFormValues({ end_date: e ? moment(e).format('YYYY-MM-DD') : '' })}
                                                        valueFormat="DD MMMM YYYY"
                                                        placeholder="Sampai Tanggal"
                                                        clearable
                                                    />
                                                </Flex>
                                            )}
                                        </Stack>
                                        <Button onClick={() => setOnEditDate(!onEditDate)} variant="transparent" color="#194e9e">
                                            {onEditDate ? 'Simpan' : 'Edit'}
                                        </Button>
                                    </Flex>
                                </Stack>
                            </DropdownComponent>

                            <DropdownComponent title="Opsi Pembayaran" icon="hugeicons:money-04" defaultOpened>
                                <Stack>
                                    <Flex component="label" justify="space-between" align="center" gap={15} className="cursor-pointer">
                                        <Stack gap={0}>
                                            <Text>Pembayaran Penuh</Text>
                                            <Text maw={400} c="gray">
                                                Bayar Total (<NumberFormatter value={Math.round(venue?.starting_price ?? 0)} />) sekarang.
                                            </Text>
                                        </Stack>
                                        <Checkbox 
                                            checked={paymentOption == 'all'} 
                                            onChange={() => setPaymentOption('all')}
                                        />
                                    </Flex>
                                    
                                    {(venue?.minimum_price ?? 0) > 0 && (
                                        <>
                                            <Divider />
                                            <Flex component="label" justify="space-between" align="center" gap={15} className="cursor-pointer">
                                                <Stack gap={0}>
                                                    <Text>Bayar Sebagian</Text>
                                                    <Text maw={400} c="gray">
                                                        Bayar sebagian (<NumberFormatter value={Math.round(venue?.minimum_price ?? 0)} />) sekarang. 
                                                        Lakukan pelunasan sebelum tanggal {moment(orderData?.date_start).format('DD MMMM YYYY')}.
                                                    </Text>
                                                </Stack>
                                                <Checkbox 
                                                    checked={paymentOption == 'divide'} 
                                                    onChange={() => setPaymentOption('divide')}
                                                />
                                            </Flex>
                                        </>
                                    )}
                                </Stack>
                            </DropdownComponent>
                        </Stack>

                        <Stack gap={10} className="!flex-grow md:!max-w-[400px]">
                            <Card withBorder radius={10} p={20}>
                                <Stack gap={20}>
                                    <Flex gap={10} align="center">
                                        <Icon icon="lucide:info" className="text-primary-base text-[20px]"/>
                                        <Text fw={600}>Detail Pembayaran</Text>
                                    </Flex>

                                    <Stack>
                                        {orderSummary.array.map(([label, value], i) => (
                                            <Flex justify="space-between" key={i}>
                                                <Text fw={label === "Total Pembayaran" ? 600 : 400}>{label}</Text>
                                                <Text fw={label === "Total Pembayaran" ? 600 : 400}>
                                                    <NumberFormatter value={value} />
                                                </Text>
                                            </Flex>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Card>
                        </Stack>
                    </Flex>
                </Stack>

                <Card pos="fixed" className="bottom-0 left-0 w-[100vw] border-t !border-primary-light" py={10} withBorder>
                    <Container size="lg" w="100%">
                        <Flex justify="end" w="100%">
                            <Button
                                loading={loading.includes('submit')}
                                onClick={handleCheckout}
                                className="uppercase"
                                color="#194E9E"
                                rightSection={<Icon icon="uiw:check" />}
                                radius="xl">
                                Proses Pembayaran
                            </Button>
                        </Flex>
                    </Container>
                </Card>
            </Container>
        </div>
    );
}

const DropdownComponent = ({ defaultOpened, children, title, icon }: PropsWithChildren<{ defaultOpened?: boolean, title: string, icon: string }>) => {
    const [opened, setOpened] = useState<boolean>(defaultOpened ?? false);

    return (
        <Card bg="white" radius={10} withBorder>
            <Stack>
                <Flex justify="space-between" align="center" gap={20} onClick={() => setOpened(!opened)} className="cursor-pointer">
                    <Flex align="center" gap={10}>
                        <Icon icon={icon} className="text-[20px] text-[#194E9E]" />
                        <Text>{title}</Text>
                    </Flex>

                    <ActionIcon variant="transparent" c="gray">
                        <Icon icon="uiw:down" className={`transition-transform ${opened ? 'rotate-180' : ''}`}/>
                    </ActionIcon>
                </Flex>

                {opened && (
                    <Stack p={5}>
                        <Divider />
                        {children}
                    </Stack>
                )}
            </Stack>
        </Card>
    );
};