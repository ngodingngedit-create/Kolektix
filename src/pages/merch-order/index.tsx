// pages/cart.tsx
// import { PropsWithChildren, useEffect, useMemo, useState } from "react";
// import {
//   Container,
//   Group,
//   Checkbox,
//   Text,
//   Title,
//   Button,
//   Paper,
//   Stack,
//   Image,
//   Flex,
//   Card,
//   NumberFormatter,
//   ActionIcon,
//   Center,
//   NumberInput,
//   AspectRatio,
//   Divider,
//   UnstyledButton,
//   TextInput,
//   Box,
//   Modal,
//   Select,
//   Textarea,
//   Loader,
// } from "@mantine/core";
// import { useListState } from "@mantine/hooks";
// import { MerchListResponse } from "../dashboard/merch/type";
// import { Delete, Get } from "@/utils/REST";
// import useLoggedUser from "@/utils/useLoggedUser";
// import _ from "lodash";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import { useRouter } from "next/router";
// import { useForm, zodResolver } from "@mantine/form";
// import Cookies from "js-cookie";
// import fetch from "@/utils/fetch";
// import { AddressData, addressDataSchema, AddressUpdateRequest } from "../dashboard/profile/address";
// import { currencyFormat } from "@/utils/currencyFormat";
// import { z } from "zod";

// type Province = {
//   id: number;
//   name: string;
// };

// type City = {
//   id: number;
//   province_id: number;
//   name: string;
//   province?: Province;
// };

// type FormState = {
//   nama_pemesan?: string;
//   email_pemesan?: string;
//   receiver?: {
//     id?: number;
//     name: string;
//     phone: string;
//     address_name: string;
//     province_id: number;
//     city_id: number;
//     pos_code: number;
//     detail: string;
//   };
//   payment_method?: string;
//   courier?: {
//     name: string;
//     type?: GetCourierRes;
//   };
// };

// type GetCourierReq = {
//   origin: number;
//   origin_type: string;
//   destination: number;
//   destination_type: string;
//   weight: number;
//   courier: string;
// };

// type GetCourierRes = {
//   service: string;
//   description: string;
//   cost: Array<{
//     value: number;
//     etd: string;
//     note: string;
//   }>;
// };

// type OrderData = {
//   product_id: number;
//   variant_id: number;
//   qty: number;
// }[];

// type Checkout = {
//   user_id: number | null;
//   nama_pemesan?: string;
//   email_pemesan?: string;
//   creator_id: number;
//   grandtotal: number;
//   product: Array<{
//     product_id: number;
//     variant_id: null | number;
//     qty: number;
//     price: number;
//   }>;
//   payment_method: string;
//   courier: {
//     main: string;
//     type: string;
//     price: number;
//   };
//   address: {
//     id?: number;
//     is_main_address: number;
//     province_id: number;
//     city_id: number;
//     address_detail: string;
//     address_name: string;
//     zipcode: string;
//     latitude: string;
//     longitude: string;
//     nama_penerima: string;
//     phone: string;
//     is_active: number;
//   };
// };

// export const formStateSchema = z.object({
//   nama_pemesan: z.string().nonempty("Nama pemesan tidak boleh kosong.").optional().nullable(),
//   email_pemesan: z.string().email("Email pemesan tidak boleh kosong.").optional().nullable(),
//   receiver: z.object({
//     name: z.string().nonempty("Nama penerima tidak boleh kosong."),
//     address_name: z.string().nonempty("Nama alamat tidak boleh kosong."),
//     phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
//     province_id: z.number().int().positive("ID provinsi harus berupa bilangan bulat positif."),
//     city_id: z.number().int().positive("ID kota harus berupa bilangan bulat positif."),
//     pos_code: z.number().int().nonnegative("Kode pos harus berupa bilangan bulat non-negatif."),
//     detail: z.string().nonempty("Detail alamat tidak boleh kosong."),
//   }),
//   payment_method: z.string().nonempty("Metode Pembayaran tidak boleh kosong."),
//   courier: z.object({
//     name: z.string().nonempty("Kurir tidak boleh kosong."),
//     type: z.any().optional(),
//   }),
// });

// export default function Cart() {
//   const [isr, setIsr] = useState(false);
//   const [modal, setModal] = useState<string>();
//   const [orderData, setOrderData] = useState<OrderData>();
//   const [productList, setProductList] = useListState<MerchListResponse>();
//   const [addressList, setAddressList] = useListState<AddressUpdateRequest>([]);
//   const [loading, setLoading] = useListState<string>();
//   const [provinceList, setProvinceList] = useListState<Province>([]);
//   const [cityList, setCityList] = useListState<City>([]);
//   const [subCourier, setSubCourier] = useListState<GetCourierRes>();
//   const user = useLoggedUser();
//   const router = useRouter();

//   const form = useForm<FormState>({});

//   useEffect(() => {
//     setIsr(true);
//   }, []);

//   useEffect(() => {
//     getData();
//     const _orderData = JSON.parse(Cookies.get("order_data") ?? "[]");
//     if (!_orderData || _orderData.length == 0) router.push("/merchandise");
//     setOrderData(_orderData);
//   }, [isr]);

//   useEffect(() => {
//     if (form.values.receiver && form.values.courier) {
//       getCourier();
//       form.setValues({ courier: { name: form.values.courier.name, type: undefined } });
//     }
//   }, [form.values.receiver, form.values.courier?.name]);

//   const getData = async () => {
//     Get("product", {})
//       .then((res: any) => {
//         setProductList.setState(res.data);
//         console.log(res.data);
//       })
//       .catch((err) => {
//         console.log(err);
//       });

//     await fetch<any, Province[]>({
//       url: "province",
//       method: "GET",
//       before: () => setLoading.append("getprovince"),
//       success: ({ data }) => {
//         setProvinceList.setState(data ?? []);
//       },
//       complete: () => setLoading.filter((e) => e != "getprovince"),
//     });

//     if (user?.id) {
//       await fetch<any, AddressUpdateRequest[]>({
//         url: `my-address?user_id=${user?.id}`,
//         method: "GET",
//         before: () => setLoading.append("getprovince"),
//         success: ({ data }) => {
//           if (data) {
//             setAddressList.setState(data ?? []);

//             const mainAddress = _.find(data, ["is_main_address", 1]) ?? data[0];
//             form.setValues({
//               receiver: {
//                 name: mainAddress.nama_penerima,
//                 phone: mainAddress.phone,
//                 address_name: mainAddress.address_name,
//                 province_id: mainAddress.province_id,
//                 city_id: mainAddress.city_id,
//                 pos_code: parseInt(mainAddress.zipcode),
//                 detail: mainAddress.address_detail,
//               },
//             });

//             getCity(mainAddress.province_id);
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "getprovince"),
//       });
//     }
//   };

//   const getCity = async (province_id: number) => {
//     await fetch<any, City[]>({
//       url: `city?province_id=${province_id}`,
//       method: "GET",
//       before: () => setLoading.append("getcity"),
//       success: ({ data }) => {
//         setCityList.setState(data ?? []);
//       },
//       complete: () => setLoading.filter((e) => e != "getcity"),
//     });
//   };

//   const orderedProduct = useMemo(() => {
//     return orderData?.map((e) => {
//       const product = _.find(productList, ["id", e.product_id]);
//       const variant = e.variant_id ? _.find(product?.product_varian, ["id", e.variant_id]) : null;
//       const subprice = parseInt((!variant ? product?.price : variant?.price) ?? "0");
//       const weight = parseInt((!variant ? product?.weight : variant?.weight) ?? "0");
//       const price = subprice * e.qty;
//       const image = product?.product_image[0] ? product?.product_image[0].image_url : "#";
//       const creator_id = product?.creator_id;

//       return { ...e, product, variant, price, subprice, image, weight, creator_id };
//     });
//   }, [productList, orderData]);

//   const orderSummary = useMemo(() => {
//     const result: [string, number][] = [];

//     for (const order of orderedProduct ?? []) {
//       result.push([`x${order.qty} ${order.product?.product_name ?? "-"}`, order.price]);
//     }

//     if (form.values.courier?.type && form.values.courier?.type.cost && form.values.courier?.type.cost.length > 0) {
//       result.push(["Biaya Pengiriman", form.values.courier?.type.cost[0].value]);
//     }

//     result.push(["Biaya Admin", 2000]);

//     // const subtotal = result.reduce((q, n) => q + n[1], 0);
//     // result.push(["PPN (11%)", subtotal * 0.11]);

//     const grandtotal = result.reduce((q, n) => q + n[1], 0);
//     result.push(["Total", grandtotal]);

//     return { array: result, grandtotal };
//   }, [orderedProduct, form.values.courier?.type, form.values.receiver]);

//   const getCourier = async () => {
//     const originCityId =
//       orderedProduct && orderedProduct.length > 0 && orderedProduct[0].product?.has_store_location && typeof orderedProduct[0].product.has_store_location.city_id === "number" ? orderedProduct[0].product.has_store_location.city_id : 1;

//     await fetch<GetCourierReq, GetCourierRes[]>({
//       url: "product-cost",
//       method: "POST",
//       data: {
//         origin: originCityId,
//         origin_type: "city",
//         destination: form.values.receiver?.city_id ?? 0,
//         destination_type: "city",
//         weight: _.sumBy(orderedProduct, "weight") == 0 ? 999 : _.sumBy(orderedProduct, "weight"),
//         courier: form.values.courier?.name ?? "-",
//       },
//       before: () => setLoading.append("getsubcourier"),
//       success: (res) => setSubCourier.setState(res.data ?? []),
//       complete: () => setLoading.filter((e) => e != "getsubcourier"),
//       error: (err) => {
//         console.error("Failed to fetch courier:", err);
//       },
//     });
//   };

//   const handleCheckout = async () => {
//     const { values } = form;
//     await fetch<Checkout, { invoice_url: string }>({
//       url: "order-product",
//       method: "POST",
//       data: {
//         user_id: user?.id ?? null,
//         nama_pemesan: values.nama_pemesan,
//         email_pemesan: values.email_pemesan,
//         creator_id: orderedProduct ? orderedProduct[0].creator_id ?? 0 : 0,
//         grandtotal: orderSummary.grandtotal,
//         product: (orderedProduct ?? []).map((e) => ({
//           product_id: e.product_id,
//           variant_id: e.variant_id,
//           qty: e.qty,
//           price: e.price,
//         })),
//         payment_method: "xendit",
//         courier: {
//           main: values.courier?.name ?? "-",
//           type: values.courier?.type?.service ?? "-",
//           price: values.courier?.type?.cost[0].value ?? 999999,
//         },
//         address: {
//           id: values.receiver?.id,
//           is_main_address: 1,
//           province_id: values.receiver?.province_id ?? 1,
//           city_id: values.receiver?.city_id ?? 1,
//           address_detail: values.receiver?.detail ?? "",
//           address_name: values.receiver?.address_name ?? "",
//           zipcode: String(values.receiver?.pos_code),
//           latitude: "",
//           longitude: "",
//           nama_penerima: values.receiver?.name ?? "",
//           phone: values.receiver?.phone ?? "",
//           is_active: 1,
//         },
//       },
//       before: () => setLoading.append("checkout"),
//       success: ({ data }) => data && router.push(data.invoice_url),
//       complete: () => setLoading.filter((e) => e != "checkout"),
//       error: () => {},
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   };

//   return (
//     <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//       <AddressModal
//         opened={modal == "address"}
//         onClose={() => setModal(undefined)}
//         list={addressList}
//         onChange={(data) => data && form.setValues({ receiver: data })}
//         province={provinceList}
//         getCity={(e) => getCity(e)}
//         cityLoading={loading.includes("getcity")}
//         city={cityList}
//       />

//       <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px`}>
//         <Stack gap={25} mb={40}>
//           <Stack gap={0}>
//             <Title order={1} size="h2">
//               Checkout Merchandise
//             </Title>
//             <Text size="sm" c="gray">
//               Pilih Metode Pembayaran dan Alamat Pengiriman
//             </Text>
//           </Stack>

//           <Divider />

//           <Flex gap={20} w="100%" wrap="wrap">
//             <Stack gap={15} className={`flex-grow`}>
//               <DropdownComponent title="Alamat Pengiriman" icon="lets-icons:form-fill" defaultOpened>
//                 {!user?.id && (
//                   <Flex gap={15} wrap="wrap" className="[&>*]:!flex-grow">
//                     <TextInput
//                       disabled={Boolean(user?.id)}
//                       label="Nama Pemesan"
//                       placeholder="Masukan Nama Pemesan"
//                       onChange={(e) => form.setValues({ nama_pemesan: e.target.value })}
//                       value={form.values.nama_pemesan}
//                       error={form.errors.nama_pemesan}
//                     />

//                     <TextInput
//                       type="email"
//                       disabled={Boolean(user?.id)}
//                       label="Email Pemesan"
//                       placeholder="Masukan Email Pemesan"
//                       onChange={(e) => form.setValues({ email_pemesan: e.target.value })}
//                       value={form.values.email_pemesan}
//                       error={form.errors.email_pemesan}
//                     />
//                   </Flex>
//                 )}

//                 <UnstyledButton mih="100%" onClick={() => {}}>
//                   <Card withBorder p={20} radius={15} h="100%" className={`!border-b-3 !border-b-[#0B387C] ${form.values?.receiver?.pos_code ? "" : "!bg-primary-light"}`} onClick={() => setModal("address")}>
//                     {form.values?.receiver?.pos_code ? (
//                       <Flex gap={15}>
//                         <Box c={"#0B387C"}>
//                           <Icon icon="gis:location-poi" className={`text-[24px]`} />
//                         </Box>
//                         <Stack gap={3} mt={-5}>
//                           <Text fw={600} size="lg">
//                             {form.values.receiver.address_name}
//                           </Text>
//                           <Text c="gray" size="sm">
//                             {form.values.receiver.name}, {form.values.receiver.phone}
//                           </Text>
//                           <Text c="gray" size="sm" mt={5} className={`uppercase`}>
//                             {_.find(provinceList, ["id", form.values.receiver.province_id])?.name}, {_.find(cityList, ["id", form.values.receiver.city_id])?.name}, {form.values.receiver.pos_code}
//                           </Text>
//                           <Text c="gray" size="sm">
//                             {form.values.receiver.detail}
//                           </Text>
//                           {/* <Text c="gray" size="xs">({form.values.receiver?.note})</Text> */}
//                         </Stack>
//                       </Flex>
//                     ) : (
//                       <Flex align="center" gap={10} justify="center">
//                         <Icon icon="uiw:plus" className={`text-primary-base`} />
//                         <Text size="sm" c="gray.8">
//                           Pilih atau Tambah Alamat
//                         </Text>
//                       </Flex>
//                     )}
//                   </Card>
//                 </UnstyledButton>
//               </DropdownComponent>

//               <DropdownComponent title="Kurir Pengiriman" icon="fa-solid:shipping-fast">
//                 <Flex wrap="wrap" className={`[&>*]:!flex-grow`} gap={15}>
//                   <Select
//                     disabled={!form.values.receiver?.city_id}
//                     data={[
//                       { value: "jne", label: "JNE" },
//                       { value: "tiki", label: "TIKI" },
//                       { value: "pos", label: "POS Indonesia" },
//                     ]}
//                     placeholder="Pilih Kurir Pengiriman"
//                     value={form.values.courier?.name}
//                     onChange={(e) => {
//                       if (e) {
//                         form.setValues({ courier: { name: e, type: undefined } });
//                       }
//                     }}
//                   />
//                   <Flex gap={10} align="center">
//                     {loading.includes("getsubcourier") && <Loader size="sm" color="#0B387C" />}
//                     <Select
//                       className={`flex-grow`}
//                       disabled={!subCourier || subCourier.length <= 0 || loading.includes("getsubcourier")}
//                       data={subCourier.map((e) => ({ value: e.service, label: `${e.service} (${e.cost[0].etd} ${e.cost[0].etd.includes("HARI") ? "" : "HARI"}) ${currencyFormat(e.cost[0].value)}` }))}
//                       value={form.values.courier?.type?.service}
//                       onChange={(e) => form.setValues({ courier: { name: form.values.courier?.name ?? "-", type: subCourier.find((z) => z.service == e) } })}
//                       placeholder="Pilih Type Pengiriman"
//                     />
//                   </Flex>
//                 </Flex>
//               </DropdownComponent>

//               {/* <DropdownComponent title="Metode Pembayaran" icon="fluent:payment-16-filled">
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
//             </Stack>

//             <Stack gap={10} className={`flex-grow md:!max-w-[400px]`}>
//               <Card withBorder radius={10} p={20}>
//                 <Stack gap={20}>
//                   <Flex gap={10} align="center">
//                     <Icon icon="octicon:info-24" className={`text-primary-base text-[20px]`} />
//                     <Text fw={600}>Rincian Produk</Text>
//                   </Flex>

//                   <Divider />

//                   {(orderedProduct ?? []).map((e, i) => (
//                     <Flex key={i} gap={15} wrap="wrap">
//                       <AspectRatio className={`shrink-0`}>
//                         <Image alt="image" src={e.image} h={50} w={50} bg="gray.1" radius="sm" />
//                       </AspectRatio>
//                       <Stack className={`flex-grow`} gap={0}>
//                         <Text className={`whitespace-nowrap text-ellipsis overflow-hidden max-w-[150px] md:max-w-[250px]`} size="sm">
//                           {e.product?.product_name}
//                         </Text>
//                         {e.variant && (
//                           <Text c="gray" size="sm">
//                             Varian: {e.variant?.varian_name}
//                           </Text>
//                         )}
//                         <Text c="gray" size="sm">
//                           <NumberFormatter value={e.subprice} />
//                         </Text>
//                       </Stack>
//                       <Text>x{e.qty}</Text>
//                     </Flex>
//                   ))}
//                 </Stack>
//               </Card>

//               <Card withBorder radius={10} p={20}>
//                 <Stack gap={20}>
//                   <Flex gap={10} align="center">
//                     <Icon icon="mdi:voucher-outline" className={`text-primary-base text-[20px]`} />
//                     <Text fw={600}>Voucher</Text>
//                   </Flex>

//                   <TextInput placeholder="Masukan Kode Voucher" />
//                 </Stack>
//               </Card>

//               <Card withBorder radius={10} p={20}>
//                 <Stack gap={20}>
//                   <Flex gap={10} align="center">
//                     <Icon icon="uiw:information" className={`text-primary-base text-[20px]`} />
//                     <Text fw={600}>Total Pembayaran</Text>
//                   </Flex>

//                   <Divider />

//                   <Stack>
//                     {orderSummary.array.map((e, i) => (
//                       <Flex justify="space-between" key={i}>
//                         <Text fw={e[0] == "Total" ? 600 : 400}>{e[0]}</Text>
//                         <Text fw={e[0] == "Total" ? 600 : 400}>
//                           <NumberFormatter value={e[1]} />
//                         </Text>
//                       </Flex>
//                     ))}
//                   </Stack>

//                   {/* <Divider /> */}

//                   {/* <Button
//                                         loading={loading.includes('checkout')}
//                                         onClick={handleCheckout}
//                                         className={`uppercase`}
//                                         color="#194E9E"
//                                         rightSection={<Icon icon="uiw:check" />}
//                                         radius="xl">
//                                         Proses Pembayaran
//                                     </Button> */}
//                 </Stack>
//               </Card>
//             </Stack>
//           </Flex>
//         </Stack>

//         <Card pos="fixed" className={`bottom-0 left-0 w-[100vw] border-t !border-primary-light`} py={10} withBorder>
//           <Container size="lg" w="100%">
//             <Flex justify="end" w="100%">
//               <Button loading={loading.includes("checkout")} onClick={handleCheckout} className={`uppercase`} color="#194E9E" rightSection={<Icon icon="uiw:check" />} radius="xl">
//                 Proses Pembayaran
//               </Button>
//             </Flex>
//           </Container>
//         </Card>
//       </Container>
//     </div>
//   );
// }

// const DropdownComponent = ({ defaultOpened, children, title, icon }: PropsWithChildren<{ defaultOpened?: boolean; title: string; icon: string }>) => {
//   const [opened, setOpened] = useState<boolean>(defaultOpened ?? false);

//   return (
//     <>
//       <Card bg="white" radius={10} withBorder>
//         <Stack>
//           <Flex justify="space-between" align="center" gap={20} onClick={() => setOpened(!opened)} className={`cursor-pointer`}>
//             <Flex align="center" gap={10}>
//               <Icon icon={icon} className={`text-[20px] text-[#194E9E]`} />
//               <Text>{title}</Text>
//             </Flex>

//             <ActionIcon variant="transparent" c="gray">
//               <Icon icon="uiw:down" className={`transition-transform ${opened ? "!rotate-180" : ""}`} />
//             </ActionIcon>
//           </Flex>

//           <Stack className={`${opened ? "" : "!hidden"}`} p={5}>
//             {children}
//           </Stack>
//         </Stack>
//       </Card>
//     </>
//   );
// };

// const AddressModal = ({
//   list,
//   opened,
//   onClose,
//   onChange,
//   province,
//   getCity,
//   city,
//   cityLoading,
// }: {
//   list: AddressUpdateRequest[];
//   opened: boolean;
//   onClose: () => void;
//   onChange: (data: FormState["receiver"]) => void;
//   getCity: (province_id: number) => void;
//   cityLoading: boolean;
//   province: Province[];
//   city: City[];
// }) => {
//   const [page, setPage] = useState<"create" | "select">("select");

//   const form = useForm<Omit<AddressData, "id">>({
//     validate: zodResolver(addressDataSchema),
//     onValuesChange: (values) => {
//       if (values.postcode) values.postcode = values.postcode.replaceAll(/\D/g, "");
//       if (values.phone) values.phone = values.phone.replaceAll(/\D/g, "");
//       return values;
//     },
//   });

//   const handleSelect = (data?: AddressUpdateRequest) => {
//     if (data) {
//       onChange({
//         id: data.id,
//         name: data.nama_penerima,
//         phone: data.phone,
//         address_name: data.address_name,
//         province_id: data.province_id,
//         city_id: data.city_id,
//         pos_code: parseInt(data.zipcode),
//         detail: data.address_detail,
//       });
//     } else {
//       const valid = form.validate();
//       if (valid.hasErrors) return;

//       const { values } = form;
//       onChange({
//         name: values.nama_penerima,
//         phone: values.phone,
//         address_name: values.name,
//         province_id: values.province,
//         city_id: values.city,
//         pos_code: parseInt(values.postcode),
//         detail: values.detail,
//       });
//     }
//     onClose();
//   };

//   useEffect(() => {
//     setPage("select");
//   }, [opened]);

//   useEffect(() => {
//     getCity(form.values.province);
//     form.setValues({ city: -1 });
//   }, [form.values.province]);

