// // pages/tracking/index.tsx
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faQrcode,
//   faKeyboard,
//   faSpinner,
//   faTruck,
//   faMapMarkerAlt,
//   faPhone,
//   faUser,
//   faBox
// } from '@fortawesome/free-solid-svg-icons';
// import { Icon } from "@iconify/react/dist/iconify.js";
// import {
//   Container,
//   Card,
//   Stack,
//   Flex,
//   Text,
//   Title,
//   Timeline,
//   ThemeIcon,
//   Badge,
//   Divider,
//   Image,
//   NumberFormatter,
//   Button,
//   Box,
//   Alert,
//   Loader,
//   Grid,
//   ScrollArea,
//   AspectRatio,
//   Group
// } from "@mantine/core";
// import QrScannerTracking from '@/components/QrScannerTracking';
// import { Get } from '@/utils/REST';
// import Cookies from 'js-cookie';

// // Interfaces berdasarkan response
// interface TrackingManifest {
//   id: number;
//   tracking_status_id: number;
//   order_id: number;
//   order_courier_id: number;
//   tracking_number: string;
//   status_name: string;
//   description: string;
//   location: string;
//   image: string | null;
//   courier_time: string | null;
//   pic_name: string;
//   created_by: string | null;
//   created_at: string;
//   deleted_at: string | null;
//   tracking_status: {
//     id: number;
//     status_delivery: string;
//     description: string;
//     active_status: number;
//     updated_at: string | null;
//     deleted_at: string | null;
//   };
// }

// interface TrackingAddress {
//   id: number;
//   order_id: number;
//   is_main_address: number;
//   province_id: number;
//   city_id: number;
//   address_detail: string;
//   address_name: string | null;
//   zipcode: number;
//   latitude: string;
//   longitude: string;
//   nama_penerima: string;
//   phone: string;
//   is_active: number;
// }

// interface TrackingCourier {
//   id: number;
//   order_id: number;
//   main: string;
//   type: string;
//   price: string;
//   courier_company: string;
//   courier_type: string;
//   courier_service: string | null;
//   etd: string;
//   etd_time: string | null;
//   tracking_number: string | null;
//   delivery_id: string;
// }

// interface TrackingDetail {
//   id: number;
//   order_product_id: number;
//   product_id: number;
//   store_location_id: number | null;
//   creator_id: number | null;
//   product_varian_id: number | null;
//   qty: number;
//   price: string;
//   order_notes: string | null;
//   product_images: Array<{
//     id: number;
//     product_id: number;
//     image: string;
//     image_url: string;
//   }>;
//   product: {
//     id: number;
//     product_name: string;
//     price: string;
//     store_location_id: number;
//     average_star: string;
//     total_review: number;
//     total_sold: number;
//     images: Array<{
//       id: number;
//       product_id: number;
//       image: string;
//       image_url: string;
//     }>;
//   };
//   variant: null;
// }

// interface TrackingData {
//   id: number;
//   store_location_id: number;
//   invoice_no: string;
//   user_id: string;
//   total_qty: number;
//   total_price: number;
//   delivery_price: number;
//   grandtotal: number;
//   admin_fee: number;
//   ppn: null;
//   payment_method_id: number;
//   payment_method: string;
//   transaction_status_id: number;
//   payment_status: string;
//   payment_channel_id: string;
//   xendit_url: string;
//   admin_fee_plus: null;
//   created_by: null;
//   updated_by: null;
//   created_at: string;
//   updated_at: string;
//   deleted_at: null;
//   is_pemesan: null;
//   payment_method_custom: string;
//   payment_date: string;
//   is_microsite: number;
//   microsite_url: string;
//   is_pickup: number;
//   picked_up_at: null;
//   picked_up_by: null;
//   manifest: TrackingManifest[];
//   address: TrackingAddress;
//   courier: TrackingCourier;
//   user: {
//     id: number;
//     name: string;
//     email: string;
//     phone: string | null;
//   };
//   detail: TrackingDetail[];
// }

// interface TrackingEvent {
//   status: string;
//   description: string;
//   time: string;
//   location?: string;
//   isActive?: boolean;
//   isCompleted?: boolean;
// }

// export default function TrackingPage() {
//   const router = useRouter();
//   const [selected, setSelected] = useState<'qr' | 'manual'>('qr');
//   const [step, setStep] = useState(0);
//   const [qrCode, setQrCode] = useState<string>('');
//   const [manualInputValue, setManualInputValue] = useState<string>('');
//   const [isAutoInputActive, setIsAutoInputActive] = useState<boolean>(false);
//   const [isScanning, setIsScanning] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [city, setCity] = useState<{ name: string }>();
//   const [province, setProvince] = useState<{ name: string }>();

//   // Set scanning aktif saat halaman pertama kali dimuat
//   useEffect(() => {
//     setIsScanning(true);
//   }, []);

//   // Handle auto-input dari scanner dengan delay 3 detik
//   useEffect(() => {
//     if (isAutoInputActive) {
//       const timer = setTimeout(() => {
//         setManualInputValue('');
//         setIsAutoInputActive(false);
//       }, 3000);

//       return () => clearTimeout(timer);
//     }
//   }, [isAutoInputActive]);

//   // Get province and city data
//   useEffect(() => {
//     getProvinceCity();
//   }, [trackingData]);

//   const getProvinceCity = async () => {
//     if (!trackingData?.address?.city_id || !trackingData?.address?.province_id) return;

//     try {
//       const authToken = Cookies.get('auth_token') || Cookies.get('token');
//       const config = authToken ? {
//         headers: { 'Authorization': `Bearer ${authToken}` }
//       } : {};

//       const cityRes = await Get(`city/${trackingData.address.city_id}`, config) as any;
//       if (cityRes?.data) {
//         setCity(cityRes.data);
//       }

//       const provinceRes = await Get(`province/${trackingData.address.province_id}`, config) as any;
//       if (provinceRes?.data) {
//         setProvince(provinceRes.data);
//       }
//     } catch (error) {
//       console.error('Error fetching province/city:', error);
//     }
//   };

