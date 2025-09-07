'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Card, Typography, Space, Tag, Row, Col } from 'antd';
import { ExperimentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { TemperatureRecord } from '@/lib/services/temperatureService';
import { useTranslation } from '@/contexts/LanguageContext';
import dayjs from 'dayjs';

const { Text } = Typography;

interface TemperatureChartProps {
  data: TemperatureRecord[];
  selectedDate: string;
}

interface ChartDataPoint {
  time: string;
  temperature: number;
  hour: number;
  minute: number;
  user: string;
  timestamp: string;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ data, selectedDate }) => {
  const { t } = useTranslation();
  // Process data for the chart
  const chartData = useMemo(() => {
    // Create 24-hour data points (one for each hour)
    const hourlyData: ChartDataPoint[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      hourlyData.push({
        time: timeStr,
        temperature: 0,
        hour,
        minute: 0,
        user: '',
        timestamp: dayjs(selectedDate).hour(hour).minute(0).second(0).toISOString()
      });
    }

    // Fill in actual temperature readings
    data.forEach(record => {
      const recordTime = dayjs(record.recordedAt);
      const hour = recordTime.hour();
      
      if (hourlyData[hour]) {
        hourlyData[hour] = {
          time: recordTime.format('HH:mm'),
          temperature: record.temperature,
          hour: recordTime.hour(),
          minute: recordTime.minute(),
          user: record.user.name,
          timestamp: record.recordedAt
        };
      }
    });

    return hourlyData;
  }, [data, selectedDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const temps = data.map(d => d.temperature);
    if (temps.length === 0) return null;

    return {
      min: Math.min(...temps),
      max: Math.max(...temps),
      avg: temps.reduce((a, b) => a + b, 0) / temps.length,
      count: temps.length
    };
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{`${t('common.time')}: ${label}`}</p>
          <p className="text-blue-600">
            <ExperimentOutlined className="mr-1" />
            {`${t('temperature.temperatureInCelsius')}: ${data.temperature}°C`}
          </p>
          {data.user && (
            <p className="text-gray-600">
              {`${t('temperature.recordedBy')}: ${data.user}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Get temperature status
  const getTemperatureStatus = (temp: number) => {
    if (temp < 36) return { color: '#1890ff', status: t('temperature.hypothermiaRange'), bg: '#e6f7ff' };
    if (temp >= 36 && temp <= 37.5) return { color: '#52c41a', status: t('temperature.normalRange'), bg: '#f6ffed' };
    if (temp > 37.5 && temp <= 39) return { color: '#faad14', status: t('temperature.feverRange'), bg: '#fffbe6' };
    return { color: '#ff4d4f', status: t('temperature.highFeverRange'), bg: '#fff2f0' };
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ExperimentOutlined className="text-4xl mb-4" />
        <p>{t('temperature.noDataAvailable')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Chart */}
      <div style={{ height: '300px', marginBottom: '12px', minWidth: '400px' }} className="sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#666"
              fontSize={10}
              interval="preserveStartEnd"
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              domain={[30, 42]}
              stroke="#666"
              fontSize={10}
              tick={{ fontSize: 10 }}
              label={{ value: t('temperature.temperatureInCelsius'), angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference lines for normal temperature range */}
            <ReferenceLine y={36} stroke="#52c41a" strokeDasharray="2 2" label="36°C" />
            <ReferenceLine y={37.5} stroke="#52c41a" strokeDasharray="2 2" label="37.5°C" />
            
            {/* Reference area for normal range */}
            <ReferenceArea y1={36} y2={37.5} fill="#52c41a" fillOpacity={0.1} />
            
            {/* Fever range */}
            <ReferenceArea y1={37.5} y2={39} fill="#faad14" fillOpacity={0.1} />
            
            {/* High fever range */}
            <ReferenceArea y1={39} y2={42} fill="#ff4d4f" fillOpacity={0.1} />
            
            {/* Hypothermia range */}
            <ReferenceArea y1={30} y2={36} fill="#1890ff" fillOpacity={0.1} />
            
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#1890ff"
              strokeWidth={3}
              dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#1890ff', strokeWidth: 2 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend and Statistics */}
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={12} md={12}>
          <Card size="small" title={<span className="text-xs sm:text-sm">{t('temperature.temperatureRange')}</span>}>
            <Space direction="vertical" size="small" className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                  <Text className="text-xs sm:text-sm">{t('temperature.hypothermiaRange')}</Text>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  <Text className="text-xs sm:text-sm">{t('temperature.normalRange')}</Text>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 rounded mr-2"></div>
                  <Text className="text-xs sm:text-sm">{t('temperature.feverRange')}</Text>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                  <Text className="text-xs sm:text-sm">{t('temperature.highFeverRange')}</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={12}>
          <Card size="small" title={<span className="text-xs sm:text-sm">{t('temperature.statistics')}</span>}>
            {stats && (
              <Space direction="vertical" size="small" className="w-full">
                <div className="flex justify-between">
                  <Text className="text-xs sm:text-sm">{t('temperature.totalReadings')}:</Text>
                  <Text strong className="text-xs sm:text-sm">{stats.count}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-xs sm:text-sm">{t('temperature.averageTemperature')}:</Text>
                  <Text strong className="text-xs sm:text-sm" style={{ color: getTemperatureStatus(stats.avg).color }}>
                    {stats.avg.toFixed(1)}°C
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-xs sm:text-sm">{t('temperature.minTemperature')}:</Text>
                  <Text strong className="text-xs sm:text-sm" style={{ color: '#1890ff' }}>
                    {stats.min.toFixed(1)}°C
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-xs sm:text-sm">{t('temperature.maxTemperature')}:</Text>
                  <Text strong className="text-xs sm:text-sm" style={{ color: '#ff4d4f' }}>
                    {stats.max.toFixed(1)}°C
                  </Text>
                </div>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TemperatureChart;