//   return (
//     <>
//       <Modal title={"Pilih Alamat"} opened={opened} onClose={() => onClose()} centered>
//         {page == "select" && list.length > 0 ? (
//           <Stack gap={20}>
//             {list.map((e, i) => (
//               <UnstyledButton key={i} mih="100%" onClick={() => handleSelect(e)}>
//                 <Card
//                   withBorder
//                   p={20}
//                   radius={15}
//                   h="100%"
//                   className={`!border-b !border-b-[#0B387C]`}
//                   // onClick={() => setModal('address')}
//                 >
//                   <Flex gap={15}>
//                     <Box c={"#0B387C"}>
//                       <Icon icon="gis:location-poi" className={`text-[24px]`} />
//                     </Box>
//                     <Stack gap={3} mt={-5}>
//                       <Text fw={600} size="lg">
//                         {e.address_name}
//                       </Text>
//                       <Text c="gray" size="sm" mt={5} className={`uppercase`}>
//                         {_.find(province, ["id", e.province_id])?.name}, {_.find(city, ["id", e.city_id])?.name}, {e.zipcode}
//                       </Text>
//                       <Text c="gray" size="sm">
//                         {e.address_detail}
//                       </Text>
//                       <Text c="gray" size="sm">
//                         {e.phone}
//                       </Text>
//                       {/* <Text c="gray" size="xs">({form.values.receiver?.note})</Text> */}
//                     </Stack>
//                   </Flex>
//                 </Card>
//               </UnstyledButton>
//             ))}

//             <Button onClick={() => setPage("create")} color="#0B387C" variant="outline" className={`!border-dashed`}>
//               Tambah Baru
//             </Button>
//           </Stack>
//         ) : (
//           <Stack gap={15} p={5}>
//             <TextInput label="Nama Penerima" placeholder="Masukan Nama Penerima" {...form.getInputProps("nama_penerima")} />

//             <TextInput label="Nama Alamat" placeholder="Rumah, Kantor, ..." {...form.getInputProps("name")} />

//             <TextInput label="No. Telp" placeholder="08XX XXXX XXXX" {...form.getInputProps("phone")} />

//             <Flex gap={15} className={`[&>*]:flex-grow !flex-col md:!flex-row`}>
//               <Select
//                 searchable
//                 label="Provinsi"
//                 placeholder="Pilih Provinsi"
//                 data={_.sortBy(province, "name").map((e) => ({ value: String(e.id), label: e.name }))}
//                 value={String(form.values.province)}
//                 onChange={(e) => e && form.setFieldValue("province", parseInt(e))}
//                 error={form.errors.province}
//               />

//               <Select
//                 disabled={cityLoading}
//                 label="Kota"
//                 placeholder="Pilih Kota"
//                 data={city.map((e) => ({ value: String(e.id), label: e.name }))}
//                 value={String(form.values.city)}
//                 onChange={(e) => e && form.setFieldValue("city", parseInt(e))}
//                 error={form.errors.city}
//               />
//             </Flex>

//             <TextInput label="Kode Pos" placeholder="Masukan Kode Pos" {...form.getInputProps("postcode")} />

//             <Textarea autosize minRows={3} label="Detail Alamat" placeholder="Kecamatan, Desa, No. Rumah, dll" {...form.getInputProps("detail")} />

//             <Text size="xs" c="gray">
//               Periksa kembali alamat yang Anda masukkan untuk memastikan tidak ada kesalahan.
//             </Text>

//             <Flex align="center" gap={10} justify="space-between" mt={10}>
//               <Button
//                 color="#0B387C"
//                 w="fit-content"
//                 radius="xl"
//                 leftSection={<Icon icon="uiw:check" />}
//                 onClick={() => handleSelect()}
//                 // loading={loading.includes('save')}
//               >
//                 Simpan Alamat
//               </Button>

//               {/* {(modalIndex && modalIndex > 0) ? (
//                                 <ActionIcon
//                                     variant="transparent"
//                                     color="red"
//                                     onClick={() => handleDelete()}
//                                 >
//                                     <Icon icon="uiw:delete" />
//                                 </ActionIcon>
//                             ) : <></>} */}
//             </Flex>
//           </Stack>
//         )}
//       </Modal>
//     </>
//   );
// };

// import { PropsWithChildren, useEffect, useMemo, useState } from "react";
// import {
//   Container,
//   Group,
//   Checkbox,
//   Text,
//   Title,
//   Button,
//   Paper,
//   Stack,
//   Image,
//   Flex,
//   Card,
//   NumberFormatter,
//   ActionIcon,
//   Center,
//   NumberInput,
//   AspectRatio,
//   Divider,
//   UnstyledButton,
//   TextInput,
//   Box,
//   Modal,
//   Select,
//   Textarea,
//   Loader,
//   SimpleGrid,
//   Grid,
//   Accordion,
// } from "@mantine/core";
// import { useListState } from "@mantine/hooks";
// import { MerchListResponse } from "../dashboard/merch/type";
// import { Delete, Get } from "@/utils/REST";
// import useLoggedUser from "@/utils/useLoggedUser";
// import _ from "lodash";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import { useRouter } from "next/router";
// import { useForm, zodResolver } from "@mantine/form";
// import Cookies from "js-cookie";
// import fetch from "@/utils/fetch";
// import { AddressData, addressDataSchema, AddressUpdateRequest } from "../dashboard/profile/address";
// import { currencyFormat } from "@/utils/currencyFormat";
// import { z } from "zod";

// type Province = {
//   id: number;
//   name: string;
// };

// type City = {
//   id: number;
//   province_id: number;
//   name: string;
//   province?: Province;
// };

// type StoreLocation = {
//   id: number;
//   location_type: string;
//   creator_id: number;
//   province_id: number;
//   city_id: number;
//   subdistric_id: number;
//   postal_code: string;
//   store_name: string;
//   full_addres: string;
//   created_by: string | null;
//   updated_by: string | null;
//   created_at: string | null;
//   updated_at: string | null;
//   deleted_at: string | null;
//   is_active: number;
// };

// type FormState = {
//   nama_pemesan?: string;
//   email_pemesan?: string;
//   phone_pemesan?: string;
//   pickup_location?: {
//     store_location_id: number;
//     address: string;
//     store_name: string;
//   };
//   receiver?: {
//     id?: number;
//     name: string;
//     phone: string;
//     address_name: string;
//     province_id: number;
//     city_id: number;
//     pos_code: number;
//     detail: string;
//   };
//   payment_method?: string;
//   courier?: {
//     name: string;
//     type?: GetCourierRes;
//   };
//   is_pickup_instore: 0 | 1;
//   is_delivery: 0 | 1;
// };

// type GetCourierReq = {
//   origin: number;
//   origin_type: string;
//   destination: number;
//   destination_type: string;
//   weight: number;
//   courier: string;
// };

// type GetCourierRes = {
//   service: string;
//   description: string;
//   cost: Array<{
//     value: number;
//     etd: string;
//     note: string;
//   }>;
// };

// type OrderData = {
//   product_id: number;
//   variant_id: number;
//   qty: number;
// }[];

// type Checkout = {
//   user_id: number | null;
//   nama_pemesan?: string | null;
//   email_pemesan?: string | null;
//   phone_pemesan?: string | null;
//   creator_id: number | null;
//   grandtotal: number;
//   product: Array<{
//     product_id: number;
//     variant_id: null | number;
//     qty: number;
//     price: number;
//   }>;
//   payment_method: string;
//   courier?: {
//     main: string;
//     type: string;
//     price: number;
//   };
//   address?: {
//     id?: number;
//     is_main_address: number;
//     province_id: number;
//     city_id: number;
//     address_detail: string;
//     address_name: string;
//     zipcode: string;
//     latitude: string;
//     longitude: string;
//     nama_penerima: string;
//     phone: string;
//     is_active: number;
//   };
//   order_pickup?: {
//     store_location_id: number;
//   };
//   is_pickup_instore: 0 | 1;
//   is_delivery: 0 | 1;
// };

// export const formStateSchema = z.object({
//   nama_pemesan: z.string().nonempty("Nama pemesan tidak boleh kosong.").optional().nullable(),
//   email_pemesan: z.string().email("Email pemesan tidak valid.").optional().nullable(),
//   phone_pemesan: z
//     .string()
//     .min(10, "Nomor telepon minimal 10 digit")
//     .max(15, "Nomor telepon maksimal 15 digit")
//     .regex(/^[0-9]+$/, "Nomor telepon harus berupa angka")
//     .optional()
//     .nullable(),
//   pickup_location: z
//     .object({
//       store_location_id: z.number().int().positive("Store location harus dipilih."),
//       address: z.string().nonempty("Lokasi pengambilan tidak boleh kosong."),
//       store_name: z.string().nonempty("Nama store tidak boleh kosong."),
//     })
//     .optional(),
//   receiver: z.object({
//     name: z.string().nonempty("Nama penerima tidak boleh kosong."),
//     address_name: z.string().nonempty("Nama alamat tidak boleh kosong."),
//     phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
//     province_id: z.number().int().positive("ID provinsi harus berupa bilangan bulat positif."),
//     city_id: z.number().int().positive("ID kota harus berupa bilangan bulat positif."),
//     pos_code: z.number().int().nonnegative("Kode pos harus berupa bilangan bulat non-negatif."),
//     detail: z.string().nonempty("Detail alamat tidak boleh kosong."),
//   }),
//   payment_method: z.string().nonempty("Metode Pembayaran tidak boleh kosong."),
//   courier: z.object({
//     name: z.string().nonempty("Kurir tidak boleh kosong."),
//     type: z.any().optional(),
//   }),
//   is_pickup_instore: z.number().int().min(0).max(1),
//   is_delivery: z.number().int().min(0).max(1),
// });

// export default function Cart() {
//   const [isr, setIsr] = useState(false);
//   const [modal, setModal] = useState<string>();
//   const [orderData, setOrderData] = useState<OrderData>();
//   const [productList, setProductList] = useListState<MerchListResponse>([]);
//   const [addressList, setAddressList] = useListState<AddressUpdateRequest>([]);
//   const [loading, setLoading] = useListState<string>();
//   const [provinceList, setProvinceList] = useListState<Province>([]);
//   const [cityList, setCityList] = useListState<City>([]);
//   const [subCourier, setSubCourier] = useListState<GetCourierRes>();
//   const [storeLocations, setStoreLocations] = useListState<StoreLocation>([]);
//   const [pickupDeliveryInfo, setPickupDeliveryInfo] = useState<{
//     is_pickup_instore: 0 | 1;
//     is_delivery: 0 | 1;
//   }>({
//     is_pickup_instore: 0,
//     is_delivery: 0,
//   });

//   const user = useLoggedUser();
//   const router = useRouter();

//   const form = useForm<FormState>({
//     initialValues: {
//       nama_pemesan: user?.name || "",
//       email_pemesan: user?.email || "",
//       phone_pemesan: "",
//       is_pickup_instore: 0,
//       is_delivery: 0,
//     },
//     validate: zodResolver(formStateSchema),
//   });

//   // Update form values when user data changes
//   useEffect(() => {
//     if (user) {
//       form.setValues({
//         nama_pemesan: user.name || "",
//         email_pemesan: user.email || "",
//         phone_pemesan: "",
//       });
//     }
//   }, [user]);

//   // Fungsi untuk mendapatkan alamat singkat
//   const getShortAddress = (fullAddress: string) => {
//     const parts = fullAddress.split(",");
//     if (parts.length > 2) {
//       return parts.slice(0, 2).join(",").trim();
//     }
//     return fullAddress;
//   };

//   // Fungsi untuk mendapatkan alamat detail yang dipotong
//   const getTruncatedAddress = (fullAddress: string) => {
//     const shortAddress = getShortAddress(fullAddress);
//     const remaining = fullAddress.replace(shortAddress, "").replace(/^,\s*/, "");

//     if (remaining.length > 50) {
//       return remaining.substring(0, 50) + "...";
//     }
//     return remaining;
//   };

//   useEffect(() => {
//     setIsr(true);
//   }, []);

//   useEffect(() => {
//     getData();
//     const _orderData = JSON.parse(Cookies.get("order_data") ?? "[]");
//     if (!_orderData || _orderData.length == 0) router.push("/merchandise");
//     setOrderData(_orderData);
//   }, [isr]);

//   useEffect(() => {
//     if (form.values.receiver && form.values.courier && pickupDeliveryInfo.is_delivery === 1) {
//       getCourier();
//       form.setValues({ courier: { name: form.values.courier.name, type: undefined } });
//     }
//   }, [form.values.receiver, form.values.courier?.name, pickupDeliveryInfo.is_delivery]);

//   const getData = async () => {
//     try {
//       const res: any = await Get("product", {});
//       console.log("API Product Data:", res.data);
//       setProductList.setState(res.data);

//       // Ekstrak store locations dari produk
//       const allStoreLocations: StoreLocation[] = [];
//       res.data.forEach((product: any) => {
//         if (product.has_store_location && product.has_store_location.is_active === 1) {
//           // Cek apakah store location sudah ada dalam array
//           const exists = allStoreLocations.some(loc => loc.id === product.has_store_location.id);
//           if (!exists) {
//             allStoreLocations.push(product.has_store_location);
//           }
//         }
//       });
//       setStoreLocations.setState(allStoreLocations);
//       console.log("Store locations extracted:", allStoreLocations);

//       // Dapatkan orderData dari cookies
//       const _orderData = JSON.parse(Cookies.get("order_data") ?? "[]");

//       // Cari produk yang sesuai dengan orderData
//       if (_orderData && _orderData.length > 0) {
//         // Ambil product_id pertama dari order
//         const firstProductId = _orderData[0].product_id;
//         console.log("First product ID in order:", firstProductId);

//         // Cari produk yang sesuai dengan ID di order
//         const orderedProduct = _.find(res.data, ["id", firstProductId]);
//         console.log("Found ordered product:", orderedProduct);

//         if (orderedProduct) {
//           // Ambil nilai dari produk yang dipesan
//           const hasPickupInstore = orderedProduct.is_pickup_instore === 1 ? 1 : 0;
//           const hasDelivery = orderedProduct.is_delivery === 1 ? 1 : 0;

//           console.log("Product pickup/delivery settings:", {
//             productId: orderedProduct.id,
//             productName: orderedProduct.product_name,
//             is_pickup_instore: orderedProduct.is_pickup_instore,
//             is_delivery: orderedProduct.is_delivery,
//             hasPickupInstore,
//             hasDelivery,
//           });

//           setPickupDeliveryInfo({
//             is_pickup_instore: hasPickupInstore,
//             is_delivery: hasDelivery,
//           });

//           form.setValues({
//             is_pickup_instore: hasPickupInstore,
//             is_delivery: hasDelivery,
//           });

//           // Set default pickup location jika produk memiliki store location
//           if (hasPickupInstore === 1 && orderedProduct.has_store_location) {
//             form.setValues({
//               pickup_location: {
//                 store_location_id: orderedProduct.has_store_location.id,
//                 address: orderedProduct.has_store_location.full_addres,
//                 store_name: orderedProduct.has_store_location.store_name,
//               },
//             });
//           }

//           // Reset form values jika tidak ada delivery
//           if (hasDelivery === 0) {
//             form.setValues({
//               courier: undefined,
//               receiver: undefined,
//             });
//           }

//           // Reset form values jika tidak ada pickup instore
//           if (hasPickupInstore === 0) {
//             form.setValues({
//               nama_pemesan: undefined,
//               email_pemesan: undefined,
//               phone_pemesan: undefined,
//               pickup_location: undefined,
//             });
//           }
//         }
//       }
//     } catch (err) {
//       console.log(err);
//     }

//     await fetch<any, Province[]>({
//       url: "province",
//       method: "GET",
//       before: () => setLoading.append("getprovince"),
//       success: ({ data }) => {
//         setProvinceList.setState(data ?? []);
//       },
//       complete: () => setLoading.filter((e) => e != "getprovince"),
//     });

//     if (user?.id) {
//       await fetch<any, AddressUpdateRequest[]>({
//         url: `my-address?user_id=${user?.id}`,
//         method: "GET",
//         before: () => setLoading.append("getaddress"),
//         success: ({ data }) => {
//           if (data) {
//             setAddressList.setState(data ?? []);

//             if (pickupDeliveryInfo.is_delivery === 1) {
//               const mainAddress = _.find(data, ["is_main_address", 1]) ?? data[0];
//               if (mainAddress) {
//                 form.setValues({
//                   receiver: {
//                     id: mainAddress.id,
//                     name: mainAddress.nama_penerima,
//                     phone: mainAddress.phone,
//                     address_name: mainAddress.address_name,
//                     province_id: mainAddress.province_id,
//                     city_id: mainAddress.city_id,
//                     pos_code: parseInt(mainAddress.zipcode),
//                     detail: mainAddress.address_detail,
//                   },
//                 });

//                 getCity(mainAddress.province_id);
//               }
//             }
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "getaddress"),
//       });
//     }
//   };

//   const getCity = async (province_id: number) => {
//     await fetch<any, City[]>({
//       url: `city?province_id=${province_id}`,
//       method: "GET",
//       before: () => setLoading.append("getcity"),
//       success: ({ data }) => {
//         setCityList.setState(data ?? []);
//       },
//       complete: () => setLoading.filter((e) => e != "getcity"),
//     });
//   };

//   const orderedProduct = useMemo(() => {
//     return orderData?.map((e) => {
//       const product = _.find(productList, ["id", e.product_id]);
//       const variant = e.variant_id ? _.find(product?.product_varian, ["id", e.variant_id]) : null;
//       const subprice = parseInt((!variant ? product?.price : variant?.price) ?? "0");
//       const weight = parseInt((!variant ? product?.weight : variant?.weight) ?? "0");
//       const price = subprice * e.qty;
//       const image = product?.product_image[0] ? product?.product_image[0].image_url : "#";
//       const creator_id = product?.creator_id;
//       const is_pickup_instore = product?.is_pickup_instore === 1;
//       const is_delivery = product?.is_delivery === 1;

//       return { ...e, product, variant, price, subprice, image, weight, creator_id, is_pickup_instore, is_delivery };
//     });
//   }, [productList, orderData]);

//   const orderSummary = useMemo(() => {
//     const result: [string, number][] = [];

//     for (const order of orderedProduct ?? []) {
//       result.push([`x${order.qty} ${order.product?.product_name ?? "-"}`, order.price]);
//     }

//     if (pickupDeliveryInfo.is_delivery === 1 && form.values.courier?.type && form.values.courier?.type.cost && form.values.courier?.type.cost.length > 0) {
//       result.push(["Biaya Pengiriman", form.values.courier?.type.cost[0].value]);
//     }

//     result.push(["Biaya Admin", 10000]);

//     const grandtotal = result.reduce((q, n) => q + n[1], 0);
//     result.push(["Total", grandtotal]);

//     return { array: result, grandtotal };
//   }, [orderedProduct, form.values.courier?.type, form.values.receiver, pickupDeliveryInfo.is_delivery]);

//   const getCourier = async () => {
//     if (pickupDeliveryInfo.is_delivery === 0 || !form.values.receiver?.city_id) return;

//     const originCityId =
//       orderedProduct && orderedProduct.length > 0 && orderedProduct[0].product?.has_store_location && typeof orderedProduct[0].product.has_store_location.city_id === "number" ? orderedProduct[0].product.has_store_location.city_id : 1;

//     await fetch<GetCourierReq, GetCourierRes[]>({
//       url: "product-cost",
//       method: "POST",
//       data: {
//         origin: originCityId,
//         origin_type: "city",
//         destination: form.values.receiver?.city_id ?? 0,
//         destination_type: "city",
//         weight: _.sumBy(orderedProduct, "weight") == 0 ? 999 : _.sumBy(orderedProduct, "weight"),
//         courier: form.values.courier?.name ?? "-",
//       },
//       before: () => setLoading.append("getsubcourier"),
//       success: (res) => {
//         console.log("Courier API response:", res);
//         if (res.data) {
//           setSubCourier.setState(res.data ?? []);
//         }
//       },
//       complete: () => setLoading.filter((e) => e != "getsubcourier"),
//       error: (err) => {
//         console.error("Failed to fetch courier:", err);
//         // Set default courier options jika API gagal
//         const defaultCouriers: GetCourierRes[] = [
//           {
//             service: "JTR",
//             description: "JTR",
//             cost: [{ value: 10000, etd: "2-3 HARI", note: "Pengiriman reguler" }],
//           },
//           {
//             service: "YES",
//             description: "Express",
//             cost: [{ value: 20000, etd: "1-2 HARI", note: "Pengiriman express" }],
//           },
//         ];
//         setSubCourier.setState(defaultCouriers);
//       },
//     });
//   };

//   const handleCheckout = async () => {
//     const { values } = form;

//     // Validasi form berdasarkan kondisi
//     if (pickupDeliveryInfo.is_pickup_instore === 1) {
//       if (!values.nama_pemesan) {
//         form.setFieldError("nama_pemesan", "Nama pemesan harus diisi untuk pickup instore");
//         return;
//       }
//       if (!values.email_pemesan) {
//         form.setFieldError("email_pemesan", "Email pemesan harus diisi untuk pickup instore");
//         return;
//       }
//       if (!values.phone_pemesan) {
//         form.setFieldError("phone_pemesan", "Nomor telepon pemesan harus diisi untuk pickup instore");
//         return;
//       }
//       if (!values.pickup_location?.store_location_id) {
//         form.setFieldError("pickup_location", "Lokasi pengambilan harus dipilih untuk pickup instore");
//         return;
//       }
//     }

//     // HANYA validasi receiver jika delivery aktif
//     if (pickupDeliveryInfo.is_delivery === 1) {
//       if (!values.receiver) {
//         form.setFieldError("receiver", "Alamat pengiriman harus diisi untuk delivery");
//         return;
//       }
//       // Kurir TIDAK perlu divalidasi karena ada nilai default
//     }

//     // Validasi orderedProduct
//     if (!orderedProduct || orderedProduct.length === 0) {
//       console.error("Tidak ada produk dalam order");
//       return;
//     }

//     // Format phone_pemesan jika ada
//     const formattedPhone = values.phone_pemesan ? values.phone_pemesan.replace(/\D/g, "") : undefined;

//     // Default user_id = 6 jika null
//     const userId = user?.id ?? 6;