//   const processTrackingCode = async (code: string) => {
//     try {
//       setLoading(true);
//       setError(null);
//       setIsScanning(false);
      
//       const authToken = Cookies.get('auth_token') || Cookies.get('token');
//       const config = authToken ? {
//         headers: { 'Authorization': `Bearer ${authToken}` }
//       } : {};

//       const response = await Get(`order-product-invoice/${code}`, config) as any;
      
//       if (response?.data) {
//         setTrackingData(response.data);
//         setStep(2);
//       } else {
//         setError('Data tracking tidak ditemukan');
//       }
//     } catch (error: any) {
//       console.error('Tracking error:', error);
//       setError(error?.message || 'Terjadi kesalahan saat melacak pesanan');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleScan = (scannedData: any) => {
//     if (scannedData?.success && scannedData?.data?.invoice_no) {
//       processTrackingCode(scannedData.data.invoice_no);
//     } else if (scannedData?.rawResponse?.invoice_no) {
//       processTrackingCode(scannedData.rawResponse.invoice_no);
//     } else {
//       setError('QR code tidak valid');
//     }
//   };

//   const handleManualSubmit = () => {
//     if (!qrCode.trim() && !manualInputValue.trim()) {
//       setError('Kode tracking tidak boleh kosong');
//       return;
//     }
    
//     const code = selected === 'manual' ? manualInputValue : qrCode;
//     processTrackingCode(code);
//   };

//   const handleScanAgain = () => {
//     setStep(0);
//     setTrackingData(null);
//     setQrCode('');
//     setManualInputValue('');
//     setError(null);
//     setIsAutoInputActive(false);
//     setIsScanning(true);
//   };

//   const formatDate = (dateString?: string): string => {
//     if (!dateString) return "-";

//     const date = new Date(dateString);
//     const hours = date.getHours().toString().padStart(2, "0");
//     const minutes = date.getMinutes().toString().padStart(2, "0");
//     const day = date.getDate().toString().padStart(2, "0");
//     const month = date.getMonth();
//     const year = date.getFullYear();
//     const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

//     return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
//   };

//   const trackingEvents = (): TrackingEvent[] => {
//     const manifestData = trackingData?.manifest;
    
//     if (!manifestData || manifestData.length === 0) {
//       return [];
//     }

//     const sortedManifest = [...manifestData].sort((a, b) => 
//       new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//     );

//     return sortedManifest.map((item, index) => ({
//       status: item.tracking_status?.status_delivery || item.status_name,
//       description: item.description,
//       time: formatDate(item.created_at),
//       location: item.location,
//       isCompleted: true,
//       isActive: index === sortedManifest.length - 1
//     }));
//   };

//   const renderTrackingResult = () => {
//     if (!trackingData) {
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center p-8">
//             <ThemeIcon size={80} radius="xl" color="gray" variant="light" className="mb-4 mx-auto">
//               <Icon icon="mdi:truck-delivery" width={40} />
//             </ThemeIcon>
//             <Text size="xl" fw={600} className="mb-2">Belum Ada Data Tracking</Text>
//             <Text size="sm" c="dimmed" className="max-w-sm">
//               Scan QR code atau masukkan kode tracking di sebelah kiri untuk melihat status pengiriman
//             </Text>
//           </div>
//         </div>
//       );
//     }

//     const events = trackingEvents();
//     const manifestData = trackingData?.manifest;
//     const trackingNumber = manifestData?.[0]?.tracking_number || '-';
//     const estimatedDelivery = trackingData?.courier?.etd || "-";

//     return (
//       <ScrollArea h="calc(100vh - 200px)" className="pr-4">
//         <Stack gap="lg">
//           {/* Header Info */}
//           <Card withBorder radius="md" className="bg-gradient-to-r from-blue-50 to-white">
//             <Flex justify="space-between" align="center" wrap="wrap" gap="md">
//               <Box>
//                 <Text size="xs" c="dimmed">No. Invoice</Text>
//                 <Text fw={700} size="lg">{trackingData.invoice_no}</Text>
//                 <Text size="xs" c="dimmed" mt={4}>
//                   {formatDate(trackingData.created_at)}
//                 </Text>
//               </Box>
//               <Badge 
//                 size="lg" 
//                 color={trackingData.payment_status?.toLowerCase() === 'verified' ? 'green' : 'yellow'}
//               >
//                 {trackingData.payment_status}
//               </Badge>
//             </Flex>
//           </Card>

//           {/* Tracking Info */}
//           {manifestData && manifestData.length > 0 && (
//             <>
//               <Card withBorder radius="md">
//                 <Grid>
//                   <Grid.Col span={6}>
//                     <Text size="xs" c="dimmed">Kode Tracking</Text>
//                     <Text fw={600}>{trackingNumber}</Text>
//                   </Grid.Col>
//                   <Grid.Col span={6}>
//                     <Text size="xs" c="dimmed">Estimasi Tiba</Text>
//                     <Text fw={600}>{estimatedDelivery}</Text>
//                     {trackingData.courier?.etd_time && (
//                       <Text size="xs" c="dimmed">Estimasi jam: {trackingData.courier.etd_time}</Text>
//                     )}
//                   </Grid.Col>
//                 </Grid>
//               </Card>

//               <Card withBorder radius="md">
//                 <Flex align="center" gap="md" wrap="wrap">
//                   <ThemeIcon size="xl" radius="md" color="blue" variant="light">
//                     <Icon icon="mdi:truck-fast" width={24} />
//                   </ThemeIcon>
//                   <Box>
//                     <Text size="sm" c="dimmed">Kurir</Text>
//                     <Text fw={600} className="capitalize">
//                       {trackingData.courier?.main || "-"} - {trackingData.courier?.type || "-"}
//                     </Text>
//                   </Box>
//                 </Flex>
//               </Card>

