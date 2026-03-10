import { Icon } from '@iconify/react/dist/iconify.js';
import {
    Button,
    Divider,
    Flex,
    InputWrapper,
    LoadingOverlay,
    Paper,
    Select,
    Space,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
    Box,
    Grid,
    Group,
    ThemeIcon,
    Card,
    Alert
} from '@mantine/core';
import { useEffect, useState } from 'react';
import fetch from '@/utils/fetch';
import useLoggedUser from '@/utils/useLoggedUser';
import { useDidUpdate, useListState } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { notifications } from '@mantine/notifications';

// Types
type Creator = {
    id: number;
    name: string;
    slug_url: string;
    email?: string;
    phone?: string;
};

type Transaction = {
    invoice_no: string;
    order_id: number;
    order_date: string;
    customer_name: string;
    total_amount: number;
};

type OrderDetail = {
    order_id: number;
    order_courier_id: number;
    invoice_no: string;
    customer_name: string;
    order_date: string;
    items?: OrderItem[];
};

type OrderItem = {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
};

type TrackingStatus = {
    id: number;
    name: string;
};

type TrackingFormValues = {
    creator_slug?: string;
    invoice_no?: string;
    order_id?: number;
    order_courier_id?: number;
    tracking_status_id: number | null;
    status_name: string;
    description: string;
    // Default fields (not shown in form)
    location: string;
    courier_time: string;
    pic_name: string;
};

type ComponentProps = {};