//     // Prepare checkout data sesuai dengan payload yang berhasil
//     const checkoutData: Checkout = {
//       user_id: userId,
//       nama_pemesan: pickupDeliveryInfo.is_pickup_instore === 1 ? values.nama_pemesan || null : null,
//       email_pemesan: pickupDeliveryInfo.is_pickup_instore === 1 ? values.email_pemesan || null : null,
//       phone_pemesan: pickupDeliveryInfo.is_pickup_instore === 1 ? formattedPhone || null : null,
//       creator_id: orderedProduct && orderedProduct.length > 0 ? orderedProduct[0].creator_id || null : null,
//       grandtotal: orderSummary.grandtotal,
//       product: (orderedProduct ?? []).map((e) => ({
//         product_id: e.product_id,
//         variant_id: e.variant_id || null,
//         qty: e.qty,
//         price: e.subprice,
//       })),
//       payment_method: "xendit",
//       is_pickup_instore: pickupDeliveryInfo.is_pickup_instore,
//       is_delivery: pickupDeliveryInfo.is_delivery,
//     };

//     // Add order_pickup jika is_pickup_instore = 1
//     if (pickupDeliveryInfo.is_pickup_instore === 1 && values.pickup_location) {
//       checkoutData.order_pickup = {
//         store_location_id: values.pickup_location.store_location_id,
//       };
//     }

//     // Add delivery data jika is_delivery = 1
//     if (pickupDeliveryInfo.is_delivery === 1 && values.receiver) {
//       // Gunakan kurir dari form jika ada, atau default jika tidak ada
//       const courierName = values.courier?.name || "jne";
//       const courierType = values.courier?.type?.service || "JTR";
//       const courierPrice = values.courier?.type?.cost?.[0]?.value || 10000;

//       checkoutData.courier = {
//         main: courierName.toUpperCase(),
//         type: courierType,
//         price: courierPrice,
//       };

//       // Address sesuai dengan receiver yang dipilih user
//       // Hapus user_id dari object address karena tidak sesuai dengan type
//       checkoutData.address = {
//         id: values.receiver.id,
//         is_main_address: 1,
//         province_id: values.receiver.province_id,
//         city_id: values.receiver.city_id,
//         address_detail: values.receiver.detail,
//         address_name: values.receiver.address_name,
//         zipcode: String(values.receiver.pos_code),
//         latitude: "",
//         longitude: "",
//         nama_penerima: values.receiver.name,
//         phone: values.receiver.phone,
//         is_active: 1,
//       };
//     } else {
//       // Jika delivery tidak aktif (is_delivery = 0), isi dengan default values
//       checkoutData.courier = {
//         main: "JNE",
//         type: "JTR",
//         price: 10000,
//       };

//       checkoutData.address = {
//         is_main_address: 1,
//         province_id: 11,
//         city_id: 22,
//         address_detail: "Ambil di Pasar Bareng Bareng",
//         address_name: "Pasar Bareng Bareng",
//         zipcode: "15147",
//         latitude: "",
//         longitude: "",
//         nama_penerima: "Pickup Instore",
//         phone: "081234567890",
//         is_active: 1,
//       };
//     }

//     console.log("Data checkout yang dikirim:", checkoutData);

//     try {
//       await fetch<any, { invoice_url: string }>({
//         url: "order-product",
//         method: "POST",
//         data: checkoutData,
//         before: () => setLoading.append("checkout"),
//         success: ({ data, status, message, error }) => {
//           console.log("Response checkout:", { data, status, message, error });
//           if (data && data.invoice_url) {
//             // Clear cookies setelah checkout berhasil
//             Cookies.remove("order_data");
//             router.push(data.invoice_url);
//           } else {
//             console.error("Gagal membuat transaksi:", { message, error });
//             // Coba parse error message jika berupa string JSON
//             if (typeof message === "string" && message.includes("{")) {
//               try {
//                 const parsedError = JSON.parse(message);
//                 console.error("Parsed error:", parsedError);
//                 alert(`Gagal membuat transaksi: ${parsedError.message || parsedError.error || "Unknown error"}`);
//               } catch {
//                 alert(`Gagal membuat transaksi: ${message || error || "Unknown error"}`);
//               }
//             } else {
//               alert(`Gagal membuat transaksi: ${message || error || "Unknown error"}`);
//             }
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "checkout"),
//         error: (err) => {
//           console.error("Error checkout:", err);
//           alert("Terjadi kesalahan saat memproses checkout. Silakan coba lagi.");
//         },
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     } catch (error) {
//       console.error("Checkout error:", error);
//       alert("Terjadi kesalahan sistem. Silakan coba lagi.");
//     }
//   };

//   // Tentukan accordion mana yang akan ditampilkan berdasarkan kondisi
//   const getAccordionItems = () => {
//     const items = [];

//     if (pickupDeliveryInfo.is_pickup_instore === 1) {
//       items.push(
//         <Accordion.Item key="data-pemesan" value="data-pemesan">
//           <Accordion.Control>
//             <Flex gap={10} align="center">
//               <Icon icon="lets-icons:form-fill" className={`text-[20px] text-[#194E9E]`} />
//               <Text fw={600}>Data Pemesan</Text>
//             </Flex>
//           </Accordion.Control>
//           <Accordion.Panel>
//             <Stack gap="md">
//               <TextInput
//                 label="Nama Pemesan"
//                 placeholder="Masukan Nama Pemesan"
//                 onChange={(e) => form.setValues({ nama_pemesan: e.target.value })}
//                 onBlur={() => form.validateField("nama_pemesan")}
//                 value={form.values.nama_pemesan || ""}
//               />

//               <TextInput
//                 type="email"
//                 label="Email Pemesan"
//                 placeholder="Masukan Email Pemesan"
//                 onChange={(e) => form.setValues({ email_pemesan: e.target.value })}
//                 onBlur={() => form.validateField("email_pemesan")}
//                 value={form.values.email_pemesan || ""}
//               />

//               <TextInput
//                 type="tel"
//                 label="No. Telepon Pemesan"
//                 placeholder="Masukan No. Telepon Pemesan (contoh: 081234567890)"
//                 onChange={(e) => {
//                   // Format input untuk hanya menerima angka
//                   const value = e.target.value.replace(/\D/g, "");
//                   form.setValues({ phone_pemesan: value });
//                 }}
//                 onBlur={() => form.validateField("phone_pemesan")}
//                 value={form.values.phone_pemesan || ""}
//               />

//               {/* Bagian 1: Lokasi Pengambilan - Card dengan border bottom biru */}
//               <div>
//                 <Text size="sm" fw={500} mb={5}>
//                   Lokasi Pengambilan
//                 </Text>
//                 <UnstyledButton onClick={() => setModal("pickup")} className="w-full">
//                   <Card
//                     withBorder
//                     p={15}
//                     radius={10}
//                     className={`
//                       w-full
//                       !border !border-gray-300 
//                       hover:bg-gray-50 
//                       transition-colors 
//                       cursor-pointer
//                       !border-b-3 !border-b-[#0B387C]
//                     `}
//                   >
//                     {form.values.pickup_location ? (
//                       <Flex gap={10} align="center">
//                         <Box c={"#0B387C"}>
//                           <Icon icon="gis:location-poi" className={`text-[20px]`} />
//                         </Box>
//                         <Stack gap={2} className="flex-grow">
//                           <Text fw={500} size="sm" lineClamp={1}>
//                             {form.values.pickup_location.store_name}
//                           </Text>
//                           <Text c="gray" size="xs" lineClamp={1}>
//                             {getTruncatedAddress(form.values.pickup_location.address)}
//                           </Text>
//                         </Stack>
//                         <Icon icon="uiw:right" className="text-gray-400 text-sm" />
//                       </Flex>
//                     ) : (
//                       <Flex align="center" gap={10} justify="center">
//                         <Icon icon="uiw:plus" className={`text-primary-base`} />
//                         <Text size="sm" c="gray.8">
//                           Pilih Lokasi Pengambilan
//                         </Text>
//                       </Flex>
//                     )}
//                   </Card>
//                 </UnstyledButton>
//               </div>
//             </Stack>
//           </Accordion.Panel>
//         </Accordion.Item>,
//       );
//     }

//     if (pickupDeliveryInfo.is_delivery === 1) {
//       items.push(
//         <Accordion.Item key="data-pengiriman" value="data-pengiriman">
//           <Accordion.Control>
//             <Flex gap={10} align="center">
//               <Icon icon="fa-solid:shipping-fast" className={`text-[20px] text-[#194E9E]`} />
//               <Text fw={600}>Data Pengiriman</Text>
//             </Flex>
//           </Accordion.Control>
//           <Accordion.Panel>
//             <Stack gap="md">
//               {/* Bagian 2: Alamat Pengiriman - Card dengan border bottom biru */}
//               <div>
//                 <Text size="sm" fw={500} mb={5}>
//                   Alamat Pengiriman
//                 </Text>
//                 <UnstyledButton mih="100%" onClick={() => setModal("address")} className="w-full">
//                   <Card
//                     withBorder
//                     p={15}
//                     radius={10}
//                     h="100%"
//                     className={`
//                       w-full
//                       !border !border-gray-300 
//                       hover:bg-gray-50 
//                       transition-colors 
//                       cursor-pointer
//                       !border-b-3 !border-b-[#0B387C]
//                       ${form.values?.receiver?.pos_code ? "" : "!bg-primary-light"}
//                     `}
//                   >
//                     {form.values?.receiver?.pos_code ? (
//                       <Flex gap={10} align="center">
//                         <Box c={"#0B387C"}>
//                           <Icon icon="gis:location-poi" className={`text-[20px]`} />
//                         </Box>
//                         <Stack gap={2} className="flex-grow">
//                           <Text fw={500} size="sm" lineClamp={1}>
//                             {form.values.receiver.address_name}
//                           </Text>
//                           <Text c="gray" size="xs" lineClamp={1}>
//                             {form.values.receiver.name}, {form.values.receiver.phone}
//                           </Text>
//                           <Text c="gray" size="xs" lineClamp={1} className={`uppercase`}>
//                             {_.find(provinceList, ["id", form.values.receiver.province_id])?.name}, {_.find(cityList, ["id", form.values.receiver.city_id])?.name}
//                           </Text>
//                         </Stack>
//                         <Icon icon="uiw:right" className="text-gray-400 text-sm" />
//                       </Flex>
//                     ) : (
//                       <Flex align="center" gap={10} justify="center">
//                         <Icon icon="uiw:plus" className={`text-primary-base`} />
//                         <Text size="sm" c="gray.8">
//                           Pilih atau Tambah Alamat
//                         </Text>
//                       </Flex>
//                     )}
//                   </Card>
//                 </UnstyledButton>
//               </div>

//               {/* Bagian Kurir Pengiriman - OPSIONAL */}
//               <div>
//                 <Text size="sm" fw={500} mb={5}>
//                   Pilih Kurir (Opsional)
//                 </Text>
//                 <Flex wrap="wrap" gap={10}>
//                   <Select
//                     className="flex-grow"
//                     disabled={!form.values.receiver?.city_id}
//                     data={[
//                       { value: "jne", label: "JNE" },
//                       { value: "tiki", label: "TIKI" },
//                       { value: "pos", label: "POS Indonesia" },
//                     ]}
//                     placeholder="Pilih Kurir Pengiriman (Opsional)"
//                     value={form.values.courier?.name}
//                     onChange={(e) => {
//                       if (e) {
//                         form.setValues({ courier: { name: e, type: undefined } });
//                       }
//                     }}
//                   />
//                   <Flex gap={10} align="center" className="flex-grow">
//                     {form.values.courier?.name && loading.includes("getsubcourier") && <Loader size="sm" color="#0B387C" />}
//                     <Select
//                       className={`flex-grow`}
//                       disabled={!form.values.courier?.name || !subCourier || subCourier.length <= 0 || loading.includes("getsubcourier")}
//                       data={subCourier.map((e) => ({ value: e.service, label: `${e.service} (${e.cost[0].etd} ${e.cost[0].etd.includes("HARI") ? "" : "HARI"}) ${currencyFormat(e.cost[0].value)}` }))}
//                       value={form.values.courier?.type?.service}
//                       onChange={(e) => form.setValues({ courier: { name: form.values.courier?.name ?? "-", type: subCourier.find((z) => z.service == e) } })}
//                       placeholder="Pilih Tipe Pengiriman (Opsional)"
//                     />
//                   </Flex>
//                 </Flex>
//                 <Text size="xs" c="gray" mt={5}>
//                   Jika tidak memilih kurir, sistem akan menggunakan kurir default
//                 </Text>
//               </div>
//             </Stack>
//           </Accordion.Panel>
//         </Accordion.Item>,
//       );
//     }

//     return items;
//   };

//   return (
//     <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//       <AddressModal
//         opened={modal == "address"}
//         onClose={() => setModal(undefined)}
//         list={addressList}
//         onChange={(data) => data && form.setValues({ receiver: data })}
//         province={provinceList}
//         getCity={(e) => getCity(e)}
//         cityLoading={loading.includes("getcity")}
//         city={cityList}
//       />

//       <PickupLocationModal
//         opened={modal == "pickup"}
//         onClose={() => setModal(undefined)}
//         onSelect={(store_location_id, address, store_name) => form.setValues({ pickup_location: { store_location_id, address, store_name } })}
//         currentStoreLocationId={form.values.pickup_location?.store_location_id}
//         storeLocations={storeLocations}
//       />

//       <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px`}>
//         <Stack gap={25} mb={40}>
//           <Stack gap={0}>
//             <Title order={1} size="h2">
//               Checkout Merchandise
//             </Title>
//             <Text size="sm" c="gray">
//               Pilih Metode Pembayaran dan Alamat Pengiriman
//             </Text>
//           </Stack>

//           <Divider />

//           {/* Grid 60/40 Layout */}
//           <Grid>
//             {/* Bagian Kiri - 60% */}
//             <Grid.Col span={{ base: 12, md: 7 }}>
//               {pickupDeliveryInfo.is_pickup_instore === 1 || pickupDeliveryInfo.is_delivery === 1 ? (
//                 <Accordion variant="separated" radius="md" defaultValue={[...(pickupDeliveryInfo.is_pickup_instore === 1 ? ["data-pemesan"] : []), ...(pickupDeliveryInfo.is_delivery === 1 ? ["data-pengiriman"] : [])]} multiple>
//                   {getAccordionItems()}
//                 </Accordion>
//               ) : (
//                 <Card withBorder radius="md" p="md">
//                   <Text c="red" ta="center">
//                     Tidak ada metode pengiriman yang tersedia untuk produk ini.
//                   </Text>
//                 </Card>
//               )}
//             </Grid.Col>

//             {/* Bagian Kanan - 40% */}
//             <Grid.Col span={{ base: 12, md: 5 }}>
//               <Stack gap={10}>
//                 <Card withBorder radius={10} p={20}>
//                   <Stack gap={15}>
//                     <Flex gap={10} align="center">
//                       <Icon icon="octicon:info-24" className={`text-primary-base text-[20px]`} />
//                       <Text fw={600}>Rincian Produk</Text>
//                     </Flex>

//                     <Divider />

//                     {(orderedProduct ?? []).map((e, i) => (
//                       <Flex key={i} gap={15} align="center">
//                         <AspectRatio ratio={1} w={60}>
//                           <Image alt="image" src={e.image} w="100%" h="100%" bg="gray.1" radius="sm" />
//                         </AspectRatio>
//                         <Stack gap={3} className={`flex-grow`}>
//                           <Text size="sm" fw={500}>
//                             {e.product?.product_name}
//                           </Text>
//                           {e.variant && (
//                             <Text c="gray" size="xs">
//                               Varian: {e.variant?.varian_name}
//                             </Text>
//                           )}
//                           <Text size="sm" fw={600}>
//                             <NumberFormatter value={e.subprice} prefix="Rp " thousandSeparator="." decimalSeparator="," />
//                           </Text>
//                           <Flex gap={5}>
//                             {e.is_pickup_instore && (
//                               <Text size="xs" c="blue" fw={500}>
//                                 Pickup In-store
//                               </Text>
//                             )}
//                             {e.is_delivery && (
//                               <Text size="xs" c="green" fw={500}>
//                                 Delivery
//                               </Text>
//                             )}
//                           </Flex>
//                         </Stack>
//                         <Text size="sm">x{e.qty}</Text>
//                       </Flex>
//                     ))}
//                   </Stack>
//                 </Card>

//                 <Card withBorder radius={10} p={20}>
//                   <Stack gap={15}>
//                     <Flex gap={10} align="center">
//                       <Icon icon="mdi:voucher-outline" className={`text-primary-base text-[20px]`} />
//                       <Text fw={600}>Voucher</Text>
//                     </Flex>

//                     <TextInput placeholder="Masukan Kode Voucher" />
//                   </Stack>
//                 </Card>

//                 <Card withBorder radius={10} p={20}>
//                   <Stack gap={15}>
//                     <Flex gap={10} align="center">
//                       <Icon icon="uiw:information" className={`text-primary-base text-[20px]`} />
//                       <Text fw={600}>Total Pembayaran</Text>
//                     </Flex>

//                     <Divider />

//                     <Stack>
//                       {orderSummary.array.map((e, i) => (
//                         <Flex justify="space-between" key={i}>
//                           <Text fw={e[0] == "Total" ? 600 : 400}>{e[0]}</Text>
//                           <Text fw={e[0] == "Total" ? 600 : 400}>
//                             <NumberFormatter value={e[1]} prefix="Rp " thousandSeparator="." decimalSeparator="," />
//                           </Text>
//                         </Flex>
//                       ))}
//                     </Stack>
//                   </Stack>
//                 </Card>
//               </Stack>
//             </Grid.Col>
//           </Grid>
//         </Stack>

//         <Card pos="fixed" className={`bottom-0 left-0 w-[100vw] border-t !border-primary-light`} py={10} withBorder>
//           <Container size="lg" w="100%">
//             <Flex justify="end" w="100%">
//               <Button
//                 loading={loading.includes("checkout")}
//                 onClick={handleCheckout}
//                 className={`uppercase`}
//                 color="#194E9E"
//                 rightSection={<Icon icon="uiw:check" />}
//                 radius="xl"
//                 disabled={!(pickupDeliveryInfo.is_pickup_instore === 1 || pickupDeliveryInfo.is_delivery === 1)}
//               >
//                 Proses Pembayaran
//               </Button>
//             </Flex>
//           </Container>
//         </Card>
//       </Container>
//     </div>
//   );
// }

// const AddressModal = ({
//   list,
//   opened,
//   onClose,
//   onChange,
//   province,
//   getCity,
//   city,
//   cityLoading,
// }: {
//   list: AddressUpdateRequest[];
//   opened: boolean;
//   onClose: () => void;
//   onChange: (data: FormState["receiver"]) => void;
//   getCity: (province_id: number) => void;
//   cityLoading: boolean;
//   province: Province[];
//   city: City[];
// }) => {
//   const [page, setPage] = useState<"create" | "select">("select");

//   const form = useForm<Omit<AddressData, "id">>({
//     validate: zodResolver(addressDataSchema),
//     onValuesChange: (values) => {
//       if (values.postcode) values.postcode = values.postcode.replaceAll(/\D/g, "");
//       if (values.phone) values.phone = values.phone.replaceAll(/\D/g, "");
//       return values;
//     },
//   });

//   const handleSelect = (data?: AddressUpdateRequest) => {
//     if (data) {
//       onChange({
//         id: data.id,
//         name: data.nama_penerima,
//         phone: data.phone,
//         address_name: data.address_name,
//         province_id: data.province_id,
//         city_id: data.city_id,
//         pos_code: parseInt(data.zipcode),
//         detail: data.address_detail,
//       });
//     } else {
//       const valid = form.validate();
//       if (valid.hasErrors) return;

//       const { values } = form;
//       onChange({
//         name: values.nama_penerima,
//         phone: values.phone,
//         address_name: values.name,
//         province_id: values.province,
//         city_id: values.city,
//         pos_code: parseInt(values.postcode),
//         detail: values.detail,
//       });
//     }
//     onClose();
//   };

//   useEffect(() => {
//     setPage("select");
//   }, [opened]);

//   useEffect(() => {
//     getCity(form.values.province);
//     form.setValues({ city: -1 });
//   }, [form.values.province]);

//   return (
//     <>
//       <Modal title={"Pilih Alamat"} opened={opened} onClose={() => onClose()} centered>
//         {page == "select" && list.length > 0 ? (
//           <Stack gap={20}>
//             {list.map((e, i) => (
//               <UnstyledButton key={i} mih="100%" onClick={() => handleSelect(e)}>
//                 <Card withBorder p={20} radius={15} h="100%" className={`!border-b !border-b-[#0B387C]`}>
//                   <Flex gap={15}>
//                     <Box c={"#0B387C"}>
//                       <Icon icon="gis:location-poi" className={`text-[24px]`} />
//                     </Box>
//                     <Stack gap={3} mt={-5}>
//                       <Text fw={600} size="lg">
//                         {e.address_name}
//                       </Text>
//                       <Text c="gray" size="sm" mt={5} className={`uppercase`}>
//                         {_.find(province, ["id", e.province_id])?.name}, {_.find(city, ["id", e.city_id])?.name}, {e.zipcode}
//                       </Text>
//                       <Text c="gray" size="sm">
//                         {e.address_detail}
//                       </Text>
//                       <Text c="gray" size="sm">
//                         {e.phone}
//                       </Text>
//                     </Stack>
//                   </Flex>
//                 </Card>
//               </UnstyledButton>
//             ))}

//             <Button onClick={() => setPage("create")} color="#0B387C" variant="outline" className={`!border-dashed`}>
//               Tambah Baru
//             </Button>
//           </Stack>
//         ) : (
//           <Stack gap={15} p={5}>
//             <TextInput label="Nama Penerima" placeholder="Masukan Nama Penerima" {...form.getInputProps("nama_penerima")} />

//             <TextInput label="Nama Alamat" placeholder="Rumah, Kantor, ..." {...form.getInputProps("name")} />

//             <TextInput label="No. Telp" placeholder="08XX XXXX XXXX" {...form.getInputProps("phone")} />

//             <Flex gap={15} className={`[&>*]:flex-grow !flex-col md:!flex-row`}>
//               <Select
//                 searchable
//                 label="Provinsi"
//                 placeholder="Pilih Provinsi"
//                 data={_.sortBy(province, "name").map((e) => ({ value: String(e.id), label: e.name }))}
//                 value={String(form.values.province)}
//                 onChange={(e) => e && form.setFieldValue("province", parseInt(e))}
//               />

//               <Select
//                 disabled={cityLoading}
//                 label="Kota"
//                 placeholder="Pilih Kota"
//                 data={city.map((e) => ({ value: String(e.id), label: e.name }))}
//                 value={String(form.values.city)}
//                 onChange={(e) => e && form.setFieldValue("city", parseInt(e))}
//               />
//             </Flex>

//             <TextInput label="Kode Pos" placeholder="Masukan Kode Pos" {...form.getInputProps("postcode")} />

//             <Textarea autosize minRows={3} label="Detail Alamat" placeholder="Kecamatan, Desa, No. Rumah, dll" {...form.getInputProps("detail")} />

//             <Text size="xs" c="gray">
//               Periksa kembali alamat yang Anda masukkan untuk memastikan tidak ada kesalahan.
//             </Text>

//             <Flex align="center" gap={10} justify="space-between" mt={10}>
//               <Button color="#0B387C" w="fit-content" radius="xl" leftSection={<Icon icon="uiw:check" />} onClick={() => handleSelect()}>
//                 Simpan Alamat
//               </Button>
//             </Flex>
//           </Stack>
//         )}
//       </Modal>
//     </>
//   );
// };

// const PickupLocationModal = ({ 
//   opened, 
//   onClose, 
//   onSelect, 
//   currentStoreLocationId,
//   storeLocations 
// }: { 
//   opened: boolean; 
//   onClose: () => void; 
//   onSelect: (store_location_id: number, address: string, store_name: string) => void; 
//   currentStoreLocationId?: number;
//   storeLocations: StoreLocation[];
// }) => {
//   return (
//     <Modal title="Pilih Lokasi Pengambilan" opened={opened} onClose={onClose} centered>
//       <Stack gap={20}>
//         {storeLocations.length > 0 ? (
//           storeLocations.map((location) => (
//             <UnstyledButton
//               key={location.id}
//               onClick={() => {
//                 onSelect(location.id, location.full_addres, location.store_name);
//                 onClose();
//               }}
//             >
//               <Card 
//                 withBorder 
//                 p={20} 
//                 radius={15} 
//                 className={`!border-b !border-b-[#0B387C] ${currentStoreLocationId === location.id ? "bg-primary-light" : ""}`}
//               >
//                 <Flex gap={15}>
//                   <Box c={"#0B387C"}>
//                     <Icon icon="gis:location-poi" className={`text-[24px]`} />
//                   </Box>
//                   <Stack gap={3} mt={-5}>
//                     <Text fw={600} size="lg">
//                       {location.store_name}
//                     </Text>
//                     <Text c="gray" size="sm">
//                       {location.full_addres}
//                     </Text>
//                     <Text c="gray" size="xs">
//                       Kode Pos: {location.postal_code}
//                     </Text>
//                   </Stack>
//                 </Flex>
//               </Card>
//             </UnstyledButton>
//           ))
//         ) : (
//           <Text c="gray" ta="center">
//             Tidak ada lokasi pengambilan yang tersedia.
//           </Text>
//         )}

//         <Button onClick={onClose} color="#0B387C" variant="outline">
//           Tutup
//         </Button>
//       </Stack>
//     </Modal>
//   );
// };

// import { PropsWithChildren, useEffect, useMemo, useState } from "react";
// import {
//   Container,
//   Group,
//   Checkbox,
//   Text,
//   Title,
//   Button,
//   Paper,
//   Stack,
//   Image,
//   Flex,
//   Card,
//   NumberFormatter,
//   ActionIcon,
//   Center,
//   NumberInput,
//   AspectRatio,
//   Divider,
//   UnstyledButton,
//   TextInput,
//   Box,
//   Modal,
//   Select,
//   Textarea,
//   Loader,
//   SimpleGrid,
//   Grid,
//   Accordion,
//   Alert,
// } from "@mantine/core";
// import { useListState } from "@mantine/hooks";
// import { MerchListResponse } from "../dashboard/merch/type";
// import { Delete, Get } from "@/utils/REST";
// import useLoggedUser from "@/utils/useLoggedUser";
// import _ from "lodash";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import { useRouter } from "next/router";
// import { useForm, zodResolver } from "@mantine/form";
// import Cookies from "js-cookie";
// import fetch from "@/utils/fetch";
// import { AddressData, addressDataSchema, AddressUpdateRequest } from "../dashboard/profile/address";
// import { currencyFormat } from "@/utils/currencyFormat";
// import { z } from "zod";
// import { notifications } from "@mantine/notifications";

// type Province = {
//   id: number;
//   name: string;
// };

// type City = {
//   id: number;
//   province_id: number;
//   name: string;
//   province?: Province;
// };

// type StoreLocation = {
//   id: number;
//   location_type: string;
//   creator_id: number;
//   province_id: number;
//   city_id: number;
//   subdistric_id: number;
//   postal_code: string;
//   store_name: string;
//   full_addres: string;
//   created_by: string | null;
//   updated_by: string | null;
//   created_at: string | null;
//   updated_at: string | null;
//   deleted_at: string | null;
//   is_active: number;
// };

// type FormState = {
//   nama_pemesan?: string;
//   email_pemesan?: string;
//   phone_pemesan?: string;
//   pickup_location?: {
//     store_location_id: number;
//     address: string;
//     store_name: string;
//   };
//   receiver?: {
//     id?: number;
//     name: string;
//     phone: string;
//     address_name: string;
//     province_id: number;
//     city_id: number;
//     pos_code: number;
//     detail: string;
//   };
//   payment_method?: string;
//   payment_method_id?: number;
//   courier?: {
//     name: string;
//     type?: GetCourierRes;
//   };
//   is_pickup_instore: 0 | 1;
//   is_delivery: 0 | 1;
//   product_notes?: Record<number, string>; // Menyimpan notes per produk berdasarkan index
// };

// type GetCourierReq = {
//   origin: number;
//   origin_type: string;
//   destination: number;
//   destination_type: string;
//   weight: number;
//   courier: string;
// };

// type GetCourierRes = {
//   service: string;
//   description: string;
//   cost: Array<{
//     value: number;
//     etd: string;
//     note: string;
//   }>;
// };

// type OrderData = {
//   product_id: number;
//   variant_id: number;
//   qty: number;
//   order_notes?: string; // Tambahkan field notes
// }[];

// type Checkout = {
//   user_id: number | null;
//   nama_pemesan?: string | null;
//   email_pemesan?: string | null;
//   phone_pemesan?: string | null;
//   creator_id: number | null;
//   grandtotal: number;
//   product: Array<{
//     product_id: number;
//     variant_id: null | number;
//     qty: number;
//     price: number;
//     order_notes?: string; // Tambahkan field notes di sini
//   }>;
//   payment_method: string;
//   payment_method_id: number;
//   courier?: {
//     main: string;
//     type: string;
//     price: number;
//   };
//   address?: {
//     id?: number;
//     is_main_address: number;
//     province_id: number;
//     city_id: number;
//     address_detail: string;
//     address_name: string;
//     zipcode: string;
//     latitude: string;
//     longitude: string;
//     nama_penerima: string;
//     phone: string;
//     is_active: number;
//   };
//   order_pickup?: {
//     store_location_id: number;
//   };
//   is_pickup_instore: 0 | 1;
//   is_delivery: 0 | 1;
// };

// export const formStateSchema = z.object({
//   nama_pemesan: z.string().nonempty("Nama pemesan tidak boleh kosong.").optional().nullable(),
//   email_pemesan: z.string().email("Email pemesan tidak valid.").optional().nullable(),
//   phone_pemesan: z
//     .string()
//     .min(10, "Nomor telepon minimal 10 digit")
//     .max(15, "Nomor telepon maksimal 15 digit")
//     .regex(/^[0-9]+$/, "Nomor telepon harus berupa angka")
//     .optional()
//     .nullable(),
//   pickup_location: z
//     .object({
//       store_location_id: z.number().int().positive("Store location harus dipilih."),
//       address: z.string().nonempty("Lokasi pengambilan tidak boleh kosong."),
//       store_name: z.string().nonempty("Nama store tidak boleh kosong."),
//     })
//     .optional(),
//   receiver: z.object({
//     name: z.string().nonempty("Nama penerima tidak boleh kosong."),
//     address_name: z.string().nonempty("Nama alamat tidak boleh kosong."),
//     phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
//     province_id: z.number().int().positive("ID provinsi harus berupa bilangan bulat positif."),
//     city_id: z.number().int().positive("ID kota harus berupa bilangan bulat positif."),
//     pos_code: z.number().int().nonnegative("Kode pos harus berupa bilangan bulat non-negatif."),
//     detail: z.string().nonempty("Detail alamat tidak boleh kosong."),
//   }),
//   payment_method: z.string().nonempty("Metode Pembayaran tidak boleh kosong."),
//   payment_method_id: z.number().int().positive("Payment method ID harus dipilih."),
//   courier: z.object({
//     name: z.string().nonempty("Kurir tidak boleh kosong."),
//     type: z.any().optional(),
//   }),
//   is_pickup_instore: z.number().int().min(0).max(1),
//   is_delivery: z.number().int().min(0).max(1),
//   product_notes: z.record(z.string()).optional(),
// });

// export default function Cart() {
//   const [isr, setIsr] = useState(false);
//   const [modal, setModal] = useState<string>();
//   const [orderData, setOrderData] = useState<OrderData>();
//   const [productList, setProductList] = useListState<MerchListResponse>([]);
//   const [addressList, setAddressList] = useListState<AddressUpdateRequest>([]);
//   const [loading, setLoading] = useListState<string>();
//   const [provinceList, setProvinceList] = useListState<Province>([]);
//   const [cityList, setCityList] = useListState<City>([]);
//   const [subCourier, setSubCourier] = useListState<GetCourierRes>();
//   const [storeLocations, setStoreLocations] = useListState<StoreLocation>([]);
//   const [pickupDeliveryInfo, setPickupDeliveryInfo] = useState<{
//     is_pickup_instore: 0 | 1;
//     is_delivery: 0 | 1;
//   }>({
//     is_pickup_instore: 0,
//     is_delivery: 0,
//   });
//   const [stockAlert, setStockAlert] = useState<{
//     show: boolean;
//     message: string;
//   }>({
//     show: false,
//     message: "",
//   });

//   const user = useLoggedUser();
//   const router = useRouter();

//   const form = useForm<FormState>({
//     initialValues: {
//       nama_pemesan: user?.name || "",
//       email_pemesan: user?.email || "",
//       phone_pemesan: "",
//       is_pickup_instore: 0,
//       is_delivery: 0,
//       payment_method_id: 4, // Default payment method ID
//       product_notes: {}, // Inisialisasi object untuk menyimpan notes
//     },
//     validate: zodResolver(formStateSchema),
//   });

//   // Update form values when user data changes
//   useEffect(() => {
//     if (user) {
//       form.setValues({
//         nama_pemesan: user.name || "",
//         email_pemesan: user.email || "",
//         phone_pemesan: "",
//         payment_method_id: 4,
//       });
//     } else {
//       // Jika tidak login, reset ke empty string agar user bisa mengisi manual
//       form.setValues({
//         nama_pemesan: "",
//         email_pemesan: "",
//         phone_pemesan: "",
//         payment_method_id: 4,
//       });
//     }
//   }, [user]);

//   // Fungsi untuk mendapatkan alamat singkat
//   const getShortAddress = (fullAddress: string) => {
//     const parts = fullAddress.split(",");
//     if (parts.length > 2) {
//       return parts.slice(0, 2).join(",").trim();
//     }
//     return fullAddress;
//   };

//   // Fungsi untuk mendapatkan alamat detail yang dipotong
//   const getTruncatedAddress = (fullAddress: string) => {
//     const shortAddress = getShortAddress(fullAddress);
//     const remaining = fullAddress.replace(shortAddress, "").replace(/^,\s*/, "");

//     if (remaining.length > 50) {
//       return remaining.substring(0, 50) + "...";
//     }
//     return remaining;
//   };

//   useEffect(() => {
//     setIsr(true);
//   }, []);

//   useEffect(() => {
//     getData();
//     const _orderData = JSON.parse(Cookies.get("order_data") ?? "[]");
//     if (!_orderData || _orderData.length == 0) router.push("/merchandise");
//     setOrderData(_orderData);
//   }, [isr]);

//   useEffect(() => {
//     if (form.values.receiver && form.values.courier && pickupDeliveryInfo.is_delivery === 1) {
//       getCourier();
//       form.setValues({ courier: { name: form.values.courier.name, type: undefined } });
//     }
//   }, [form.values.receiver, form.values.courier?.name, pickupDeliveryInfo.is_delivery]);

//   const getData = async () => {
//     try {
//       // Fungsi untuk fetch semua halaman produk
//       const fetchAllProducts = async () => {
//         let allProducts: any[] = [];
//         let currentPage = 1;
//         let hasMorePages = true;
//         let totalPages = 0;

//         while (hasMorePages) {
//           const res: any = await Get("product", { page: currentPage });
          
//           if (res.data && Array.isArray(res.data)) {
//             allProducts = [...allProducts, ...res.data];
            
//             if (res.last_page) {
//               totalPages = res.last_page;
//             }
            
//             // Jika halaman saat ini sama dengan total halaman atau tidak ada data lagi
//             if (currentPage >= totalPages || res.data.length === 0) {
//               hasMorePages = false;
//             } else {
//               currentPage++;
//             }
//           } else {
//             hasMorePages = false;
//           }
//         }
        
//         return allProducts;
//       };

//       // Fetch semua produk
//       const allProducts = await fetchAllProducts();
//       console.log("All products loaded:", allProducts.length);
      
//       setProductList.setState(allProducts);

//       // Ekstrak store locations dari produk
//       const allStoreLocations: StoreLocation[] = [];
//       allProducts.forEach((product: any) => {
//         if (product.has_store_location && product.has_store_location.is_active === 1) {
//           // Cek apakah store location sudah ada dalam array
//           const exists = allStoreLocations.some(loc => loc.id === product.has_store_location.id);
//           if (!exists) {
//             allStoreLocations.push(product.has_store_location);
//           }
//         }
//       });
//       setStoreLocations.setState(allStoreLocations);
//       console.log("Store locations extracted:", allStoreLocations.length);

//       // Dapatkan orderData dari cookies
//       const _orderData = JSON.parse(Cookies.get("order_data") ?? "[]");

//       // Cari produk yang sesuai dengan orderData
//       if (_orderData && _orderData.length > 0) {
//         // Ambil product_id pertama dari order
//         const firstProductId = _orderData[0].product_id;
//         console.log("First product ID in order:", firstProductId);

//         // Cari produk yang sesuai dengan ID di order
//         const orderedProduct = _.find(allProducts, ["id", firstProductId]);
//         console.log("Found ordered product:", orderedProduct);

//         if (orderedProduct) {
//           // Ambil nilai dari produk yang dipesan
//           const hasPickupInstore = orderedProduct.is_pickup_instore === 1 ? 1 : 0;
//           const hasDelivery = orderedProduct.is_delivery === 1 ? 1 : 0;

//           console.log("Product pickup/delivery settings:", {
//             productId: orderedProduct.id,
//             productName: orderedProduct.product_name,
//             is_pickup_instore: orderedProduct.is_pickup_instore,
//             is_delivery: orderedProduct.is_delivery,
//             hasPickupInstore,
//             hasDelivery,
//           });

//           setPickupDeliveryInfo({
//             is_pickup_instore: hasPickupInstore,
//             is_delivery: hasDelivery,
//           });

//           form.setValues({
//             is_pickup_instore: hasPickupInstore,
//             is_delivery: hasDelivery,
//             payment_method_id: 4,
//           });

//           // Set default pickup location jika produk memiliki store location
//           if (hasPickupInstore === 1 && orderedProduct.has_store_location) {
//             form.setValues({
//               pickup_location: {
//                 store_location_id: orderedProduct.has_store_location.id,
//                 address: orderedProduct.has_store_location.full_addres,
//                 store_name: orderedProduct.has_store_location.store_name,
//               },
//             });
//           }

//           // Reset form values jika tidak ada delivery
//           if (hasDelivery === 0) {
//             form.setValues({
//               courier: undefined,
//               receiver: undefined,
//             });
//           }

//           // Reset form values jika tidak ada pickup instore
//           if (hasPickupInstore === 0) {
//             form.setValues({
//               nama_pemesan: undefined,
//               email_pemesan: undefined,
//               phone_pemesan: undefined,
//               pickup_location: undefined,
//             });
//           }
//         }
//       }
//     } catch (err) {
//       console.log("Error fetching products:", err);
//       // Fallback: coba fetch hanya halaman pertama
//       try {
//         const res: any = await Get("product", {});
//         console.log("Fallback - First page products:", res.data?.length || 0);
//         if (res.data) {
//           setProductList.setState(res.data);
//         }
//       } catch (fallbackErr) {
//         console.log("Fallback also failed:", fallbackErr);
//       }
//     }

//     await fetch<any, Province[]>({
//       url: "province",
//       method: "GET",
//       before: () => setLoading.append("getprovince"),
//       success: ({ data }) => {
//         setProvinceList.setState(data ?? []);
//       },
//       complete: () => setLoading.filter((e) => e != "getprovince"),
//     });

//     if (user?.id) {
//       await fetch<any, AddressUpdateRequest[]>({
//         url: `my-address?user_id=${user?.id}`,
//         method: "GET",
//         before: () => setLoading.append("getaddress"),
//         success: ({ data }) => {
//           if (data) {
//             setAddressList.setState(data ?? []);

//             if (pickupDeliveryInfo.is_delivery === 1) {
//               const mainAddress = _.find(data, ["is_main_address", 1]) ?? data[0];
//               if (mainAddress) {
//                 form.setValues({
//                   receiver: {
//                     id: mainAddress.id,
//                     name: mainAddress.nama_penerima,
//                     phone: mainAddress.phone,
//                     address_name: mainAddress.address_name,
//                     province_id: mainAddress.province_id,
//                     city_id: mainAddress.city_id,
//                     pos_code: parseInt(mainAddress.zipcode),
//                     detail: mainAddress.address_detail,
//                   },
//                 });

//                 getCity(mainAddress.province_id);
//               }
//             }
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "getaddress"),
//       });
//     }
//   };

