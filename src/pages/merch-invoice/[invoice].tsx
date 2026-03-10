// import { Icon } from "@iconify/react/dist/iconify.js";
// import { Box, Card, Container, Divider, Flex, Image, NumberFormatter, ScrollArea, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
// import _ from "lodash";
// import Link from "next/link";
// import { InvoiceResponse } from "./type";
// import { useEffect, useMemo, useState } from "react";
// import fetch from "@/utils/fetch";
// import { useListState } from "@mantine/hooks";
// import { useRouter } from "next/router";
// import { City, Province } from "../dashboard/profile/address";

// export default function Invoice() {
//   const [isClient, setIsClient] = useState(false);
//   const [data, setData] = useState<InvoiceResponse>();
//   const [loading, setLoading] = useListState<string>();
//   const router = useRouter();
//   const { invoice } = router.query;
//   const [city, setCity] = useState<City>();
//   const [province, setProvince] = useState<Province>();

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     getData();
//   }, [isClient, invoice]);

//   useEffect(() => {
//     getProvinceCity();
//   }, [data]);

//   const getData = async () => {
//     if (invoice) {
//       await fetch<any, InvoiceResponse>({
//         url: `order-product-invoice/${invoice}`,
//         method: "GET",
//         data: {},
//         before: () => setLoading.append("getdata"),
//         success: ({ data }) => {
//           if (data) {
//             setData(data);
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "getdata"),
//         error: () => {},
//       });
//     }
//   };

//   const getProvinceCity = async () => {
//     if (!data?.address?.city_id || !data?.address?.province_id) return;

//     await fetch<any, City>({
//       url: `city/${data.address.city_id}`,
//       method: "GET",
//       success: ({ data: cityData }) => cityData && setCity(cityData),
//     });

//     await fetch<any, Province>({
//       url: `province/${data.address.province_id}`,
//       method: "GET",
//       success: ({ data: provinceData }) => provinceData && setProvince(provinceData),
//     });
//   };

//   const iconStatus: { [key: string]: string } = {
//     expired: "ooui:alert",
//     pending: "icon-park-solid:time",
//     verified: "uiw:circle-check",
//   };

//   const summaryPrice = useMemo(() => {
//     const admin = 2000;
//     const totalProductPrice = data?.detail.reduce((q, n) => q + (Boolean(n.product_varian_id) ? parseInt(n.variant.price) : parseInt(n.product.price)), 0);
//     const courier = parseInt(data?.courier?.price ?? "0");
//     const ppn = (courier + admin + (totalProductPrice ?? 0)) * 0.11;

//     return { ppn, admin, courier };
//   }, [data]);

//   // Fungsi untuk format date yang konsisten di server dan client
//   const formatDate = (dateString?: string): string => {
//     if (!dateString) return "-";

//     // Gunakan UTC time untuk konsistensi antara server dan client
//     const date = new Date(dateString);

//     // Format manual tanpa toLocaleString untuk menghindari timezone differences
//     const hours = date.getUTCHours().toString().padStart(2, "0");
//     const minutes = date.getUTCMinutes().toString().padStart(2, "0");

//     const day = date.getUTCDate().toString().padStart(2, "0");
//     const month = date.getUTCMonth();
//     const year = date.getUTCFullYear();

//     const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

//     return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
//   };

//   // Tampilkan loading jika masih di server
//   if (!isClient) {
//     return (
//       <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//         <Container px={0} className={`py-[44px] md:py-[100px]`}>
//           <Card p={0} radius={8} className={`!shadow-lg`}>
//             <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//               <Flex justify="center" align="center" h={200}>
//                 <Text>Memuat invoice...</Text>
//               </Flex>
//             </Card>
//           </Card>
//         </Container>
//       </div>
//     );
//   }

//   return (
//     <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//       <Container px={0} className={`py-[44px] md:py-[100px]`}>
//         <Card p={0} radius={8} className={`!shadow-lg`}>
//           <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//             <Stack gap={30}>
//               <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
//                 <Flex gap={15} align="center">
//                   <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
//                   <Stack gap={0}>
//                     <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
//                       Invoice Pesanan
//                     </Title>
//                     <Text size="sm">{invoice}</Text>
//                   </Stack>
//                 </Flex>

//                 <Stack gap={5} className={`items-start md:!items-end`}>
//                   <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
//                     <Flex align="center" gap={10}>
//                       <Text size="sm" c="gray.8">
//                         Status Pembayaran :
//                       </Text>
//                       <Flex gap={5} align="center">
//                         <Icon
//                           icon={iconStatus[data?.payment_status?.toLowerCase() ?? "pending"]}
//                           className={`
//                             text-[18px]
//                             ${data?.payment_status?.toLowerCase() == "expired" && "text-red-400"}
//                             ${data?.payment_status?.toLowerCase() == "pending" && "text-yellow-500"}
//                             ${data?.payment_status?.toLowerCase() == "verified" && "text-green-500"}
//                           `}
//                         />
//                         <Text size="md" fw={400}>
//                           {data?.payment_status?.toLowerCase() == "expired" && <>Expired</>}
//                           {data?.payment_status?.toLowerCase() == "pending" && <>Pending</>}
//                           {data?.payment_status?.toLowerCase() == "verified" && <>Berhasil</>}
//                         </Text>
//                       </Flex>
//                     </Flex>
//                   </Card>
//                 </Stack>
//               </Flex>
//             </Stack>
//           </Card>
//           <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
//               <Stack gap={10}>
//                 <Text fw={600} c="gray.8">
//                   Informasi Pemesan
//                 </Text>
//                 <Card withBorder>
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Nama Pemesan
//                       </Text>
//                       {/* Menggunakan nama penerima untuk nama pemesan */}
//                       <Text size="sm" fw={600}>
//                         {data?.address?.nama_penerima || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Kurir yang Dipilih
//                       </Text>
//                       <Text size="sm" className="capitalize">
//                         {data?.courier?.main || "-"} - {data?.courier?.type || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Tanggal Pesanan Dibuat
//                       </Text>
//                       <Text size="sm" suppressHydrationWarning>
//                         {formatDate(data?.created_at)}
//                       </Text>
//                     </Stack>
//                   </SimpleGrid>
//                 </Card>
//               </Stack>

//               <Stack gap={10} className={`md:max-w-[300px]`}>
//                 <Text fw={600} c="gray.8">
//                   Total Pembayaran
//                 </Text>
//                 <Card bg="gray.1">
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
//                     <Text size="xl" fw={600}>
//                       <NumberFormatter value={data?.grandtotal || 0} />
//                     </Text>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Metode Pembayaran
//                       </Text>
//                       <Text size="sm" className="capitalize">
//                         {data?.payment_method || "-"}
//                       </Text>
//                     </Stack>
//                     {data?.xendit_url && (
//                       <Link href={data.xendit_url} target="_blank">
//                         <Text size="xs" className={`hover:underline !text-primary-base`}>
//                           Buka Halaman Pembayaran
//                         </Text>
//                       </Link>
//                     )}
//                   </SimpleGrid>
//                 </Card>
//               </Stack>
//             </Flex>

//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//               <Stack gap={10}>
//                 <Text fw={600} c="gray.8">
//                   Informasi Pengiriman
//                 </Text>
//                 <Card withBorder>
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Nama Penerima
//                       </Text>
//                       <Text size="sm" fw={600}>
//                         {data?.address?.nama_penerima || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         No. Telp Penerima
//                       </Text>
//                       <Text size="sm">{data?.address?.phone || "-"}</Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300} mb={5}>
//                         Alamat Pengiriman
//                       </Text>
//                       <Text size="xs">
//                         {province?.name || "-"}, {city?.name || "-"}, {data?.address?.zipcode || "-"}
//                       </Text>
//                       <Text size="xs">{data?.address?.address_detail || "-"}</Text>
//                     </Stack>
//                   </SimpleGrid>
//                 </Card>
//               </Stack>
//             </Flex>

//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//               <Stack gap={10} className={`[&_*]:!text-[14px]`}>
//                 <Text fw={600} c="gray.8">
//                   Detail Pesanan
//                 </Text>
//                 <Box maw="calc(100vw - 40px)" className={`overflow-auto`}>
//                   <Table withRowBorders={false} horizontalSpacing="md" miw={600}>
//                     <Table.Thead>
//                       <Table.Tr>
//                         <Table.Th>No</Table.Th>
//                         <Table.Th>Produk</Table.Th>
//                         <Table.Th>Harga</Table.Th>
//                         <Table.Th>QTY</Table.Th>
//                         <Table.Th>Total</Table.Th>
//                       </Table.Tr>
//                     </Table.Thead>
//                     <Table.Tbody>
//                       {data?.detail?.map((e, i) => (
//                         <Table.Tr key={i}>
//                           <Table.Td>{i + 1}</Table.Td>
//                           <Table.Td>
//                             <Flex gap={15} className={`!py-[5px]`}>
//                               <Image src={e.product?.product_image?.[0]?.image_url || "#"} w={48} h={48} bg="gray.1" radius={5} className={`shrink-0`} />
//                               <Stack miw={400} gap={0}>
//                                 <Text>{e.product?.product_name || "-"}</Text>
//                                 {Boolean(e.product_varian_id) && (
//                                   <Text size="sm" c="gray.7">
//                                     Varian: {e.variant?.varian_name || "-"}
//                                   </Text>
//                                 )}
//                               </Stack>
//                             </Flex>
//                           </Table.Td>
//                           <Table.Td>
//                             <NumberFormatter value={parseInt(Boolean(e.product_varian_id) ? e.variant?.price || "0" : e.product?.price || "0")} />
//                           </Table.Td>
//                           <Table.Td>{e.qty || 0}</Table.Td>
//                           <Table.Td>
//                             <NumberFormatter value={parseInt(Boolean(e.product_varian_id) ? e.variant?.price || "0" : e.product?.price || "0") * (e.qty || 0)} />
//                           </Table.Td>
//                         </Table.Tr>
//                       ))}

//                       {/* Summary rows */}
//                       <Table.Tr>
//                         <Table.Td colSpan={3}></Table.Td>
//                         <Table.Td>
//                           <Text>Biaya Admin</Text>
//                         </Table.Td>
//                         <Table.Td>
//                           <Text>
//                             <NumberFormatter value={summaryPrice.admin} />
//                           </Text>
//                         </Table.Td>
//                       </Table.Tr>

//                       <Table.Tr className={`[&_*]:!font-[600]`}>
//                         <Table.Td colSpan={3}></Table.Td>
//                         <Table.Td>Total Pembayaran</Table.Td>
//                         <Table.Td>
//                           <NumberFormatter value={data?.grandtotal || 0} />
//                         </Table.Td>
//                       </Table.Tr>
//                     </Table.Tbody>
//                   </Table>
//                 </Box>
//               </Stack>
//             </Flex>
//           </Stack>
//         </Card>
//       </Container>
//     </div>
//   );
// }

// import { Icon } from "@iconify/react/dist/iconify.js";
// import { Box, Button, Card, Container, Divider, Flex, Image, NumberFormatter, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
// import Link from "next/link";
// import { InvoiceResponse } from "./type";
// import { useEffect, useMemo, useState } from "react";
// import fetch from "@/utils/fetch";
// import { useListState } from "@mantine/hooks";
// import { useRouter } from "next/router";
// import { City, Province } from "../dashboard/profile/address";

// // Definisikan interface Product
// interface Product {
//   id: number;
//   product_name: string;
//   price: string;
//   admin_fee?: string;
//   fee?: string;
//   admin?: string;
//   adminFee?: string;
//   application_fee?: string;
//   service_fee?: string;
//   product_image?: Array<{ id: number; image_url: string }>;
// }

// // Interface untuk response produk dari API dengan pagination
// interface ProductResponse {
//   data: Product[];
//   meta?: {
//     total: number;
//     per_page: number;
//     current_page: number;
//     last_page: number;
//   };
//   current_page?: number;
//   last_page?: number;
//   total?: number;
// }

// export default function Invoice() {
//   const [isClient, setIsClient] = useState(false);
//   const [data, setData] = useState<InvoiceResponse>();
//   const [products, setProducts] = useState<Map<number, Product>>(new Map());
//   const [loading, setLoading] = useListState<string>();
//   const [loadingDownload, setLoadingDownload] = useState(false);
//   const router = useRouter();
//   const { invoice } = router.query;
//   const [city, setCity] = useState<City>();
//   const [province, setProvince] = useState<Province>();

//   // Default admin fee 5000 untuk fallback
//   const DEFAULT_ADMIN_FEE = 5000;
  
//   // State untuk tracking produk yang kena fallback
//   const [fallbackProducts, setFallbackProducts] = useState<Set<number>>(new Set());

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     getData();
//   }, [isClient, invoice]);

//   useEffect(() => {
//     if (data?.detail) {
//       fetchAllProductsPaginated();
//     }
//   }, [data]);

//   useEffect(() => {
//     getProvinceCity();
//   }, [data]);

//   // Hitung fallback products setelah products berubah
//   useEffect(() => {
//     if (data?.detail && products.size > 0) {
//       const newFallbackProducts = new Set<number>();
      