export default function OrderTracking({}: Readonly<ComponentProps>) {
    const [loading, setLoading] = useListState<string>();
    const [creators, setCreators] = useState<Creator[]>([]);
    const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Pilih Creator, 2: Pilih Invoice, 3: Detail Order, 4: Form Tracking
    
    const user = useLoggedUser();
    const router = useRouter();

    const form = useForm<TrackingFormValues>({
        initialValues: {
            tracking_status_id: null,
            status_name: '',
            description: '',
            location: 'Warehouse Jakarta',
            courier_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            pic_name: 'system'
        },
        validate: {
            tracking_status_id: (value) => value ? null : 'Status tracking harus dipilih',
            status_name: (value) => value ? null : 'Nama status harus diisi',
            description: (value) => value ? null : 'Deskripsi harus diisi',
        }
    });

    // Load creators on mount
    useEffect(() => {
        getCreators();
    }, []);

    // Update form when order detail is loaded
    useDidUpdate(() => {
        if (orderDetail) {
            form.setValues({
                ...form.values,
                order_id: orderDetail.order_id,
                order_courier_id: orderDetail.order_courier_id,
            });
            setStep(4);
        }
    }, [orderDetail]);

    const getCreators = async () => {
        await fetch<any, Creator[]>({
            url: 'creator',
            method: 'GET',
            before: () => setLoading.append('getcreators'),
            success: ({ data }) => {
                if (data) {
                    setCreators(data);
                }
            },
            complete: () => setLoading.filter(e => e !== 'getcreators'),
        });
    };

    const getTransactions = async (slug: string) => {
        await fetch<any, Transaction[]>({
            url: `order-product/creator/${slug}/transactions`,
            method: 'GET',
            before: () => setLoading.append('gettransactions'),
            success: ({ data }) => {
                if (data && data.length > 0) {
                    setTransactions(data);
                    setStep(2);
                } else {
                    notifications.show({
                        title: 'Info',
                        message: 'Tidak ada transaksi untuk creator ini',
                        color: 'blue'
                    });
                }
            },
            complete: () => setLoading.filter(e => e !== 'gettransactions'),
        });
    };

    const getOrderDetail = async (invoiceNo: string) => {
        await fetch<any, OrderDetail>({
            url: `order-product-invoice/${invoiceNo}`,
            method: 'GET',
            before: () => setLoading.append('getorderdetail'),
            success: ({ data }) => {
                if (data) {
                    setOrderDetail(data);
                    setSelectedTransaction(transactions.find(t => t.invoice_no === invoiceNo) || null);
                }
            },
            complete: () => setLoading.filter(e => e !== 'getorderdetail'),
        });
    };

    const submitTracking = async () => {
        const validation = form.validate();
        if (validation.hasErrors) {
            notifications.show({
                title: 'Error',
                message: 'Mohon lengkapi semua field yang diperlukan',
                color: 'red'
            });
            return;
        }

        if (!orderDetail) {
            notifications.show({
                title: 'Error',
                message: 'Data order tidak ditemukan',
                color: 'red'
            });
            return;
        }

        const submitData = {
            ...form.values,
            order_id: orderDetail.order_id,
            order_courier_id: orderDetail.order_courier_id,
            tracking_status_id: Number(form.values.tracking_status_id),
            courier_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };

        await fetch<any, any>({
            url: 'api/order-manifest/',
            method: 'POST',
            data: submitData,
            before: () => setLoading.append('submittracking'),
            success: () => {
                notifications.show({
                    title: 'Sukses',
                    message: 'Data tracking berhasil disimpan',
                    color: 'green'
                });
                
                // Reset form
                form.reset();
                setSelectedCreator(null);
                setTransactions([]);
                setSelectedTransaction(null);
                setOrderDetail(null);
                setStep(1);
            },
            complete: () => setLoading.filter(e => e !== 'submittracking'),
            invalid: (errors) => {
                notifications.show({
                    title: 'Error',
                    message: errors.message || 'Gagal menyimpan data',
                    color: 'red'
                });
            },
        });
    };

    const resetToCreator = () => {
        setSelectedCreator(null);
        setTransactions([]);
        setSelectedTransaction(null);
        setOrderDetail(null);
        setStep(1);
        form.reset();
    };

    const resetToInvoice = () => {
        setSelectedTransaction(null);
        setOrderDetail(null);
        setStep(2);
        form.reset();
    };

    const SectionHeader = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
        <Group gap="sm" align="center" mb="md">
            <ThemeIcon size="lg" variant="light" color="blue" radius="md">
                <Icon icon={icon} className="text-xl" />
            </ThemeIcon>
            <Box>
                <Title order={4} fw={600}>{title}</Title>
                {subtitle && <Text size="sm" c="dimmed">{subtitle}</Text>}
            </Box>
        </Group>
    );

    const FormCard = ({ children }: { children: React.ReactNode }) => (
        <Paper withBorder radius="md" shadow="sm" bg="white" p="xl">
            {children}
        </Paper>
    );

    const StepIndicator = () => (
        <Group justify="center" gap="xl" mb="xl">
            {[1, 2, 3, 4].map((s) => (
                <Box key={s} style={{ textAlign: 'center' }}>
                    <ThemeIcon
                        size={40}
                        radius="xl"
                        variant={step >= s ? 'filled' : 'light'}
                        color={step >= s ? 'blue' : 'gray'}
                    >
                        <Text fw={700}>{s}</Text>
                    </ThemeIcon>
                    <Text size="xs" mt={4} c={step >= s ? 'blue' : 'dimmed'}>
                        {s === 1 && 'Pilih Creator'}
                        {s === 2 && 'Pilih Invoice'}
                        {s === 3 && 'Detail Order'}
                        {s === 4 && 'Form Tracking'}
                    </Text>
                </Box>
            ))}
        </Group>
    );

    return (
        <Box pos="relative" mih="100vh" bg="gray.0">
            <LoadingOverlay visible={loading.length > 0} />
            
            {/* Header */}
            <Box bg="white" style={{ borderBottom: '1px solid #dee2e6' }}>
                <Box px="xl" py="lg" maw={800} mx="auto">
                    <Group justify="space-between" align="center">
                        <Box>
                            <Title order={2} size="h2" fw={700}>
                                Tracking Order
                            </Title>
                            <Text size="sm" c="dimmed" mt={4}>
                                Buat tracking baru untuk order yang sudah diterima
                            </Text>
                        </Box>
                        {step > 1 && (
                            <Button 
                                variant="subtle" 
                                onClick={resetToCreator}
                                leftSection={<Icon icon="mdi:arrow-left" />}
                            >
                                Kembali ke Awal
                            </Button>
                        )}
                    </Group>
                </Box>
            </Box>

            <Divider />

            {/* Main Content */}
            <Box px="xl" py="xl" maw={800} mx="auto">
                <StepIndicator />

                <Stack gap="xl">
                    {/* Step 1: Pilih Creator */}
                    {step === 1 && (
                        <FormCard>
                            <SectionHeader 
                                icon="mdi:account-group" 
                                title="Pilih Creator" 
                                subtitle="Pilih creator untuk melihat daftar transaksi"
                            />
                            
                            <Stack gap="md">
                                {creators.map((creator) => (
                                    <Card 
                                        key={creator.id}
                                        withBorder 
                                        p="lg"
                                        radius="md"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            setSelectedCreator(creator);
                                            getTransactions(creator.slug_url);
                                        }}
                                    >
                                        <Group justify="space-between" align="center">
                                            <Box>
                                                <Text fw={600} size="lg">{creator.name}</Text>
                                                <Text size="sm" c="dimmed">Slug: {creator.slug_url}</Text>
                                            </Box>
                                            <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                                <Icon icon="mdi:arrow-right" />
                                            </ThemeIcon>
                                        </Group>
                                    </Card>
                                ))}
                            </Stack>
                        </FormCard>
                    )}

                    {/* Step 2: Pilih Invoice */}
                    {step === 2 && (
                        <FormCard>
                            <SectionHeader 
                                icon="mdi:file-document" 
                                title="Pilih Invoice" 
                                subtitle={`Transaksi untuk ${selectedCreator?.name}`}
                            />
                            
                            <Button 
                                variant="subtle" 
                                size="sm" 
                                onClick={resetToCreator}
                                leftSection={<Icon icon="mdi:arrow-left" />}
                                mb="md"
                            >
                                Pilih Creator Lain
                            </Button>
                            
                            <Stack gap="md">
                                {transactions.map((transaction) => (
                                    <Card 
                                        key={transaction.invoice_no}
                                        withBorder 
                                        p="lg"
                                        radius="md"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => getOrderDetail(transaction.invoice_no)}
                                    >
                                        <Stack gap="xs">
                                            <Group justify="space-between" align="center">
                                                <Text fw={600} size="lg">{transaction.invoice_no}</Text>
                                                <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                                    <Icon icon="mdi:arrow-right" />
                                                </ThemeIcon>
                                            </Group>
                                            <Group gap="xs">
                                                <Text size="sm" c="dimmed">Order ID: {transaction.order_id}</Text>
                                                <Text size="sm" c="dimmed">•</Text>
                                                <Text size="sm" c="dimmed">{transaction.customer_name}</Text>
                                            </Group>
                                            <Text size="sm" c="dimmed">
                                                Tanggal: {new Date(transaction.order_date).toLocaleDateString('id-ID')}
                                            </Text>
                                        </Stack>
                                    </Card>
                                ))}
                            </Stack>
                        </FormCard>
                    )}

                    {/* Step 3: Detail Order */}
                    {step === 3 && orderDetail && (
                        <FormCard>
                            <SectionHeader 
                                icon="mdi:package" 
                                title="Detail Order" 
                                subtitle="Konfirmasi detail order sebelum membuat tracking"
                            />
                            
                            <Button 
                                variant="subtle" 
                                size="sm" 
                                onClick={resetToInvoice}
                                leftSection={<Icon icon="mdi:arrow-left" />}
                                mb="md"
                            >
                                Pilih Invoice Lain
                            </Button>

                            <Stack gap="md">
                                <Alert color="blue" variant="light">
                                    <Stack gap="xs">
                                        <Group justify="space-between">
                                            <Text fw={500}>Invoice:</Text>
                                            <Text>{orderDetail.invoice_no}</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text fw={500}>Order ID:</Text>
                                            <Text>{orderDetail.order_id}</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text fw={500}>Courier ID:</Text>
                                            <Text>{orderDetail.order_courier_id}</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text fw={500}>Customer:</Text>
                                            <Text>{orderDetail.customer_name}</Text>
                                        </Group>
                                    </Stack>
                                </Alert>

                                <Button 
                                    fullWidth 
                                    onClick={() => setStep(4)}
                                    rightSection={<Icon icon="mdi:arrow-right" />}
                                >
                                    Lanjut ke Form Tracking
                                </Button>
                            </Stack>
                        </FormCard>
                    )}

                    {/* Step 4: Form Tracking */}
                    {step === 4 && orderDetail && (
                        <FormCard>
                            <SectionHeader 
                                icon="mdi:truck-delivery" 
                                title="Form Tracking" 
                                subtitle="Lengkapi data tracking order"
                            />
                            
                            <Stack gap="lg">
                                {/* Info Ringkas Order */}
                                <Paper withBorder p="sm" bg="gray.0" radius="md">
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <Text size="xs" c="dimmed">Order ID</Text>
                                            <Text fw={600}>{orderDetail.order_id}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Text size="xs" c="dimmed">Courier ID</Text>
                                            <Text fw={600}>{orderDetail.order_courier_id}</Text>
                                        </Grid.Col>
                                    </Grid>
                                </Paper>

                                <Select
                                    withAsterisk
                                    label="Status Tracking"
                                    placeholder="Pilih status"
                                    data={[
                                        { value: '1', label: '1 - Dalam Proses' },
                                        { value: '2', label: '2 - Dalam Perjalanan' },
                                        { value: '3', label: '3 - Telah Diterima' },
                                    ]}
                                    size="md"
                                    {...form.getInputProps('tracking_status_id')}
                                    onChange={(value) => form.setFieldValue('tracking_status_id', value ? parseInt(value) : null)}
                                />

                                <TextInput
                                    withAsterisk
                                    label="Nama Status"
                                    placeholder="Contoh: Telah Diterima, Dalam Perjalanan, dll"
                                    size="md"
                                    {...form.getInputProps('status_name')}
                                />

                                <Textarea
                                    withAsterisk
                                    label="Deskripsi"
                                    placeholder="Deskripsi detail status tracking"
                                    autosize
                                    minRows={3}
                                    size="md"
                                    {...form.getInputProps('description')}
                                />

                                <Alert color="gray" variant="light">
                                    <Group gap="xs">
                                        <Icon icon="mdi:information" />
                                        <Text size="sm">
                                            Location: Warehouse Jakarta • PIC: system • Waktu akan diisi otomatis
                                        </Text>
                                    </Group>
                                </Alert>

                                <Button
                                    fullWidth
                                    loading={loading.includes('submittracking')}
                                    onClick={submitTracking}
                                    color="blue"
                                    size="md"
                                    radius="md"
                                >
                                    Submit Tracking
                                </Button>
                            </Stack>
                        </FormCard>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}