//   const getCity = async (province_id: number) => {
//     await fetch<any, City[]>({
//       url: `city?province_id=${province_id}`,
//       method: "GET",
//       before: () => setLoading.append("getcity"),
//       success: ({ data }) => {
//         setCityList.setState(data ?? []);
//       },
//       complete: () => setLoading.filter((e) => e != "getcity"),
//     });
//   };

//   const orderedProduct = useMemo(() => {
//     return orderData?.map((e, index) => {
//       const product = _.find(productList, ["id", e.product_id]);
//       const variant = e.variant_id ? _.find(product?.product_varian, ["id", e.variant_id]) : null;
//       const subprice = parseInt((!variant ? product?.price : variant?.price) ?? "0");
//       const weight = parseInt((!variant ? product?.weight : variant?.weight) ?? "0");
//       const price = subprice * e.qty;
//       const image = product?.product_image[0] ? product?.product_image[0].image_url : "#";
//       const creator_id = product?.creator_id;
//       const is_pickup_instore = product?.is_pickup_instore === 1;
//       const is_delivery = product?.is_delivery === 1;
//       const admin_fee = parseInt(product?.admin_fee || "0");

//       return { 
//         ...e, 
//         product, 
//         variant, 
//         price, 
//         subprice, 
//         image, 
//         weight, 
//         creator_id, 
//         is_pickup_instore, 
//         is_delivery, 
//         admin_fee,
//         index // Tambahkan index untuk keperluan notes
//       };
//     });
//   }, [productList, orderData]);

//   const orderSummary = useMemo(() => {
//     const result: [string, number][] = [];

//     // Hitung total produk
//     for (const order of orderedProduct ?? []) {
//       result.push([`x${order.qty} ${order.product?.product_name ?? "-"}`, order.price]);
//     }

//     // Tambah biaya pengiriman jika delivery aktif
//     if (pickupDeliveryInfo.is_delivery === 1 && form.values.courier?.type && form.values.courier?.type.cost && form.values.courier?.type.cost.length > 0) {
//       result.push(["Biaya Pengiriman", form.values.courier?.type.cost[0].value]);
//     }

//     // Ambil biaya admin dari produk pertama yang dipesan (jika ada) atau default 0
//     const adminFee = orderedProduct && orderedProduct.length > 0 
//       ? orderedProduct[0].admin_fee || 0
//       : 0;
    
//     if (adminFee > 0) {
//       result.push(["Biaya Admin", adminFee]);
//     }

//     const grandtotal = result.reduce((q, n) => q + n[1], 0);
//     result.push(["Total", grandtotal]);

//     return { array: result, grandtotal, adminFee };
//   }, [orderedProduct, form.values.courier?.type, form.values.receiver, pickupDeliveryInfo.is_delivery]);

//   const getCourier = async () => {
//     if (pickupDeliveryInfo.is_delivery === 0 || !form.values.receiver?.city_id) return;

//     const originCityId =
//       orderedProduct && orderedProduct.length > 0 && orderedProduct[0].product?.has_store_location && typeof orderedProduct[0].product.has_store_location.city_id === "number" ? orderedProduct[0].product.has_store_location.city_id : 1;

//     await fetch<GetCourierReq, GetCourierRes[]>({
//       url: "product-cost",
//       method: "POST",
//       data: {
//         origin: originCityId,
//         origin_type: "city",
//         destination: form.values.receiver?.city_id ?? 0,
//         destination_type: "city",
//         weight: _.sumBy(orderedProduct, "weight") == 0 ? 999 : _.sumBy(orderedProduct, "weight"),
//         courier: form.values.courier?.name ?? "-",
//       },
//       before: () => setLoading.append("getsubcourier"),
//       success: (res) => {
//         console.log("Courier API response:", res);
//         if (res.data) {
//           setSubCourier.setState(res.data ?? []);
//         }
//       },
//       complete: () => setLoading.filter((e) => e != "getsubcourier"),
//       error: (err) => {
//         console.error("Failed to fetch courier:", err);
//         // Set default courier options jika API gagal
//         const defaultCouriers: GetCourierRes[] = [
//           {
//             service: "JTR",
//             description: "JTR",
//             cost: [{ value: 10000, etd: "2-3 HARI", note: "Pengiriman reguler" }],
//           },
//           {
//             service: "YES",
//             description: "Express",
//             cost: [{ value: 20000, etd: "1-2 HARI", note: "Pengiriman express" }],
//           },
//         ];
//         setSubCourier.setState(defaultCouriers);
//       },
//     });
//   };

//   // Handler untuk mengubah notes produk
//   const handleProductNoteChange = (index: number, note: string) => {
//     form.setFieldValue(`product_notes.${index}`, note);
//   };

//   const handleCheckout = async () => {
//     const { values } = form;

//     // Validasi form berdasarkan kondisi
//     if (pickupDeliveryInfo.is_pickup_instore === 1) {
//       if (!values.nama_pemesan) {
//         form.setFieldError("nama_pemesan", "Nama pemesan harus diisi untuk pickup instore");
//         return;
//       }
//       if (!values.email_pemesan) {
//         form.setFieldError("email_pemesan", "Email pemesan harus diisi untuk pickup instore");
//         return;
//       }
//       if (!values.phone_pemesan) {
//         form.setFieldError("phone_pemesan", "Nomor telepon pemesan harus diisi untuk pickup instore");
//         return;
//       }
//       if (!values.pickup_location?.store_location_id) {
//         form.setFieldError("pickup_location", "Lokasi pengambilan harus dipilih untuk pickup instore");
//         return;
//       }
//     }