//               {/* Timeline */}
//               <Card withBorder radius="md">
//                 <Text fw={600} mb="xl" size="lg">Status Pengiriman</Text>
//                 <Timeline active={events.findIndex(t => t.isActive)} bulletSize={24} lineWidth={2}>
//                   {events.map((event, index) => (
//                     <Timeline.Item
//                       key={index}
//                       bullet={
//                         <ThemeIcon
//                           size={24}
//                           radius="xl"
//                           color={event.isCompleted ? 'green' : event.isActive ? 'blue' : 'gray'}
//                           variant={event.isCompleted || event.isActive ? 'filled' : 'light'}
//                         >
//                           <Icon 
//                             icon={
//                               event.isCompleted ? 'mdi:check' : 
//                               event.isActive ? 'mdi:truck' : 
//                               'mdi:circle-outline'
//                             } 
//                             width={14} 
//                           />
//                         </ThemeIcon>
//                       }
//                       title={
//                         <Text fw={600} c={event.isCompleted ? 'green' : event.isActive ? 'blue' : 'dimmed'}>
//                           {event.status}
//                         </Text>
//                       }
//                     >
//                       <Stack gap={4}>
//                         {event.location && (
//                           <Text size="xs" c="dimmed">{event.location}</Text>
//                         )}
//                         <Text size="sm">{event.description}</Text>
//                         <Text size="xs" c="dimmed" mt={4}>{event.time}</Text>
//                       </Stack>
//                     </Timeline.Item>
//                   ))}
//                 </Timeline>
//               </Card>
//             </>
//           )}

//           {/* Detail Pesanan */}
//           <Card withBorder radius="md">
//             <Text fw={600} mb="md" size="lg">Detail Pesanan</Text>
            
//             <Stack gap="md">
//               {trackingData.detail.map((item) => {
//                 const price = parseInt(item.price || "0");
//                 const qty = item.qty || 0;
//                 const totalPrice = price * qty;
                
//                 return (
//                   <Flex key={item.id} gap="md" className="border-b border-gray-100 pb-3 last:border-0">
//                     <Image 
//                       src={item.product?.images?.[0]?.image_url || "/placeholder.png"} 
//                       w={60} 
//                       h={60} 
//                       radius="md"
//                       className="bg-gray-100"
//                     />
//                     <Box style={{ flex: 1 }}>
//                       <Text fw={600}>{item.product?.product_name || "-"}</Text>
//                       <Flex justify="space-between" mt="xs">
//                         <Text size="sm">{qty} x <NumberFormatter value={price} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
//                         <Text fw={600}><NumberFormatter value={totalPrice} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
//                       </Flex>
//                       {item.order_notes && (
//                         <Text size="xs" c="dimmed" fs="italic" mt={2}>
//                           Catatan: {item.order_notes}
//                         </Text>
//                       )}
//                     </Box>
//                   </Flex>
//                 );
//               })}
//             </Stack>

//             <Divider my="md" />

//             {/* Total */}
//             <Stack gap="xs">
//               <Flex justify="space-between">
//                 <Text c="dimmed">Subtotal Produk</Text>
//                 <Text fw={500}><NumberFormatter value={trackingData.total_price || 0} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
//               </Flex>
//               <Flex justify="space-between">
//                 <Text c="dimmed">Biaya Admin</Text>
//                 <Text fw={500}><NumberFormatter value={trackingData.admin_fee || 0} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
//               </Flex>
//               <Flex justify="space-between">
//                 <Text c="dimmed">Biaya Pengiriman</Text>
//                 <Text fw={500}><NumberFormatter value={trackingData.delivery_price || 0} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
//               </Flex>
//               <Divider />
//               <Flex justify="space-between">
//                 <Text fw={700}>Total</Text>
//                 <Text fw={700} c="blue"><NumberFormatter value={trackingData.grandtotal || 0} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
//               </Flex>
//             </Stack>
//           </Card>

//           {/* Alamat Pengiriman */}
//           <Card withBorder radius="md">
//             <Text fw={600} mb="md" size="lg">Alamat Pengiriman</Text>
//             <Stack gap="xs">
//               <Flex align="center" gap="sm">
//                 <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
//                   <Icon icon="mdi:user" width={14} />
//                 </ThemeIcon>
//                 <Text>{trackingData.address.nama_penerima}</Text>
//               </Flex>
//               <Flex align="center" gap="sm">
//                 <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
//                   <Icon icon="mdi:phone" width={14} />
//                 </ThemeIcon>
//                 <Text>{trackingData.address.phone || "-"}</Text>
//               </Flex>
//               <Flex align="center" gap="sm">
//                 <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
//                   <Icon icon="mdi:map-marker" width={14} />
//                 </ThemeIcon>
//                 <Text>
//                   {province?.name || "-"}, {city?.name || "-"}, {trackingData.address.zipcode}
//                   <br />
//                   {trackingData.address.address_detail}
//                 </Text>
//               </Flex>
//             </Stack>
//           </Card>

//           <Button 
//             variant="light" 
//             color="blue" 
//             onClick={handleScanAgain}
//             leftSection={<Icon icon="mdi:refresh" width={18} />}
//             fullWidth
//             size="md"
//           >
//             Scan Lagi
//           </Button>
//         </Stack>
//       </ScrollArea>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 pt-16">
//       <Container size="xl" className="h-full">
//         {/* Header */}
//         <div className="mb-4">
//           <Flex align="center" gap="md">
//             <ThemeIcon size={40} radius="md" color="blue" variant="light">
//               <Icon icon="mdi:truck-fast" width={24} />
//             </ThemeIcon>
//             <Box>
//               <Title order={2} className="!text-2xl font-semibold">Lacak Pesanan</Title>
//               <Text size="sm" c="dimmed">
//                 Scan QR atau masukkan kode tracking untuk melihat status pengiriman
//               </Text>
//             </Box>
//           </Flex>
//         </div>

