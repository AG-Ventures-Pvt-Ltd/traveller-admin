'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Typography, ConfigProvider, theme, Modal, message } from 'antd';
import type { Dayjs } from 'dayjs';
import TripDetailModal from './components/TripDetailModal';
import CancellationPolicyModal from './components/CanclellationPolicyModal';
import TripFilters from './components/TripFilters';
import TripTable from './components/TripTable';
import {
    HOSTS,
    TAGS_LIST,
    ADDRESSES,
    CANCELLATION_POLICIES,
    PREVIEW_IMAGES,
    JOINED_USERS,
    POLICY_DETAILS,
    Trip,
    Host
} from './constant';
import { columns } from './components/TripColumns';
import { PERMISSIONS } from '@/common/constants/permissions';

const { Title, Text } = Typography;

const generateMockTrips = (): Trip[] => {
    const trips: Trip[] = [];
    for (let i = 1; i <= 20; i++) {
        const host = HOSTS[i % HOSTS.length];
        const tags = TAGS_LIST[i % TAGS_LIST.length];
        const address = ADDRESSES[i % ADDRESSES.length];
        const isCompleted = Math.random() > 0.5;
        const maxCapacity = Math.floor(Math.random() * 20) + 5;
        const price = Math.floor(Math.random() * 2000) + 100;
        const cancellationPolicy = CANCELLATION_POLICIES[i % CANCELLATION_POLICIES.length];
        const images = [PREVIEW_IMAGES[i % PREVIEW_IMAGES.length], PREVIEW_IMAGES[(i + 1) % PREVIEW_IMAGES.length]];
        const joined = JOINED_USERS[i % JOINED_USERS.length];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + i * 2);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 2);
        trips.push({
            id: i,
            title: `Trip ${i} to ${address.split(',')[1]}`,
            description: `This is a wonderful trip to ${address.split(',')[1]}. Enjoy the best experiences and make memories!`,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            address,
            host,
            isCompleted,
            maxCapacity,
            tags,
            price,
            cancellationPolicy,
            previewImages: images,
            joinedUsers: joined,
        });
    }
    return trips;
};



const Trips = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isCompletedFilter, setIsCompletedFilter] = useState('all');
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [tripModalVisible, setTripModalVisible] = useState(false);
    const [policyModalVisible, setPolicyModalVisible] = useState(false);
    const [policyPoints, setPolicyPoints] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [priceRange, setPriceRange] = useState<number[]>([0, 10000]); // Initial safe range or null if supported


    const loadTrips = () => {
        setLoading(true);
        setTimeout(() => {
            setTrips(generateMockTrips());
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadTrips();
    }, []);



    const filteredTrips = useMemo(() => {
        let filtered = [...trips];
        if (searchText) {
            filtered = filtered.filter(trip => {
                const search = searchText.toLowerCase();
                return (
                    trip.title.toLowerCase().includes(search) ||
                    trip.description.toLowerCase().includes(search) ||
                    trip.address.toLowerCase().includes(search) ||
                    (trip.host && trip.host.name && trip.host.name.toLowerCase().includes(search))
                );
            });
        }
        if (isCompletedFilter !== 'all') {
            filtered = filtered.filter(trip => String(trip.isCompleted) === isCompletedFilter);
        }
        if (dateRange && dateRange[0] && dateRange[1]) {
            filtered = filtered.filter(trip => {
                // Compare only the date part, ignore time
                const tripDate = new Date(trip.startDate);
                const tripDateOnly = new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate());
                const startDateOnly = dateRange[0]!.toDate();
                startDateOnly.setHours(0, 0, 0, 0);
                const endDateOnly = dateRange[1]!.toDate();
                endDateOnly.setHours(0, 0, 0, 0);
                return tripDateOnly >= startDateOnly && tripDateOnly <= endDateOnly;
            });
        }
        if (priceRange && priceRange[0] !== undefined && priceRange[1] !== undefined) {
            // Ensure priceRange is valid before filtering
            const minPrice = priceRange[0];
            const maxPrice = priceRange[1];
            if (minPrice !== null && maxPrice !== null) {
                filtered = filtered.filter(trip => trip.price >= minPrice && trip.price <= maxPrice);
            }
        }
        // Sort by upcoming trips (ascending startDate)
        filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        return filtered;
    }, [trips, searchText, isCompletedFilter, dateRange, priceRange]);




    const handleShowPolicyModal = (policy: string) => {
        setPolicyPoints(POLICY_DETAILS[policy] || [policy]);
        setPolicyModalVisible(true);
    };

    const handleShowTripModal = (trip: Trip) => {
        setSelectedTrip({
            ...trip,
            onShowPolicyModal: () => handleShowPolicyModal(trip.cancellationPolicy)
        });
        setTripModalVisible(true);
    };

    const handleCloseTripModal = () => {
        setTripModalVisible(false);
        setSelectedTrip(null);
    };

    const handleClosePolicyModal = () => {
        setPolicyModalVisible(false);
        setPolicyPoints([]);
    };

    const handleDeleteTrip = (trip: Trip) => {
        Modal.confirm({
            title: 'Delete Trip',
            content: `Are you sure you want to delete trip "${trip.title}"?`,
            okText: 'Delete',
            okType: 'danger',
            onOk: () => {
                setTrips(trips.filter(t => t.id !== trip.id));
                message.success('Trip deleted successfully');
            }
        });
    };



    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 8,
                }
            }}
        >
            <div style={{ padding: '24px', minHeight: '100vh', background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>
                        Trips Management
                    </Title>
                    <Text type="secondary">
                        View and manage all trips
                    </Text>
                </div>
                <Card
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        marginBottom: '24px'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <TripFilters
                        searchText={searchText}
                        setSearchText={setSearchText}
                        isCompletedFilter={isCompletedFilter}
                        setIsCompletedFilter={setIsCompletedFilter}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        loadTrips={loadTrips}
                        loading={loading}
                    />
                </Card>
                <Card
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        marginBottom: '24px'
                    }}
                    bodyStyle={{ padding: 0 }}
                >
                    <TripTable
                        columns={columns(handleDeleteTrip)}
                        data={filteredTrips}
                        loading={loading}
                        onRow={(record: Trip) => ({
                            onClick: () => handleShowTripModal(record)
                        })}
                    />
                </Card>
            </div>
            <TripDetailModal
                visible={tripModalVisible}
                onClose={handleCloseTripModal}
                trip={selectedTrip}
            />
            <CancellationPolicyModal
                visible={policyModalVisible}
                onClose={handleClosePolicyModal}
                policyPoints={policyPoints}
            />
        </ConfigProvider>
    );
}

export default Trips;