//     // HANYA validasi receiver jika delivery aktif
//     if (pickupDeliveryInfo.is_delivery === 1) {
//       if (!values.receiver) {
//         form.setFieldError("receiver", "Alamat pengiriman harus diisi untuk delivery");
//         return;
//       }
//     }

//     // Validasi payment_method_id
//     if (!values.payment_method_id) {
//       form.setFieldError("payment_method_id", "Payment method ID harus diisi");
//       return;
//     }

//     // Validasi orderedProduct
//     if (!orderedProduct || orderedProduct.length === 0) {
//       console.error("Tidak ada produk dalam order");
//       return;
//     }

//     // Format phone_pemesan jika ada
//     const formattedPhone = values.phone_pemesan ? values.phone_pemesan.replace(/\D/g, "") : undefined;

//     // Default user_id = 6 jika null
//     const userId = user?.id ?? 6;

//     // Default payment_method_id = 4
//     const paymentMethodId = values.payment_method_id || 4;

//     // Prepare checkout data
//     const checkoutData: Checkout = {
//       user_id: userId,
//       nama_pemesan: pickupDeliveryInfo.is_pickup_instore === 1 ? values.nama_pemesan || null : null,
//       email_pemesan: pickupDeliveryInfo.is_pickup_instore === 1 ? values.email_pemesan || null : null,
//       phone_pemesan: pickupDeliveryInfo.is_pickup_instore === 1 ? formattedPhone || null : null,
//       creator_id: orderedProduct && orderedProduct.length > 0 ? orderedProduct[0].creator_id || null : null,
//       grandtotal: orderSummary.grandtotal,
//       product: (orderedProduct ?? []).map((e, index) => ({
//         product_id: e.product_id,
//         variant_id: e.variant_id || null,
//         qty: e.qty,
//         price: e.subprice,
//         order_notes: values.product_notes?.[index] || "", // Tambahkan notes di sini
//       })),
//       payment_method: "xendit",
//       payment_method_id: paymentMethodId,
//       is_pickup_instore: pickupDeliveryInfo.is_pickup_instore,
//       is_delivery: pickupDeliveryInfo.is_delivery,
//     };

//     // Add order_pickup jika is_pickup_instore = 1
//     if (pickupDeliveryInfo.is_pickup_instore === 1 && values.pickup_location) {
//       checkoutData.order_pickup = {
//         store_location_id: values.pickup_location.store_location_id,
//       };
//     }

//     // Add delivery data jika is_delivery = 1
//     if (pickupDeliveryInfo.is_delivery === 1 && values.receiver) {
//       // Gunakan kurir dari form jika ada, atau default jika tidak ada
//       const courierName = values.courier?.name || "jne";
//       const courierType = values.courier?.type?.service || "JTR";
//       const courierPrice = values.courier?.type?.cost?.[0]?.value || 10000;

//       checkoutData.courier = {
//         main: courierName.toUpperCase(),
//         type: courierType,
//         price: courierPrice,
//       };

//       // Address sesuai dengan receiver yang dipilih user
//       checkoutData.address = {
//         id: values.receiver.id,
//         is_main_address: 1,
//         province_id: values.receiver.province_id,
//         city_id: values.receiver.city_id,
//         address_detail: values.receiver.detail,
//         address_name: values.receiver.address_name,
//         zipcode: String(values.receiver.pos_code),
//         latitude: "",
//         longitude: "",
//         nama_penerima: values.receiver.name,
//         phone: values.receiver.phone,
//         is_active: 1,
//       };
//     } else {
//       // Jika delivery tidak aktif (is_delivery = 0), isi dengan default values
//       checkoutData.courier = {
//         main: "JNE",
//         type: "JTR",
//         price: 10000,
//       };

//       checkoutData.address = {
//         is_main_address: 1,
//         province_id: 11,
//         city_id: 22,
//         address_detail: "Ambil di Pasar Bareng Bareng",
//         address_name: "Pasar Bareng Bareng",
//         zipcode: "15147",
//         latitude: "",
//         longitude: "",
//         nama_penerima: values.nama_pemesan || "Customer", // Gunakan nama pemesan dari form atau default
//         phone: formattedPhone || "081234567890", // Gunakan nomor telepon dari form atau default
//         is_active: 1,
//       };
//     }

//     console.log("Data checkout yang dikirim:", checkoutData);

//     try {
//       await fetch<any, any>({
//         url: "order-product",
//         method: "POST",
//         data: checkoutData,
//         before: () => setLoading.append("checkout"),
//         success: ({ data, status, message, error }) => {
//           console.log("Response checkout:", { data, status, message, error });
//           if (data?.xendit_invoice) {
//             // Clear cookies setelah checkout berhasil
//             Cookies.remove("order_data");
//             router.push(data.xendit_invoice);
//           } else if (data?.xendit?.invoice_url) {
//             // Fallback ke data.xendit.invoice_url jika ada
//             Cookies.remove("order_data");
//             router.push(data.xendit.invoice_url);
//           } else {
//             console.error("Gagal membuat transaksi:", { message, error });
//             // Coba parse error message jika berupa string JSON
//             if (typeof message === "string" && message.includes("{")) {
//               try {
//                 const parsedError = JSON.parse(message);
//                 console.error("Parsed error:", parsedError);
                
//                 // Handle khusus untuk out of stock
//                 if (parsedError.out_of_stock === true) {
//                   setStockAlert({
//                     show: true,
//                     message: parsedError.message || "Stock produk tidak mencukupi. Silakan periksa kembali jumlah produk yang dipesan."
//                   });
                  
//                   notifications.show({
//                     title: 'Stock Tidak Tersedia',
//                     message: parsedError.message || 'Maaf, produk yang Anda pesan sudah habis atau stock tidak mencukupi.',
//                     color: 'red',
//                     icon: <Icon icon="mdi:alert-circle" />,
//                   });
//                 } else {
//                   alert(`Gagal membuat transaksi: ${parsedError.message || parsedError.error || "Unknown error"}`);
//                 }
//               } catch {
//                 alert(`Gagal membuat transaksi: ${message || error || "Unknown error"}`);
//               }
//             } else {
//               alert(`Gagal membuat transaksi: ${message || error || "Unknown error"}`);
//             }
//           }
//         },
//         complete: () => setLoading.filter((e) => e != "checkout"),
//         error: (err) => {
//           console.error("Error checkout:", err);
          
//           // Handle error khusus untuk out of stock
//           if (err?.response?.data?.out_of_stock === true || err?.out_of_stock === true) {
//             const errorMessage = err?.response?.data?.message || err?.message || "Stock produk tidak mencukupi. Silakan periksa kembali jumlah produk yang dipesan.";
            
//             setStockAlert({
//               show: true,
//               message: errorMessage
//             });
            
//             notifications.show({
//               title: 'Stock Tidak Tersedia',
//               message: errorMessage,
//               color: 'red',
//               icon: <Icon icon="mdi:alert-circle" />,
//             });
//           } else {
//             alert("Terjadi kesalahan saat memproses checkout. Silakan coba lagi.");
//           }
//         },
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     } catch (error) {
//       console.error("Checkout error:", error);
      
//       // Handle error umum
//       if (error && typeof error === 'object' && 'out_of_stock' in error && error.out_of_stock === true) {
//         setStockAlert({
//           show: true,
//           message: "Stock produk tidak mencukupi. Silakan periksa kembali jumlah produk yang dipesan."
//         });
//       } else {
//         alert("Terjadi kesalahan sistem. Silakan coba lagi.");
//       }
//     }
//   };

//   // Tentukan accordion mana yang akan ditampilkan berdasarkan kondisi
//   const getAccordionItems = () => {
//     const items = [];

//     if (pickupDeliveryInfo.is_pickup_instore === 1) {
//       items.push(
//         <Accordion.Item key="data-pemesan" value="data-pemesan">
//           <Accordion.Control>
//             <Flex gap={10} align="center">
//               <Icon icon="lets-icons:form-fill" className={`text-[20px] text-[#194E9E]`} />
//               <Text fw={600}>Data Pemesan</Text>
//             </Flex>
//           </Accordion.Control>
//           <Accordion.Panel>
//             <Stack gap="md">
//               <TextInput
//                 label="Nama Pemesan"
//                 placeholder="Masukan Nama Pemesan"
//                 onChange={(e) => form.setValues({ nama_pemesan: e.target.value })}
//                 onBlur={() => form.validateField("nama_pemesan")}
//                 value={form.values.nama_pemesan || ""}
//               />

//               <TextInput
//                 type="email"
//                 label="Email Pemesan"
//                 placeholder="Masukan Email Pemesan"
//                 onChange={(e) => form.setValues({ email_pemesan: e.target.value })}
//                 onBlur={() => form.validateField("email_pemesan")}
//                 value={form.values.email_pemesan || ""}
//               />

//               <TextInput
//                 type="tel"
//                 label="No. Telepon Pemesan"
//                 placeholder="Masukan No. Telepon Pemesan (contoh: 081234567890)"
//                 onChange={(e) => {
//                   // Format input untuk hanya menerima angka
//                   const value = e.target.value.replace(/\D/g, "");
//                   form.setValues({ phone_pemesan: value });
//                 }}
//                 onBlur={() => form.validateField("phone_pemesan")}
//                 value={form.values.phone_pemesan || ""}
//               />

//               {/* Bagian 1: Lokasi Pengambilan - Card dengan border bottom biru */}
//               <div>
//                 <Text size="sm" fw={500} mb={5}>
//                   Lokasi Pengambilan
//                 </Text>
//                 <UnstyledButton onClick={() => setModal("pickup")} className="w-full">
//                   <Card
//                     withBorder
//                     p={15}
//                     radius={10}
//                     className={`
//                       w-full
//                       !border !border-gray-300 
//                       hover:bg-gray-50 
//                       transition-colors 
//                       cursor-pointer
//                       !border-b-3 !border-b-[#0B387C]
//                     `}
//                   >
//                     {form.values.pickup_location ? (
//                       <Flex gap={10} align="center">
//                         <Box c={"#0B387C"}>
//                           <Icon icon="gis:location-poi" className={`text-[20px]`} />
//                         </Box>
//                         <Stack gap={2} className="flex-grow">
//                           <Text fw={500} size="sm" lineClamp={1}>
//                             {form.values.pickup_location.store_name}
//                           </Text>
//                           <Text c="gray" size="xs" lineClamp={1}>
//                             {getTruncatedAddress(form.values.pickup_location.address)}
//                           </Text>
//                         </Stack>
//                         <Icon icon="uiw:right" className="text-gray-400 text-sm" />
//                       </Flex>
//                     ) : (
//                       <Flex align="center" gap={10} justify="center">
//                         <Icon icon="uiw:plus" className={`text-primary-base`} />
//                         <Text size="sm" c="gray.8">
//                           Pilih Lokasi Pengambilan
//                         </Text>
//                       </Flex>
//                     )}
//                   </Card>
//                 </UnstyledButton>
//               </div>
//             </Stack>
//           </Accordion.Panel>
//         </Accordion.Item>,
//       );
//     }

//     if (pickupDeliveryInfo.is_delivery === 1) {
//       items.push(
//         <Accordion.Item key="data-pengiriman" value="data-pengiriman">
//           <Accordion.Control>
//             <Flex gap={10} align="center">
//               <Icon icon="fa-solid:shipping-fast" className={`text-[20px] text-[#194E9E]`} />
//               <Text fw={600}>Data Pengiriman</Text>
//             </Flex>
//           </Accordion.Control>
//           <Accordion.Panel>
//             <Stack gap="md">
//               {/* Bagian 2: Alamat Pengiriman - Card dengan border bottom biru */}
//               <div>
//                 <Text size="sm" fw={500} mb={5}>
//                   Alamat Pengiriman
//                 </Text>
//                 <UnstyledButton mih="100%" onClick={() => setModal("address")} className="w-full">
//                   <Card
//                     withBorder
//                     p={15}
//                     radius={10}
//                     h="100%"
//                     className={`
//                       w-full
//                       !border !border-gray-300 
//                       hover:bg-gray-50 
//                       transition-colors 
//                       cursor-pointer
//                       !border-b-3 !border-b-[#0B387C]
//                       ${form.values?.receiver?.pos_code ? "" : "!bg-primary-light"}
//                     `}
//                   >
//                     {form.values?.receiver?.pos_code ? (
//                       <Flex gap={10} align="center">
//                         <Box c={"#0B387C"}>
//                           <Icon icon="gis:location-poi" className={`text-[20px]`} />
//                         </Box>
//                         <Stack gap={2} className="flex-grow">
//                           <Text fw={500} size="sm" lineClamp={1}>
//                             {form.values.receiver.address_name}
//                           </Text>
//                           <Text c="gray" size="xs" lineClamp={1}>
//                             {form.values.receiver.name}, {form.values.receiver.phone}
//                           </Text>
//                           <Text c="gray" size="xs" lineClamp={1} className={`uppercase`}>
//                             {_.find(provinceList, ["id", form.values.receiver.province_id])?.name}, {_.find(cityList, ["id", form.values.receiver.city_id])?.name}
//                           </Text>
//                         </Stack>
//                         <Icon icon="uiw:right" className="text-gray-400 text-sm" />
//                       </Flex>
//                     ) : (
//                       <Flex align="center" gap={10} justify="center">
//                         <Icon icon="uiw:plus" className={`text-primary-base`} />
//                         <Text size="sm" c="gray.8">
//                           Pilih atau Tambah Alamat
//                         </Text>
//                       </Flex>
//                     )}
//                   </Card>
//                 </UnstyledButton>
//               </div>

//               {/* Bagian Kurir Pengiriman - OPSIONAL */}
//               <div>
//                 <Text size="sm" fw={500} mb={5}>
//                   Pilih Kurir (Opsional)
//                 </Text>
//                 <Flex wrap="wrap" gap={10}>
//                   <Select
//                     className="flex-grow"
//                     disabled={!form.values.receiver?.city_id}
//                     data={[
//                       { value: "jne", label: "JNE" },
//                       { value: "tiki", label: "TIKI" },
//                       { value: "pos", label: "POS Indonesia" },
//                     ]}
//                     placeholder="Pilih Kurir Pengiriman (Opsional)"
//                     value={form.values.courier?.name}
//                     onChange={(e) => {
//                       if (e) {
//                         form.setValues({ courier: { name: e, type: undefined } });
//                       }
//                     }}
//                   />
//                   <Flex gap={10} align="center" className="flex-grow">
//                     {form.values.courier?.name && loading.includes("getsubcourier") && <Loader size="sm" color="#0B387C" />}
//                     <Select
//                       className={`flex-grow`}
//                       disabled={!form.values.courier?.name || !subCourier || subCourier.length <= 0 || loading.includes("getsubcourier")}
//                       data={subCourier.map((e) => ({ value: e.service, label: `${e.service} (${e.cost[0].etd} ${e.cost[0].etd.includes("HARI") ? "" : "HARI"}) ${currencyFormat(e.cost[0].value)}` }))}
//                       value={form.values.courier?.type?.service}
//                       onChange={(e) => form.setValues({ courier: { name: form.values.courier?.name ?? "-", type: subCourier.find((z) => z.service == e) } })}
//                       placeholder="Pilih Tipe Pengiriman (Opsional)"
//                     />
//                   </Flex>
//                 </Flex>
//                 <Text size="xs" c="gray" mt={5}>
//                   Jika tidak memilih kurir, sistem akan menggunakan kurir default
//                 </Text>
//               </div>
//             </Stack>
//           </Accordion.Panel>
//         </Accordion.Item>,
//       );
//     }

//     return items;
//   };

//   return (
//     <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
//       <AddressModal
//         opened={modal == "address"}
//         onClose={() => setModal(undefined)}
//         list={addressList}
//         onChange={(data) => data && form.setValues({ receiver: data })}
//         province={provinceList}
//         getCity={(e) => getCity(e)}
//         cityLoading={loading.includes("getcity")}
//         city={cityList}
//       />

//       <PickupLocationModal
//         opened={modal == "pickup"}
//         onClose={() => setModal(undefined)}
//         onSelect={(store_location_id, address, store_name) => form.setValues({ pickup_location: { store_location_id, address, store_name } })}
//         currentStoreLocationId={form.values.pickup_location?.store_location_id}
//         storeLocations={storeLocations}
//       />

//       <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px`}>
//         {/* Stock Alert Notification */}
//         {stockAlert.show && (
//           <Alert
//             title="Stock Tidak Tersedia"
//             color="red"
//             mb="md"
//             icon={<Icon icon="mdi:alert-circle" />}
//             onClose={() => setStockAlert({ show: false, message: "" })}
//             withCloseButton
//           >
//             {stockAlert.message}
//           </Alert>
//         )}

//         <Stack gap={25} mb={40}>
//           <Stack gap={0}>
//             <Title order={1} size="h2">
//               Checkout Merchandise
//             </Title>
//             <Text size="sm" c="gray">
//               Pilih Metode Pembayaran dan Alamat Pengiriman
//             </Text>
//           </Stack>

//           <Divider />

//           {/* Grid 60/40 Layout */}
//           <Grid>
//             {/* Bagian Kiri - 60% */}
//             <Grid.Col span={{ base: 12, md: 7 }}>
//               {pickupDeliveryInfo.is_pickup_instore === 1 || pickupDeliveryInfo.is_delivery === 1 ? (
//                 <Accordion variant="separated" radius="md" defaultValue={[...(pickupDeliveryInfo.is_pickup_instore === 1 ? ["data-pemesan"] : []), ...(pickupDeliveryInfo.is_delivery === 1 ? ["data-pengiriman"] : [])]} multiple>
//                   {getAccordionItems()}
//                 </Accordion>
//               ) : (
//                 <Card withBorder radius="md" p="md">
//                   <Text c="red" ta="center">
//                     Tidak ada metode pengiriman yang tersedia untuk produk ini.
//                   </Text>
//                 </Card>
//               )}
//             </Grid.Col>

//             {/* Bagian Kanan - 40% */}
//             <Grid.Col span={{ base: 12, md: 5 }}>
//               <Stack gap={10}>
//                 <Card withBorder radius={10} p={20}>
//                   <Stack gap={15}>
//                     <Flex gap={10} align="center">
//                       <Icon icon="octicon:info-24" className={`text-primary-base text-[20px]`} />
//                       <Text fw={600}>Rincian Produk</Text>
//                     </Flex>

//                     <Divider />

//                     {(orderedProduct ?? []).map((e, i) => (
//                       <Stack key={i} gap={10}>
//                         <Flex gap={15} align="center">
//                           <AspectRatio ratio={1} w={60}>
//                             <Image alt="image" src={e.image} w="100%" h="100%" bg="gray.1" radius="sm" />
//                           </AspectRatio>
//                           <Stack gap={3} className={`flex-grow`}>
//                             <Text size="sm" fw={500}>
//                               {e.product?.product_name}
//                             </Text>
//                             {e.variant && (
//                               <Text c="gray" size="xs">
//                                 Varian: {e.variant?.varian_name}
//                               </Text>
//                             )}
//                             <Text size="sm" fw={600}>
//                               <NumberFormatter value={e.subprice} prefix="Rp " thousandSeparator="." decimalSeparator="," />
//                             </Text>
//                             <Flex gap={5}>
//                               {e.is_pickup_instore && (
//                                 <Text size="xs" c="blue" fw={500}>
//                                   Pickup In-store
//                                 </Text>
//                               )}
//                               {e.is_delivery && (
//                                 <Text size="xs" c="green" fw={500}>
//                                   Delivery
//                                 </Text>
//                               )}
//                             </Flex>
//                           </Stack>
//                           <Text size="sm">x{e.qty}</Text>
//                         </Flex>
                        
//                         {/* Input untuk Catatan/Notes per produk */}
//                         <Box pl={75} pr={10}>
//                           <TextInput
//                             size="xs"
//                             placeholder="Tambahkan catatan (contoh: warna, ukuran, dll)"
//                             value={form.values.product_notes?.[i] || ""}
//                             onChange={(event) => handleProductNoteChange(i, event.currentTarget.value)}
//                             rightSection={
//                               form.values.product_notes?.[i] ? (
//                                 <ActionIcon 
//                                   size="xs" 
//                                   color="gray" 
//                                   variant="subtle"
//                                   onClick={() => handleProductNoteChange(i, "")}
//                                 >
//                                   <Icon icon="mdi:close" fontSize={14} />
//                                 </ActionIcon>
//                               ) : null
//                             }
//                           />
//                         </Box>
//                       </Stack>
//                     ))}
//                   </Stack>
//                 </Card>

//                 <Card withBorder radius={10} p={20}>
//                   <Stack gap={15}>
//                     <Flex gap={10} align="center">
//                       <Icon icon="mdi:voucher-outline" className={`text-primary-base text-[20px]`} />
//                       <Text fw={600}>Voucher</Text>
//                     </Flex>

//                     <TextInput placeholder="Masukan Kode Voucher" />
//                   </Stack>
//                 </Card>

//                 <Card withBorder radius={10} p={20}>
//                   <Stack gap={15}>
//                     <Flex gap={10} align="center">
//                       <Icon icon="uiw:information" className={`text-primary-base text-[20px]`} />
//                       <Text fw={600}>Total Pembayaran</Text>
//                     </Flex>

//                     <Divider />

//                     <Stack>
//                       {orderSummary.array.map((e, i) => (
//                         <Flex justify="space-between" key={i}>
//                           <Text fw={e[0] == "Total" ? 600 : 400}>{e[0]}</Text>
//                           <Text fw={e[0] == "Total" ? 600 : 400}>
//                             <NumberFormatter value={e[1]} prefix="Rp " thousandSeparator="." decimalSeparator="," />
//                           </Text>
//                         </Flex>
//                       ))}
//                     </Stack>
//                   </Stack>
//                 </Card>
//               </Stack>
//             </Grid.Col>
//           </Grid>
//         </Stack>

//         <Card pos="fixed" className={`bottom-0 left-0 w-[100vw] border-t !border-primary-light`} py={10} withBorder>
//           <Container size="lg" w="100%">
//             <Flex justify="end" w="100%">
//               <Button
//                 loading={loading.includes("checkout")}
//                 onClick={handleCheckout}
//                 className={`uppercase`}
//                 color="#194E9E"
//                 rightSection={<Icon icon="uiw:check" />}
//                 radius="xl"
//                 disabled={!(pickupDeliveryInfo.is_pickup_instore === 1 || pickupDeliveryInfo.is_delivery === 1)}
//               >
//                 Proses Pembayaran
//               </Button>
//             </Flex>
//           </Container>
//         </Card>
//       </Container>
//     </div>
//   );
// }

// const AddressModal = ({
//   list,
//   opened,
//   onClose,
//   onChange,
//   province,
//   getCity,
//   city,
//   cityLoading,
// }: {
//   list: AddressUpdateRequest[];
//   opened: boolean;
//   onClose: () => void;
//   onChange: (data: FormState["receiver"]) => void;
//   getCity: (province_id: number) => void;
//   cityLoading: boolean;
//   province: Province[];
//   city: City[];
// }) => {
//   const [page, setPage] = useState<"create" | "select">("select");

//   const form = useForm<Omit<AddressData, "id">>({
//     validate: zodResolver(addressDataSchema),
//     onValuesChange: (values) => {
//       if (values.postcode) values.postcode = values.postcode.replaceAll(/\D/g, "");
//       if (values.phone) values.phone = values.phone.replaceAll(/\D/g, "");
//       return values;
//     },
//   });

//   const handleSelect = (data?: AddressUpdateRequest) => {
//     if (data) {
//       onChange({
//         id: data.id,
//         name: data.nama_penerima,
//         phone: data.phone,
//         address_name: data.address_name,
//         province_id: data.province_id,
//         city_id: data.city_id,
//         pos_code: parseInt(data.zipcode),
//         detail: data.address_detail,
//       });
//     } else {
//       const valid = form.validate();
//       if (valid.hasErrors) return;

//       const { values } = form;
//       onChange({
//         name: values.nama_penerima,
//         phone: values.phone,
//         address_name: values.name,
//         province_id: values.province,
//         city_id: values.city,
//         pos_code: parseInt(values.postcode),
//         detail: values.detail,
//       });
//     }
//     onClose();
//   };

//   useEffect(() => {
//     setPage("select");
//   }, [opened]);

//   useEffect(() => {
//     getCity(form.values.province);
//     form.setValues({ city: -1 });
//   }, [form.values.province]);

//   return (
//     <>
//       <Modal title={"Pilih Alamat"} opened={opened} onClose={() => onClose()} centered>
//         {page == "select" && list.length > 0 ? (
//           <Stack gap={20}>
//             {list.map((e, i) => (
//               <UnstyledButton key={i} mih="100%" onClick={() => handleSelect(e)}>
//                 <Card withBorder p={20} radius={15} h="100%" className={`!border-b !border-b-[#0B387C]`}>
//                   <Flex gap={15}>
//                     <Box c={"#0B387C"}>
//                       <Icon icon="gis:location-poi" className={`text-[24px]`} />
//                     </Box>
//                     <Stack gap={3} mt={-5}>
//                       <Text fw={600} size="lg">
//                         {e.address_name}
//                       </Text>
//                       <Text c="gray" size="sm" mt={5} className={`uppercase`}>
//                         {_.find(province, ["id", e.province_id])?.name}, {_.find(city, ["id", e.city_id])?.name}, {e.zipcode}
//                       </Text>
//                       <Text c="gray" size="sm">
//                         {e.address_detail}
//                       </Text>
//                       <Text c="gray" size="sm">
//                         {e.phone}
//                       </Text>
//                     </Stack>
//                   </Flex>
//                 </Card>
//               </UnstyledButton>
//             ))}

//             <Button onClick={() => setPage("create")} color="#0B387C" variant="outline" className={`!border-dashed`}>
//               Tambah Baru
//             </Button>
//           </Stack>
//         ) : (
//           <Stack gap={15} p={5}>
//             <TextInput label="Nama Penerima" placeholder="Masukan Nama Penerima" {...form.getInputProps("nama_penerima")} />

//             <TextInput label="Nama Alamat" placeholder="Rumah, Kantor, ..." {...form.getInputProps("name")} />

//             <TextInput label="No. Telp" placeholder="08XX XXXX XXXX" {...form.getInputProps("phone")} />

//             <Flex gap={15} className={`[&>*]:flex-grow !flex-col md:!flex-row`}>
//               <Select
//                 searchable
//                 label="Provinsi"
//                 placeholder="Pilih Provinsi"
//                 data={_.sortBy(province, "name").map((e) => ({ value: String(e.id), label: e.name }))}
//                 value={String(form.values.province)}
//                 onChange={(e) => e && form.setFieldValue("province", parseInt(e))}
//               />

//               <Select
//                 disabled={cityLoading}
//                 label="Kota"
//                 placeholder="Pilih Kota"
//                 data={city.map((e) => ({ value: String(e.id), label: e.name }))}
//                 value={String(form.values.city)}
//                 onChange={(e) => e && form.setFieldValue("city", parseInt(e))}
//               />
//             </Flex>

//             <TextInput label="Kode Pos" placeholder="Masukan Kode Pos" {...form.getInputProps("postcode")} />

//             <Textarea autosize minRows={3} label="Detail Alamat" placeholder="Kecamatan, Desa, No. Rumah, dll" {...form.getInputProps("detail")} />

//             <Text size="xs" c="gray">
//               Periksa kembali alamat yang Anda masukkan untuk memastikan tidak ada kesalahan.
//             </Text>

//             <Flex align="center" gap={10} justify="space-between" mt={10}>
//               <Button color="#0B387C" w="fit-content" radius="xl" leftSection={<Icon icon="uiw:check" />} onClick={() => handleSelect()}>
//                 Simpan Alamat
//               </Button>
//             </Flex>
//           </Stack>
//         )}
//       </Modal>
//     </>
//   );
// };

// const PickupLocationModal = ({ 
//   opened, 
//   onClose, 
//   onSelect, 
//   currentStoreLocationId,
//   storeLocations 
// }: { 
//   opened: boolean; 
//   onClose: () => void; 
//   onSelect: (store_location_id: number, address: string, store_name: string) => void; 
//   currentStoreLocationId?: number;
//   storeLocations: StoreLocation[];
// }) => {
//   return (
//     <Modal title="Pilih Lokasi Pengambilan" opened={opened} onClose={onClose} centered>
//       <Stack gap={20}>
//         {storeLocations.length > 0 ? (
//           storeLocations.map((location) => (
//             <UnstyledButton
//               key={location.id}
//               onClick={() => {
//                 onSelect(location.id, location.full_addres, location.store_name);
//                 onClose();
//               }}
//             >
//               <Card 
//                 withBorder 
//                 p={20} 
//                 radius={15} 
//                 className={`!border-b !border-b-[#0B387C] ${currentStoreLocationId === location.id ? "bg-primary-light" : ""}`}
//               >
//                 <Flex gap={15}>
//                   <Box c={"#0B387C"}>
//                     <Icon icon="gis:location-poi" className={`text-[24px]`} />
//                   </Box>
//                   <Stack gap={3} mt={-5}>
//                     <Text fw={600} size="lg">
//                       {location.store_name}
//                     </Text>
//                     <Text c="gray" size="sm">
//                       {location.full_addres}
//                     </Text>
//                     <Text c="gray" size="xs">
//                       Kode Pos: {location.postal_code}
//                     </Text>
//                   </Stack>
//                 </Flex>
//               </Card>
//             </UnstyledButton>
//           ))
//         ) : (
//           <Text c="gray" ta="center">
//             Tidak ada lokasi pengambilan yang tersedia.
//           </Text>
//         )}

//         <Button onClick={onClose} color="#0B387C" variant="outline">
//           Tutup
//         </Button>
//       </Stack>
//     </Modal>
//   );
// };


// KODE YANG LAGI DI REVISI --------------------------------------------------

import { PropsWithChildren, useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  Container,
  Group,
  Checkbox,
  Text,
  Title,
  Button,
  Paper,
  Stack,
  Image,
  Flex,
  Card,
  NumberFormatter,
  ActionIcon,
  Center,
  NumberInput,
  AspectRatio,
  Divider,
  UnstyledButton,
  TextInput,
  Box,
  Modal,
  Select,
  Textarea,
  Loader,
  SimpleGrid,
  Grid,
  Accordion,
  Alert,
  Badge,
  ScrollArea,
} from "@mantine/core";
import { useListState, useMediaQuery, useDebouncedCallback, useThrottledCallback } from "@mantine/hooks";
import { MerchListResponse } from "../dashboard/merch/type";
import { Delete, Get } from "@/utils/REST";
import useLoggedUser from "@/utils/useLoggedUser";
import _ from "lodash";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/router";
import { useForm, zodResolver } from "@mantine/form";
import Cookies from "js-cookie";
import fetch from "@/utils/fetch";
import { AddressData, addressDataSchema, AddressUpdateRequest } from "../dashboard/profile/address";
import { currencyFormat } from "@/utils/currencyFormat";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import { LoadScript, Autocomplete, GoogleMap, Marker, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api";

// Cache untuk menyimpan hasil API
const productCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

// Google Maps Libraries
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

type Province = {
  id: number;
  name: string;
};

type City = {
  id: number;
  province_id: number;
  name: string;
  province?: Province;
};

type StoreLocation = {
  id: number;
  location_type: string;
  creator_id: number;
  province_id: number;
  city_id: number;
  subdistric_id: number;
  postal_code: string;
  store_name: string;
  full_addres: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  is_active: number;
};

type FormState = {
  nama_pemesan?: string;
  email_pemesan?: string;
  phone_pemesan?: string;
  pickup_location?: {
    store_location_id: number;
    address: string;
    store_name: string;
  };
  receiver?: {
    id?: number;
    name: string;
    phone: string;
    address_name: string;
    province_id: number;
    city_id: number;
    pos_code: number;
    detail: string;
    latitude?: string;
    longitude?: string;
  };
  payment_method?: string;
  payment_method_id?: number;
  courier?: {
    name: string;
    service: string;
    type: string;
    price: number;
    etd: string;
  };
  is_pickup_instore: 0 | 1;
  is_delivery: 0 | 1;
  product_notes?: Record<number, string>;
};

type GetCourierReq = {
  origin_postal_code: string;
  destination_postal_code: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  weight: number;
};

type CourierRate = {
  courier: string;
  service: string;
  type: string;
  price: number;
  etd: string;
};

type CourierResponse = {
  success: boolean;
  origin_city: string | null;
  destination_city: string | null;
  total: number;
  rates: {
    instant: CourierRate[];
    same_day: CourierRate[];
    regular: CourierRate[];
  };
};

type OrderData = {
  product_id: number;
  variant_id: number;
  qty: number;
  order_notes?: string;
}[];

type Checkout = {
  user_id: number | null;
  nama_pemesan?: string | null;
  email_pemesan?: string | null;
  phone_pemesan?: string | null;
  creator_id: number | null;
  grandtotal: number;
  product: Array<{
    product_id: number;
    variant_id: null | number;
    qty: number;
    price: number;
    order_notes?: string;
  }>;
  payment_method: string;
  payment_method_id: number;
  courier?: {
    main: string;
    type: string;
    price: number;
    service: string;
    etd: string;
  };
  address?: {
    id?: number;
    is_main_address: number;
    province_id: number;
    city_id: number;
    address_detail: string;
    address_name: string;
    zipcode: string;
    latitude: string;
    longitude: string;
    nama_penerima: string;
    phone: string;
    is_active: number;
  };
  order_pickup?: {
    store_location_id: number;
  };
  is_pickup_instore: 0 | 1;
  is_delivery: 0 | 1;
};

type PinpointLocation = {
  lat: number;
  lng: number;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  formattedAddress: string;
};

export const formStateSchema = z.object({
  nama_pemesan: z.string().nonempty("Nama pemesan tidak boleh kosong.").optional().nullable(),
  email_pemesan: z.string().email("Email pemesan tidak valid.").optional().nullable(),
  phone_pemesan: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9]+$/, "Nomor telepon harus berupa angka")
    .optional()
    .nullable(),
  pickup_location: z
    .object({
      store_location_id: z.number().int().positive("Store location harus dipilih."),
      address: z.string().nonempty("Lokasi pengambilan tidak boleh kosong."),
      store_name: z.string().nonempty("Nama store tidak boleh kosong."),
    })
    .optional(),
  receiver: z.object({
    name: z.string().nonempty("Nama penerima tidak boleh kosong."),
    address_name: z.string().nonempty("Nama alamat tidak boleh kosong."),
    phone: z.string().nonempty("Nomor telepon tidak boleh kosong."),
    province_id: z.number().int().positive("ID provinsi harus berupa bilangan bulat positif."),
    city_id: z.number().int().positive("ID kota harus berupa bilangan bulat positif."),
    pos_code: z.number().int().nonnegative("Kode pos harus berupa bilangan bulat non-negatif."),
    detail: z.string().nonempty("Detail alamat tidak boleh kosong."),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  }),
  payment_method: z.string().nonempty("Metode Pembayaran tidak boleh kosong."),
  payment_method_id: z.number().int().positive("Payment method ID harus dipilih."),
  courier: z.object({
    name: z.string().nonempty("Kurir tidak boleh kosong."),
    service: z.string().nonempty("Service kurir tidak boleh kosong."),
    type: z.string().nonempty("Tipe kurir tidak boleh kosong."),
    price: z.number().int().positive("Harga kurir harus diisi."),
    etd: z.string().nonempty("Estimasi tidak boleh kosong."),
  }).optional(),
  is_pickup_instore: z.number().int().min(0).max(1),
  is_delivery: z.number().int().min(0).max(1),
  product_notes: z.record(z.string()).optional(),
});

