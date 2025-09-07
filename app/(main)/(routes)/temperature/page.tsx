'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  DatePicker,
  Space,
  Typography,
  Statistic,
  Alert,
  Spin,
  message,
  Modal,
  Form,
  InputNumber,
  Tooltip,
  Select,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FireOutlined,
  CalendarOutlined,
  BarChartOutlined,
  ExportOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { temperatureService, TemperatureRecord, TemperatureStats } from '@/lib/services/temperatureService';
import TemperatureChart from '@/components/TemperatureChart';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function TemperaturePage() {
  const [temperatures, setTemperatures] = useState<TemperatureRecord[]>([]);
  const [stats, setStats] = useState<TemperatureStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [exporting, setExporting] = useState(false);

  const { t } = useTranslation();
  const { user } = useUser();

  // Load temperature data
  const loadTemperatureData = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      const targetDate = date || selectedDate;
      
      const [temperatureData, statsData] = await Promise.all([
        temperatureService.getTemperatures({ date: targetDate, limit: 1000 }),
        temperatureService.getTemperatureStats(targetDate)
      ]);

      setTemperatures(temperatureData);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading temperature data:', error);
      console.error('Error details:', error.response?.data || error.message);
      message.error(t('temperature.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  }, [selectedDate, t]);

  // Load data on component mount and when date changes
  useEffect(() => {
    loadTemperatureData();
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (date: any) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'));
    }
  };

  // Handle temperature recording
  const handleRecordTemperature = async (values: { temperature: number; recordedAt?: string }) => {
    try {
      console.log('Recording temperature:', values);
      const result = await temperatureService.createTemperature({
        temperature: values.temperature,
        recordedAt: values.recordedAt || new Date().toISOString()
      });
      
      console.log('Temperature recorded successfully:', result);
      message.success(t('temperature.temperatureRecorded'));
      setIsModalVisible(false);
      form.resetFields();
      loadTemperatureData();
    } catch (error: any) {
      console.error('Error recording temperature:', error);
      console.error('Error details:', error.response?.data || error.message);
      message.error(t('temperature.failedToRecordTemperature'));
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExporting(true);
      const startDate = dayjs(selectedDate).startOf('day').toISOString();
      const endDate = dayjs(selectedDate).endOf('day').toISOString();
      
      const blob = await temperatureService.exportTemperatures(startDate, endDate);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `temperature_data_${selectedDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success(t('temperature.dataExported'));
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error(t('temperature.failedToExport'));
    } finally {
      setExporting(false);
    }
  };

  // Get temperature status color
  const getTemperatureStatus = (temp: number) => {
    if (temp < 36) return { color: '#1890ff', status: 'hypothermia' };
    if (temp >= 36 && temp <= 37.5) return { color: '#52c41a', status: 'normal' };
    if (temp > 37.5 && temp <= 39) return { color: '#faad14', status: 'fever' };
    return { color: '#ff4d4f', status: 'high_fever' };
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Title level={2} className="mb-2 text-lg sm:text-xl lg:text-2xl">
          <FireOutlined className="mr-2" />
          {t('temperature.temperatureDashboard')}
        </Title>
        <Text type="secondary" className="text-sm sm:text-base">
          {t('temperature.temperatureMonitoring')}
        </Text>
      </div>

      {/* Controls */}
      <Card className="mb-4 sm:mb-6">
        <Row gutter={[8, 8]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              className="w-full"
              suffixIcon={<CalendarOutlined />}
              placeholder={t('temperature.selectDate')}
              size="middle"
            />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              size="middle"
              className="w-full"
              block
            >
              <span className="hidden sm:inline">{t('temperature.recordTemperature')}</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadTemperatureData()}
              loading={loading}
              size="middle"
              className="w-full"
              block
            >
              <span className="hidden sm:inline">{t('temperature.refreshData')}</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
              loading={exporting}
              size="middle"
              className="w-full"
              block
            >
              <span className="hidden sm:inline">{t('temperature.exportToExcel')}</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      {stats && (
        <Row gutter={[8, 8]} className="mb-4 sm:mb-6">
          <Col xs={12} sm={6} md={6}>
            <Card size="small" className="h-full">
              <Statistic
                title={<span className="text-xs sm:text-sm">{t('temperature.totalReadings')}</span>}
                value={stats.count}
                prefix={<ExperimentOutlined className="text-sm" />}
                valueStyle={{ fontSize: '16px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Card size="small" className="h-full">
              <Statistic
                title={<span className="text-xs sm:text-sm">{t('temperature.averageTemperature')}</span>}
                value={stats.average}
                precision={1}
                suffix="°C"
                valueStyle={{ color: getTemperatureStatus(stats.average).color, fontSize: '16px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Card size="small" className="h-full">
              <Statistic
                title={<span className="text-xs sm:text-sm">{t('temperature.minTemperature')}</span>}
                value={stats.min}
                precision={1}
                suffix="°C"
                valueStyle={{ color: '#1890ff', fontSize: '16px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Card size="small" className="h-full">
              <Statistic
                title={<span className="text-xs sm:text-sm">{t('temperature.maxTemperature')}</span>}
                value={stats.max}
                precision={1}
                suffix="°C"
                valueStyle={{ color: '#ff4d4f', fontSize: '16px' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Chart */}
      <Card 
        title={
          <Space className="text-sm sm:text-base">
            <BarChartOutlined />
            <span className="hidden sm:inline">{t('temperature.temperatureChart')}</span>
            <span className="sm:hidden">Chart</span>
          </Space>
        }
        className="mb-4 sm:mb-6"
        size="small"
      >
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="text-center py-4 sm:py-8">
              <Spin size="large" />
              <div className="mt-2 sm:mt-4 text-sm">{t('temperature.loadingData')}</div>
            </div>
          ) : temperatures.length > 0 ? (
            <TemperatureChart 
              data={temperatures} 
              selectedDate={selectedDate}
            />
          ) : (
            <Alert
              message={t('temperature.noDataAvailable')}
              type="info"
              showIcon
              action={
                <Button 
                  type="primary" 
                  onClick={() => setIsModalVisible(true)}
                  icon={<PlusOutlined />}
                  size="small"
                >
                  <span className="hidden sm:inline">{t('temperature.addTemperatureData')}</span>
                  <span className="sm:hidden">Add Data</span>
                </Button>
              }
            />
          )}
        </div>
      </Card>

      {/* Temperature Recording Modal */}
      <Modal
        title={
          <Space>
            <FireOutlined />
            {t('temperature.recordTemperature')}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRecordTemperature}
          initialValues={{
            recordedAt: dayjs()
          }}
        >
          <Form.Item
            name="temperature"
            label={t('temperature.temperatureValue')}
            rules={[
              { required: true, message: 'Temperature is required' },
              { 
                type: 'number', 
                min: 0, 
                max: 100, 
                message: 'Please enter a valid temperature between 0-100°C' 
              }
            ]}
          >
            <InputNumber
              placeholder={t('temperature.temperaturePlaceholder')}
              style={{ width: '100%' }}
              precision={1}
              step={0.1}
              suffix="°C"
              size="large"
              min={0}
              max={100}
            />
          </Form.Item>

          <Form.Item
            name="recordedAt"
            label={t('temperature.recordedAt')}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
              size="large"
              disabled
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsModalVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('common.save')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
