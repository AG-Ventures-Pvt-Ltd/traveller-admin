'use client';

import React, { useState, useMemo } from 'react';
import {
    Row, Col, Card, Statistic, Skeleton, Tooltip, Typography, Divider, ConfigProvider, theme, Empty, Button,
} from 'antd';
import { MapPin, Globe, Building2, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useGetData } from '@/services/useGetData';
import { api } from '@/common/constants/api.urls';

const { Title, Text } = Typography;

const IndiaMap = dynamic(() => import('./components/IndiaMap'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | 'all';

interface Summary {
    totalSessions: number;
    uniqueCities: number;
    uniqueStates: number;
    uniqueCountries: number;
}

interface StateRow {
    state: string;
    sessions: number;
    coordinates: [number, number] | null;
}

interface CityRow {
    city: string;
    state: string | null;
    sessions: number;
    coordinates: [number, number] | null;
}

interface CountryRow {
    countryCode: string;
    country: string | null;
    sessions: number;
}

interface HeatCell {
    hour: number;
    dow: number; // 1=Sun … 7=Sat (MongoDB $dayOfWeek)
    count: number;
}

interface LocationAnalyticsData {
    summary: Summary;
    stateBreakdown: StateRow[];
    cityBreakdown: CityRow[];
    countryBreakdown: CountryRow[];
    heatmap: HeatCell[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// MongoDB $dayOfWeek: 1=Sun, 2=Mon, … 7=Sat
// Display order: Mon(2)…Sun(1)
const DOW_ORDER = [2, 3, 4, 5, 6, 7, 1];

const formatHour = (h: number) => {
    if (h === 0) return '12a';
    if (h === 12) return '12p';
    return h < 12 ? `${h}a` : `${h - 12}p`;
};

const heatColor = (count: number, max: number): string => {
    if (max === 0 || count === 0) return 'rgba(59,130,246,0.05)';
    const t = count / max;
    const alpha = 0.1 + t * 0.85;
    return `rgba(59,130,246,${alpha.toFixed(2)})`;
};

// ─── Period Selector ──────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: 'All Time', value: 'all' },
];

const PeriodSelector = ({ value, onChange }: { value: Period; onChange: (p: Period) => void }) => (
    <div style={{ display: 'flex', gap: 6 }}>
        {PERIOD_OPTIONS.map(opt => (
            <Button
                key={opt.value}
                type={value === opt.value ? 'primary' : 'default'}
                size="small"
                onClick={() => onChange(opt.value)}
                style={value !== opt.value ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' } : {}}
            >
                {opt.label}
            </Button>
        ))}
    </div>
);

// ─── Summary Cards ────────────────────────────────────────────────────────────

const SUMMARY_CONFIGS = [
    {
        key: 'totalSessions' as const,
        label: 'Total Sessions',
        icon: Users,
        color: '#1890ff',
        bg: 'rgba(24, 144, 255, 0.1)',
        border: 'rgba(24, 144, 255, 0.25)',
    },
    {
        key: 'uniqueStates' as const,
        label: 'States Reached',
        icon: MapPin,
        color: '#52c41a',
        bg: 'rgba(82, 196, 26, 0.1)',
        border: 'rgba(82, 196, 26, 0.25)',
    },
    {
        key: 'uniqueCities' as const,
        label: 'Cities Reached',
        icon: Building2,
        color: '#faad14',
        bg: 'rgba(250, 173, 20, 0.1)',
        border: 'rgba(250, 173, 20, 0.25)',
    },
] as const;

const SummaryCards = ({
    summary,
    countryBreakdown,
    loading,
}: {
    summary: Summary | undefined;
    countryBreakdown: CountryRow[];
    loading: boolean;
}) => {
    const topCountryShare = useMemo(() => {
        if (!summary?.totalSessions || !countryBreakdown.length) return null;
        const top = countryBreakdown[0];
        const pct = ((top.sessions / summary.totalSessions) * 100).toFixed(0);
        return `${top.country ?? top.countryCode} ${pct}%`;
    }, [summary, countryBreakdown]);

    return (
        <Row gutter={[16, 16]}>
            {SUMMARY_CONFIGS.map(cfg => {
                const Icon = cfg.icon;
                return (
                    <Col key={cfg.key} xs={24} sm={12} lg={6}>
                        <Card
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, height: '100%' }}
                            styles={{ body: { padding: '20px 24px' } }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    {loading ? (
                                        <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
                                    ) : (
                                        <Statistic
                                            title={<span style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 500 }}>{cfg.label}</span>}
                                            value={(summary?.[cfg.key] ?? 0).toLocaleString()}
                                            styles={{ content: { color: cfg.color, fontSize: 28, fontWeight: 700 } }}
                                        />
                                    )}
                                </div>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10, background: cfg.bg,
                                    border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0, marginLeft: 12,
                                }}>
                                    <Icon size={20} color={cfg.color} />
                                </div>
                            </div>
                        </Card>
                    </Col>
                );
            })}

            {/* Top country card */}
            <Col xs={24} sm={12} lg={6}>
                <Card
                    style={{ background: 'rgba(114,46,209,0.1)', border: '1px solid rgba(114,46,209,0.25)', borderRadius: 12, height: '100%' }}
                    styles={{ body: { padding: '20px 24px' } }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            {loading ? (
                                <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
                            ) : (
                                <Statistic
                                    title={<span style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 500 }}>Top Country Share</span>}
                                    value={topCountryShare ?? '—'}
                                    styles={{ content: { color: '#722ed1', fontSize: topCountryShare && topCountryShare.length > 12 ? 18 : 24, fontWeight: 700 } }}
                                />
                            )}
                        </div>
                        <div style={{
                            width: 44, height: 44, borderRadius: 10, background: 'rgba(114,46,209,0.1)',
                            border: '1px solid rgba(114,46,209,0.25)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0, marginLeft: 12,
                        }}>
                            <Globe size={20} color="#722ed1" />
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