// Fixed origin location (gudang)
const ORIGIN_POSTAL_CODE = "16519";
const ORIGIN_LATITUDE = -6.4078008;
const ORIGIN_LONGITUDE = 106.7672963;

// Google Maps Configuration
const GOOGLE_MAPS_API_KEY = "AIzaSyBxZekg89Ut1U72fFpQldJAenvgTy197As";
const GOOGLE_MAPS_MAP_ID = "795838f77e7bb079c78f5aac";

// Cache management functions
const getCachedData = (key: string) => {
  const cached = productCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  productCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export default function Cart() {
  const [isr, setIsr] = useState(false);
  const [modal, setModal] = useState<string>();
  const [orderData, setOrderData] = useState<OrderData>();
  const [productList, setProductList] = useListState<MerchListResponse>([]);
  const [addressList, setAddressList] = useListState<AddressUpdateRequest>([]);
  const [loading, setLoading] = useListState<string>();
  const [provinceList, setProvinceList] = useListState<Province>([]);
  const [cityList, setCityList] = useListState<City>([]);
  const [courierOptions, setCourierOptions] = useState<{ group: string; items: CourierRate[] }[]>([]);
  const [storeLocations, setStoreLocations] = useListState<StoreLocation>([]);
  const [pickupDeliveryInfo, setPickupDeliveryInfo] = useState<{
    is_pickup_instore: 0 | 1;
    is_delivery: 0 | 1;
  }>({
    is_pickup_instore: 0,
    is_delivery: 0,
  });
  const [stockAlert, setStockAlert] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: "",
  });
  
  // Flag untuk mencegah multiple API calls
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  const user = useLoggedUser();
  const router = useRouter();

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_MAP_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const form = useForm<FormState>({
    initialValues: {
      nama_pemesan: user?.name || "",
      email_pemesan: user?.email || "",
      phone_pemesan: "",
      is_pickup_instore: 0,
      is_delivery: 0,
      payment_method_id: 4,
      product_notes: {},
    },
    validate: zodResolver(formStateSchema),
  });

  // Debounced function untuk check ongkir
  const debouncedCheckOngkir = useDebouncedCallback(() => {
    if (form.values.receiver?.latitude && 
        form.values.receiver?.longitude && 
        form.values.receiver?.pos_code &&
        pickupDeliveryInfo.is_delivery === 1) {
      checkAllOngkir();
    }
  }, 500);

  // Throttled function untuk getData
  const throttledGetData = useThrottledCallback(
    () => {
      getData();
    },
    3000 // Minimal 3 detik antara pemanggilan
  );

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.setValues({
        nama_pemesan: user.name || "",
        email_pemesan: user.email || "",
        phone_pemesan: "",
        payment_method_id: 4,
      });
    } else {
      form.setValues({
        nama_pemesan: "",
        email_pemesan: "",
        phone_pemesan: "",
        payment_method_id: 4,
      });
    }
  }, [user]);

  const getShortAddress = (fullAddress: string | undefined | null) => {
    if (!fullAddress) return "";
    const parts = fullAddress.split(",");
    if (parts.length > 2) {
      return parts.slice(0, 2).join(",").trim();
    }
    return fullAddress;
  };

  const getTruncatedAddress = (fullAddress: string | undefined | null) => {
    if (!fullAddress) return "";
    const shortAddress = getShortAddress(fullAddress);
    const remaining = fullAddress.replace(shortAddress, "").replace(/^,\s*/, "");

    if (remaining.length > 50) {
      return remaining.substring(0, 50) + "...";
    }
    return remaining;
  };

  useEffect(() => {
    setIsr(true);
  }, []);

  useEffect(() => {
    const _orderData = JSON.parse(Cookies.get("order_data") ?? "[]");
    if (!_orderData || _orderData.length == 0) {
      router.push("/merchandise");
      return;
    }
    setOrderData(_orderData);
    
    // Panggil throttledGetData hanya sekali
    if (isr) {
      throttledGetData();
    }
  }, [isr]);

  // Fetch ongkir dengan debounce
  useEffect(() => {
    debouncedCheckOngkir();
    
    // Cleanup timeout
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [form.values.receiver, pickupDeliveryInfo.is_delivery]);

  const getData = async () => {
    // Cek apakah sedang fetching
    if (isFetchingRef.current) {
      console.log("Already fetching products, skipping...");
      return;
    }

    try {
      isFetchingRef.current = true;
      
      // Cek cache terlebih dahulu
      const cachedProducts = getCachedData('all_products');
      if (cachedProducts) {
        console.log("Using cached products");
        setProductList.setState(cachedProducts);
        processStoreLocations(cachedProducts);
        return;
      }

      console.log("Fetching products from API...");
      const fetchAllProducts = async () => {
        let allProducts: any[] = [];
        let currentPage = 1;
        let hasMorePages = true;
        let totalPages = 0;

        while (hasMorePages) {
          // Tambahkan delay antar request untuk menghindari overload
          if (currentPage > 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          const res: any = await Get("product", { page: currentPage });
          
          if (res.data && Array.isArray(res.data)) {
            allProducts = [...allProducts, ...res.data];
            
            if (res.last_page) {
              totalPages = res.last_page;
            }
            
            if (currentPage >= totalPages || res.data.length === 0) {
              hasMorePages = false;
            } else {
              currentPage++;
            }
          } else {
            hasMorePages = false;
          }
        }
        
        return allProducts;
      };

      const allProducts = await fetchAllProducts();
      console.log("All products loaded:", allProducts.length);
      
      // Simpan ke cache
      setCachedData('all_products', allProducts);
      
      setProductList.setState(allProducts);
      processStoreLocations(allProducts);

    } catch (err) {
      console.log("Error fetching products:", err);
      // Fallback ke single page request
      try {
        const res: any = await Get("product", {});
        if (res.data) {
          setProductList.setState(res.data);
          processStoreLocations(res.data);
        }
      } catch (fallbackErr) {
        console.log("Fallback also failed:", fallbackErr);
      }
    } finally {
      // Reset fetching flag setelah delay
      fetchTimeoutRef.current = setTimeout(() => {
        isFetchingRef.current = false;
      }, 2000);
    }

    // Fetch province dan address tetap jalan
    await fetch<any, Province[]>({
      url: "province",
      method: "GET",
      before: () => setLoading.append("getprovince"),
      success: ({ data }) => {
        setProvinceList.setState(data ?? []);
      },
      complete: () => setLoading.filter((e) => e != "getprovince"),
    });

    if (user?.id) {
      await fetch<any, AddressUpdateRequest[]>({
        url: `my-address?user_id=${user?.id}`,
        method: "GET",
        before: () => setLoading.append("getaddress"),
        success: ({ data }) => {
          if (data) {
            setAddressList.setState(data ?? []);

            if (pickupDeliveryInfo.is_delivery === 1) {
              const mainAddress = _.find(data, ["is_main_address", 1]) ?? data[0];
              if (mainAddress) {
                form.setValues({
                  receiver: {
                    id: mainAddress.id,
                    name: mainAddress.nama_penerima,
                    phone: mainAddress.phone,
                    address_name: mainAddress.address_name,
                    province_id: mainAddress.province_id,
                    city_id: mainAddress.city_id,
                    pos_code: parseInt(mainAddress.zipcode),
                    detail: mainAddress.address_detail,
                    latitude: mainAddress.latitude || "",
                    longitude: mainAddress.longitude || "",
                  },
                });

                getCity(mainAddress.province_id);
              }
            }
          }
        },
        complete: () => setLoading.filter((e) => e != "getaddress"),
      });
    }
  };

  const processStoreLocations = (products: any[]) => {
    const allStoreLocations: StoreLocation[] = [];
    products.forEach((product: any) => {
      if (product.has_store_location && product.has_store_location.is_active === 1) {
        const exists = allStoreLocations.some(loc => loc.id === product.has_store_location.id);
        if (!exists) {
          allStoreLocations.push(product.has_store_location);
        }
      }
    });
    setStoreLocations.setState(allStoreLocations);

    const _orderData = JSON.parse(Cookies.get("order_data") ?? "[]");

    if (_orderData && _orderData.length > 0) {
      const firstProductId = _orderData[0].product_id;
      const orderedProduct = _.find(products, ["id", firstProductId]);

      if (orderedProduct) {
        const hasPickupInstore = orderedProduct.is_pickup_instore === 1 ? 1 : 0;
        const hasDelivery = orderedProduct.is_delivery === 1 ? 1 : 0;

        setPickupDeliveryInfo({
          is_pickup_instore: hasPickupInstore,
          is_delivery: hasDelivery,
        });

        form.setValues({
          is_pickup_instore: hasPickupInstore,
          is_delivery: hasDelivery,
          payment_method_id: 4,
        });

        if (hasPickupInstore === 1 && orderedProduct.has_store_location) {
          form.setValues({
            pickup_location: {
              store_location_id: orderedProduct.has_store_location.id,
              address: orderedProduct.has_store_location.full_addres,
              store_name: orderedProduct.has_store_location.store_name,
            },
          });
        }

        if (hasDelivery === 0) {
          form.setValues({
            courier: undefined,
            receiver: undefined,
          });
        }

        if (hasPickupInstore === 0) {
          form.setValues({
            nama_pemesan: undefined,
            email_pemesan: undefined,
            phone_pemesan: undefined,
            pickup_location: undefined,
          });
        }
      }
    }
  };

  const getCity = async (province_id: number) => {
    await fetch<any, City[]>({
      url: `city?province_id=${province_id}`,
      method: "GET",
      before: () => setLoading.append("getcity"),
      success: ({ data }) => {
        setCityList.setState(data ?? []);
      },
      complete: () => setLoading.filter((e) => e != "getcity"),
    });
  };

  // Function to check all ongkir options - HANYA MENAMPILKAN REGULAR
  const checkAllOngkir = async () => {
    if (!form.values.receiver?.latitude || 
        !form.values.receiver?.longitude || 
        !form.values.receiver?.pos_code) {
      return;
    }

    const totalWeight = _.sumBy(orderedProduct, "weight") || 1000;

    await fetch<GetCourierReq, any>({
      url: "shipping/cek-all-ongkir",
      method: "POST",
      data: {
        origin_postal_code: ORIGIN_POSTAL_CODE,
        destination_postal_code: form.values.receiver.pos_code.toString(),
        origin_latitude: ORIGIN_LATITUDE,
        origin_longitude: ORIGIN_LONGITUDE,
        destination_latitude: parseFloat(form.values.receiver.latitude),
        destination_longitude: parseFloat(form.values.receiver.longitude),
        weight: totalWeight,
      },
      before: () => setLoading.append("getongkir"),
      success: (response) => {
        console.log("Ongkir response:", response);
        
        const responseData = response.data || response;
        
        if (responseData && responseData.success === true) {
          const rates = responseData.rates;
          
          if (!rates) {
            console.error("No rates in response:", responseData);
            setCourierOptions([]);
            return;
          }
          
          // Format dropdown options - HANYA REGULAR
          const options: { group: string; items: CourierRate[] }[] = [];
          
          const processRateItems = (items: any[] | undefined, groupName: string): CourierRate[] => {
            if (!items || !Array.isArray(items)) return [];
            
            return items
              .filter(item => item && typeof item === 'object')
              .map((item: any) => ({
                courier: item.courier || groupName,
                service: item.service || "Layanan",
                type: item.type || "regular",
                price: typeof item.price === 'number' ? item.price : parseInt(item.price) || 0,
                etd: item.etd || "-"
              }))
              .filter(item => item.price > 0);
          };
          
          // HANYA PROSES REGULAR, instant dan same_day diabaikan
          if (rates.regular && Array.isArray(rates.regular) && rates.regular.length > 0) {
            const regularItems = processRateItems(rates.regular, "Regular");
            if (regularItems.length > 0) {
              options.push({
                group: "Regular",
                items: regularItems
              });
            }
          }
          
          console.log("Formatted courier options (regular only):", options);
          setCourierOptions(options);
        } else {
          console.error("Failed to fetch ongkir or success false:", responseData);
          setCourierOptions([]);
        }
      },
      complete: () => setLoading.filter((e) => e != "getongkir"),
      error: (err) => {
        console.error("Failed to fetch ongkir:", err);
        setCourierOptions([]);
      },
    });
  };

  const orderedProduct = useMemo(() => {
    return orderData?.map((e, index) => {
      const product = _.find(productList, ["id", e.product_id]);
      const variant = e.variant_id ? _.find(product?.product_varian, ["id", e.variant_id]) : null;
      const subprice = parseInt((!variant ? product?.price : variant?.price) ?? "0");
      const weight = parseInt((!variant ? product?.weight : variant?.weight) ?? "0");
      const price = subprice * e.qty;
      const image = product?.product_image[0] ? product?.product_image[0].image_url : "#";
      const creator_id = product?.creator_id;
      const is_pickup_instore = product?.is_pickup_instore === 1;
      const is_delivery = product?.is_delivery === 1;
      const admin_fee = parseInt(product?.admin_fee || "0");

      return { 
        ...e, 
        product, 
        variant, 
        price, 
        subprice, 
        image, 
        weight, 
        creator_id, 
        is_pickup_instore, 
        is_delivery, 
        admin_fee,
        index
      };
    });
  }, [productList, orderData]);

  const orderSummary = useMemo(() => {
    const result: [string, number][] = [];

    for (const order of orderedProduct ?? []) {
      result.push([`x${order.qty} ${order.product?.product_name ?? "-"}`, order.price]);
    }

    if (pickupDeliveryInfo.is_delivery === 1 && form.values.courier?.price) {
      result.push(["Biaya Pengiriman", form.values.courier.price]);
    }

    const adminFee = orderedProduct && orderedProduct.length > 0 
      ? orderedProduct[0].admin_fee || 0
      : 0;
    
    if (adminFee > 0) {
      result.push(["Biaya Admin", adminFee]);
    }

    const grandtotal = result.reduce((q, n) => q + n[1], 0);
    result.push(["Total", grandtotal]);

    return { array: result, grandtotal, adminFee };
  }, [orderedProduct, form.values.courier, pickupDeliveryInfo.is_delivery]);

  const handleProductNoteChange = (index: number, note: string) => {
    form.setFieldValue(`product_notes.${index}`, note);
  };

  const handleCheckout = async () => {
    const { values } = form;

    if (pickupDeliveryInfo.is_pickup_instore === 1) {
      if (!values.nama_pemesan) {
        form.setFieldError("nama_pemesan", "Nama pemesan harus diisi untuk pickup instore");
        return;
      }
      if (!values.email_pemesan) {
        form.setFieldError("email_pemesan", "Email pemesan harus diisi untuk pickup instore");
        return;
      }
      if (!values.phone_pemesan) {
        form.setFieldError("phone_pemesan", "Nomor telepon pemesan harus diisi untuk pickup instore");
        return;
      }
      if (!values.pickup_location?.store_location_id) {
        form.setFieldError("pickup_location", "Lokasi pengambilan harus dipilih untuk pickup instore");
        return;
      }
    }

    if (pickupDeliveryInfo.is_delivery === 1) {
      if (!values.receiver) {
        form.setFieldError("receiver", "Alamat pengiriman harus diisi untuk delivery");
        return;
      }
      if (!values.courier) {
        form.setFieldError("courier", "Kurir harus dipilih untuk delivery");
        return;
      }
    }

    if (!values.payment_method_id) {
      form.setFieldError("payment_method_id", "Payment method ID harus diisi");
      return;
    }

    if (!orderedProduct || orderedProduct.length === 0) {
      console.error("Tidak ada produk dalam order");
      return;
    }

    const formattedPhone = values.phone_pemesan ? values.phone_pemesan.replace(/\D/g, "") : undefined;
    const userId = user?.id ?? 6;
    const paymentMethodId = values.payment_method_id || 4;

    const checkoutData: Checkout = {
      user_id: userId,
      nama_pemesan: pickupDeliveryInfo.is_pickup_instore === 1 ? values.nama_pemesan || null : null,
      email_pemesan: pickupDeliveryInfo.is_pickup_instore === 1 ? values.email_pemesan || null : null,
      phone_pemesan: pickupDeliveryInfo.is_pickup_instore === 1 ? formattedPhone || null : null,
      creator_id: orderedProduct && orderedProduct.length > 0 ? orderedProduct[0].creator_id || null : null,
      grandtotal: orderSummary.grandtotal,
      product: (orderedProduct ?? []).map((e, index) => ({
        product_id: e.product_id,
        variant_id: e.variant_id || null,
        qty: e.qty,
        price: e.subprice,
        order_notes: values.product_notes?.[index] || "",
      })),
      payment_method: "xendit",
      payment_method_id: paymentMethodId,
      is_pickup_instore: pickupDeliveryInfo.is_pickup_instore,
      is_delivery: pickupDeliveryInfo.is_delivery,
    };

    if (pickupDeliveryInfo.is_pickup_instore === 1 && values.pickup_location) {
      checkoutData.order_pickup = {
        store_location_id: values.pickup_location.store_location_id,
      };
    }

    if (pickupDeliveryInfo.is_delivery === 1 && values.receiver && values.courier) {
      checkoutData.courier = {
        main: values.courier.name ? values.courier.name.toUpperCase() : "JNE",
        type: values.courier.type || "standard",
        price: values.courier.price || 0,
        service: values.courier.service || "Reguler",
        etd: values.courier.etd || "1-2 days",
      };

      checkoutData.address = {
        id: values.receiver.id,
        is_main_address: 1,
        province_id: values.receiver.province_id,
        city_id: values.receiver.city_id,
        address_detail: values.receiver.detail,
        address_name: values.receiver.address_name,
        zipcode: String(values.receiver.pos_code),
        latitude: values.receiver.latitude || "",
        longitude: values.receiver.longitude || "",
        nama_penerima: values.receiver.name,
        phone: values.receiver.phone,
        is_active: 1,
      };
    } else {
      checkoutData.courier = {
        main: "JNE",
        type: "standard",
        price: 10000,
        service: "Reguler",
        etd: "1-2 days",
      };

      checkoutData.address = {
        is_main_address: 1,
        province_id: 11,
        city_id: 22,
        address_detail: "Ambil di Pasar Bareng Bareng",
        address_name: "Pasar Bareng Bareng",
        zipcode: "15147",
        latitude: "",
        longitude: "",
        nama_penerima: values.nama_pemesan || "Customer",
        phone: formattedPhone || "081234567890",
        is_active: 1,
      };
    }

    try {
      await fetch<any, any>({
        url: "order-product",
        method: "POST",
        data: checkoutData,
        before: () => setLoading.append("checkout"),
        success: ({ data, status, message, error }) => {
          console.log("Checkout success response:", data);
          
          // Handle response structure based on actual API response
          if (data?.xendit && Array.isArray(data.xendit) && data.xendit.length > 0) {
            const xenditData = data.xendit[0];
            if (xenditData.invoice_url) {
              Cookies.remove("order_data");
              router.push(xenditData.invoice_url);
              return;
            }
          }
          
          // Fallback untuk struktur lama
          if (data?.xendit_invoice) {
            Cookies.remove("order_data");
            router.push(data.xendit_invoice);
            return;
          } else if (data?.xendit?.invoice_url) {
            Cookies.remove("order_data");
            router.push(data.xendit.invoice_url);
            return;
          } else {
            if (typeof message === "string" && message.includes("{")) {
              try {
                const parsedError = JSON.parse(message);
                
                if (parsedError.out_of_stock === true) {
                  setStockAlert({
                    show: true,
                    message: parsedError.message || "Stock produk tidak mencukupi. Silakan periksa kembali jumlah produk yang dipesan."
                  });
                  
                  notifications.show({
                    title: 'Stock Tidak Tersedia',
                    message: parsedError.message || 'Maaf, produk yang Anda pesan sudah habis atau stock tidak mencukupi.',
                    color: 'red',
                    icon: <Icon icon="mdi:alert-circle" />,
                  });
                } else {
                  alert(`Gagal membuat transaksi: ${parsedError.message || parsedError.error || "Unknown error"}`);
                }
              } catch {
                alert(`Gagal membuat transaksi: ${message || error || "Unknown error"}`);
              }
            } else {
              alert(`Gagal membuat transaksi: ${message || error || "Unknown error"}`);
            }
          }
        },
        complete: () => setLoading.filter((e) => e != "checkout"),
        error: (err) => {
          console.error("Error checkout:", err);
          
          if (err?.response?.data?.out_of_stock === true || err?.out_of_stock === true) {
            const errorMessage = err?.response?.data?.message || err?.message || "Stock produk tidak mencukupi. Silakan periksa kembali jumlah produk yang dipesan.";
            
            setStockAlert({
              show: true,
              message: errorMessage
            });
            
            notifications.show({
              title: 'Stock Tidak Tersedia',
              message: errorMessage,
              color: 'red',
              icon: <Icon icon="mdi:alert-circle" />,
            });
          } else {
            alert("Terjadi kesalahan saat memproses checkout. Silakan coba lagi.");
          }
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      
      if (error && typeof error === 'object' && 'out_of_stock' in error && error.out_of_stock === true) {
        setStockAlert({
          show: true,
          message: "Stock produk tidak mencukupi. Silakan periksa kembali jumlah produk yang dipesan."
        });
      } else {
        alert("Terjadi kesalahan sistem. Silakan coba lagi.");
      }
    }
  };

  const getAccordionItems = () => {
    const items = [];

    if (pickupDeliveryInfo.is_pickup_instore === 1) {
      items.push(
        <Accordion.Item key="data-pemesan" value="data-pemesan">
          <Accordion.Control>
            <Flex gap={10} align="center">
              <Icon icon="lets-icons:form-fill" className={`text-[20px] text-[#194E9E]`} />
              <Text fw={600}>Data Pemesan</Text>
            </Flex>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <TextInput
                label="Nama Pemesan"
                placeholder="Masukan Nama Pemesan"
                onChange={(e) => form.setValues({ nama_pemesan: e.target.value })}
                onBlur={() => form.validateField("nama_pemesan")}
                value={form.values.nama_pemesan || ""}
              />

              <TextInput
                type="email"
                label="Email Pemesan"
                placeholder="Masukan Email Pemesan"
                onChange={(e) => form.setValues({ email_pemesan: e.target.value })}
                onBlur={() => form.validateField("email_pemesan")}
                value={form.values.email_pemesan || ""}
              />

              <TextInput
                type="tel"
                label="No. Telepon Pemesan"
                placeholder="Masukan No. Telepon Pemesan (contoh: 081234567890)"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  form.setValues({ phone_pemesan: value });
                }}
                onBlur={() => form.validateField("phone_pemesan")}
                value={form.values.phone_pemesan || ""}
              />

              <div>
                <Text size="sm" fw={500} mb={5}>
                  Lokasi Pengambilan
                </Text>
                <UnstyledButton onClick={() => setModal("pickup")} className="w-full">
                  <Card
                    withBorder
                    p={15}
                    radius={10}
                    className={`
                      w-full
                      !border !border-gray-300 
                      hover:bg-gray-50 
                      transition-colors 
                      cursor-pointer
                      !border-b-3 !border-b-[#0B387C]
                    `}
                  >
                    {form.values.pickup_location ? (
                      <Flex gap={10} align="center">
                        <Box c={"#0B387C"}>
                          <Icon icon="gis:location-poi" className={`text-[20px]`} />
                        </Box>
                        <Stack gap={2} className="flex-grow">
                          <Text fw={500} size="sm" lineClamp={1}>
                            {form.values.pickup_location.store_name}
                          </Text>
                          <Text c="gray" size="xs" lineClamp={1}>
                            {getTruncatedAddress(form.values.pickup_location.address)}
                          </Text>
                        </Stack>
                        <Icon icon="uiw:right" className="text-gray-400 text-sm" />
                      </Flex>
                    ) : (
                      <Flex align="center" gap={10} justify="center">
                        <Icon icon="uiw:plus" className={`text-primary-base`} />
                        <Text size="sm" c="gray.8">
                          Pilih Lokasi Pengambilan
                        </Text>
                      </Flex>
                    )}
                  </Card>
                </UnstyledButton>
              </div>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>,
      );
    }

    if (pickupDeliveryInfo.is_delivery === 1) {
      items.push(
        <Accordion.Item key="data-pengiriman" value="data-pengiriman">
          <Accordion.Control>
            <Flex gap={10} align="center">
              <Icon icon="fa-solid:shipping-fast" className={`text-[20px] text-[#194E9E]`} />
              <Text fw={600}>Data Pengiriman</Text>
            </Flex>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <div>
                <Text size="sm" fw={500} mb={5}>
                  Alamat Pengiriman
                </Text>
                <UnstyledButton mih="100%" onClick={() => setModal("address")} className="w-full">
                  <Card
                    withBorder
                    p={15}
                    radius={10}
                    h="100%"
                    className={`
                      w-full
                      !border !border-gray-300 
                      hover:bg-gray-50 
                      transition-colors 
                      cursor-pointer
                      !border-b-3 !border-b-[#0B387C]
                      ${form.values?.receiver?.pos_code ? "" : "!bg-primary-light"}
                    `}
                  >
                    {form.values?.receiver?.pos_code ? (
                      <Flex gap={10} align="center">
                        <Box c={"#0B387C"}>
                          <Icon icon="gis:location-poi" className={`text-[20px]`} />
                        </Box>
                        <Stack gap={2} className="flex-grow">
                          <Text fw={500} size="sm" lineClamp={1}>
                            {form.values.receiver.address_name}
                          </Text>
                          <Text c="gray" size="xs" lineClamp={1}>
                            {form.values.receiver.name}, {form.values.receiver.phone}
                          </Text>
                          <Text c="gray" size="xs" lineClamp={1} className={`uppercase`}>
                            {_.find(provinceList, ["id", form.values.receiver.province_id])?.name}, {_.find(cityList, ["id", form.values.receiver.city_id])?.name}
                          </Text>
                          {form.values.receiver.latitude && form.values.receiver.longitude && (
                            <Badge size="xs" color="green" variant="light">
                              <Icon icon="mdi:map-marker" className="mr-1" /> Pinpoint tersedia
                            </Badge>
                          )}
                        </Stack>
                        <Icon icon="uiw:right" className="text-gray-400 text-sm" />
                      </Flex>
                    ) : (
                      <Flex align="center" gap={10} justify="center">
                        <Icon icon="uiw:plus" className={`text-primary-base`} />
                        <Text size="sm" c="gray.8">
                          Pilih atau Tambah Alamat
                        </Text>
                      </Flex>
                    )}
                  </Card>
                </UnstyledButton>
              </div>

              {/* Bagian Kurir Pengiriman - HANYA REGULAR */}
              {form.values?.receiver?.pos_code && (
                <div>
                  <Text size="sm" fw={500} mb={5}>
                    Pilih Kurir
                  </Text>
                  
                  {loading.includes("getongkir") ? (
                    <Center py="md">
                      <Loader size="sm" />
                      <Text size="sm" ml="xs">Menghitung ongkir...</Text>
                    </Center>
                  ) : (
                    <>
                      {courierOptions && Array.isArray(courierOptions) && courierOptions.length > 0 ? (
                        <>
                          <Select
                            placeholder="Pilih kurir pengiriman"
                            data={(() => {
                              try {
                                if (!Array.isArray(courierOptions)) return [];
                                
                                // Filter hanya grup Regular
                                const regularGroup = courierOptions.find(group => group.group === "Regular");
                                
                                if (!regularGroup || !Array.isArray(regularGroup.items)) return [];
                                
                                return regularGroup.items
                                  .filter(item => item && typeof item === 'object')
                                  .map(item => ({
                                    value: JSON.stringify(item),
                                    label: `${item.courier || 'Kurir'} - ${item.service || 'Layanan'} (${item.etd || '-'}) - ${currencyFormat(item.price || 0)}`,
                                  }));
                              } catch (error) {
                                console.error("Error formatting courier options:", error);
                                return [];
                              }
                            })()}
                            value={form.values.courier ? JSON.stringify(form.values.courier) : null}
                            onChange={(value) => {
                              if (value) {
                                try {
                                  const courier = JSON.parse(value);
                                  if (courier && typeof courier === 'object') {
                                    form.setValues({ courier });
                                  }
                                } catch (e) {
                                  console.error("Error parsing courier data:", e);
                                }
                              }
                            }}
                            searchable
                            clearable
                            nothingFoundMessage="Tidak ada kurir tersedia"
                          />
                        </>
                      ) : (
                        <Card withBorder p="sm" bg="yellow.0">
                          <Text size="sm" c="dimmed" ta="center">
                            {loading.includes("getongkir") ? "Sedang menghitung ongkir..." : "Tidak ada kurir yang tersedia untuk alamat ini"}
                          </Text>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>,
      );
    }

    return items;
  };

  return (
    <div className={`bg-primary-light mt-[-20px] pt-[20px] pb-[30px] mb-[-20px]`}>
      <AddressModal
        opened={modal == "address"}
        onClose={() => setModal(undefined)}
        list={addressList}
        onChange={(data) => {
          if (data) {
            form.setValues({ receiver: data });
            form.setValues({ courier: undefined });
            if (data.latitude && data.longitude) {
              setTimeout(() => checkAllOngkir(), 100);
            }
          }
        }}
        province={provinceList}
        getCity={(e) => getCity(e)}
        cityLoading={loading.includes("getcity")}
        city={cityList}
        isLoaded={isLoaded}
      />

      <PickupLocationModal
        opened={modal == "pickup"}
        onClose={() => setModal(undefined)}
        onSelect={(store_location_id, address, store_name) => form.setValues({ pickup_location: { store_location_id, address, store_name } })}
        currentStoreLocationId={form.values.pickup_location?.store_location_id}
        storeLocations={storeLocations}
      />

      <Container size="lg" mb="xl" className={`mt-[85px] md:mt-[100px`}>
        {stockAlert.show && (
          <Alert
            title="Stock Tidak Tersedia"
            color="red"
            mb="md"
            icon={<Icon icon="mdi:alert-circle" />}
            onClose={() => setStockAlert({ show: false, message: "" })}
            withCloseButton
          >
            {stockAlert.message}
          </Alert>
        )}

        <Stack gap={25} mb={40}>
          <Stack gap={0}>
            <Title order={1} size="h2">
              Checkout Merchandise
            </Title>
            <Text size="sm" c="gray">
              Pilih Metode Pembayaran dan Alamat Pengiriman
            </Text>
          </Stack>

          <Divider />

          <Grid>
            <Grid.Col span={{ base: 12, md: 7 }}>
              {pickupDeliveryInfo.is_pickup_instore === 1 || pickupDeliveryInfo.is_delivery === 1 ? (
                <Accordion variant="separated" radius="md" defaultValue={[...(pickupDeliveryInfo.is_pickup_instore === 1 ? ["data-pemesan"] : []), ...(pickupDeliveryInfo.is_delivery === 1 ? ["data-pengiriman"] : [])]} multiple>
                  {getAccordionItems()}
                </Accordion>
              ) : (
                <Card withBorder radius="md" p="md">
                  <Text c="red" ta="center">
                    Tidak ada metode pengiriman yang tersedia untuk produk ini.
                  </Text>
                </Card>
              )}
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap={10}>
                <Card withBorder radius={10} p={20}>
                  <Stack gap={15}>
                    <Flex gap={10} align="center">
                      <Icon icon="octicon:info-24" className={`text-primary-base text-[20px]`} />
                      <Text fw={600}>Rincian Produk</Text>
                    </Flex>

                    <Divider />

                    {(orderedProduct ?? []).map((e, i) => (
                      <Stack key={i} gap={10}>
                        <Flex gap={15} align="center">
                          <AspectRatio ratio={1} w={60}>
                            <Image alt="image" src={e.image} w="100%" h="100%" bg="gray.1" radius="sm" />
                          </AspectRatio>
                          <Stack gap={3} className={`flex-grow`}>
                            <Text size="sm" fw={500}>
                              {e.product?.product_name}
                            </Text>
                            {e.variant && (
                              <Text c="gray" size="xs">
                                Varian: {e.variant?.varian_name}
                              </Text>
                            )}
                            <Text size="sm" fw={600}>
                              <NumberFormatter value={e.subprice} prefix="Rp " thousandSeparator="." decimalSeparator="," />
                            </Text>
                            <Flex gap={5}>
                              {e.is_pickup_instore && (
                                <Text size="xs" c="blue" fw={500}>
                                  Pickup In-store
                                </Text>
                              )}
                              {e.is_delivery && (
                                <Text size="xs" c="green" fw={500}>
                                  Delivery
                                </Text>
                              )}
                            </Flex>
                          </Stack>
                          <Text size="sm">x{e.qty}</Text>
                        </Flex>
                        
                        <Box pl={75} pr={10}>
                          <TextInput
                            size="xs"
                            placeholder="Tambahkan catatan (contoh: warna, ukuran, dll)"
                            value={form.values.product_notes?.[i] || ""}
                            onChange={(event) => handleProductNoteChange(i, event.currentTarget.value)}
                            rightSection={
                              form.values.product_notes?.[i] ? (
                                <ActionIcon 
                                  size="xs" 
                                  color="gray" 
                                  variant="subtle"
                                  onClick={() => handleProductNoteChange(i, "")}
                                >
                                  <Icon icon="mdi:close" fontSize={14} />
                                </ActionIcon>
                              ) : null
                            }
                          />
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Card>

                <Card withBorder radius={10} p={20}>
                  <Stack gap={15}>
                    <Flex gap={10} align="center">
                      <Icon icon="mdi:voucher-outline" className={`text-primary-base text-[20px]`} />
                      <Text fw={600}>Voucher</Text>
                    </Flex>

                    <TextInput placeholder="Masukan Kode Voucher" />
                  </Stack>
                </Card>

                <Card withBorder radius={10} p={20}>
                  <Stack gap={15}>
                    <Flex gap={10} align="center">
                      <Icon icon="uiw:information" className={`text-primary-base text-[20px]`} />
                      <Text fw={600}>Total Pembayaran</Text>
                    </Flex>

                    <Divider />

                    <Stack>
                      {orderSummary.array.map((e, i) => (
                        <Flex justify="space-between" key={i}>
                          <Text fw={e[0] == "Total" ? 600 : 400}>{e[0]}</Text>
                          <Text fw={e[0] == "Total" ? 600 : 400}>
                            <NumberFormatter value={e[1]} prefix="Rp " thousandSeparator="." decimalSeparator="," />
                          </Text>
                        </Flex>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>

        <Card pos="fixed" className={`bottom-0 left-0 w-[100vw] border-t !border-primary-light`} py={10} withBorder>
          <Container size="lg" w="100%">
            <Flex justify="end" w="100%">
              <Button
                loading={loading.includes("checkout")}
                onClick={handleCheckout}
                className={`uppercase`}
                color="#194E9E"
                rightSection={<Icon icon="uiw:check" />}
                radius="xl"
                disabled={!(pickupDeliveryInfo.is_pickup_instore === 1 || pickupDeliveryInfo.is_delivery === 1)}
              >
                Proses Pembayaran
              </Button>
            </Flex>
          </Container>
        </Card>
      </Container>
    </div>
  );
}

// AddressModal dengan 3 step dan Google Maps
const AddressModal = ({
  list,
  opened,
  onClose,
  onChange,
  province,
  getCity,
  city,
  cityLoading,
  isLoaded,
}: {
  list: AddressUpdateRequest[];
  opened: boolean;
  onClose: () => void;
  onChange: (data: FormState["receiver"]) => void;
  getCity: (province_id: number) => void;
  cityLoading: boolean;
  province: Province[];
  city: City[];
  isLoaded: boolean;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<PinpointLocation | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -6.2088, lng: 106.8456 });
  const [mapMarker, setMapMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressUpdateRequest | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  type LocalAddressForm = {
    name: string;
    nama_penerima: string;
    phone: string;
    province: number;
    city: number;
    postcode: string;
    detail: string;
  };

  const form = useForm<LocalAddressForm>({
    initialValues: {
      name: "",
      nama_penerima: "",
      phone: "",
      province: -1,
      city: -1,
      postcode: "",
      detail: "",
    },
    validate: {
      name: (value) => (!value ? "Nama alamat tidak boleh kosong" : null),
      nama_penerima: (value) => (!value ? "Nama penerima tidak boleh kosong" : null),
      phone: (value) => {
        if (!value) return "Nomor telepon tidak boleh kosong";
        if (value.length < 10) return "Nomor telepon minimal 10 digit";
        if (value.length > 15) return "Nomor telepon maksimal 15 digit";
        if (!/^[0-9]+$/.test(value)) return "Nomor telepon harus berupa angka";
        return null;
      },
      province: (value) => (value <= 0 ? "Provinsi harus dipilih" : null),
      city: (value) => (value <= 0 ? "Kota harus dipilih" : null),
      postcode: (value) => {
        if (!value) return "Kode pos tidak boleh kosong";
        if (!/^[0-9]+$/.test(value)) return "Kode pos harus berupa angka";
        return null;
      },
      detail: (value) => (!value ? "Detail alamat tidak boleh kosong" : null),
    },
  });

  const handleSelectExisting = (data: AddressUpdateRequest) => {
    setSelectedAddress(data);
    setActiveStep(2);
    form.setValues({
      name: data.address_name,
      nama_penerima: data.nama_penerima,
      phone: data.phone,
      province: data.province_id,
      city: data.city_id,
      postcode: data.zipcode,
      detail: data.address_detail,
    });
    
    if (data.latitude && data.longitude) {
      setMapCenter({ 
        lat: parseFloat(data.latitude), 
        lng: parseFloat(data.longitude) 
      });
      setMapMarker({ 
        lat: parseFloat(data.latitude), 
        lng: parseFloat(data.longitude) 
      });
    }
  };

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formattedAddress = place.formatted_address || "";
        
        let postalCode = "";
        let city = "";
        let province = "";
        const addressComponents = place.address_components;
        
        if (addressComponents) {
          for (const component of addressComponents) {
            if (component.types.includes("postal_code")) {
              postalCode = component.long_name;
            }
            if (component.types.includes("locality") || component.types.includes("administrative_area_level_3")) {
              city = component.long_name;
            }
            if (component.types.includes("administrative_area_level_1")) {
              province = component.long_name;
            }
          }
        }

        const locationData: PinpointLocation = {
          lat,
          lng,
          address: formattedAddress,
          postalCode,
          city,
          province,
          country: "Indonesia",
          formattedAddress,
        };

        setSelectedLocation(locationData);
        setMapCenter({ lat, lng });
        setMapMarker({ lat, lng });
        
        form.setValues({
          detail: formattedAddress,
          postcode: postalCode,
        });
        
        setActiveStep(1);
      }
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMapMarker({ lat, lng });
      setDirections(null);
      
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const address = results[0].formatted_address;
          
          let postalCode = "";
          for (const component of results[0].address_components) {
            if (component.types.includes("postal_code")) {
              postalCode = component.long_name;
              break;
            }
          }

          const locationData: PinpointLocation = {
            lat,
            lng,
            address,
            postalCode,
            city: "",
            province: "",
            country: "Indonesia",
            formattedAddress: address,
          };

          setSelectedLocation(locationData);
          
          form.setValues({
            detail: address,
            postcode: postalCode,
          });

          calculateDirections(lat, lng);
        }
      });
    }
  };

  const calculateDirections = (destLat: number, destLng: number) => {
    if (!isLoaded || !window.google) return;

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: { lat: ORIGIN_LATITUDE, lng: ORIGIN_LONGITUDE },
        destination: { lat: destLat, lng: destLng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        }
      }
    );
  };

  const handleConfirmPinpoint = () => {
    if (selectedLocation) {
      setActiveStep(2);
    }
  };

  const handleSaveNewAddress = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    const values = form.values;
    
    if (selectedAddress) {
      const receiverData: FormState["receiver"] = {
        id: selectedAddress.id,
        name: selectedAddress.nama_penerima,
        phone: selectedAddress.phone,
        address_name: selectedAddress.address_name,
        province_id: selectedAddress.province_id,
        city_id: selectedAddress.city_id,
        pos_code: parseInt(selectedAddress.zipcode),
        detail: selectedAddress.address_detail,
        latitude: selectedAddress.latitude || (selectedLocation ? selectedLocation.lat.toString() : ""),
        longitude: selectedAddress.longitude || (selectedLocation ? selectedLocation.lng.toString() : ""),
      };
      
      onChange(receiverData);
    } 
    else {
      if (!selectedLocation) {
        notifications.show({
          title: 'Error',
          message: 'Lokasi belum dipilih. Silakan tentukan titik lokasi di peta.',
          color: 'red',
        });
        return;
      }

      const receiverData: FormState["receiver"] = {
        name: values.nama_penerima,
        phone: values.phone,
        address_name: values.name,
        province_id: values.province,
        city_id: values.city,
        pos_code: parseInt(values.postcode),
        detail: values.detail,
        latitude: selectedLocation.lat.toString(),
        longitude: selectedLocation.lng.toString(),
      };
      
      onChange(receiverData);
    }
    
    onClose();
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (opened) {
      setActiveStep(0);
      setSearchQuery("");
      setSelectedLocation(null);
      setMapMarker(null);
      setSelectedAddress(null);
      setDirections(null);
      form.reset();
    }
  }, [opened]);

  useEffect(() => {
    if (form.values.province && form.values.province > 0) {
      getCity(form.values.province);
      form.setFieldValue("city", -1);
    }
  }, [form.values.province]);

  const mapContainerStyle = {
    width: '100%',
    height: isMobile ? '250px' : '350px',
    borderRadius: '12px',
  };

  const StepIndicator = () => (
    <Box mb={isMobile ? 20 : 30} mt={10}>
      <Flex justify="space-between" align="center" pos="relative" wrap="nowrap">
        <Box 
          pos="absolute" 
          top={isMobile ? 15 : 20} 
          left="10%" 
          right="10%" 
          h={2} 
          bg="gray.2" 
          style={{ zIndex: 1 }}
        />
        
        <Box style={{ zIndex: 2 }} ta="center" w={isMobile ? 60 : 100}>
          <Badge 
            size={isMobile ? "md" : "xl"} 
            radius="xl" 
            bg={activeStep >= 0 ? "#0B387C" : "gray.2"}
            c={activeStep >= 0 ? "white" : "gray.6"}
            style={{ 
              width: isMobile ? 30 : 40, 
              height: isMobile ? 30 : 40, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 0,
              margin: '0 auto'
            }}
          >
            1
          </Badge>
          <Text 
            size={isMobile ? "10px" : "sm"} 
            fw={activeStep === 0 ? 600 : 400} 
            mt={5} 
            c={activeStep === 0 ? "#0B387C" : "gray.6"}
            style={{ fontSize: isMobile ? '10px' : '14px', whiteSpace: 'nowrap' }}
          >
            Cari Lokasi
          </Text>
        </Box>

        <Box style={{ zIndex: 2 }} ta="center" w={isMobile ? 60 : 100}>
          <Badge 
            size={isMobile ? "md" : "xl"} 
            radius="xl" 
            bg={activeStep >= 1 ? "#0B387C" : "gray.2"}
            c={activeStep >= 1 ? "white" : "gray.6"}
            style={{ 
              width: isMobile ? 30 : 40, 
              height: isMobile ? 30 : 40, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 0,
              margin: '0 auto'
            }}
          >
            2
          </Badge>
          <Text 
            size={isMobile ? "10px" : "sm"} 
            fw={activeStep === 1 ? 600 : 400} 
            mt={5} 
            c={activeStep === 1 ? "#0B387C" : "gray.6"}
            style={{ fontSize: isMobile ? '10px' : '14px', whiteSpace: 'nowrap' }}
          >
            Pinpoint
          </Text>
        </Box>

        <Box style={{ zIndex: 2 }} ta="center" w={isMobile ? 60 : 100}>
          <Badge 
            size={isMobile ? "md" : "xl"} 
            radius="xl" 
            bg={activeStep >= 2 ? "#0B387C" : "gray.2"}
            c={activeStep >= 2 ? "white" : "gray.6"}
            style={{ 
              width: isMobile ? 30 : 40, 
              height: isMobile ? 30 : 40, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 0,
              margin: '0 auto'
            }}
          >
            3
          </Badge>
          <Text 
            size={isMobile ? "10px" : "sm"} 
            fw={activeStep === 2 ? 600 : 400} 
            mt={5} 
            c={activeStep === 2 ? "#0B387C" : "gray.6"}
            style={{ fontSize: isMobile ? '10px' : '14px', whiteSpace: 'nowrap' }}
          >
            Detail
          </Text>
        </Box>
      </Flex>
    </Box>
  );

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <Stack gap={isMobile ? 15 : 20}>
          <StepIndicator />

          {isLoaded ? (
            <Autocomplete
              onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete;
              }}
              onPlaceChanged={handlePlaceSelect}
            >
              <TextInput
                placeholder="Tulis nama jalan / gedung / perumahan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size={isMobile ? "sm" : "md"}
                radius="md"
                leftSection={<Icon icon="mdi:magnify" />}
                rightSection={
                  <Button size="xs" color="blue" variant="filled" onClick={handlePlaceSelect}>
                    Cari
                  </Button>
                }
                rightSectionWidth={70}
              />
            </Autocomplete>
          ) : (
            <Center p="xl">
              <Loader />
            </Center>
          )}

          {list.length > 0 && (
            <>
              <Divider label="atau pilih dari alamat tersimpan" labelPosition="center" />
              
              <ScrollArea h={isMobile ? 250 : 300}>
                <Stack gap={10}>
                  {list.map((item, index) => (
                    <UnstyledButton key={index} onClick={() => handleSelectExisting(item)}>
                      <Card withBorder p={isMobile ? 12 : 15} radius={10} className="hover:bg-blue-50 transition-colors">
                        <Flex gap={10}>
                          <Box c={"#0B387C"}>
                            <Icon icon="mdi:home" className={isMobile ? "text-[18px]" : "text-[20px]"} />
                          </Box>
                          <Box style={{ flex: 1 }}>
                            <Text fw={600} size={isMobile ? "xs" : "sm"}>{item.address_name}</Text>
                            <Text size={isMobile ? "10px" : "xs"} c="dimmed" lineClamp={2}>{item.address_detail}</Text>
                            <Text size={isMobile ? "10px" : "xs"} c="dimmed" mt={5}>{item.nama_penerima} • {item.phone}</Text>
                            {item.latitude && item.longitude && (
                              <Badge size="xs" color="green" variant="light" mt={5}>
                                <Icon icon="mdi:map-marker" className="mr-1" /> Pinpoint
                              </Badge>
                            )}
                          </Box>
                        </Flex>
                      </Card>
                    </UnstyledButton>
                  ))}
                </Stack>
              </ScrollArea>
            </>
          )}
        </Stack>
      );
    }

    if (activeStep === 1) {
      return (
        <Stack gap={isMobile ? 15 : 20}>
          <StepIndicator />

          {selectedLocation && (
            <Card withBorder p={isMobile ? "sm" : "md"} bg="blue.0">
              <Text size={isMobile ? "xs" : "sm"} fw={500}>Lokasi yang dipilih:</Text>
              <Text size={isMobile ? "10px" : "sm"}>{selectedLocation.formattedAddress}</Text>
              {selectedLocation.postalCode && (
                <Text size={isMobile ? "8px" : "xs"} c="dimmed" mt={5}>Kode Pos: {selectedLocation.postalCode}</Text>
              )}
            </Card>
          )}

          {isLoaded ? (
            <Box style={{ position: 'relative' }}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
                options={{
                  mapId: GOOGLE_MAPS_MAP_ID,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                  zoomControl: true,
                }}
              >
                {mapMarker && (
                  <Marker 
                    position={mapMarker} 
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      scaledSize: new window.google.maps.Size(40, 40)
                    }}
                  />
                )}
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
              
              <ActionIcon
                size="lg"
                radius="xl"
                color="blue"
                variant="filled"
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  zIndex: 10,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
                onClick={() => {
                  if (mapRef.current) {
                    const control = mapRef.current.getDiv().querySelector('button[title="Toggle fullscreen view"]') as HTMLElement;
                    if (control) control.click();
                  }
                }}
              >
                <Icon icon="mdi:fullscreen" />
              </ActionIcon>
            </Box>
          ) : (
            <Center p="xl">
              <Loader />
            </Center>
          )}

          <Text size={isMobile ? "xs" : "sm"} fw={500} mt={10}>
            Klik pada peta untuk menandai titik lokasi:
          </Text>

          <Flex direction={isMobile ? "column" : "row"} justify="space-between" gap={10} mt={20}>
            <Button 
              variant="outline" 
              color="gray" 
              onClick={handleBack} 
              leftSection={<Icon icon="mdi:arrow-left" />}
              fullWidth={isMobile}
              size={isMobile ? "sm" : "md"}
            >
              Kembali
            </Button>
            <Button 
              color="#0B387C" 
              onClick={handleConfirmPinpoint} 
              rightSection={<Icon icon="mdi:arrow-right" />} 
              disabled={!mapMarker}
              fullWidth={isMobile}
              size={isMobile ? "sm" : "md"}
            >
              Konfirmasi Lokasi
            </Button>
          </Flex>
        </Stack>
      );
    }

    if (activeStep === 2) {
      return (
        <Stack gap={isMobile ? 12 : 15}>
          <StepIndicator />

          {selectedLocation && !selectedAddress && (
            <Card withBorder p="sm" bg="blue.0">
              <Text size={isMobile ? "10px" : "xs"} c="dimmed">Lokasi: {selectedLocation.formattedAddress}</Text>
            </Card>
          )}

          <TextInput 
            label="Nama Penerima" 
            placeholder="Masukan Nama Penerima" 
            {...form.getInputProps("nama_penerima")}
            size={isMobile ? "sm" : "md"}
          />

          <TextInput 
            label="Nama Alamat" 
            placeholder="Rumah, Kantor, ..." 
            {...form.getInputProps("name")}
            size={isMobile ? "sm" : "md"}
          />

          <TextInput 
            label="No. Telp" 
            placeholder="08XX XXXX XXXX" 
            {...form.getInputProps("phone")}
            size={isMobile ? "sm" : "md"}
          />

          <Flex gap={15} className={`[&>*]:flex-grow !flex-col md:!flex-row`}>
            <Select
              searchable
              label="Provinsi"
              placeholder="Pilih Provinsi"
              data={_.sortBy(province, "name").map((e) => ({ value: String(e.id), label: e.name }))}
              value={String(form.values.province)}
              onChange={(e) => e && form.setFieldValue("province", parseInt(e))}
              size={isMobile ? "sm" : "md"}
            />

            <Select
              disabled={cityLoading || form.values.province === -1}
              label="Kota"
              placeholder="Pilih Kota"
              data={city.map((e) => ({ value: String(e.id), label: e.name }))}
              value={String(form.values.city)}
              onChange={(e) => e && form.setFieldValue("city", parseInt(e))}
              size={isMobile ? "sm" : "md"}
            />
          </Flex>

          <TextInput 
            label="Kode Pos" 
            placeholder="Masukan Kode Pos" 
            {...form.getInputProps("postcode")} 
            value={form.values.postcode || (selectedLocation?.postalCode || "")}
            size={isMobile ? "sm" : "md"}
          />

          <Textarea 
            autosize 
            minRows={3} 
            label="Detail Alamat" 
            placeholder="Kecamatan, Desa, No. Rumah, dll" 
            {...form.getInputProps("detail")} 
            value={form.values.detail || (selectedLocation?.formattedAddress || "")}
            size={isMobile ? "sm" : "md"}
          />

          <Text size={isMobile ? "8px" : "xs"} c="gray">
            Periksa kembali alamat yang Anda masukkan untuk memastikan tidak ada kesalahan.
          </Text>

          <Flex direction={isMobile ? "column" : "row"} align="center" gap={10} justify="space-between" mt={10}>
            <Button 
              color="gray" 
              variant="outline" 
              onClick={handleBack} 
              leftSection={<Icon icon="mdi:arrow-left" />}
              fullWidth={isMobile}
              size={isMobile ? "sm" : "md"}
            >
              Kembali
            </Button>
            <Button 
              color="#0B387C" 
              radius="xl" 
              leftSection={<Icon icon="uiw:check" />} 
              onClick={handleSaveNewAddress}
              fullWidth={isMobile}
              size={isMobile ? "sm" : "md"}
            >
              Simpan Alamat
            </Button>
          </Flex>
        </Stack>
      );
    }

    return null;
  };

  return (
    <Modal 
      title={
        <Text size={isMobile ? "sm" : "md"} fw={600}>
          {activeStep === 0 ? "Tambah Alamat Baru" : activeStep === 1 ? "Tentukan Pinpoint" : "Detail Alamat"}
        </Text>
      } 
      opened={opened} 
      onClose={onClose} 
      centered
      size="lg"
      fullScreen={isMobile}
      styles={{
        body: {
          padding: isMobile ? '10px' : '20px',
        }
      }}
    >
      {renderStepContent()}
    </Modal>
  );
};