//       data.detail.forEach(item => {
//         const product = products.get(item.product_id);
//         const productAny = product as any;
        
//         // Jika produk tidak ditemukan atau tidak punya admin_fee, masukin ke fallback
//         if (!product || !productAny.admin_fee) {
//           newFallbackProducts.add(item.product_id);
//         }
//       });
      
//       setFallbackProducts(newFallbackProducts);
//       console.log("🎯 Fallback products:", Array.from(newFallbackProducts));
//     }
//   }, [data, products]);

//   const fetchAllProductsPaginated = async () => {
//     try {
//       setLoading.append("fetchProducts");
      
//       const productsMap = new Map<number, Product>();
//       let currentPage = 1;
//       let lastPage = 1;
//       let hasMorePages = true;
      
//       // Dapatkan semua product IDs yang perlu di-fetch
//       const neededProductIds = new Set(data?.detail.map(item => item.product_id) || []);
//       console.log("🔍 Need to fetch products:", Array.from(neededProductIds));
      
//       // Loop untuk mengambil semua halaman
//       while (hasMorePages) {
//         console.log(`📦 Fetching products page ${currentPage}...`);
        
//         await fetch<any, ProductResponse>({
//           url: `product?page=${currentPage}`,
//           method: "GET",
//           success: ({ data: responseData }) => {
//             console.log(`📄 Response page ${currentPage}:`, responseData);
            
//             // Handle berbagai format response
//             let productsData: Product[] = [];
            
//             if (responseData?.data && Array.isArray(responseData.data)) {
//               // Format: { data: [...], meta: { last_page: ... } }
//               productsData = responseData.data;
//               lastPage = responseData.meta?.last_page || responseData.last_page || 1;
              
//               // Update hasMorePages berdasarkan lastPage
//               if (currentPage >= lastPage) {
//                 hasMorePages = false;
//               } else {
//                 currentPage++;
//               }
//             } else if (Array.isArray(responseData)) {
//               // Format: langsung array
//               productsData = responseData;
//               // Jika response adalah array dan kosong, berhenti
//               if (productsData.length === 0) {
//                 hasMorePages = false;
//               } else {
//                 // Coba halaman berikutnya
//                 currentPage++;
//               }
//             } else {
//               // Format tidak dikenal, berhenti
//               hasMorePages = false;
//             }
            
//             // Masukkan semua produk dari halaman ini ke map
//             productsData.forEach((product: Product) => {
//               if (product?.id) {
//                 productsMap.set(product.id, product);
                
//                 // Log jika ini adalah produk yang kita butuhkan
//                 if (neededProductIds.has(product.id)) {
//                   const productAny = product as any;
//                   console.log(`✅ Found needed product ${product.id} on page ${currentPage-1}:`, {
//                     id: product.id,
//                     name: product.product_name,
//                     admin_fee: productAny.admin_fee || 'NOT FOUND'
//                   });
//                 }
//               }
//             });
            
//             console.log(`📊 Page ${currentPage - 1}: Got ${productsData.length} products, total so far: ${productsMap.size}`);
//             console.log(`🔄 Has more pages: ${hasMorePages}, current page: ${currentPage}, last page: ${lastPage}`);
//           },
//           error: (error) => {
//             console.error(`❌ Error fetching page ${currentPage}:`, error);
//             hasMorePages = false;
//           }
//         });
//       }
      
//       setProducts(productsMap);
//       console.log("🎯 Total products fetched:", productsMap.size);
      
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     } finally {
//       setLoading.filter((e) => e != "fetchProducts");
//     }
//   };

//   const getProvinceCity = async () => {
//     if (!data?.address?.city_id || !data?.address?.province_id) return;

//     await fetch<any, City>({
//       url: `city/${data.address.city_id}`,
//       method: "GET",
//       success: ({ data: cityData }) => cityData && setCity(cityData),
//     });

//     await fetch<any, Province>({
//       url: `province/${data.address.province_id}`,
//       method: "GET",
//       success: ({ data: provinceData }) => provinceData && setProvince(provinceData),
//     });
//   };

//   const getData = async () => {
//     if (invoice) {
//       await fetch<any, InvoiceResponse>({
//         url: `order-product-invoice/${invoice}`,
//         method: "GET",
//         data: {},
//         before: () => setLoading.append("getdata"),
//         success: ({ data }) => {
//           if (data) {
//             setData(data);
//             console.log("📋 Invoice Data:", data);
//             console.log("📋 Detail items:", data.detail);
//             console.log("🚚 Courier Data:", data.courier); // Log data kurir
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "getdata"),
//         error: () => {},
//       });
//     }
//   };

//   const handleDownloadInvoice = async () => {
//     if (!invoice) return;
    
//     setLoadingDownload(true);
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_WS_URL;
      
//       if (!apiUrl) {
//         console.error('NEXT_PUBLIC_WS_URL is not defined');
//         return;
//       }

//       const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
//       let downloadUrl;
//       if (baseUrl.endsWith('/api')) {
//         downloadUrl = `${baseUrl}/order-product/download/${invoice}`;
//       } else if (baseUrl.endsWith('/api/')) {
//         downloadUrl = `${baseUrl}order-product/download/${invoice}`;
//       } else {
//         downloadUrl = `${baseUrl}/api/order-product/download/${invoice}`;
//       }
      
//       console.log('Download URL:', downloadUrl);
//       window.open(downloadUrl, '_blank');
//     } catch (error) {
//       console.error('Error downloading invoice:', error);
//     } finally {
//       setLoadingDownload(false);
//     }
//   };

//   const iconStatus: { [key: string]: string } = {
//     expired: "ooui:alert",
//     pending: "icon-park-solid:time",
//     verified: "uiw:circle-check",
//   };

//   // Fungsi pure untuk mendapatkan admin fee
//   const getAdminFeeForItem = (item: any): number => {
//     if (item.product_id && products.has(item.product_id)) {
//       const product = products.get(item.product_id);
//       const productAny = product as any;
      
//       const adminFee = productAny.admin_fee || 
//                        productAny.fee || 
//                        productAny.admin || 
//                        productAny.adminFee ||
//                        productAny.application_fee ||
//                        productAny.service_fee;
      
//       if (adminFee) {
//         const parsedFee = parseInt(adminFee);
//         return isNaN(parsedFee) ? DEFAULT_ADMIN_FEE : parsedFee;
//       }
//     }
    
//     return DEFAULT_ADMIN_FEE;
//   };

//   // Hitung biaya kurir
//   const courierPrice = useMemo(() => {
//     if (data?.courier?.price) {
//       const price = parseInt(data.courier.price);
//       return isNaN(price) ? 0 : price;
//     }
//     return 0;
//   }, [data]);

//   // Hitung total harga produk
//   const totalProductPrice = useMemo(() => {
//     const total = data?.detail.reduce((total, item) => {
//       const price = item.product_varian_id 
//         ? parseInt(item.variant?.price || "0") 
//         : parseInt(item.product?.price || "0");
//       return total + (price * (item.qty || 0));
//     }, 0) || 0;
    
//     return total;
//   }, [data]);

//   // Hitung total admin fee
//   const totalAdminFee = useMemo(() => {
//     const total = data?.detail.reduce((total, item) => {
//       const adminFeePerItem = getAdminFeeForItem(item);
//       return total + (adminFeePerItem * (item.qty || 0));
//     }, 0) || 0;
    
//     return total;
//   }, [data, products]);

//   // Grand total = total produk + total admin fee + biaya kurir
//   const grandTotal = useMemo(() => {
//     return totalProductPrice + totalAdminFee + courierPrice;
//   }, [totalProductPrice, totalAdminFee, courierPrice]);

//   // Dapatkan daftar produk yang kena fallback
//   const fallbackProductsList = useMemo(() => {
//     if (!data?.detail) return [];
//     return data.detail
//       .filter(item => fallbackProducts.has(item.product_id))
//       .map(item => ({
//         id: item.product_id,
//         name: item.product?.product_name || 'Unknown',
//         qty: item.qty || 0
//       }));
//   }, [data, fallbackProducts]);

//   const formatDate = (dateString?: string): string => {
//     if (!dateString) return "-";

//     const date = new Date(dateString);
//     const hours = date.getUTCHours().toString().padStart(2, "0");
//     const minutes = date.getUTCMinutes().toString().padStart(2, "0");
//     const day = date.getUTCDate().toString().padStart(2, "0");
//     const month = date.getUTCMonth();
//     const year = date.getUTCFullYear();
//     const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

//     return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
//   };

//   if (!isClient) {
//     return (
//       <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//         <Container px={0} className={`py-[44px] md:py-[100px]`}>
//           <Card p={0} radius={8} className={`!shadow-lg`}>
//             <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//               <Flex justify="center" align="center" h={200}>
//                 <Text>Memuat invoice...</Text>
//               </Flex>
//             </Card>
//           </Card>
//         </Container>
//       </div>
//     );
//   }

//   return (
//     <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//       <Container px={0} className={`py-[44px] md:py-[100px]`}>
//         <Card p={0} radius={8} className={`!shadow-lg`}>
//           <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//             <Stack gap={30}>
//               <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
//                 <Flex gap={15} align="center">
//                   <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
//                   <Stack gap={0}>
//                     <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
//                       Invoice Pesanan
//                     </Title>
//                     <Text size="sm">{invoice}</Text>
//                   </Stack>
//                 </Flex>

//                 <Stack gap={5} className={`items-start md:!items-end`}>
//                   <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
//                     <Flex align="center" gap={10}>
//                       <Text size="sm" c="gray.8">
//                         Status Pembayaran :
//                       </Text>
//                       <Flex gap={5} align="center">
//                         <Icon
//                           icon={iconStatus[data?.payment_status?.toLowerCase() ?? "pending"]}
//                           className={`
//                             text-[18px]
//                             ${data?.payment_status?.toLowerCase() == "expired" && "text-red-400"}
//                             ${data?.payment_status?.toLowerCase() == "pending" && "text-yellow-500"}
//                             ${data?.payment_status?.toLowerCase() == "verified" && "text-green-500"}
//                           `}
//                         />
//                         <Text size="md" fw={400}>
//                           {data?.payment_status?.toLowerCase() == "expired" && <>Expired</>}
//                           {data?.payment_status?.toLowerCase() == "pending" && <>Pending</>}
//                           {data?.payment_status?.toLowerCase() == "verified" && <>Berhasil</>}
//                         </Text>
//                       </Flex>
//                     </Flex>
//                   </Card>
//                 </Stack>
//               </Flex>
//             </Stack>
//           </Card>
//           <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
//               <Stack gap={10}>
//                 <Text fw={600} c="gray.8">
//                   Informasi Pemesan
//                 </Text>
//                 <Card withBorder>
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Nama Pemesan
//                       </Text>
//                       <Text size="sm" fw={600}>
//                         {data?.address?.nama_penerima || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Kurir yang Dipilih
//                       </Text>
//                       <Text size="sm" className="capitalize">
//                         {data?.courier?.main || "-"} - {data?.courier?.type || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Tanggal Pesanan Dibuat
//                       </Text>
//                       <Text size="sm" suppressHydrationWarning>
//                         {formatDate(data?.created_at)}
//                       </Text>
//                     </Stack>
//                   </SimpleGrid>
//                 </Card>
//               </Stack>

//               <Stack gap={10} className={`md:max-w-[300px]`}>
//                 <Text fw={600} c="gray.8">
//                   Total Pembayaran
//                 </Text>
//                 <Card bg="gray.1">
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
//                     <Text size="xl" fw={600}>
//                       <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," />
//                     </Text>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Metode Pembayaran
//                       </Text>
//                       <Text size="sm" className="capitalize">
//                         {data?.payment_method || "-"}
//                       </Text>
//                     </Stack>
//                     <Button
//                       variant="light"
//                       color="blue"
//                       leftSection={<Icon icon="mdi:file-download-outline" />}
//                       onClick={handleDownloadInvoice}
//                       loading={loadingDownload}
//                       size="sm"
//                       fullWidth
//                       disabled={!invoice}
//                     >
//                       Download Invoice Merch
//                     </Button>
//                     {data?.xendit_url && (
//                       <Link href={data.xendit_url} target="_blank">
//                         <Button
//                           variant="light"
//                           color="green"
//                           leftSection={<Icon icon="mdi:external-link" />}
//                           size="sm"
//                           fullWidth
//                         >
//                           Buka Halaman Pembayaran
//                         </Button>
//                       </Link>
//                     )}
//                   </SimpleGrid>
//                 </Card>
//               </Stack>
//             </Flex>

//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//               <Stack gap={10}>
//                 <Text fw={600} c="gray.8">
//                   Informasi Pengiriman
//                 </Text>
//                 <Card withBorder>
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Nama Penerima
//                       </Text>
//                       <Text size="sm" fw={600}>
//                         {data?.address?.nama_penerima || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         No. Telp Penerima
//                       </Text>
//                       <Text size="sm">{data?.address?.phone || "-"}</Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300} mb={5}>
//                         Alamat Pengiriman
//                       </Text>
//                       <Text size="xs">
//                         {province?.name || "-"}, {city?.name || "-"}, {data?.address?.zipcode || "-"}
//                       </Text>
//                       <Text size="xs">{data?.address?.address_detail || "-"}</Text>
//                     </Stack>
//                   </SimpleGrid>
//                 </Card>
//               </Stack>
//             </Flex>