//         {/* Split Screen Layout */}
//         <Grid gutter="md" className="h-[calc(100vh-180px)]">
//           {/* Left Side - Scanner/Input */}
//           <Grid.Col span={6}>
//             <Card shadow="sm" radius="lg" withBorder className="h-full flex flex-col">
//               <Card.Section withBorder inheritPadding py="md">
//                 <Flex gap="md" justify="center">
//                   <Button
//                     variant={selected === 'qr' ? 'filled' : 'light'}
//                     color="blue"
//                     leftSection={<FontAwesomeIcon icon={faQrcode} />}
//                     onClick={() => {
//                       setSelected('qr');
//                       setStep(0);
//                       setIsScanning(true);
//                       setTrackingData(null);
//                       setError(null);
//                     }}
//                     radius="md"
//                     style={{ flex: 1 }}
//                   >
//                     Scan QR
//                   </Button>
//                   <Button
//                     variant={selected === 'manual' ? 'filled' : 'light'}
//                     color="blue"
//                     leftSection={<FontAwesomeIcon icon={faKeyboard} />}
//                     onClick={() => {
//                       setSelected('manual');
//                       setStep(0);
//                       setIsScanning(false);
//                       setTrackingData(null);
//                       setError(null);
//                     }}
//                     radius="md"
//                     style={{ flex: 1 }}
//                   >
//                     Input Manual
//                   </Button>
//                 </Flex>
//               </Card.Section>

//               <div className="p-4 flex-1">
//                 {selected === 'qr' && (
//                   <div className="h-full flex flex-col">
//                     <div className="flex-1 relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
//                       {/* QrScannerTracking langsung aktif tanpa background */}
//                       <div className="absolute inset-0">
//                         <QrScannerTracking
//                           isOpen={isScanning}
//                           step={step}
//                           setStep={setStep}
//                           setData={handleScan}
//                           scanType="merchandise"
//                         />
//                       </div>
                      
//                       {/* Frame scanner minimalis - hanya 4 corner tipis */}
//                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                         <div className="relative w-64 h-64">
//                           {/* Corner putih tipis */}
//                           <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/80 rounded-tl-2xl"></div>
//                           <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/80 rounded-tr-2xl"></div>
//                           <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/80 rounded-bl-2xl"></div>
//                           <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/80 rounded-br-2xl"></div>
                          
//                           {/* Garis scan animasi - opsional, bisa dihapus jika tidak mau */}
//                           <div className="absolute left-4 right-4 h-0.5 bg-blue-500 animate-scan rounded-full shadow-lg"></div>
//                         </div>
//                       </div>
                      
//                       {/* Teks instruksi di bagian bawah */}
//                       <div className="absolute bottom-4 left-0 right-0 text-center">
//                         <Text size="sm" c="white" className="bg-black/50 py-1 px-3 inline-block rounded-full">
//                           Arahkan kamera ke QR code
//                         </Text>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {selected === 'manual' && (
//                   <div className="border rounded-xl bg-gray-50 p-6 max-w-md mx-auto">
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Kode Tracking
//                         </label>
//                         <input
//                           type="text"
//                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                           placeholder="Contoh: INV/202403/12345"
//                           value={isAutoInputActive ? manualInputValue : qrCode}
//                           onChange={(e) => setQrCode(e.target.value)}
//                           onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
//                           disabled={isAutoInputActive}
//                           readOnly={isAutoInputActive}
//                         />
//                         {isAutoInputActive && (
//                           <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
//                             <FontAwesomeIcon icon={faSpinner} spin />
//                             Memproses kode...
//                           </p>
//                         )}
//                       </div>
//                       <button
//                         onClick={handleManualSubmit}
//                         disabled={(!qrCode.trim() && !manualInputValue.trim()) || isAutoInputActive || loading}
//                         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         {loading ? 'Memproses...' : 'Lacak Pesanan'}
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Error Message */}
//                 {error && (
//                   <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <div className="flex items-center gap-2 text-red-700">
//                       <Icon icon="mdi:alert-circle" width={18} />
//                       <span className="text-sm font-medium">{error}</span>
//                     </div>
//                   </div>
//                 )}

//                 {/* Loading State */}
//                 {loading && (
//                   <div className="flex justify-center py-8">
//                     <Loader size="md" />
//                   </div>
//                 )}
//               </div>
//             </Card>
//           </Grid.Col>

//           {/* Right Side - Tracking Result */}
//           <Grid.Col span={6}>
//             <Card shadow="sm" radius="lg" withBorder className="h-full flex flex-col">
//               <Card.Section withBorder inheritPadding py="md">
//                 <Flex align="center" gap="sm">
//                   <ThemeIcon size="md" radius="xl" color="blue" variant="light">
//                     <Icon icon="mdi:truck-delivery" width={16} />
//                   </ThemeIcon>
//                   <Text fw={600}>Status Pengiriman</Text>
//                 </Flex>
//               </Card.Section>

//               <div className="p-4 flex-1">
//                 {renderTrackingResult()}
//               </div>
//             </Card>
//           </Grid.Col>
//         </Grid>
//       </Container>

//       <style jsx>{`
//         @keyframes scan {
//           0%, 100% {
//             top: 0%;
//           }
//           50% {
//             top: 100%;
//           }
//         }
//         .animate-scan {
//           animation: scan 2s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

// pages/tracking/index.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQrcode,
  faKeyboard,
  faSpinner,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Container,
  Card,
  Stack,
  Flex,
  Text,
  Title,
  Timeline,
  ThemeIcon,
  Badge,
  Divider,
  Image,
  NumberFormatter,
  Button,
  Box,
  Grid,
  ScrollArea,
  Transition
} from "@mantine/core";
import { useMediaQuery } from '@mantine/hooks';
import QrScannerTracking from '@/components/QrScannerTracking';
import { Get, Post } from '@/utils/REST';