// ─── Panel wrapper ────────────────────────────────────────────────────────────

const Panel = ({ title, children, span = 24 }: { title: string; children: React.ReactNode; span?: number }) => (
    <Col xs={24} lg={span}>
        <Card
            title={<span style={{ color: '#fff', fontWeight: 600 }}>{title}</span>}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
            styles={{ body: { padding: '16px 20px' } }}
        >
            {children}
        </Card>
    </Col>
);

// ─── Top Cities Table ─────────────────────────────────────────────────────────

const CitiesTable = ({ cities, total, loading }: { cities: CityRow[]; total: number; loading: boolean }) => {
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? cities : cities.slice(0, 20);
    const maxSessions = cities[0]?.sessions ?? 1;

    if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;
    if (!cities.length) return <Empty description="No city data" />;

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 100px 80px 160px', gap: '8px 12px', marginBottom: 8 }}>
                {['#', 'City', 'State', 'Sessions', '% Total', ''].map((h, i) => (
                    <Text key={i} style={{ color: '#8c8c8c', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{h}</Text>
                ))}
            </div>
            <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 0 8px' }} />
            {visible.map((row, idx) => {
                const pct = total > 0 ? ((row.sessions / total) * 100).toFixed(1) : '0.0';
                const barWidth = Math.max(4, (row.sessions / maxSessions) * 100);
                return (
                    <div
                        key={`${row.city}-${row.state}-${idx}`}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '40px 1fr 120px 100px 80px 160px',
                            gap: '8px 12px',
                            padding: '7px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: '#8c8c8c', fontSize: 13 }}>{idx + 1}</Text>
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{row.city}</Text>
                        <Text style={{ color: '#8c8c8c', fontSize: 13 }}>{row.state ?? '—'}</Text>
                        <Text style={{ color: '#1890ff', fontSize: 13, fontWeight: 600 }}>{row.sessions.toLocaleString()}</Text>
                        <Text style={{ color: '#8c8c8c', fontSize: 13 }}>{pct}%</Text>
                        <div style={{ height: 8, background: 'rgba(24,144,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${barWidth}%`, height: '100%', background: '#1890ff', borderRadius: 4 }} />
                        </div>
                    </div>
                );
            })}
            {cities.length > 20 && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button
                        type="link"
                        onClick={() => setShowAll(v => !v)}
                        style={{ color: '#1890ff' }}
                    >
                        {showAll ? 'Show less' : `Show ${cities.length - 20} more`}
                    </Button>
                </div>
            )}
        </div>
    );
};

// ─── Heatmap ──────────────────────────────────────────────────────────────────

const HeatmapGrid = ({ heatmap, loading }: { heatmap: HeatCell[]; loading: boolean }) => {
    if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;
    if (!heatmap.length) return <Empty description="No heatmap data" />;

    const grid = new Map<string, number>();
    let maxCount = 0;
    for (const cell of heatmap) {
        const key = `${cell.dow}-${cell.hour}`;
        grid.set(key, cell.count);
        if (cell.count > maxCount) maxCount = cell.count;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 640 }}>
                {/* Hour labels */}
                <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(24, 1fr)', gap: 2, marginBottom: 4 }}>
                    <div />
                    {Array.from({ length: 24 }, (_, h) => (
                        <Text key={h} style={{ color: '#6b7280', fontSize: 10, textAlign: 'center', display: 'block' }}>
                            {h % 3 === 0 ? formatHour(h) : ''}
                        </Text>
                    ))}
                </div>

                {/* Rows */}
                {DOW_ORDER.map((mongoDay, rowIdx) => (
                    <div key={mongoDay} style={{ display: 'grid', gridTemplateColumns: '48px repeat(24, 1fr)', gap: 2, marginBottom: 2 }}>
                        <Text style={{ color: '#9ca3af', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                            {DOW_LABELS[rowIdx]}
                        </Text>
                        {Array.from({ length: 24 }, (_, h) => {
                            const count = grid.get(`${mongoDay}-${h}`) ?? 0;
                            return (
                                <Tooltip
                                    key={h}
                                    title={`${DOW_LABELS[rowIdx]} ${formatHour(h)} IST — ${count.toLocaleString()} sessions`}
                                    overlayInnerStyle={{ fontSize: 12 }}
                                >
                                    <div
                                        style={{
                                            height: 20,
                                            borderRadius: 3,
                                            background: heatColor(count, maxCount),
                                            cursor: count > 0 ? 'default' : undefined,
                                        }}
                                    />
                                </Tooltip>
                            );
                        })}
                    </div>
                ))}

                <Text style={{ color: '#6b7280', fontSize: 11, display: 'block', marginTop: 8 }}>
                    Times shown in IST (UTC+5:30)
                </Text>
            </div>
        </div>
    );
};

// ─── International traffic check ──────────────────────────────────────────────

const isInternationalHeavy = (countryBreakdown: CountryRow[], total: number): boolean => {
    if (!total) return false;
    const indSessions = countryBreakdown.find(r => r.countryCode === 'IN')?.sessions ?? 0;
    return (1 - indSessions / total) > 0.2;
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LocationAnalyticsDashboard() {
    const [period, setPeriod] = useState<Period>('30d');

    const { data: res, isLoading } = useGetData({
        key: ['admin', 'location-analytics', period],
        url: api.getLocationAnalytics,
        params: { period },
    });

    const payload = (res as { data: LocationAnalyticsData } | undefined)?.data;
    const summary = payload?.summary;
    const stateBreakdown = payload?.stateBreakdown ?? [];
    const cityBreakdown = payload?.cityBreakdown ?? [];
    const countryBreakdown = payload?.countryBreakdown ?? [];
    const heatmap = payload?.heatmap ?? [];

    const intlHeavy = isInternationalHeavy(countryBreakdown, summary?.totalSessions ?? 0);

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
            <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                    <div>
                        <Title level={2} style={{ color: '#fff', marginBottom: 4 }}>
                            Location Analytics
                        </Title>
                        <Text style={{ color: '#8c8c8c' }}>
                            User session geography, state distribution, and activity patterns
                        </Text>
                    </div>
                    <PeriodSelector value={period} onChange={setPeriod} />
                </div>

                {/* Summary strip */}
                <SummaryCards
                    summary={summary}
                    countryBreakdown={countryBreakdown}
                    loading={isLoading}
                />

                <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '28px 0 20px' }} />

                {/* India Choropleth Map */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Panel title="India State Distribution">
                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 12 }} />
                        ) : (
                            <>
                                <IndiaMap
                                    stateBreakdown={stateBreakdown}
                                    totalSessions={summary?.totalSessions ?? 0}
                                />
                                <Text style={{ color: '#6b7280', fontSize: 12, display: 'block', marginTop: 10 }}>
                                    {intlHeavy
                                        ? 'Showing India map — international traffic exceeds 20%.'
                                        : 'Showing India only — switches to world map when international traffic exceeds 20%.'}
                                </Text>
                            </>
                        )}
                    </Panel>
                </Row>

                {/* Top cities table */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Panel title="Top Cities">
                        <CitiesTable
                            cities={cityBreakdown}
                            total={summary?.totalSessions ?? 0}
                            loading={isLoading}
                        />
                    </Panel>
                </Row>

                {/* Timezone heatmap */}
                <Row gutter={[16, 16]}>
                    <Panel title="Activity Heatmap (IST)">
                        <HeatmapGrid heatmap={heatmap} loading={isLoading} />
                    </Panel>
                </Row>
            </div>
        </ConfigProvider>
    );
}
