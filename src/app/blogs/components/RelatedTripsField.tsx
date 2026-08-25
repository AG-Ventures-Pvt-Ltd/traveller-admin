'use client';

import { useState } from 'react';
import { Form, Select, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import baseAPI from '@/services/baseApi';
import { api } from '@/common/constants/api.urls';

interface PublishedTrip {
  _id: string;
  title: string;
  slug?: string;
  location?: { city?: string };
}

/** Trips with a bookable batch, filtered by title/city — same source the featured-trips picker uses. */
const usePublishedTripsDropdown = (search: string) =>
  useQuery({
    queryKey: ['published-trips-dropdown', search],
    queryFn: async () => {
      const { data } = await baseAPI.get(api.getPublishedTripsForDropdown, {
        params: search ? { search } : {},
      });
      return data.data.trips as PublishedTrip[];
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

/**
 * Form.Item (name="relatedTrips") storing Trip.slug values — matches what the
 * client fetches trip metadata by for the blog's related-trips carousel.
 */
export default function RelatedTripsField() {
  const [search, setSearch] = useState('');
  const { data: trips = [], isLoading } = usePublishedTripsDropdown(search);

  const options = trips.map((t) => ({
    value: t.slug,
    label: `${t.title}${t.location?.city ? ` — ${t.location.city}` : ''}`,
  }));

  return (
    <Form.Item
      name="relatedTrips"
      initialValue={[]}
      label={<span className="text-gray-300 text-sm">Related Trips</span>}
      tooltip="Shown as a carousel at the bottom of the post"
    >
      <Select
        mode="multiple"
        placeholder="Search and select trips..."
        showSearch
        filterOption={false}
        onSearch={setSearch}
        loading={isLoading}
        options={options}
        notFoundContent={isLoading ? <Spin size="small" /> : <Empty description="No trips found" />}
        maxTagCount="responsive"
        className="w-full"
      />
    </Form.Item>
  );
}