const PickupLocationModal = ({ 
  opened, 
  onClose, 
  onSelect, 
  currentStoreLocationId,
  storeLocations 
}: { 
  opened: boolean; 
  onClose: () => void; 
  onSelect: (store_location_id: number, address: string, store_name: string) => void; 
  currentStoreLocationId?: number;
  storeLocations: StoreLocation[];
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Modal 
      title={<Text size={isMobile ? "sm" : "md"} fw={600}>Pilih Lokasi Pengambilan</Text>} 
      opened={opened} 
      onClose={onClose} 
      centered 
      size="lg"
      fullScreen={isMobile}
    >
      <Stack gap={20}>
        {storeLocations.length > 0 ? (
          storeLocations.map((location) => (
            <UnstyledButton
              key={location.id}
              onClick={() => {
                onSelect(location.id, location.full_addres, location.store_name);
                onClose();
              }}
            >
              <Card 
                withBorder 
                p={isMobile ? 15 : 20} 
                radius={15} 
                className={`!border-b !border-b-[#0B387C] ${currentStoreLocationId === location.id ? "bg-primary-light" : ""} hover:bg-blue-50 transition-colors`}
              >
                <Flex gap={15}>
                  <Box c={"#0B387C"}>
                    <Icon icon="gis:location-poi" className={isMobile ? "text-[20px]" : "text-[24px]"} />
                  </Box>
                  <Stack gap={3} mt={-5}>
                    <Text fw={600} size={isMobile ? "sm" : "lg"}>
                      {location.store_name}
                    </Text>
                    <Text c="gray" size={isMobile ? "xs" : "sm"}>
                      {location.full_addres}
                    </Text>
                    <Text c="gray" size={isMobile ? "8px" : "xs"}>
                      Kode Pos: {location.postal_code}
                    </Text>
                  </Stack>
                </Flex>
              </Card>
            </UnstyledButton>
          ))
        ) : (
          <Text c="gray" ta="center">
            Tidak ada lokasi pengambilan yang tersedia.
          </Text>
        )}

        <Button onClick={onClose} color="#0B387C" variant="outline" fullWidth size={isMobile ? "sm" : "md"}>
          Tutup
        </Button>
      </Stack>
    </Modal>
  );
};