//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//               <Stack gap={10} className={`[&_*]:!text-[14px]`}>
//                 <Text fw={600} c="gray.8">
//                   Detail Pesanan
//                 </Text>
                
//                 {/* Tampilkan peringatan jika ada produk yang kena fallback */}
//                 {fallbackProductsList.length > 0 && (
//                   <Card withBorder bg="yellow.0" c="yellow.9" p="sm">
//                     <Flex gap="xs" align="center">
//                       <Icon icon="mdi:alert" />
//                       <Box>
//                         <Text fw={600} size="sm">Perhatian: Ada {fallbackProductsList.length} produk menggunakan admin fee default 5000</Text>
//                         <Text size="xs">Produk: {fallbackProductsList.map(p => p.name).join(', ')}</Text>
//                       </Box>
//                     </Flex>
//                   </Card>
//                 )}
                
//                 <Box maw="calc(100vw - 40px)" className={`overflow-auto`}>
//                   <Table withRowBorders={false} horizontalSpacing="md" miw={600}>
//                     <Table.Thead>
//                       <Table.Tr>
//                         <Table.Th>No</Table.Th>
//                         <Table.Th>Produk</Table.Th>
//                         <Table.Th>Qty</Table.Th>
//                         <Table.Th>Harga</Table.Th>
//                       </Table.Tr>
//                     </Table.Thead>
//                     <Table.Tbody>
//                       {data?.detail?.map((e, i) => {
//                         const price = e.product_varian_id 
//                           ? parseInt(e.variant?.price || "0") 
//                           : parseInt(e.product?.price || "0");
                        
//                         const qty = e.qty || 0;
                        
//                         return (
//                           <Table.Tr key={i}>
//                             <Table.Td>{i + 1}</Table.Td>
//                             <Table.Td>
//                               <Flex gap={15} className={`!py-[5px]`}>
//                                 <Image 
//                                   src={e.product?.product_image?.[0]?.image_url || "#"} 
//                                   w={48} 
//                                   h={48} 
//                                   bg="gray.1" 
//                                   radius={5} 
//                                   className={`shrink-0`} 
//                                 />
//                                 <Stack gap={0}>
//                                   <Text>{e.product?.product_name || "-"}</Text>
//                                   {Boolean(e.product_varian_id) && (
//                                     <Text size="sm" c="gray.7">
//                                       Varian: {e.variant?.varian_name || "-"}
//                                     </Text>
//                                   )}
//                                   {/* Menambahkan order_notes di bawah nama produk */}
//                                   {e.order_notes && (
//                                     <Text size="xs" c="dimmed" fs="italic" mt={4}>
//                                       Catatan: {e.order_notes}
//                                     </Text>
//                                   )}
//                                 </Stack>
//                               </Flex>
//                             </Table.Td>
//                             <Table.Td>{qty}</Table.Td>
//                             <Table.Td>
//                               <NumberFormatter value={price} thousandSeparator="." decimalSeparator="," />
//                             </Table.Td>
//                           </Table.Tr>
//                         );
//                       })}
//                     </Table.Tbody>
//                   </Table>
//                 </Box>

//                 {/* Summary Card dengan Biya Kurir */}
//                 <Card withBorder mt="md" bg="gray.0">
//                   <Stack gap="xs">
//                     <Flex justify="space-between">
//                       <Text fw={500}>Subtotal Produk:</Text>
//                       <Text fw={500}>
//                         <NumberFormatter value={totalProductPrice} thousandSeparator="." decimalSeparator="," />
//                       </Text>
//                     </Flex>
//                     <Flex justify="space-between">
//                       <Text fw={500}>Total Admin Fee:</Text>
//                       <Text fw={500}>
//                         <NumberFormatter value={totalAdminFee} thousandSeparator="." decimalSeparator="," />
//                       </Text>
//                     </Flex>
//                     <Flex justify="space-between">
//                       <Text fw={500}>Biaya Pengiriman ({data?.courier?.main || "-"} - {data?.courier?.type || "-"}):</Text>
//                       <Text fw={500}>
//                         <NumberFormatter value={courierPrice} thousandSeparator="." decimalSeparator="," />
//                       </Text>
//                     </Flex>
//                     <Divider my="xs" />
//                     <Flex justify="space-between">
//                       <Text fw={700} size="lg">Total Pembayaran:</Text>
//                       <Text fw={700} size="lg" c="blue">
//                         <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," />
//                       </Text>
//                     </Flex>
//                   </Stack>
//                 </Card>
//               </Stack>
//             </Flex>
//           </Stack>
//         </Card>
//       </Container>
//     </div>
//   );
// }

// import { Icon } from "@iconify/react/dist/iconify.js";
// import { Box, Button, Card, Container, Divider, Flex, Image, Modal, NumberFormatter, SimpleGrid, Stack, Table, Tabs, Text, TextInput, Title, Timeline, Badge, ThemeIcon } from "@mantine/core";
// import Link from "next/link";
// import { InvoiceResponse } from "./type";
// import { useEffect, useMemo, useState } from "react";
// import fetch from "@/utils/fetch";
// import { useListState, useDisclosure } from "@mantine/hooks";
// import { useRouter } from "next/router";
// import { City, Province } from "../dashboard/profile/address";

// // Definisikan interface Product
// interface Product {
//   id: number;
//   product_name: string;
//   price: string;
//   admin_fee?: string;
//   fee?: string;
//   admin?: string;
//   adminFee?: string;
//   application_fee?: string;
//   service_fee?: string;
//   product_image?: Array<{ id: number; image_url: string }>;
// }

// // Interface untuk response produk dari API dengan pagination
// interface ProductResponse {
//   data: Product[];
//   meta?: {
//     total: number;
//     per_page: number;
//     current_page: number;
//     last_page: number;
//   };
//   current_page?: number;
//   last_page?: number;
//   total?: number;
// }

// // Interface untuk tracking data
// interface TrackingEvent {
//   status: string;
//   description: string;
//   time: string;
//   icon?: string;
//   isActive?: boolean;
//   isCompleted?: boolean;
// }

// export default function Invoice() {
//   const [isClient, setIsClient] = useState(false);
//   const [data, setData] = useState<InvoiceResponse>();
//   const [products, setProducts] = useState<Map<number, Product>>(new Map());
//   const [loading, setLoading] = useListState<string>();
//   const [loadingDownload, setLoadingDownload] = useState(false);
//   const router = useRouter();
//   const { invoice } = router.query;
//   const [city, setCity] = useState<City>();
//   const [province, setProvince] = useState<Province>();
  
//   // State untuk tracking
//   const [activeTab, setActiveTab] = useState<string | null>('invoice');
//   const [trackingCode, setTrackingCode] = useState('');
//   const [isTrackingVerified, setIsTrackingVerified] = useState(false);
//   const [scanError, setScanError] = useState('');
//   const [opened, { open, close }] = useDisclosure(false);
//   const [trackingData, setTrackingData] = useState<TrackingEvent[]>([
//     {
//       status: "Paket telah terkirim",
//       description: "Paket telah terkirim.",
//       time: "Selasa, 3 Mar 2026 • 18:04 WIB",
//       isCompleted: true,
//       isActive: false
//     },
//     {
//       status: "Sedang dalam pengiriman",
//       description: "Paket sedang diantar.",
//       time: "Selasa, 3 Mar 2026 • 17:27 WIB",
//       isCompleted: true,
//       isActive: false
//     },
//     {
//       status: "Paket sudah di pick-up",
//       description: "Paket di-pick-up driver.",
//       time: "Selasa, 3 Mar 2026 • 17:27 WIB",
//       isCompleted: true,
//       isActive: false
//     },
//     {
//       status: "Menyiapkan pengiriman",
//       description: "Driver sedang mem-pick-up paket Anda.",
//       time: "Selasa, 3 Mar 2026 • 16:58 WIB",
//       isCompleted: true,
//       isActive: false
//     },
//     {
//       status: "Berhasil mendapatkan driver",
//       description: "Berhasil mendapatkan driver.",
//       time: "Selasa, 3 Mar 2026 • 16:56 WIB",
//       isCompleted: true,
//       isActive: true
//     },
//     {
//       status: "Siap untuk dikirim",
//       description: "Paket siap untuk dikirim.",
//       time: "Selasa, 3 Mar 2026 • 16:30 WIB",
//       isCompleted: false,
//       isActive: false
//     }
//   ]);

//   // Default admin fee 5000 untuk fallback
//   const DEFAULT_ADMIN_FEE = 5000;
  
//   // State untuk tracking produk yang kena fallback
//   const [fallbackProducts, setFallbackProducts] = useState<Set<number>>(new Set());

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     getData();
//   }, [isClient, invoice]);

//   useEffect(() => {
//     if (data?.detail) {
//       fetchAllProductsPaginated();
//     }
//   }, [data]);

//   useEffect(() => {
//     getProvinceCity();
//   }, [data]);

//   // Hitung fallback products setelah products berubah
//   useEffect(() => {
//     if (data?.detail && products.size > 0) {
//       const newFallbackProducts = new Set<number>();
      
//       data.detail.forEach(item => {
//         const product = products.get(item.product_id);
//         const productAny = product as any;
        
//         // Jika produk tidak ditemukan atau tidak punya admin_fee, masukin ke fallback
//         if (!product || !productAny.admin_fee) {
//           newFallbackProducts.add(item.product_id);
//         }
//       });
      
//       setFallbackProducts(newFallbackProducts);
//       console.log("🎯 Fallback products:", Array.from(newFallbackProducts));
//     }
//   }, [data, products]);

//   const fetchAllProductsPaginated = async () => {
//     try {
//       setLoading.append("fetchProducts");
      
//       const productsMap = new Map<number, Product>();
//       let currentPage = 1;
//       let lastPage = 1;
//       let hasMorePages = true;
      
//       // Dapatkan semua product IDs yang perlu di-fetch
//       const neededProductIds = new Set(data?.detail.map(item => item.product_id) || []);
//       console.log("🔍 Need to fetch products:", Array.from(neededProductIds));
      
//       // Loop untuk mengambil semua halaman
//       while (hasMorePages) {
//         console.log(`📦 Fetching products page ${currentPage}...`);
        
//         await fetch<any, ProductResponse>({
//           url: `product?page=${currentPage}`,
//           method: "GET",
//           success: ({ data: responseData }) => {
//             console.log(`📄 Response page ${currentPage}:`, responseData);
            
//             // Handle berbagai format response
//             let productsData: Product[] = [];
            
//             if (responseData?.data && Array.isArray(responseData.data)) {
//               // Format: { data: [...], meta: { last_page: ... } }
//               productsData = responseData.data;
//               lastPage = responseData.meta?.last_page || responseData.last_page || 1;
              
//               // Update hasMorePages berdasarkan lastPage
//               if (currentPage >= lastPage) {
//                 hasMorePages = false;
//               } else {
//                 currentPage++;
//               }
//             } else if (Array.isArray(responseData)) {
//               // Format: langsung array
//               productsData = responseData;
//               // Jika response adalah array dan kosong, berhenti
//               if (productsData.length === 0) {
//                 hasMorePages = false;
//               } else {
//                 // Coba halaman berikutnya
//                 currentPage++;
//               }
//             } else {
//               // Format tidak dikenal, berhenti
//               hasMorePages = false;
//             }
            
//             // Masukkan semua produk dari halaman ini ke map
//             productsData.forEach((product: Product) => {
//               if (product?.id) {
//                 productsMap.set(product.id, product);
                
//                 // Log jika ini adalah produk yang kita butuhkan
//                 if (neededProductIds.has(product.id)) {
//                   const productAny = product as any;
//                   console.log(`✅ Found needed product ${product.id} on page ${currentPage-1}:`, {
//                     id: product.id,
//                     name: product.product_name,
//                     admin_fee: productAny.admin_fee || 'NOT FOUND'
//                   });
//                 }
//               }
//             });
            
//             console.log(`📊 Page ${currentPage - 1}: Got ${productsData.length} products, total so far: ${productsMap.size}`);
//             console.log(`🔄 Has more pages: ${hasMorePages}, current page: ${currentPage}, last page: ${lastPage}`);
//           },
//           error: (error) => {
//             console.error(`❌ Error fetching page ${currentPage}:`, error);
//             hasMorePages = false;
//           }
//         });
//       }
      
//       setProducts(productsMap);
//       console.log("🎯 Total products fetched:", productsMap.size);
      
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     } finally {
//       setLoading.filter((e) => e != "fetchProducts");
//     }
//   };

//   const getProvinceCity = async () => {
//     if (!data?.address?.city_id || !data?.address?.province_id) return;

//     await fetch<any, City>({
//       url: `city/${data.address.city_id}`,
//       method: "GET",
//       success: ({ data: cityData }) => cityData && setCity(cityData),
//     });

//     await fetch<any, Province>({
//       url: `province/${data.address.province_id}`,
//       method: "GET",
//       success: ({ data: provinceData }) => provinceData && setProvince(provinceData),
//     });
//   };

//   const getData = async () => {
//     if (invoice) {
//       await fetch<any, InvoiceResponse>({
//         url: `order-product-invoice/${invoice}`,
//         method: "GET",
//         data: {},
//         before: () => setLoading.append("getdata"),
//         success: ({ data }) => {
//           if (data) {
//             setData(data);
//             console.log("📋 Invoice Data:", data);
//             console.log("📋 Detail items:", data.detail);
//             console.log("🚚 Courier Data:", data.courier);
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "getdata"),
//         error: () => {},
//       });
//     }
//   };

