'use client';

import { useState } from 'react';
import { Card, Typography, ConfigProvider, theme, Modal, message } from 'antd';
import TripDetailModal from './components/TripDetailModal';
import TripFilters from './components/TripFilters';
import TripTable from './components/TripTable';
import { columns } from './components/TripColumns';
import { useGetData } from '@/services/useGetData';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';
import { Trip } from './constant';

const { Title, Text } = Typography;

const TripsPage = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [tripModalVisible, setTripModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmTrip, setConfirmTrip] = useState<Trip | null>(null);

    const params: Record<string, unknown> = {
        page,
        limit,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchText && { search: searchText }),
    };

    const { data: tripsResponse, isLoading, refetch } = useGetData({
        key: ['trips'],
        url: api.getTrips,
        params,
    });

    // API shape: { data: { data: { data: Trip[], totalItems: number } } }
    const tripsPayload = (tripsResponse as { data?: { data?: { data?: Trip[]; totalItems?: number } } } | undefined)?.data?.data;
    const trips: Trip[] = tripsPayload?.data || [];
    const totalItems: number = tripsPayload?.totalItems || 0;

    const handleShowTripModal = async (trip: Trip) => {
        setTripModalVisible(true);
        setModalLoading(true);
        try {
            const { data } = await baseAPI.get(api.getTripById(trip._id));
            setSelectedTrip((data as { data: Trip }).data);
        } catch {
            message.error('Failed to load trip details');
            setTripModalVisible(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseTripModal = () => {
        setTripModalVisible(false);
        setSelectedTrip(null);
    };

    const handlePublish = (trip: Trip) => {
        setConfirmTrip(trip);
        setConfirmVisible(true);
    };

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        if (newPageSize !== limit) {
            setPage(1);
        }
    };

    const handleReset = () => {
        setPage(1);
        setStatusFilter('all');
        setSearchText('');
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: { colorPrimary: '#1890ff', borderRadius: 8 },
            }}
        >
            <div style={{ padding: '24px', minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>
                        Trips Management
                    </Title>
                    <Text type="secondary">
                        Review and publish trips — showing in_review and published trips
                    </Text>
                </div>

                <Card
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}
                    styles={{ body: { padding: '20px' } }}
                >
                    <TripFilters
                        searchText={searchText}
                        setSearchText={(v) => { setSearchText(v); setPage(1); }}
                        statusFilter={statusFilter}
                        setStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
                        onRefresh={refetch}
                        onReset={handleReset}
                        loading={isLoading}
                    />
                </Card>

                <Card
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}
                    styles={{ body: { padding: 0 } }}
                >
                    <TripTable
                        columns={columns({ handlePublish })}
                        data={trips}
                        loading={isLoading}
                        pagination={{ page, limit, totalItems, onChange: handlePageChange }}
                        onRow={(record: Trip) => ({
                            onClick: () => handleShowTripModal(record),
                            style: { cursor: 'pointer' },
                        })}
                    />
                </Card>
            </div>

            <Modal
                title="Publish Trip"
                open={confirmVisible}
                onOk={async () => {
                    try {
                        await baseAPI.patch(api.publishTrip(confirmTrip!._id));
                        message.success('Trip published successfully');
                        refetch();
                        if (selectedTrip?._id === confirmTrip?._id) {
                            setSelectedTrip(prev => prev ? { ...prev, status: 'published' } : null);
                        }
                        setConfirmVisible(false);
                        setConfirmTrip(null);
                    } catch (err: unknown) {
                        const axiosErr = err as { response?: { data?: { message?: string } } };
                        message.error(axiosErr.response?.data?.message || 'Failed to publish trip');
                    }
                }}
                onCancel={() => {
                    setConfirmVisible(false);
                    setConfirmTrip(null);
                }}
                okText="Publish"
            >
                <p>Are you sure you want to publish &quot;{confirmTrip?.title}&quot;?</p>
            </Modal>

            <TripDetailModal
                visible={tripModalVisible}
                onClose={handleCloseTripModal}
                trip={selectedTrip}
                loading={modalLoading}
                onPublish={handlePublish}
                onTripUpdate={(updated) => setSelectedTrip(updated)}
            />
        </ConfigProvider>
    );
};

export default TripsPage;