// Interfaces (sama seperti sebelumnya)
interface TrackingManifest {
  id: number;
  tracking_status_id: number;
  order_id: number;
  order_courier_id: number;
  tracking_number: string;
  status_name: string;
  description: string;
  location: string;
  image: string | null;
  courier_time: string | null;
  pic_name: string;
  created_by: string | null;
  created_at: string;
  deleted_at: string | null;
  tracking_status: {
    id: number;
    status_delivery: string;
    description: string;
    active_status: number;
    updated_at: string | null;
    deleted_at: string | null;
  };
}

interface TrackingAddress {
  id: number;
  order_id: number;
  is_main_address: number;
  province_id: number;
  city_id: number;
  address_detail: string;
  address_name: string | null;
  zipcode: number;
  latitude: string;
  longitude: string;
  nama_penerima: string;
  phone: string;
  is_active: number;
}

interface TrackingCourier {
  id: number;
  order_id: number;
  main: string;
  type: string;
  price: string;
  courier_company: string;
  courier_type: string;
  courier_service: string | null;
  etd: string;
  etd_time: string | null;
  tracking_number: string | null;
  delivery_id: string;
}

interface TrackingDetail {
  id: number;
  order_product_id: number;
  product_id: number;
  store_location_id: number | null;
  creator_id: number | null;
  product_varian_id: number | null;
  qty: number;
  price: string;
  order_notes: string | null;
  product_images: Array<{
    id: number;
    product_id: number;
    image: string;
    image_url: string;
  }>;
  product: {
    id: number;
    product_name: string;
    price: string;
    store_location_id: number;
    average_star: string;
    total_review: number;
    total_sold: number;
    images: Array<{
      id: number;
      product_id: number;
      image: string;
      image_url: string;
    }>;
  };
  variant: null;
}

interface TrackingData {
  id: number;
  store_location_id: number;
  invoice_no: string;
  user_id: string;
  total_qty: number;
  total_price: number;
  delivery_price: number;
  grandtotal: number;
  admin_fee: number;
  ppn: null;
  payment_method_id: number;
  payment_method: string;
  transaction_status_id: number;
  payment_status: string;
  payment_channel_id: string;
  xendit_url: string;
  admin_fee_plus: null;
  created_by: null;
  updated_by: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  is_pemesan: null;
  payment_method_custom: string;
  payment_date: string;
  is_microsite: number;
  microsite_url: string;
  is_pickup: number;
  picked_up_at: null;
  picked_up_by: null;
  manifest: TrackingManifest[];
  address: TrackingAddress;
  courier: TrackingCourier;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  detail: TrackingDetail[];
}