//   const handleDownloadInvoice = async () => {
//     if (!invoice) return;
    
//     setLoadingDownload(true);
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_WS_URL;
      
//       if (!apiUrl) {
//         console.error('NEXT_PUBLIC_WS_URL is not defined');
//         return;
//       }

//       const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
//       let downloadUrl;
//       if (baseUrl.endsWith('/api')) {
//         downloadUrl = `${baseUrl}/order-product/download/${invoice}`;
//       } else if (baseUrl.endsWith('/api/')) {
//         downloadUrl = `${baseUrl}order-product/download/${invoice}`;
//       } else {
//         downloadUrl = `${baseUrl}/api/order-product/download/${invoice}`;
//       }
      
//       console.log('Download URL:', downloadUrl);
//       window.open(downloadUrl, '_blank');
//     } catch (error) {
//       console.error('Error downloading invoice:', error);
//     } finally {
//       setLoadingDownload(false);
//     }
//   };

//   // Handle verifikasi tracking
//   const handleVerifyTracking = () => {
//     // Simulasi verifikasi kode tracking
//     // Dalam implementasi nyata, ini akan memanggil API untuk validasi
//     if (trackingCode === 'GK-11-861316716' || trackingCode === 'demo' || trackingCode === 'GK-11') {
//       setIsTrackingVerified(true);
//       setScanError('');
//     } else {
//       setScanError('Kode tracking tidak valid. Silakan coba lagi.');
//     }
//   };

//   // Handle input kode tracking manual
//   const handleManualCode = () => {
//     // Contoh kode tracking dari gambar
//     setTrackingCode('GK-11-861316716');
//   };

//   const iconStatus: { [key: string]: string } = {
//     expired: "ooui:alert",
//     pending: "icon-park-solid:time",
//     verified: "uiw:circle-check",
//   };

//   // Fungsi pure untuk mendapatkan admin fee
//   const getAdminFeeForItem = (item: any): number => {
//     if (item.product_id && products.has(item.product_id)) {
//       const product = products.get(item.product_id);
//       const productAny = product as any;
      
//       const adminFee = productAny.admin_fee || 
//                        productAny.fee || 
//                        productAny.admin || 
//                        productAny.adminFee ||
//                        productAny.application_fee ||
//                        productAny.service_fee;
      
//       if (adminFee) {
//         const parsedFee = parseInt(adminFee);
//         return isNaN(parsedFee) ? DEFAULT_ADMIN_FEE : parsedFee;
//       }
//     }
    
//     return DEFAULT_ADMIN_FEE;
//   };

//   // Hitung biaya kurir
//   const courierPrice = useMemo(() => {
//     if (data?.courier?.price) {
//       const price = parseInt(data.courier.price);
//       return isNaN(price) ? 0 : price;
//     }
//     return 0;
//   }, [data]);

//   // Hitung total harga produk
//   const totalProductPrice = useMemo(() => {
//     const total = data?.detail.reduce((total, item) => {
//       const price = item.product_varian_id 
//         ? parseInt(item.variant?.price || "0") 
//         : parseInt(item.product?.price || "0");
//       return total + (price * (item.qty || 0));
//     }, 0) || 0;
    
//     return total;
//   }, [data]);

//   // Hitung total admin fee
//   const totalAdminFee = useMemo(() => {
//     const total = data?.detail.reduce((total, item) => {
//       const adminFeePerItem = getAdminFeeForItem(item);
//       return total + (adminFeePerItem * (item.qty || 0));
//     }, 0) || 0;
    
//     return total;
//   }, [data, products]);

//   // Grand total = total produk + total admin fee + biaya kurir
//   const grandTotal = useMemo(() => {
//     return totalProductPrice + totalAdminFee + courierPrice;
//   }, [totalProductPrice, totalAdminFee, courierPrice]);

//   // Dapatkan daftar produk yang kena fallback
//   const fallbackProductsList = useMemo(() => {
//     if (!data?.detail) return [];
//     return data.detail
//       .filter(item => fallbackProducts.has(item.product_id))
//       .map(item => ({
//         id: item.product_id,
//         name: item.product?.product_name || 'Unknown',
//         qty: item.qty || 0
//       }));
//   }, [data, fallbackProducts]);

//   const formatDate = (dateString?: string): string => {
//     if (!dateString) return "-";

//     const date = new Date(dateString);
//     const hours = date.getUTCHours().toString().padStart(2, "0");
//     const minutes = date.getUTCMinutes().toString().padStart(2, "0");
//     const day = date.getUTCDate().toString().padStart(2, "0");
//     const month = date.getUTCMonth();
//     const year = date.getUTCFullYear();
//     const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

//     return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
//   };

//   // Render tracking section
//   const renderTracking = () => {
//     if (!isTrackingVerified) {
//       return (
//         <Stack gap="md" py="xl" px="md" align="center">
//           <Icon icon="mdi:truck-delivery" width={80} height={80} className="text-gray-400" />
//           <Title order={3} ta="center">Lacak Pengiriman</Title>
//           <Text c="dimmed" ta="center" size="sm" maw={400}>
//             Masukkan kode tracking untuk melihat status pengiriman paket Anda
//           </Text>
          
//           <Card withBorder w="100%" maw={400} mt="md">
//             <Stack gap="md">
//               <TextInput
//                 label="Kode Tracking"
//                 placeholder="Contoh: GK-11-861316716"
//                 value={trackingCode}
//                 onChange={(e) => setTrackingCode(e.target.value)}
//                 error={scanError}
//                 description="Masukkan kode tracking yang tertera pada resi"
//               />
              
//               <Flex gap="sm">
//                 <Button 
//                   variant="light" 
//                   fullWidth
//                   onClick={handleVerifyTracking}
//                   leftSection={<Icon icon="mdi:check" />}
//                 >
//                   Verifikasi
//                 </Button>
//               </Flex>
              
//               <Divider label="atau" labelPosition="center" />
              
//               <Button 
//                 variant="outline" 
//                 fullWidth
//                 onClick={handleManualCode}
//                 leftSection={<Icon icon="mdi:file-document-outline" />}
//               >
//                 Gunakan Contoh Kode (Demo)
//               </Button>
              
//               <Text size="xs" c="dimmed" ta="center">
//                 Untuk demo, gunakan kode: GK-11-861316716 atau GK-11
//               </Text>
//             </Stack>
//           </Card>
//         </Stack>
//       );
//     }

//     // Tracking info header - Menggunakan data dari gambar
//     return (
//       <Stack gap="lg">
//         <Card withBorder bg="blue.0">
//           <Flex justify="space-between" align="center" wrap="wrap" gap="md">
//             <Box>
//               <Text size="xs" c="dimmed">Kode Tracking</Text>
//               <Text fw={700} size="xl">GK-11-861316716</Text>
//               <Badge color="green" size="lg" mt="xs">Dalam Pengiriman</Badge>
//             </Box>
//             <Box>
//               <Text size="xs" c="dimmed">Estimasi Tiba</Text>
//               <Text fw={600}>4 - 4 Mar 2026</Text>
//             </Box>
//             <Button 
//               variant="light" 
//               color="blue"
//               leftSection={<Icon icon="mdi:map-marker-path" />}
//               component="a"
//               href="#"
//               target="_blank"
//             >
//               Live Tracking
//             </Button>
//           </Flex>
//         </Card>

//         {/* Courier Info - Dari gambar */}
//         <Card withBorder>
//           <Flex justify="space-between" align="center" wrap="wrap" gap="md">
//             <Flex align="center" gap="md">
//               <ThemeIcon size="xl" radius="md" color="blue" variant="light">
//                 <Icon icon="mdi:truck-fast" width={24} />
//               </ThemeIcon>
//               <Box>
//                 <Text size="sm" c="dimmed">Kurir</Text>
//                 <Text fw={600}>GoSend - GKS</Text>
//                 <Text size="xs" c="dimmed">GK-11-861316716</Text>
//               </Box>
//             </Flex>
//             <Box>
//               <Text size="sm" c="dimmed">Kurir</Text>
//               <Text fw={600}>MOHAMMAD IMAM MALIK</Text>
//               <Flex align="center" gap="xs" mt={4}>
//                 <Icon icon="mdi:phone" width={16} />
//                 <Text size="sm" component="a" href="tel:+6283872984224">
//                   +6283872984224
//                 </Text>
//               </Flex>
//             </Box>
//             <Flex gap="xs">
//               <Button 
//                 variant="subtle" 
//                 size="sm"
//                 leftSection={<Icon icon="mdi:chat" />}
//               >
//                 Chat
//               </Button>
//               <Button 
//                 variant="subtle" 
//                 size="sm"
//                 leftSection={<Icon icon="mdi:phone" />}
//               >
//                 Hubungi
//               </Button>
//             </Flex>
//           </Flex>
//         </Card>

//         {/* Tracking Timeline - Sesuai gambar */}
//         <Card withBorder>
//           <Text fw={600} mb="md">Status Pengiriman</Text>
//           <Timeline active={trackingData.findIndex(t => t.isActive)} bulletSize={24} lineWidth={2}>
//             {trackingData.map((event, index) => (
//               <Timeline.Item
//                 key={index}
//                 bullet={
//                   <ThemeIcon
//                     size={24}
//                     radius="xl"
//                     color={event.isCompleted ? 'green' : event.isActive ? 'blue' : 'gray'}
//                     variant={event.isCompleted || event.isActive ? 'filled' : 'light'}
//                   >
//                     <Icon 
//                       icon={
//                         event.isCompleted ? 'mdi:check' : 
//                         event.isActive ? 'mdi:truck' : 
//                         'mdi:circle-outline'
//                       } 
//                       width={14} 
//                     />
//                   </ThemeIcon>
//                 }
//                 title={
//                   <Text fw={600} c={event.isCompleted ? 'green' : event.isActive ? 'blue' : 'dimmed'}>
//                     {event.status}
//                   </Text>
//                 }
//               >
//                 <Text size="sm" c="dimmed" mt={4}>{event.time}</Text>
//                 <Text size="sm">{event.description}</Text>
//               </Timeline.Item>
//             ))}
//           </Timeline>
//         </Card>

//         {/* Diterima status - Dari gambar */}
//         <Card withBorder bg="green.0">
//           <Flex align="center" gap="md">
//             <ThemeIcon size="lg" radius="xl" color="green">
//               <Icon icon="mdi:check" width={20} />
//             </ThemeIcon>
//             <Box>
//               <Text fw={600}>Diterima</Text>
//               <Text size="sm" c="dimmed">Paket telah terkirim. Selasa, 3 Mar 2026 • 18:04 WIB</Text>
//             </Box>
//           </Flex>
//         </Card>

//         {/* Reset button */}
//         <Button 
//           variant="subtle" 
//           color="gray"
//           onClick={() => {
//             setIsTrackingVerified(false);
//             setTrackingCode('');
//           }}
//           leftSection={<Icon icon="mdi:arrow-left" />}
//           fullWidth
//         >
//           Kembali ke Verifikasi
//         </Button>
//       </Stack>
//     );
//   };

//   if (!isClient) {
//     return (
//       <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//         <Container px={0} className={`py-[44px] md:py-[100px]`}>
//           <Card p={0} radius={8} className={`!shadow-lg`}>
//             <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//               <Flex justify="center" align="center" h={200}>
//                 <Text>Memuat invoice...</Text>
//               </Flex>
//             </Card>
//           </Card>
//         </Container>
//       </div>
//     );
//   }

//   return (
//     <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//       <Container px={0} className={`py-[44px] md:py-[100px]`}>
//         <Card p={0} radius={8} className={`!shadow-lg`}>
//           <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//             <Stack gap={30}>
//               <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
//                 <Flex gap={15} align="center">
//                   <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
//                   <Stack gap={0}>
//                     <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
//                       Invoice Pesanan
//                     </Title>
//                     <Text size="sm">{invoice}</Text>
//                   </Stack>
//                 </Flex>

//                 <Stack gap={5} className={`items-start md:!items-end`}>
//                   <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
//                     <Flex align="center" gap={10}>
//                       <Text size="sm" c="gray.8">
//                         Status Pembayaran :
//                       </Text>
//                       <Flex gap={5} align="center">
//                         <Icon
//                           icon={iconStatus[data?.payment_status?.toLowerCase() ?? "pending"]}
//                           className={`
//                             text-[18px]
//                             ${data?.payment_status?.toLowerCase() == "expired" && "text-red-400"}
//                             ${data?.payment_status?.toLowerCase() == "pending" && "text-yellow-500"}
//                             ${data?.payment_status?.toLowerCase() == "verified" && "text-green-500"}
//                           `}
//                         />
//                         <Text size="md" fw={400}>
//                           {data?.payment_status?.toLowerCase() == "expired" && <>Expired</>}
//                           {data?.payment_status?.toLowerCase() == "pending" && <>Pending</>}
//                           {data?.payment_status?.toLowerCase() == "verified" && <>Berhasil</>}
//                         </Text>
//                       </Flex>
//                     </Flex>
//                   </Card>
//                 </Stack>
//               </Flex>
//             </Stack>
//           </Card>