export default function TrackingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'qr' | 'manual'>('qr');
  const [step, setStep] = useState(0);
  const [manualInputValue, setManualInputValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<{ name: string }>();
  const [province, setProvince] = useState<{ name: string }>();
  const [showScanSuccess, setShowScanSuccess] = useState(false);
  const [scannedInvoice, setScannedInvoice] = useState<string>('');
  
  // Ref untuk mencegah multiple triggers
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const hasShownSuccessRef = useRef<boolean>(false);
  
  // Media query untuk deteksi mobile (max-width: 768px)
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Get province and city data
  useEffect(() => {
    getProvinceCity();
  }, [trackingData]);

  const getProvinceCity = async () => {
    if (!trackingData?.address?.city_id || !trackingData?.address?.province_id) return;

    try {
      const cityRes = await Get(`city/${trackingData.address.city_id}`, {}) as any;
      if (cityRes?.data) {
        setCity(cityRes.data);
      }

      const provinceRes = await Get(`province/${trackingData.address.province_id}`, {}) as any;
      if (provinceRes?.data) {
        setProvince(provinceRes.data);
      }
    } catch (error) {
      console.error('Error fetching province/city:', error);
    }
  };

  const showSuccessNotification = useCallback((invoice: string) => {
    // Cegah multiple notification
    if (hasShownSuccessRef.current) {
      console.log('Notification already shown, skipping...');
      return;
    }

    // Clear timeout sebelumnya jika ada
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    console.log('Showing success notification for:', invoice);
    hasShownSuccessRef.current = true;
    setScannedInvoice(invoice);
    setShowScanSuccess(true);
    
    // Set timeout untuk menghilangkan notifikasi setelah 1 detik
    successTimeoutRef.current = setTimeout(() => {
      console.log('Hiding success notification');
      setShowScanSuccess(false);
      successTimeoutRef.current = null;
      
      // Reset flag setelah notifikasi hilang
      setTimeout(() => {
        hasShownSuccessRef.current = false;
      }, 500);
    }, 1000);
  }, []);

  const processTrackingCode = async (code: string) => {
    // Prevent multiple simultaneous requests
    if (isProcessingRef.current) {
      console.log('Already processing, skipping...');
      return;
    }
    
    try {
      isProcessingRef.current = true;
      setLoading(true);
      setError(null);
      
      const response = await Post('tracking/order/', { 
        invoice_no: code,
        qr_code: code 
      }) as any;
      
      console.log('Tracking response:', response);
      
      if (response?.data) {
        setTrackingData(response.data);
        setStep(2);
        
        // Tampilkan notifikasi sukses scan (hanya sekali)
        showSuccessNotification(response.data.invoice_no || code);
        
      } else if (response?.success && response?.data) {
        setTrackingData(response.data);
        setStep(2);
        
        // Tampilkan notifikasi sukses scan (hanya sekali)
        showSuccessNotification(response.data.invoice_no || code);
        
      } else if (response?.invoice_no) {
        setTrackingData(response as TrackingData);
        setStep(2);
        
        // Tampilkan notifikasi sukses scan (hanya sekali)
        showSuccessNotification(response.invoice_no || code);
        
      } else {
        setError('Data tracking tidak ditemukan');
      }
    } catch (error: any) {
      console.error('Tracking error:', error);
      setError(error?.message || 'Terjadi kesalahan saat melacak pesanan');
    } finally {
      setLoading(false);
      
      // Beri jeda sebelum mengizinkan request baru
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  };

  const handleScan = useCallback((scannedData: any) => {
    console.log('Scan result received:', scannedData);
    
    // Cegah multiple scan dalam waktu dekat
    if (isProcessingRef.current) {
      console.log('Already processing a scan, ignoring...');
      return;
    }
    
    // Cegah jika sudah menunjukkan notifikasi baru-baru ini
    if (hasShownSuccessRef.current) {
      console.log('Success notification recently shown, ignoring...');
      return;
    }
    
    let invoiceNo = null;
    
    if (scannedData?.success && scannedData?.data?.invoice_no) {
      invoiceNo = scannedData.data.invoice_no;
    } else if (scannedData?.rawResponse?.data?.invoice_no) {
      invoiceNo = scannedData.rawResponse.data.invoice_no;
    } else if (scannedData?.rawResponse?.invoice_no) {
      invoiceNo = scannedData.rawResponse.invoice_no;
    } else if (scannedData?.data?.invoice_no) {
      invoiceNo = scannedData.data.invoice_no;
    }
    
    if (invoiceNo) {
      processTrackingCode(invoiceNo);
    } else {
      setError('QR code tidak valid');
    }
  }, []);

  const handleManualSubmit = () => {
    if (!manualInputValue.trim()) {
      setError('Kode tracking tidak boleh kosong');
      return;
    }
    
    processTrackingCode(manualInputValue);
  };

  const handleScanAgain = () => {
    console.log('Scan again clicked');
    
    setStep(0);
    setTrackingData(null);
    setManualInputValue('');
    setError(null);
    setShowScanSuccess(false);
    
    // Reset semua refs
    isProcessingRef.current = false;
    hasShownSuccessRef.current = false;
    
    // Clear timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  };

  const handleModeChange = (mode: 'qr' | 'manual') => {
    console.log('Mode changed to:', mode);
    
    setSelected(mode);
    setStep(0);
    setTrackingData(null);
    setError(null);
    setShowScanSuccess(false);
    
    // Reset semua refs
    isProcessingRef.current = false;
    hasShownSuccessRef.current = false;
    
    // Clear timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
  };

  const formatEtd = (etd: string): string => {
    if (!etd) return "-";
    // Convert "2-3" to "2 - 3 Hari"
    return etd.replace(/-/g, ' - ') + ' Hari';
  };

  const renderTrackingResult = () => {
    if (!trackingData) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-8 px-4">
          <ThemeIcon size={60} radius="xl" color="gray" variant="light" className="mb-3">
            <Icon icon="mdi:truck-delivery" width={30} />
          </ThemeIcon>
          <Text fw={500} className="mb-1">Belum Ada Data Tracking</Text>
          <Text size="sm" c="dimmed" className="text-center">
            Scan QR code atau masukkan kode tracking untuk melihat status pengiriman
          </Text>
        </div>
      );
    }

    const manifestData = trackingData?.manifest || [];
    const sortedManifest = [...manifestData].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const trackingNumber = manifestData?.[0]?.tracking_number || '-';
    const estimatedDelivery = formatEtd(trackingData?.courier?.etd || "-");
    const courierName = trackingData.courier?.main || "-";
    const courierType = trackingData.courier?.type || "-";

    return (
      <ScrollArea h="100%" type="always" offsetScrollbars className="pr-2">
        <Stack gap="md" pb="md">
          {/* Header Info - No. Invoice */}
          <Card withBorder radius="md" className="bg-gradient-to-r from-blue-50 to-white">
            <Flex justify="space-between" align="center" wrap="wrap" gap="sm">
              <Box>
                <Text size="xs" c="dimmed">No. Invoice</Text>
                <Text fw={700} size="md" className="font-mono">{trackingData.invoice_no}</Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {formatDate(trackingData.created_at)}
                </Text>
              </Box>
              <Badge 
                size="md" 
                color={trackingData.payment_status?.toLowerCase() === 'verified' ? 'green' : 'yellow'}
              >
                {trackingData.payment_status || 'Pending'}
              </Badge>
            </Flex>
          </Card>

          {/* Tracking Info - Kode Tracking & Estimasi */}
          {manifestData.length > 0 && (
            <Card withBorder radius="md">
              <Grid gutter="md">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Kode Tracking</Text>
                  <Text fw={600} size="sm" className="font-mono">{trackingNumber}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Estimasi</Text>
                  <Text fw={600} size="sm">{estimatedDelivery}</Text>
                  {trackingData.courier?.etd_time && (
                    <Text size="xs" c="dimmed">{trackingData.courier.etd_time}</Text>
                  )}
                </Grid.Col>
              </Grid>
            </Card>
          )}

          {/* Courier Info */}
          {manifestData.length > 0 && (
            <Card withBorder radius="md">
              <Flex align="center" gap="sm">
                <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                  <Icon icon="mdi:truck-fast" width={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed">Kurir</Text>
                  <Text fw={600} size="sm" className="capitalize">
                    {courierName} - {courierType}
                  </Text>
                </Box>
              </Flex>
            </Card>
          )}

          {/* Timeline Status Pengiriman */}
          {sortedManifest.length > 0 && (
            <Card withBorder radius="md">
              <Text fw={600} mb="md" size="md">Status Pengiriman</Text>
              <Timeline bulletSize={24} lineWidth={2} color="green">
                {sortedManifest.map((item, index) => (
                  <Timeline.Item
                    key={index}
                    bullet={
                      <ThemeIcon
                        size={24}
                        radius="xl"
                        color="green"
                        variant="filled"
                      >
                        <Icon icon="mdi:check" width={14} />
                      </ThemeIcon>
                    }
                    title={
                      <Text fw={600} size="sm" c="green">
                        {item.tracking_status?.status_delivery || item.status_name}
                      </Text>
                    }
                  >
                    <Stack gap={2}>
                      {item.location && (
                        <Text size="xs" c="dimmed">{item.location}</Text>
                      )}
                      <Text size="sm">{item.description}</Text>
                      <Text size="xs" c="dimmed" mt={2}>{formatDate(item.created_at)}</Text>
                    </Stack>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          )}

          {/* Detail Pesanan */}
          <Card withBorder radius="md">
            <Text fw={600} mb="md" size="md">Detail Pesanan</Text>
            
            <Stack gap="md">
              {trackingData.detail.map((item) => {
                const price = parseInt(item.price || "0");
                const qty = item.qty || 0;
                const totalPrice = price * qty;
                
                return (
                  <Flex key={item.id} gap="sm" className="border-b border-gray-100 pb-3 last:border-0">
                    <Image 
                      src={item.product?.images?.[0]?.image_url || "/placeholder.png"} 
                      w={60} 
                      h={60} 
                      radius="md"
                      className="bg-gray-100 object-cover"
                    />
                    <Box style={{ flex: 1 }}>
                      <Text fw={600} size="sm" lineClamp={2}>{item.product?.product_name || "-"}</Text>
                      <Flex justify="space-between" align="center" mt={2}>
                        <Text size="sm" c="dimmed">{qty} x <NumberFormatter value={price} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
                        <Text fw={600} size="md" c="dark"><NumberFormatter value={totalPrice} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
                      </Flex>
                    </Box>
                  </Flex>
                );
              })}
            </Stack>

            <Divider my="md" />

            {/* Total */}
            <Stack gap="xs">
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">Subtotal Produk</Text>
                <Text size="sm" fw={500}><NumberFormatter value={trackingData.total_price || 0} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
              </Flex>
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">Biaya Admin</Text>
                <Text size="sm" fw={500}><NumberFormatter value={trackingData.admin_fee || 0} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
              </Flex>
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">Biaya Pengiriman</Text>
                <Text size="sm" fw={500}><NumberFormatter value={trackingData.delivery_price || 0} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
              </Flex>
              <Divider />
              <Flex justify="space-between">
                <Text fw={700} size="lg">Total</Text>
                <Text fw={700} size="lg" c="blue"><NumberFormatter value={trackingData.grandtotal || 0} thousandSeparator="." decimalSeparator="," prefix="Rp " /></Text>
              </Flex>
            </Stack>
          </Card>

          {/* Alamat Pengiriman */}
          <Card withBorder radius="md">
            <Text fw={600} mb="md" size="md">Alamat Pengiriman</Text>
            <Stack gap="xs">
              <Flex align="center" gap="sm">
                <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                  <Icon icon="mdi:user" width={12} />
                </ThemeIcon>
                <Text size="sm">{trackingData.address.nama_penerima}</Text>
              </Flex>
              <Flex align="center" gap="sm">
                <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                  <Icon icon="mdi:phone" width={12} />
                </ThemeIcon>
                <Text size="sm">{trackingData.address.phone || "-"}</Text>
              </Flex>
              <Flex align="center" gap="sm">
                <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                  <Icon icon="mdi:map-marker" width={12} />
                </ThemeIcon>
                <Text size="sm">
                  {province?.name || "-"}, {city?.name || "-"}, {trackingData.address.zipcode}
                  <br />
                  {trackingData.address.address_detail}
                </Text>
              </Flex>
            </Stack>
          </Card>

          <Button 
            variant="light" 
            color="blue" 
            onClick={handleScanAgain}
            leftSection={<Icon icon="mdi:refresh" width={16} />}
            fullWidth
            size="md"
          >
            Scan Lagi
          </Button>
        </Stack>
      </ScrollArea>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container size="xl" className="px-4 pt-20 pb-4 h-[calc(100vh-80px)]">
        {/* Header */}
        <Flex align="center" gap="sm" className="mb-6">
          <ThemeIcon size={40} radius="md" color="blue" variant="light">
            <Icon icon="mdi:truck-fast" width={24} />
          </ThemeIcon>
          <Box>
            <Title order={2} className="!text-2xl font-semibold">Lacak Pesanan</Title>
            <Text size="sm" c="dimmed">
              Scan QR atau masukkan kode tracking untuk melihat status pengiriman
            </Text>
          </Box>
        </Flex>

        {/* Conditional Layout: Desktop 50-50, Mobile Stack */}
        {isMobile ? (
          /* Mobile Layout: Scanner di atas, Result di bawah */
          <Stack gap="md" className="h-full">
            {/* Scanner Section */}
            <Card shadow="sm" radius="lg" withBorder className="w-full flex-shrink-0">
              {/* Toggle Buttons */}
              <Flex gap="xs" className="mb-3">
                <Button
                  variant={selected === 'qr' ? 'filled' : 'light'}
                  color="blue"
                  size="sm"
                  leftSection={<FontAwesomeIcon icon={faQrcode} />}
                  onClick={() => handleModeChange('qr')}
                  style={{ flex: 1 }}
                  radius="md"
                >
                  Scan QR
                </Button>
                <Button
                  variant={selected === 'manual' ? 'filled' : 'light'}
                  color="blue"
                  size="sm"
                  leftSection={<FontAwesomeIcon icon={faKeyboard} />}
                  onClick={() => handleModeChange('manual')}
                  style={{ flex: 1 }}
                  radius="md"
                >
                  Manual
                </Button>
              </Flex>

              {/* Scanner / Input Content */}
              {selected === 'qr' && (
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '200px' }}>
                  <div className="absolute inset-0">
                    <QrScannerTracking
                      isOpen={selected === 'qr'} // Langsung berdasarkan selected, bukan state terpisah
                      step={step}
                      setStep={setStep}
                      setData={handleScan}
                      scanType="merchandise"
                    />
                  </div>
                  
                  {/* Scanner Frame */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-40 h-40">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-xl"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-xl"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-xl"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-xl"></div>
                      <div className="absolute left-4 right-4 h-0.5 bg-blue-500 animate-scan rounded-full shadow-lg"></div>
                    </div>
                  </div>
                  
                  {/* Success Notification di ATAS area scanner */}
                  <Transition mounted={showScanSuccess} transition="slide-down" duration={300}>
                    {(styles) => (
                      <div style={styles} className="absolute top-0 left-0 right-0 z-20">
                        <div className="bg-green-500 text-white py-2 px-3 flex items-center gap-2 shadow-lg">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm" />
                          </div>
                          <Text size="sm" fw={500} className="text-white truncate">
                            Berhasil Scan: {scannedInvoice}
                          </Text>
                        </div>
                      </div>
                    )}
                  </Transition>
                  
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <Text size="xs" c="white" className="bg-black/50 py-1 px-2 inline-block rounded-full">
                      Arahkan ke QR code
                    </Text>
                  </div>
                </div>
              )}

              {selected === 'manual' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        No. Invoice / Kode Tracking
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contoh: INV/202403/12345"
                        value={manualInputValue}
                        onChange={(e) => setManualInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                        disabled={loading}
                      />
                    </div>
                    <button
                      onClick={handleManualSubmit}
                      disabled={!manualInputValue.trim() || loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <FontAwesomeIcon icon={faSpinner} spin />
                          Memproses...
                        </span>
                      ) : (
                        'Lacak Pesanan'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <Icon icon="mdi:alert-circle" width={16} />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Result Section - Scrollable */}
            <Card shadow="sm" radius="lg" withBorder className="w-full flex-1 min-h-0">
              <Flex align="center" gap="xs" className="mb-3">
                <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                  <Icon icon="mdi:truck-delivery" width={12} />
                </ThemeIcon>
                <Text fw={600} size="sm">Status Pengiriman</Text>
              </Flex>

              <div className="h-[calc(100%-40px)]">
                {renderTrackingResult()}
              </div>
            </Card>
          </Stack>
        ) : (
          /* Desktop Layout: 50-50 Split Screen dengan Left Side Fixed, Right Side Scrollable */
          <Grid gutter="md" className="h-full">
            {/* Left Side - Scanner/Input (Fixed, tidak ikut scroll) */}
            <Grid.Col span={6} className="h-full">
              <Card shadow="sm" radius="lg" withBorder className="h-full flex flex-col">
                <Card.Section withBorder inheritPadding py="md">
                  <Flex gap="md" justify="center">
                    <Button
                      variant={selected === 'qr' ? 'filled' : 'light'}
                      color="blue"
                      leftSection={<FontAwesomeIcon icon={faQrcode} />}
                      onClick={() => handleModeChange('qr')}
                      radius="md"
                      style={{ flex: 1 }}
                    >
                      Scan QR
                    </Button>
                    <Button
                      variant={selected === 'manual' ? 'filled' : 'light'}
                      color="blue"
                      leftSection={<FontAwesomeIcon icon={faKeyboard} />}
                      onClick={() => handleModeChange('manual')}
                      radius="md"
                      style={{ flex: 1 }}
                    >
                      Input Manual
                    </Button>
                  </Flex>
                </Card.Section>

                <div className="p-4 flex-1">
                  {selected === 'qr' && (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '350px' }}>
                        <div className="absolute inset-0">
                          <QrScannerTracking
                            isOpen={selected === 'qr'} // Langsung berdasarkan selected, bukan state terpisah
                            step={step}
                            setStep={setStep}
                            setData={handleScan}
                            scanType="merchandise"
                          />
                        </div>
                        
                        {/* Frame scanner minimalis */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative w-56 h-56">
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-white/80 rounded-tl-2xl"></div>
                            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/80 rounded-tr-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/80 rounded-bl-2xl"></div>
                            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-white/80 rounded-br-2xl"></div>
                            <div className="absolute left-4 right-4 h-0.5 bg-blue-500 animate-scan rounded-full shadow-lg"></div>
                          </div>
                        </div>
                        
                        {/* Success Notification di ATAS area scanner untuk desktop */}
                        <Transition mounted={showScanSuccess} transition="slide-down" duration={300}>
                          {(styles) => (
                            <div style={styles} className="absolute top-0 left-0 right-0 z-20">
                              <div className="bg-green-500 text-white py-3 px-4 flex items-center gap-3 shadow-lg">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg" />
                                </div>
                                <Text fw={500} size="md" className="text-white truncate">
                                  Berhasil Scan: {scannedInvoice}
                                </Text>
                              </div>
                            </div>
                          )}
                        </Transition>
                        
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <Text size="sm" c="white" className="bg-black/50 py-1 px-3 inline-block rounded-full">
                            Arahkan kamera ke QR code
                          </Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {selected === 'manual' && (
                    <div className="border rounded-xl bg-gray-50 p-6 max-w-md mx-auto">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            No. Invoice / Kode Tracking
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Contoh: INV/202403/12345"
                            value={manualInputValue}
                            onChange={(e) => setManualInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Masukkan no. invoice atau kode tracking
                          </p>
                        </div>
                        <button
                          onClick={handleManualSubmit}
                          disabled={!manualInputValue.trim() || loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <FontAwesomeIcon icon={faSpinner} spin />
                              Memproses...
                            </span>
                          ) : (
                            'Lacak Pesanan'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <Icon icon="mdi:alert-circle" width={18} />
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Grid.Col>

            {/* Right Side - Tracking Result (Scrollable) */}
            <Grid.Col span={6} className="h-full">
              <Card shadow="sm" radius="lg" withBorder className="h-full flex flex-col">
                <Card.Section withBorder inheritPadding py="md">
                  <Flex align="center" gap="sm">
                    <ThemeIcon size="md" radius="xl" color="blue" variant="light">
                      <Icon icon="mdi:truck-delivery" width={16} />
                    </ThemeIcon>
                    <Text fw={600}>Status Pengiriman</Text>
                  </Flex>
                </Card.Section>

                <div className="p-4 flex-1 min-h-0">
                  {renderTrackingResult()}
                </div>
              </Card>
            </Grid.Col>
          </Grid>
        )}
      </Container>

      <style jsx>{`
        @keyframes scan {
          0%, 100% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}