//           {/* Tabs Navigation */}
//           <Tabs value={activeTab} onChange={setActiveTab} mt="md">
//             <Tabs.List px="md">
//               <Tabs.Tab value="invoice" leftSection={<Icon icon="mdi:file-document" />}>
//                 Detail Invoice
//               </Tabs.Tab>
//               <Tabs.Tab value="tracking" leftSection={<Icon icon="mdi:truck-delivery" />}>
//                 Tracking Pengiriman
//               </Tabs.Tab>
//             </Tabs.List>

//             <Tabs.Panel value="invoice">
//               <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
//                 <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
//                   <Stack gap={10}>
//                     <Text fw={600} c="gray.8">
//                       Informasi Pemesan
//                     </Text>
//                     <Card withBorder>
//                       <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                         <Stack gap={0}>
//                           <Text size="xs" fw={300}>
//                             Nama Pemesan
//                           </Text>
//                           <Text size="sm" fw={600}>
//                             {data?.address?.nama_penerima || "-"}
//                           </Text>
//                         </Stack>
//                         <Stack gap={0}>
//                           <Text size="xs" fw={300}>
//                             Kurir yang Dipilih
//                           </Text>
//                           <Text size="sm" className="capitalize">
//                             {data?.courier?.main || "-"} - {data?.courier?.type || "-"}
//                           </Text>
//                         </Stack>
//                         <Stack gap={0}>
//                           <Text size="xs" fw={300}>
//                             Tanggal Pesanan Dibuat
//                           </Text>
//                           <Text size="sm" suppressHydrationWarning>
//                             {formatDate(data?.created_at)}
//                           </Text>
//                         </Stack>
//                       </SimpleGrid>
//                     </Card>
//                   </Stack>

//                   <Stack gap={10} className={`md:max-w-[300px]`}>
//                     <Text fw={600} c="gray.8">
//                       Total Pembayaran
//                     </Text>
//                     <Card bg="gray.1">
//                       <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
//                         <Text size="xl" fw={600}>
//                           <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                         </Text>
//                         <Stack gap={0}>
//                           <Text size="xs" fw={300}>
//                             Metode Pembayaran
//                           </Text>
//                           <Text size="sm" className="capitalize">
//                             {data?.payment_method || "-"}
//                           </Text>
//                         </Stack>
//                         <Button
//                           variant="light"
//                           color="blue"
//                           leftSection={<Icon icon="mdi:file-download-outline" />}
//                           onClick={handleDownloadInvoice}
//                           loading={loadingDownload}
//                           size="sm"
//                           fullWidth
//                           disabled={!invoice}
//                         >
//                           Download Invoice Merch
//                         </Button>
//                         {data?.xendit_url && (
//                           <Link href={data.xendit_url} target="_blank">
//                             <Button
//                               variant="light"
//                               color="green"
//                               leftSection={<Icon icon="mdi:external-link" />}
//                               size="sm"
//                               fullWidth
//                             >
//                               Buka Halaman Pembayaran
//                             </Button>
//                           </Link>
//                         )}
//                       </SimpleGrid>
//                     </Card>
//                   </Stack>
//                 </Flex>

//                 <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//                   <Stack gap={10}>
//                     <Text fw={600} c="gray.8">
//                       Informasi Pengiriman
//                     </Text>
//                     <Card withBorder>
//                       <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                         <Stack gap={0}>
//                           <Text size="xs" fw={300}>
//                             Nama Penerima
//                           </Text>
//                           <Text size="sm" fw={600}>
//                             {data?.address?.nama_penerima || "-"}
//                           </Text>
//                         </Stack>
//                         <Stack gap={0}>
//                           <Text size="xs" fw={300}>
//                             No. Telp Penerima
//                           </Text>
//                           <Text size="sm">{data?.address?.phone || "-"}</Text>
//                         </Stack>
//                         <Stack gap={0}>
//                           <Text size="xs" fw={300} mb={5}>
//                             Alamat Pengiriman
//                           </Text>
//                           <Text size="xs">
//                             {province?.name || "-"}, {city?.name || "-"}, {data?.address?.zipcode || "-"}
//                           </Text>
//                           <Text size="xs">{data?.address?.address_detail || "-"}</Text>
//                         </Stack>
//                       </SimpleGrid>
//                     </Card>
//                   </Stack>
//                 </Flex>

//                 <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//                   <Stack gap={10} className={`[&_*]:!text-[14px]`}>
//                     <Text fw={600} c="gray.8">
//                       Detail Pesanan
//                     </Text>
                    
//                     {/* Tampilkan peringatan jika ada produk yang kena fallback */}
//                     {fallbackProductsList.length > 0 && (
//                       <Card withBorder bg="yellow.0" c="yellow.9" p="sm">
//                         <Flex gap="xs" align="center">
//                           <Icon icon="mdi:alert" />
//                           <Box>
//                             <Text fw={600} size="sm">Perhatian: Ada {fallbackProductsList.length} produk menggunakan admin fee default 5000</Text>
//                             <Text size="xs">Produk: {fallbackProductsList.map(p => p.name).join(', ')}</Text>
//                           </Box>
//                         </Flex>
//                       </Card>
//                     )}
                    
//                     <Box maw="calc(100vw - 40px)" className={`overflow-auto`}>
//                       <Table withRowBorders={false} horizontalSpacing="md" miw={600}>
//                         <Table.Thead>
//                           <Table.Tr>
//                             <Table.Th>No</Table.Th>
//                             <Table.Th>Produk</Table.Th>
//                             <Table.Th>Qty</Table.Th>
//                             <Table.Th>Harga</Table.Th>
//                           </Table.Tr>
//                         </Table.Thead>
//                         <Table.Tbody>
//                           {data?.detail?.map((e, i) => {
//                             const price = e.product_varian_id 
//                               ? parseInt(e.variant?.price || "0") 
//                               : parseInt(e.product?.price || "0");
                            
//                             const qty = e.qty || 0;
                            
//                             return (
//                               <Table.Tr key={i}>
//                                 <Table.Td>{i + 1}</Table.Td>
//                                 <Table.Td>
//                                   <Flex gap={15} className={`!py-[5px]`}>
//                                     <Image 
//                                       src={e.product?.product_image?.[0]?.image_url || "#"} 
//                                       w={48} 
//                                       h={48} 
//                                       bg="gray.1" 
//                                       radius={5} 
//                                       className={`shrink-0`} 
//                                     />
//                                     <Stack gap={0}>
//                                       <Text>{e.product?.product_name || "-"}</Text>
//                                       {Boolean(e.product_varian_id) && (
//                                         <Text size="sm" c="gray.7">
//                                           Varian: {e.variant?.varian_name || "-"}
//                                         </Text>
//                                       )}
//                                       {/* Menambahkan order_notes di bawah nama produk */}
//                                       {e.order_notes && (
//                                         <Text size="xs" c="dimmed" fs="italic" mt={4}>
//                                           Catatan: {e.order_notes}
//                                         </Text>
//                                       )}
//                                     </Stack>
//                                   </Flex>
//                                 </Table.Td>
//                                 <Table.Td>{qty}</Table.Td>
//                                 <Table.Td>
//                                   <NumberFormatter value={price} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                                 </Table.Td>
//                               </Table.Tr>
//                             );
//                           })}
//                         </Table.Tbody>
//                       </Table>
//                     </Box>

//                     {/* Summary Card dengan Biaya Kurir */}
//                     <Card withBorder mt="md" bg="gray.0">
//                       <Stack gap="xs">
//                         <Flex justify="space-between">
//                           <Text fw={500}>Subtotal Produk:</Text>
//                           <Text fw={500}>
//                             <NumberFormatter value={totalProductPrice} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                           </Text>
//                         </Flex>
//                         <Flex justify="space-between">
//                           <Text fw={500}>Total Admin Fee:</Text>
//                           <Text fw={500}>
//                             <NumberFormatter value={totalAdminFee} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                           </Text>
//                         </Flex>
//                         <Flex justify="space-between">
//                           <Text fw={500}>Biaya Pengiriman ({data?.courier?.main || "-"} - {data?.courier?.type || "-"}):</Text>
//                           <Text fw={500}>
//                             <NumberFormatter value={courierPrice} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                           </Text>
//                         </Flex>
//                         <Divider my="xs" />
//                         <Flex justify="space-between">
//                           <Text fw={700} size="lg">Total Pembayaran:</Text>
//                           <Text fw={700} size="lg" c="blue">
//                             <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                           </Text>
//                         </Flex>
//                       </Stack>
//                     </Card>
//                   </Stack>
//                 </Flex>
//               </Stack>
//             </Tabs.Panel>

//             <Tabs.Panel value="tracking">
//               <Box py={25} className={`px-[20px] md:!px-[30px]`}>
//                 {renderTracking()}
//               </Box>
//             </Tabs.Panel>
//           </Tabs>
//         </Card>
//       </Container>
//     </div>
//   );
// }

// TES KODE YANG DIMODIF 

import { Icon } from "@iconify/react/dist/iconify.js";
import { Box, Button, Card, Container, Divider, Flex, Image, Modal, NumberFormatter, SimpleGrid, Stack, Table, Tabs, Text, TextInput, Title, Timeline, Badge, ThemeIcon } from "@mantine/core";
import Link from "next/link";
import { InvoiceResponse } from "./type";
import { useEffect, useMemo, useState } from "react";
import fetch from "@/utils/fetch";
import { useListState, useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { City, Province } from "../dashboard/profile/address";

// Definisikan interface Product
interface Product {
  id: number;
  product_name: string;
  price: string;
  admin_fee?: string;
  fee?: string;
  admin?: string;
  adminFee?: string;
  application_fee?: string;
  service_fee?: string;
  product_image?: Array<{ id: number; image_url: string }>;
}

// Interface untuk response produk dari API dengan pagination
interface ProductResponse {
  data: Product[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  current_page?: number;
  last_page?: number;
  total?: number;
}

// Interface untuk tracking status
interface TrackingStatus {
  id: number;
  status_delivery: string;
  description: string;
  active_status: number;
  updated_at: string | null;
  deleted_at: string | null;
}

// Interface untuk manifest
interface Manifest {
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
  tracking_status: TrackingStatus;
}

// Update InvoiceResponse type untuk menyertakan manifest
interface InvoiceResponseWithManifest extends InvoiceResponse {
  manifest?: Manifest[];
}

// Interface untuk tracking data yang akan ditampilkan di Timeline
interface TrackingEvent {
  status: string;
  description: string;
  time: string;
  location?: string;
  tracking_status_id: number;
  isCompleted?: boolean;
  isActive?: boolean;
}

export default function Invoice() {
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<InvoiceResponseWithManifest>();
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useListState<string>();
  const [loadingDownload, setLoadingDownload] = useState(false);
  const router = useRouter();
  const { invoice } = router.query;
  const [city, setCity] = useState<City>();
  const [province, setProvince] = useState<Province>();
  
  // State untuk tracking
  const [activeTab, setActiveTab] = useState<string | null>('invoice');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getData();
  }, [isClient, invoice]);

  useEffect(() => {
    if (data?.detail) {
      fetchAllProductsPaginated();
    }
  }, [data]);

  useEffect(() => {
    getProvinceCity();
  }, [data]);

  const fetchAllProductsPaginated = async () => {
    try {
      setLoading.append("fetchProducts");
      
      const productsMap = new Map<number, Product>();
      let currentPage = 1;
      let lastPage = 1;
      let hasMorePages = true;
      
      // Dapatkan semua product IDs yang perlu di-fetch
      const neededProductIds = new Set(data?.detail.map(item => item.product_id) || []);
      
      // Loop untuk mengambil semua halaman
      while (hasMorePages) {
        await fetch<any, ProductResponse>({
          url: `product?page=${currentPage}`,
          method: "GET",
          success: ({ data: responseData }) => {
            let productsData: Product[] = [];
            
            if (responseData?.data && Array.isArray(responseData.data)) {
              productsData = responseData.data;
              lastPage = responseData.meta?.last_page || responseData.last_page || 1;
              
              if (currentPage >= lastPage) {
                hasMorePages = false;
              } else {
                currentPage++;
              }
            } else if (Array.isArray(responseData)) {
              productsData = responseData;
              if (productsData.length === 0) {
                hasMorePages = false;
              } else {
                currentPage++;
              }
            } else {
              hasMorePages = false;
            }
            
            productsData.forEach((product: Product) => {
              if (product?.id) {
                productsMap.set(product.id, product);
              }
            });
          },
          error: (error) => {
            console.error(`Error fetching page ${currentPage}:`, error);
            hasMorePages = false;
          }
        });
      }
      
      setProducts(productsMap);
      
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading.filter((e) => e != "fetchProducts");
    }
  };

  const getProvinceCity = async () => {
    if (!data?.address?.city_id || !data?.address?.province_id) return;

    await fetch<any, City>({
      url: `city/${data.address.city_id}`,
      method: "GET",
      success: ({ data: cityData }) => cityData && setCity(cityData),
    });

    await fetch<any, Province>({
      url: `province/${data.address.province_id}`,
      method: "GET",
      success: ({ data: provinceData }) => provinceData && setProvince(provinceData),
    });
  };

  const getData = async () => {
    if (invoice) {
      await fetch<any, InvoiceResponseWithManifest>({
        url: `order-product-invoice/${invoice}`,
        method: "GET",
        data: {},
        before: () => setLoading.append("getdata"),
        success: ({ data }) => {
          if (data) {
            console.log("Data invoice with manifest:", data);
            setData(data);
          }
        },
        complete: () => setLoading.filter((e) => e != "getdata"),
        error: () => {},
      });
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoice) return;
    
    setLoadingDownload(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_WS_URL;
      
      if (!apiUrl) {
        console.error('NEXT_PUBLIC_WS_URL is not defined');
        return;
      }

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      let downloadUrl;
      if (baseUrl.endsWith('/api')) {
        downloadUrl = `${baseUrl}/order-product/download/${invoice}`;
      } else if (baseUrl.endsWith('/api/')) {
        downloadUrl = `${baseUrl}order-product/download/${invoice}`;
      } else {
        downloadUrl = `${baseUrl}/api/order-product/download/${invoice}`;
      }
      
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setLoadingDownload(false);
    }
  };

  const iconStatus: { [key: string]: string } = {
    expired: "ooui:alert",
    pending: "icon-park-solid:time",
    verified: "uiw:circle-check",
  };

  // Hitung biaya kurir - ambil dari delivery_price
  const courierPrice = useMemo(() => {
    if (data?.delivery_price) {
      const price = parseInt(data.delivery_price.toString());
      return isNaN(price) ? 0 : price;
    }
    return 0;
  }, [data]);

  // Hitung total harga produk dari data.total_price
  const totalProductPrice = useMemo(() => {
    return data?.total_price || 0;
  }, [data]);

  // Admin fee diambil dari level invoice (flat untuk seluruh invoice)
  const adminFee = useMemo(() => {
    if (data?.admin_fee) {
      return data.admin_fee;
    }
    return 0;
  }, [data]);

  // Grand total = data.grandtotal
  const grandTotal = useMemo(() => {
    return data?.grandtotal || 0;
  }, [data]);

  // Format ETD dari data courier
  const estimatedDelivery = useMemo(() => {
    if (data?.courier?.etd) {
      return data.courier.etd;
    }
    return "4 - 4 Mar 2026"; // Default jika tidak ada ETD
  }, [data]);

  // Format ETD time dari data courier
  const estimatedDeliveryTime = useMemo(() => {
    if (data?.courier?.etd_time) {
      return data.courier.etd_time;
    }
    return null;
  }, [data]);

  // Ambil lokasi pengiriman (Dikirim Dari) dari manifest
  const shippingFromLocation = useMemo(() => {
    if (data?.manifest && data.manifest.length > 0) {
      // Ambil lokasi dari manifest pertama
      return data.manifest[0].location || "Warehouse";
    }
    return "Warehouse";
  }, [data?.manifest]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
  };

  const formatDateManifest = (dateString?: string): string => {
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

  // Konversi manifest ke tracking events untuk timeline - URUTAN BERDASARKAN TRACKING_STATUS_ID
  // tracking_status_id 1 = paling bawah (status awal)
  // tracking_status_id 2 = tengah
  // tracking_status_id 3 = atas (status akhir)
  const trackingEvents = useMemo<TrackingEvent[]>(() => {
    const manifestData = data?.manifest;
    
    if (!manifestData || manifestData.length === 0) {
      return [];
    }

    // Urutkan manifest berdasarkan tracking_status_id ASCENDING (1,2,3)
    // Tapi untuk tampilan di timeline, kita ingin:
    // - ID 1 (status awal) di PALING BAWAH
    // - ID 2 (status menengah) di TENGAH
    // - ID 3 (status akhir) di PALING ATAS
    const sortedManifest = [...manifestData].sort((a, b) => 
      a.tracking_status_id - b.tracking_status_id
    );

    console.log("Sorted manifest by tracking_status_id:", sortedManifest.map(m => ({id: m.tracking_status_id, status: m.status_name})));

    // Konversi ke tracking events
    return sortedManifest.map((item, index) => ({
      status: item.tracking_status?.status_delivery || item.status_name,
      description: item.tracking_status?.description || item.description,
      time: formatDateManifest(item.created_at),
      location: item.location,
      tracking_status_id: item.tracking_status_id,
      isCompleted: true, // Semua manifest yang ada dianggap completed karena sudah terjadi
      isActive: item.tracking_status_id === 3 // Hanya status dengan ID 3 (Telah Diterima) yang dianggap aktif
    }));
  }, [data?.manifest]);

  // Cek apakah status terakhir adalah "Telah Diterima" (tracking_status_id = 3)
  const isLastStatusReceived = useMemo(() => {
    if (trackingEvents.length === 0) return false;
    
    // Cek apakah ada manifest dengan tracking_status_id = 3
    return trackingEvents.some(event => event.tracking_status_id === 3);
  }, [trackingEvents]);

  // Render tracking section - menggunakan data manifest dari response invoice
  const renderTracking = () => {
    const manifestData = data?.manifest;
    
    // Jika manifest undefined atau array kosong, tampilkan pesan
    if (!manifestData || manifestData.length === 0) {
      return (
        <Stack gap="lg" w="100%" style={{ alignItems: 'center' }} py={50}>
          <Card withBorder w="100%" maw={650} style={{ margin: '0 auto' }} p="xl">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="xl" color="gray" variant="light">
                <Icon icon="mdi:truck-delivery" width={30} />
              </ThemeIcon>
              <Text fw={600} size="lg" ta="center">Belum Ada Informasi Pengiriman</Text>
              <Text size="sm" c="dimmed" ta="center">
                Status pengiriman akan segera muncul setelah pesanan diproses
              </Text>
            </Stack>
          </Card>
        </Stack>
      );
    }

    // Ambil tracking number dari manifest pertama
    const trackingNumber = manifestData[0].tracking_number;

    return (
      <Stack gap="lg" w="100%" style={{ alignItems: 'center' }}>
        {/* Header Card */}
        <Box w="100%" style={{ display: 'flex', justifyContent: 'center' }}>
          <Card withBorder bg="blue.0" w="100%" maw={650} style={{ margin: '0 auto' }}>
            <Flex justify="space-between" align="center" wrap="wrap" gap="md">
              <Box>
                <Text size="xs" c="dimmed">Kode Tracking</Text>
                <Text fw={700} size="xl">{trackingNumber}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Estimasi Tiba</Text>
                <Text fw={600}>{estimatedDelivery}</Text>
                {estimatedDeliveryTime && (
                  <Text size="xs" c="dimmed" ta="right">Estimasi jam: {estimatedDeliveryTime}</Text>
                )}
              </Box>
              <Button 
                variant="light" 
                color="blue"
                leftSection={<Icon icon="mdi:map-marker-path" />}
                component="a"
                href="#"
                target="_blank"
              >
                Live Tracking
              </Button>
            </Flex>
          </Card>
        </Box>

        {/* Courier Info Card */}
        <Box w="100%" style={{ display: 'flex', justifyContent: 'center' }}>
          <Card withBorder w="100%" maw={650} style={{ margin: '0 auto' }}>
            <Flex justify="space-between" align="center" wrap="wrap" gap="md">
              <Flex align="center" gap="md">
                <ThemeIcon size="xl" radius="md" color="blue" variant="light">
                  <Icon icon="mdi:truck-fast" width={24} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" c="dimmed">Kurir</Text>
                  <Text fw={600} className="capitalize">
                    {data?.courier?.main || "-"} - {data?.courier?.type || "-"}
                  </Text>
                  <Text size="xs" c="dimmed">{trackingNumber}</Text>
                </Box>
              </Flex>
              <Button
                variant="light"
                color="green"
                leftSection={<Icon icon="mdi:whatsapp" width={18} />}
                component="a"
                href="https://wa.me/6281287728920"
                target="_blank"
                rel="noopener noreferrer"
              >
                Customer Support
              </Button>
            </Flex>
          </Card>
        </Box>

        {/* Timeline Card */}
        <Box w="100%" style={{ display: 'flex', justifyContent: 'center' }}>
          <Card withBorder w="100%" maw={650} style={{ margin: '0 auto' }}>
            <Text fw={600} mb="xl" ta="center" size="lg">Status Pengiriman</Text>
            <Box style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Box style={{ maxWidth: 500, width: '100%' }}>
                <Timeline 
                  active={trackingEvents.findIndex(e => e.tracking_status_id === 3)} // Active index adalah status dengan ID 3 (Telah Diterima)
                  bulletSize={24} 
                  lineWidth={2}
                >
                  {/* Balik urutan untuk tampilan: ID 1 di bawah, ID 3 di atas */}
                  {[...trackingEvents].reverse().map((event, index) => {
                    const originalIndex = trackingEvents.length - 1 - index;
                    const isActive = event.tracking_status_id === 3;
                    
                    return (
                      <Timeline.Item
                        key={originalIndex}
                        bullet={
                          <ThemeIcon
                            size={24}
                            radius="xl"
                            color={isActive ? 'blue' : 'green'}
                            variant="filled"
                          >
                            <Icon 
                              icon={
                                isActive ? 'mdi:check-circle' : 'mdi:check'
                              } 
                              width={14} 
                            />
                          </ThemeIcon>
                        }
                        title={
                          <Text fw={600} c={isActive ? 'blue' : 'dimmed'}>
                            {event.status}
                          </Text>
                        }
                      >
                        <Stack gap={4}>
                          {event.location && (
                            <Text size="xs" c="dimmed">{event.location}</Text>
                          )}
                          <Text size="sm">{event.description}</Text>
                          <Text size="xs" c="dimmed">{event.time}</Text>
                        </Stack>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Diterima Card - Tampilkan jika ada status dengan tracking_status_id = 3 */}
        {isLastStatusReceived && (
          <Box w="100%" style={{ display: 'flex', justifyContent: 'center' }}>
            <Card withBorder bg="green.0" w="100%" maw={650} style={{ margin: '0 auto' }}>
              <Flex align="center" gap="md" justify="center" direction="column">
                <ThemeIcon size="lg" radius="xl" color="green">
                  <Icon icon="mdi:check-circle" width={20} />
                </ThemeIcon>
                <Box>
                  <Text fw={600} ta="center" size="lg">Pesanan Telah Diterima</Text>
                  <Text size="sm" c="dimmed" ta="center">
                    {trackingEvents.find(e => e.tracking_status_id === 3)?.time || "-"}
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Box>
        )}
      </Stack>
    );
  };

  if (!isClient) {
    return (
      <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
        <Container px={0} className={`py-[44px] md:py-[100px]`}>
          <Card p={0} radius={8} className={`!shadow-lg`}>
            <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
              <Flex justify="center" align="center" h={200}>
                <Text>Memuat invoice...</Text>
              </Flex>
            </Card>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
      <Container px={0} className={`py-[44px] md:py-[100px]`}>
        <Card p={0} radius={8} className={`!shadow-lg`}>
          <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
            <Stack gap={30}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
                <Flex gap={15} align="center">
                  <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
                  <Stack gap={0}>
                    <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
                      Invoice Pesanan
                    </Title>
                    <Text size="sm">{invoice}</Text>
                  </Stack>
                </Flex>

                <Stack gap={5} className={`items-start md:!items-end`}>
                  <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
                    <Flex align="center" gap={10}>
                      <Text size="sm" c="gray.8">
                        Status Pembayaran :
                      </Text>
                      <Flex gap={5} align="center">
                        <Icon
                          icon={iconStatus[data?.payment_status?.toLowerCase() ?? "pending"]}
                          className={`
                            text-[18px]
                            ${data?.payment_status?.toLowerCase() == "expired" && "text-red-400"}
                            ${data?.payment_status?.toLowerCase() == "pending" && "text-yellow-500"}
                            ${data?.payment_status?.toLowerCase() == "verified" && "text-green-500"}
                          `}
                        />
                        <Text size="md" fw={400}>
                          {data?.payment_status?.toLowerCase() == "expired" && <>Expired</>}
                          {data?.payment_status?.toLowerCase() == "pending" && <>Pending</>}
                          {data?.payment_status?.toLowerCase() == "verified" && <>Berhasil</>}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Stack>
              </Flex>
            </Stack>
          </Card>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onChange={setActiveTab} mt="md">
            <Tabs.List px="md">
              <Tabs.Tab value="invoice" leftSection={<Icon icon="mdi:file-document" />}>
                Detail Invoice
              </Tabs.Tab>
              <Tabs.Tab value="tracking" leftSection={<Icon icon="mdi:truck-delivery" />}>
                Live Status Pengiriman
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="invoice">
              <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
                <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
                  <Stack gap={10}>
                    <Text fw={600} c="gray.8">
                      Informasi Pemesan
                    </Text>
                    <Card withBorder>
                      <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                        <Stack gap={0}>
                          <Text size="xs" fw={300}>
                            Nama Pemesan
                          </Text>
                          <Text size="sm" fw={600}>
                            {data?.address?.nama_penerima || "-"}
                          </Text>
                        </Stack>
                        <Stack gap={0}>
                          <Text size="xs" fw={300}>
                            Kurir yang Dipilih
                          </Text>
                          <Text size="sm" className="capitalize">
                            {data?.courier?.main || "-"} - {data?.courier?.type || "-"}
                          </Text>
                        </Stack>
                        <Stack gap={0}>
                          <Text size="xs" fw={300}>
                            Tanggal Pesanan Dibuat
                          </Text>
                          <Text size="sm" suppressHydrationWarning>
                            {formatDate(data?.created_at)}
                          </Text>
                        </Stack>
                        {/* Tambahan informasi Dikirim Dari */}
                        <Stack gap={0}>
                          <Text size="xs" fw={300}>
                            Dikirim Dari
                          </Text>
                          <Text size="sm" fw={600}>
                            {shippingFromLocation}
                          </Text>
                        </Stack>
                      </SimpleGrid>
                    </Card>
                  </Stack>

                  <Stack gap={10} className={`md:max-w-[300px]`}>
                    <Text fw={600} c="gray.8">
                      Total Pembayaran
                    </Text>
                    <Card bg="gray.1">
                      <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
                        <Text size="xl" fw={600}>
                          <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," prefix="Rp " />
                        </Text>
                        <Stack gap={0}>
                          <Text size="xs" fw={300}>
                            Metode Pembayaran
                          </Text>
                          <Text size="sm" className="capitalize">
                            {data?.payment_method || "-"}
                          </Text>
                        </Stack>
                        <Button
                          variant="light"
                          color="blue"
                          leftSection={<Icon icon="mdi:file-download-outline" />}
                          onClick={handleDownloadInvoice}
                          loading={loadingDownload}
                          size="sm"
                          fullWidth
                          disabled={!invoice}
                        >
                          Download Invoice Merch
                        </Button>
                        {data?.xendit_url && (
                          <Link href={data.xendit_url} target="_blank">
                            <Button
                              variant="light"
                              color="green"
                              leftSection={<Icon icon="mdi:external-link" />}
                              size="sm"
                              fullWidth
                            >
                              Buka Halaman Pembayaran
                            </Button>
                          </Link>
                        )}
                      </SimpleGrid>
                    </Card>
                  </Stack>
                </Flex>

                <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
                  <Stack gap={10}>
                    <Text fw={600} c="gray.8">
                      Informasi Pengiriman
                    </Text>
                    <Card withBorder>
                      <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
                        <Stack gap={0}>
                          <Text size="xs" fw={300}>
                            Nama Penerima
                          </Text>
                          <Text size="sm" fw={600}>
                            {data?.address?.nama_penerima || "-"}
                          </Text>
                        </Stack>
                        <Stack gap={0}>
                          <Text size="xs" fw={300}>
                            No. Telp Penerima
                          </Text>
                          <Text size="sm">{data?.address?.phone || "-"}</Text>
                        </Stack>
                        <Stack gap={0}>
                          <Text size="xs" fw={300} mb={5}>
                            Alamat Pengiriman
                          </Text>
                          <Text size="xs">
                            {province?.name || "-"}, {city?.name || "-"}, {data?.address?.zipcode || "-"}
                          </Text>
                          <Text size="xs">{data?.address?.address_detail || "-"}</Text>
                        </Stack>
                      </SimpleGrid>
                    </Card>
                  </Stack>
                </Flex>

                <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
                  <Stack gap={10} className={`[&_*]:!text-[14px]`}>
                    <Text fw={600} c="gray.8">
                      Detail Pesanan
                    </Text>
                    
                    <Box maw="calc(100vw - 40px)" className={`overflow-auto`}>
                      <Table withRowBorders={false} horizontalSpacing="md" miw={500}>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>No</Table.Th>
                            <Table.Th>Produk</Table.Th>
                            <Table.Th>Qty</Table.Th>
                            <Table.Th>Harga</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {data?.detail?.map((e, i) => {
                            // Ambil harga dari detail item (response invoice)
                            const price = parseInt(e.price || "0");
                            const qty = e.qty || 0;
                            // Hitung total harga per item (qty × harga satuan)
                            const totalPrice = price * qty;
                            
                            return (
                              <Table.Tr key={i}>
                                <Table.Td>{i + 1}</Table.Td>
                                <Table.Td>
                                  <Flex gap={15} className={`!py-[5px]`}>
                                    <Image 
                                      src={e.product?.product_image?.[0]?.image_url || "#"} 
                                      w={48} 
                                      h={48} 
                                      bg="gray.1" 
                                      radius={5} 
                                      className={`shrink-0`} 
                                    />
                                    <Stack gap={0}>
                                      <Text>{e.product?.product_name || "-"}</Text>
                                      {/* Menampilkan informasi varian jika ada */}
                                      {e.product_varian_id && e.variant ? (
                                        <Text size="sm" c="gray.7">
                                          Varian: {e.variant.varian_name || "-"}
                                        </Text>
                                      ) : e.variant ? (
                                        <Text size="sm" c="gray.7">
                                          Varian: {e.variant.varian_name || "-"}
                                        </Text>
                                      ) : null}
                                      {e.order_notes && (
                                        <Text size="xs" c="dimmed" fs="italic" mt={4}>
                                          Catatan: {e.order_notes}
                                        </Text>
                                      )}
                                    </Stack>
                                  </Flex>
                                </Table.Td>
                                <Table.Td>{qty}</Table.Td>
                                <Table.Td>
                                  <NumberFormatter value={totalPrice} thousandSeparator="." decimalSeparator="," prefix="Rp " />
                                </Table.Td>
                              </Table.Tr>
                            );
                          })}
                        </Table.Tbody>
                      </Table>
                    </Box>

                    {/* Summary Card dengan Biaya Kurir */}
                    <Card withBorder mt="md" bg="gray.0">
                      <Stack gap="xs">
                        <Flex justify="space-between">
                          <Text fw={500}>Subtotal Produk:</Text>
                          <Text fw={500}>
                            <NumberFormatter value={totalProductPrice} thousandSeparator="." decimalSeparator="," prefix="Rp " />
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text fw={500}>Biaya Admin:</Text>
                          <Text fw={500}>
                            <NumberFormatter value={adminFee} thousandSeparator="." decimalSeparator="," prefix="Rp " />
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text fw={500}>Biaya Pengiriman ({data?.courier?.main || "-"} - {data?.courier?.type || "-"}):</Text>
                          <Text fw={500}>
                            <NumberFormatter value={courierPrice} thousandSeparator="." decimalSeparator="," prefix="Rp " />
                          </Text>
                        </Flex>
                        <Divider my="xs" />
                        <Flex justify="space-between">
                          <Text fw={700} size="lg">Total Pembayaran:</Text>
                          <Text fw={700} size="lg" c="blue">
                            <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," prefix="Rp " />
                          </Text>
                        </Flex>
                      </Stack>
                    </Card>
                  </Stack>
                </Flex>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="tracking">
              <Box py={25} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Box style={{ maxWidth: 750, width: '100%', margin: '0 auto' }} className={`px-[20px] md:!px-[30px]`}>
                  {renderTracking()}
                </Box>
              </Box>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Container>
    </div>
  );
}
// INI UNTUK PUSH SEMENTARA
// import { Icon } from "@iconify/react/dist/iconify.js";
// import { Box, Button, Card, Container, Divider, Flex, Image, Modal, NumberFormatter, SimpleGrid, Stack, Table, Tabs, Text, TextInput, Title, Timeline, Badge, ThemeIcon } from "@mantine/core";
// import Link from "next/link";
// import { InvoiceResponse } from "./type";
// import { useEffect, useMemo, useState } from "react";
// import fetch from "@/utils/fetch";
// import { useListState, useDisclosure } from "@mantine/hooks";
// import { useRouter } from "next/router";
// import { City, Province } from "../dashboard/profile/address";

// // Definisikan interface Product
// interface Product {
//   id: number;
//   product_name: string;
//   price: string;
//   admin_fee?: string;
//   fee?: string;
//   admin?: string;
//   adminFee?: string;
//   application_fee?: string;
//   service_fee?: string;
//   product_image?: Array<{ id: number; image_url: string }>;
// }

// // Interface untuk response produk dari API dengan pagination
// interface ProductResponse {
//   data: Product[];
//   meta?: {
//     total: number;
//     per_page: number;
//     current_page: number;
//     last_page: number;
//   };
//   current_page?: number;
//   last_page?: number;
//   total?: number;
// }

// export default function Invoice() {
//   const [isClient, setIsClient] = useState(false);
//   const [data, setData] = useState<InvoiceResponse>();
//   const [products, setProducts] = useState<Map<number, Product>>(new Map());
//   const [loading, setLoading] = useListState<string>();
//   const [loadingDownload, setLoadingDownload] = useState(false);
//   const router = useRouter();
//   const { invoice } = router.query;
//   const [city, setCity] = useState<City>();
//   const [province, setProvince] = useState<Province>();
  
//   // State untuk tabs
//   const [activeTab, setActiveTab] = useState<string | null>('invoice');

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     getData();
//   }, [isClient, invoice]);

//   useEffect(() => {
//     if (data?.detail) {
//       fetchAllProductsPaginated();
//     }
//   }, [data]);

//   useEffect(() => {
//     getProvinceCity();
//   }, [data]);

//   const fetchAllProductsPaginated = async () => {
//     try {
//       setLoading.append("fetchProducts");
      
//       const productsMap = new Map<number, Product>();
//       let currentPage = 1;
//       let lastPage = 1;
//       let hasMorePages = true;
      
//       // Dapatkan semua product IDs yang perlu di-fetch
//       const neededProductIds = new Set(data?.detail.map(item => item.product_id) || []);
//       console.log("🔍 Need to fetch products:", Array.from(neededProductIds));
      
//       // Loop untuk mengambil semua halaman
//       while (hasMorePages) {
//         console.log(`📦 Fetching products page ${currentPage}...`);
        
//         await fetch<any, ProductResponse>({
//           url: `product?page=${currentPage}`,
//           method: "GET",
//           success: ({ data: responseData }) => {
//             console.log(`📄 Response page ${currentPage}:`, responseData);
            
//             // Handle berbagai format response
//             let productsData: Product[] = [];
            
//             if (responseData?.data && Array.isArray(responseData.data)) {
//               // Format: { data: [...], meta: { last_page: ... } }
//               productsData = responseData.data;
//               lastPage = responseData.meta?.last_page || responseData.last_page || 1;
              
//               // Update hasMorePages berdasarkan lastPage
//               if (currentPage >= lastPage) {
//                 hasMorePages = false;
//               } else {
//                 currentPage++;
//               }
//             } else if (Array.isArray(responseData)) {
//               // Format: langsung array
//               productsData = responseData;
//               // Jika response adalah array dan kosong, berhenti
//               if (productsData.length === 0) {
//                 hasMorePages = false;
//               } else {
//                 // Coba halaman berikutnya
//                 currentPage++;
//               }
//             } else {
//               // Format tidak dikenal, berhenti
//               hasMorePages = false;
//             }
            
//             // Masukkan semua produk dari halaman ini ke map
//             productsData.forEach((product: Product) => {
//               if (product?.id) {
//                 productsMap.set(product.id, product);
                
//                 // Log jika ini adalah produk yang kita butuhkan
//                 if (neededProductIds.has(product.id)) {
//                   const productAny = product as any;
//                   console.log(`✅ Found needed product ${product.id} on page ${currentPage-1}:`, {
//                     id: product.id,
//                     name: product.product_name,
//                     admin_fee: productAny.admin_fee || 'NOT FOUND'
//                   });
//                 }
//               }
//             });
            
//             console.log(`📊 Page ${currentPage - 1}: Got ${productsData.length} products, total so far: ${productsMap.size}`);
//             console.log(`🔄 Has more pages: ${hasMorePages}, current page: ${currentPage}, last page: ${lastPage}`);
//           },
//           error: (error) => {
//             console.error(`❌ Error fetching page ${currentPage}:`, error);
//             hasMorePages = false;
//           }
//         });
//       }
      
//       setProducts(productsMap);
//       console.log("🎯 Total products fetched:", productsMap.size);
      
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     } finally {
//       setLoading.filter((e) => e != "fetchProducts");
//     }
//   };

//   const getProvinceCity = async () => {
//     if (!data?.address?.city_id || !data?.address?.province_id) return;

//     await fetch<any, City>({
//       url: `city/${data.address.city_id}`,
//       method: "GET",
//       success: ({ data: cityData }) => cityData && setCity(cityData),
//     });

//     await fetch<any, Province>({
//       url: `province/${data.address.province_id}`,
//       method: "GET",
//       success: ({ data: provinceData }) => provinceData && setProvince(provinceData),
//     });
//   };

//   const getData = async () => {
//     if (invoice) {
//       await fetch<any, InvoiceResponse>({
//         url: `order-product-invoice/${invoice}`,
//         method: "GET",
//         data: {},
//         before: () => setLoading.append("getdata"),
//         success: ({ data }) => {
//           if (data) {
//             setData(data);
//             console.log("📋 Invoice Data:", data);
//             console.log("📋 Detail items:", data.detail);
//             console.log("🚚 Courier Data:", data.courier);
//             console.log("💰 Admin Fee (Invoice Level):", data.admin_fee);
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "getdata"),
//         error: () => {},
//       });
//     }
//   };

//   const handleDownloadInvoice = async () => {
//     if (!invoice) return;
    
//     setLoadingDownload(true);
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_WS_URL;
      
//       if (!apiUrl) {
//         console.error('NEXT_PUBLIC_WS_URL is not defined');
//         return;
//       }

//       const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
//       let downloadUrl;
//       if (baseUrl.endsWith('/api')) {
//         downloadUrl = `${baseUrl}/order-product/download/${invoice}`;
//       } else if (baseUrl.endsWith('/api/')) {
//         downloadUrl = `${baseUrl}order-product/download/${invoice}`;
//       } else {
//         downloadUrl = `${baseUrl}/api/order-product/download/${invoice}`;
//       }
      
//       console.log('Download URL:', downloadUrl);
//       window.open(downloadUrl, '_blank');
//     } catch (error) {
//       console.error('Error downloading invoice:', error);
//     } finally {
//       setLoadingDownload(false);
//     }
//   };

//   const iconStatus: { [key: string]: string } = {
//     expired: "ooui:alert",
//     pending: "icon-park-solid:time",
//     verified: "uiw:circle-check",
//   };

//   // Hitung biaya kurir
//   const courierPrice = useMemo(() => {
//     if (data?.courier?.price) {
//       const price = parseInt(data.courier.price);
//       return isNaN(price) ? 0 : price;
//     }
//     return 0;
//   }, [data]);

//   // Hitung total harga produk dari data.detail[].price
//   const totalProductPrice = useMemo(() => {
//     const total = data?.detail.reduce((total, item) => {
//       // Ambil harga dari detail item (response invoice)
//       const price = parseInt(item.price || "0");
//       return total + (price * (item.qty || 0));
//     }, 0) || 0;
    
//     console.log("💰 Total Product Price from detail.price:", total);
//     return total;
//   }, [data]);

//   // Admin fee diambil dari level invoice (flat untuk seluruh invoice)
//   const adminFee = useMemo(() => {
//     if (data?.admin_fee) {
//       return data.admin_fee;
//     }
//     return 0;
//   }, [data]);

//   // Grand total = total produk + admin fee (flat) + biaya kurir
//   const grandTotal = useMemo(() => {
//     // Bisa juga menggunakan data.grandtotal langsung dari response
//     if (data?.grandtotal) {
//       return data.grandtotal;
//     }
    
//     return totalProductPrice + adminFee + courierPrice;
//   }, [totalProductPrice, adminFee, courierPrice, data]);

//   const formatDate = (dateString?: string): string => {
//     if (!dateString) return "-";

//     const date = new Date(dateString);
//     const hours = date.getUTCHours().toString().padStart(2, "0");
//     const minutes = date.getUTCMinutes().toString().padStart(2, "0");
//     const day = date.getUTCDate().toString().padStart(2, "0");
//     const month = date.getUTCMonth();
//     const year = date.getUTCFullYear();
//     const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

//     return `${hours}:${minutes}, ${day} ${monthNames[month]} ${year}`;
//   };

//   if (!isClient) {
//     return (
//       <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//         <Container px={0} className={`py-[44px] md:py-[100px]`}>
//           <Card p={0} radius={8} className={`!shadow-lg`}>
//             <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//               <Flex justify="center" align="center" h={200}>
//                 <Text>Memuat invoice...</Text>
//               </Flex>
//             </Card>
//           </Card>
//         </Container>
//       </div>
//     );
//   }

//   return (
//     <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//       <Container px={0} className={`py-[44px] md:py-[100px]`}>
//         <Card p={0} radius={8} className={`!shadow-lg`}>
//           <Card className={`!bg-gradient-to-bl from-primary-base to-primary-dark !overflow-visible`} p={30} c="white" radius={0}>
//             <Stack gap={30}>
//               <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
//                 <Flex gap={15} align="center">
//                   <Icon icon="iconamoon:invoice-light" className={`text-[48px]`} />
//                   <Stack gap={0}>
//                     <Title order={1} className={`uppercase !text-[20px] md:!text-[1.8rem]`}>
//                       Invoice Pesanan
//                     </Title>
//                     <Text size="sm">{invoice}</Text>
//                   </Stack>
//                 </Flex>

//                 <Stack gap={5} className={`items-start md:!items-end`}>
//                   <Card px={15} py={5} radius={10} withBorder className={`!overflow-visible`}>
//                     <Flex align="center" gap={10}>
//                       <Text size="sm" c="gray.8">
//                         Status Pembayaran :
//                       </Text>
//                       <Flex gap={5} align="center">
//                         <Icon
//                           icon={iconStatus[data?.payment_status?.toLowerCase() ?? "pending"]}
//                           className={`
//                             text-[18px]
//                             ${data?.payment_status?.toLowerCase() == "expired" && "text-red-400"}
//                             ${data?.payment_status?.toLowerCase() == "pending" && "text-yellow-500"}
//                             ${data?.payment_status?.toLowerCase() == "verified" && "text-green-500"}
//                           `}
//                         />
//                         <Text size="md" fw={400}>
//                           {data?.payment_status?.toLowerCase() == "expired" && <>Expired</>}
//                           {data?.payment_status?.toLowerCase() == "pending" && <>Pending</>}
//                           {data?.payment_status?.toLowerCase() == "verified" && <>Berhasil</>}
//                         </Text>
//                       </Flex>
//                     </Flex>
//                   </Card>
//                 </Stack>
//               </Flex>
//             </Stack>
//           </Card>

//           {/* Hanya menampilkan panel invoice, tanpa tabs tracking */}
//           <Stack py={25} gap={30} className={`px-[20px] md:!px-[30px]`}>
//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap-reverse">
//               <Stack gap={10}>
//                 <Text fw={600} c="gray.8">
//                   Informasi Pemesan
//                 </Text>
//                 <Card withBorder>
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Nama Pemesan
//                       </Text>
//                       <Text size="sm" fw={600}>
//                         {data?.address?.nama_penerima || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Kurir yang Dipilih
//                       </Text>
//                       <Text size="sm" className="capitalize">
//                         {data?.courier?.main || "-"} - {data?.courier?.type || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Tanggal Pesanan Dibuat
//                       </Text>
//                       <Text size="sm" suppressHydrationWarning>
//                         {formatDate(data?.created_at)}
//                       </Text>
//                     </Stack>
//                   </SimpleGrid>
//                 </Card>
//               </Stack>

//               <Stack gap={10} className={`md:max-w-[300px]`}>
//                 <Text fw={600} c="gray.8">
//                   Total Pembayaran
//                 </Text>
//                 <Card bg="gray.1">
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-1 !gap-[10px]`}>
//                     <Text size="xl" fw={600}>
//                       <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                     </Text>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Metode Pembayaran
//                       </Text>
//                       <Text size="sm" className="capitalize">
//                         {data?.payment_method || "-"}
//                       </Text>
//                     </Stack>
//                     <Button
//                       variant="light"
//                       color="blue"
//                       leftSection={<Icon icon="mdi:file-download-outline" />}
//                       onClick={handleDownloadInvoice}
//                       loading={loadingDownload}
//                       size="sm"
//                       fullWidth
//                       disabled={!invoice}
//                     >
//                       Download Invoice Merch
//                     </Button>
//                     {data?.xendit_url && (
//                       <Link href={data.xendit_url} target="_blank">
//                         <Button
//                           variant="light"
//                           color="green"
//                           leftSection={<Icon icon="mdi:external-link" />}
//                           size="sm"
//                           fullWidth
//                         >
//                           Buka Halaman Pembayaran
//                         </Button>
//                       </Link>
//                     )}
//                   </SimpleGrid>
//                 </Card>
//               </Stack>
//             </Flex>

//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//               <Stack gap={10}>
//                 <Text fw={600} c="gray.8">
//                   Informasi Pengiriman
//                 </Text>
//                 <Card withBorder>
//                   <SimpleGrid className={`!grid-cols-1 md:!grid-cols-2 !gap-[15px]`}>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         Nama Penerima
//                       </Text>
//                       <Text size="sm" fw={600}>
//                         {data?.address?.nama_penerima || "-"}
//                       </Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300}>
//                         No. Telp Penerima
//                       </Text>
//                       <Text size="sm">{data?.address?.phone || "-"}</Text>
//                     </Stack>
//                     <Stack gap={0}>
//                       <Text size="xs" fw={300} mb={5}>
//                         Alamat Pengiriman
//                       </Text>
//                       <Text size="xs">
//                         {province?.name || "-"}, {city?.name || "-"}, {data?.address?.zipcode || "-"}
//                       </Text>
//                       <Text size="xs">{data?.address?.address_detail || "-"}</Text>
//                     </Stack>
//                   </SimpleGrid>
//                 </Card>
//               </Stack>
//             </Flex>

//             <Flex gap={15} className={`[&>*]:flex-grow`} wrap="wrap">
//               <Stack gap={10} className={`[&_*]:!text-[14px]`}>
//                 <Text fw={600} c="gray.8">
//                   Detail Pesanan
//                 </Text>
                
//                 <Box maw="calc(100vw - 40px)" className={`overflow-auto`}>
//                   <Table withRowBorders={false} horizontalSpacing="md" miw={600}>
//                     <Table.Thead>
//                       <Table.Tr>
//                         <Table.Th>No</Table.Th>
//                         <Table.Th>Produk</Table.Th>
//                         <Table.Th>Qty</Table.Th>
//                         <Table.Th>Harga Satuan</Table.Th>
//                         <Table.Th>Subtotal</Table.Th>
//                       </Table.Tr>
//                     </Table.Thead>
//                     <Table.Tbody>
//                       {data?.detail?.map((e, i) => {
//                         // Ambil harga dari detail item (response invoice)
//                         const price = parseInt(e.price || "0");
//                         const qty = e.qty || 0;
//                         const subtotal = price * qty;
                        
//                         return (
//                           <Table.Tr key={i}>
//                             <Table.Td>{i + 1}</Table.Td>
//                             <Table.Td>
//                               <Flex gap={15} className={`!py-[5px]`}>
//                                 <Image 
//                                   src={e.product?.product_image?.[0]?.image_url || "#"} 
//                                   w={48} 
//                                   h={48} 
//                                   bg="gray.1" 
//                                   radius={5} 
//                                   className={`shrink-0`} 
//                                 />
//                                 <Stack gap={0}>
//                                   <Text>{e.product?.product_name || "-"}</Text>
//                                   {Boolean(e.product_varian_id) && (
//                                     <Text size="sm" c="gray.7">
//                                       Varian: {e.variant?.varian_name || "-"}
//                                     </Text>
//                                   )}
//                                   {/* Menambahkan order_notes di bawah nama produk */}
//                                   {e.order_notes && (
//                                     <Text size="xs" c="dimmed" fs="italic" mt={4}>
//                                       Catatan: {e.order_notes}
//                                     </Text>
//                                   )}
//                                 </Stack>
//                               </Flex>
//                             </Table.Td>
//                             <Table.Td>{qty}</Table.Td>
//                             <Table.Td>
//                               <NumberFormatter value={price} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                             </Table.Td>
//                             <Table.Td>
//                               <NumberFormatter value={subtotal} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                             </Table.Td>
//                           </Table.Tr>
//                         );
//                       })}
//                     </Table.Tbody>
//                   </Table>
//                 </Box>

//                 {/* Summary Card dengan Biaya Kurir */}
//                 <Card withBorder mt="md" bg="gray.0">
//                   <Stack gap="xs">
//                     <Flex justify="space-between">
//                       <Text fw={500}>Subtotal Produk:</Text>
//                       <Text fw={500}>
//                         <NumberFormatter value={totalProductPrice} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                       </Text>
//                     </Flex>
//                     <Flex justify="space-between">
//                       <Text fw={500}>Biaya Admin:</Text>
//                       <Text fw={500}>
//                         <NumberFormatter value={adminFee} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                       </Text>
//                     </Flex>
//                     <Flex justify="space-between">
//                       <Text fw={500}>Biaya Pengiriman ({data?.courier?.main || "-"} - {data?.courier?.type || "-"}):</Text>
//                       <Text fw={500}>
//                         <NumberFormatter value={courierPrice} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                       </Text>
//                     </Flex>
//                     <Divider my="xs" />
//                     <Flex justify="space-between">
//                       <Text fw={700} size="lg">Total Pembayaran:</Text>
//                       <Text fw={700} size="lg" c="blue">
//                         <NumberFormatter value={grandTotal} thousandSeparator="." decimalSeparator="," prefix="Rp " />
//                       </Text>
//                     </Flex>
//                   </Stack>
//                 </Card>
//               </Stack>
//             </Flex>
//           </Stack>
//         </Card>
//       </Container>
//     </div>
//   );
// }