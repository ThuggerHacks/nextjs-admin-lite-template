'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  List,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
  Badge,
  Tooltip,
  Divider,
  Empty,
  Spin,
  Tabs,
} from 'antd';
import {
  UnorderedListOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { listService } from '@/lib/services';
import { List as ListType, ListItem, CreateListRequest, CreateListItemRequest, ListFilters } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function ListsPage() {
  const { user } = useUser();
  const { t } = useTranslation();
  
  // State management
  const [lists, setLists] = useState<ListType[]>([]);
  const [selectedList, setSelectedList] = useState<ListType | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  
  // Modal states
  const [listModalVisible, setListModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [editingList, setEditingList] = useState<ListType | null>(null);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  
  // Form instances
  const [listForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [memberForm] = Form.useForm();
  
  // Filters
  const [filters, setFilters] = useState<ListFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Load lists on component mount
  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listService.getLists();
      setLists(response.lists);
    } catch (error) {
      console.error('Error loading lists:', error);
      message.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load list items
  const loadListItems = useCallback(async (listId: string) => {
    try {
      setItemsLoading(true);
      const response = await listService.getListItems(listId, filters);
      setListItems(response.items);
    } catch (error) {
      console.error('Error loading list items:', error);
      message.error('Failed to load list items');
    } finally {
      setItemsLoading(false);
    }
  }, [filters]);

  // Load data on mount
  useEffect(() => {
    loadLists();
  }, [loadLists]);

  // Load items when list is selected or filters change
  useEffect(() => {
    if (selectedList) {
      loadListItems(selectedList.id);
    }
  }, [selectedList, loadListItems]);

  // Handle list selection
  const handleListSelect = (list: ListType) => {
    setSelectedList(list);
    setSearchTerm('');
    setFilters({});
  };

  // Handle create list
  const handleCreateList = () => {
    setEditingList(null);
    listForm.resetFields();
    setListModalVisible(true);
  };

  // Handle edit list
  const handleEditList = (list: ListType) => {
    setEditingList(list);
    listForm.setFieldsValue({
      name: list.name,
      description: list.description,
    });
    setListModalVisible(true);
  };

  // Handle list form submission
  const handleListSubmit = async (values: any) => {
    try {
      if (editingList) {
        await listService.updateList(editingList.id, values);
        message.success(t('lists.success.listUpdated'));
      } else {
        await listService.createList(values);
        message.success(t('lists.success.listCreated'));
      }
      setListModalVisible(false);
      loadLists();
    } catch (error) {
      console.error('Error saving list:', error);
      message.error('Failed to save list');
    }
  };

  // Handle delete list
  const handleDeleteList = async (listId: string) => {
    try {
      await listService.deleteList(listId);
      message.success(t('lists.success.listDeleted'));
      if (selectedList?.id === listId) {
        setSelectedList(null);
        setListItems([]);
      }
      loadLists();
    } catch (error) {
      console.error('Error deleting list:', error);
      message.error('Failed to delete list');
    }
  };

  // Handle create item
  const handleCreateItem = () => {
    if (!selectedList) return;
    setEditingItem(null);
    itemForm.resetFields();
    setItemModalVisible(true);
  };

  // Handle edit item
  const handleEditItem = (item: ListItem) => {
    setEditingItem(item);
    itemForm.setFieldsValue({
      name: item.name,
      description: item.description,
      value: item.value,
      startDate: item.startDate ? dayjs(item.startDate) : null,
      endDate: item.endDate ? dayjs(item.endDate) : null,
    });
    setItemModalVisible(true);
  };

  // Handle item form submission
  const handleItemSubmit = async (values: any) => {
    if (!selectedList) return;
    
    try {
      const itemData: CreateListItemRequest = {
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
      };

      if (editingItem) {
        await listService.updateListItem(selectedList.id, editingItem.id, itemData);
        message.success(t('lists.success.itemUpdated'));
      } else {
        await listService.createListItem(selectedList.id, itemData);
        message.success(t('lists.success.itemCreated'));
      }
      setItemModalVisible(false);
      loadListItems(selectedList.id);
    } catch (error) {
      console.error('Error saving item:', error);
      message.error('Failed to save item');
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!selectedList) return;
    
    try {
      await listService.deleteListItem(selectedList.id, itemId);
      message.success(t('lists.success.itemDeleted'));
      loadListItems(selectedList.id);
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Failed to delete item');
    }
  };

  // Handle filters
  const handleFilterChange = (newFilters: ListFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Get expiration status for an item
  const getExpirationStatus = (item: ListItem) => {
    if (!item.endDate) return { status: 'valid', color: 'green', text: t('lists.valid') };
    
    const now = dayjs();
    const endDate = dayjs(item.endDate);
    const daysDiff = endDate.diff(now, 'day');
    
    if (daysDiff < 0) {
      return { 
        status: 'expired', 
        color: 'red', 
        text: `${Math.abs(daysDiff)} ${t('lists.expiredDaysAgo')}` 
      };
    } else if (daysDiff === 0) {
      return { status: 'expiring-today', color: 'orange', text: t('lists.expiringToday') };
    } else if (daysDiff === 1) {
      return { status: 'expiring-tomorrow', color: 'yellow', text: t('lists.expiringTomorrow') };
    } else {
      return { status: 'valid', color: 'green', text: `${daysDiff} ${t('lists.daysLeft')}` };
    }
  };

  // Filter items based on search term
  const filteredItems = listItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check if user can edit list
  const canEditList = (list: ListType) => {
    return list.createdById === user?.id || 
           list.members.some(member => member.userId === user?.id && member.role === 'ADMIN');
  };

  // Check if user can edit item
  const canEditItem = (item: ListItem) => {
    return item.createdById === user?.id || 
           (selectedList && canEditList(selectedList));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UnorderedListOutlined style={{ color: '#1890ff' }} />
              {t('lists.title')}
            </Title>
            <Text type="secondary">
              {t('lists.listManagement')}
            </Text>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateList}
            >
              {t('lists.createList')}
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Lists Sidebar */}
        <Col xs={24} lg={8}>
          <Card 
            title={t('lists.myLists')} 
            extra={
              <Button 
                type="text" 
                icon={<PlusOutlined />}
                onClick={handleCreateList}
              />
            }
          >
            {loading ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : lists.length === 0 ? (
              <Empty 
                description={t('lists.createFirstList')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={lists}
                renderItem={(list) => (
                  <List.Item
                    className={`cursor-pointer p-3 rounded hover:bg-gray-50 ${
                      selectedList?.id === list.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleListSelect(list)}
                  >
                    <List.Item.Meta
                      avatar={<UnorderedListOutlined className="text-xl text-blue-500" />}
                      title={list.name}
                      description={
                        <div>
                          <div className="text-gray-600">{list.description}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {list._count.items} {t('lists.items')} • {t('lists.createdBy')} {list.createdBy.name}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            👥 {list._count.members} {t('lists.members')}
                          </div>
                        </div>
                      }
                    />
                    {canEditList(list) && (
                      <Space>
                        <Button 
                          icon={<EditOutlined />} 
                          size="small" 
                          type="text"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditList(list);
                          }}
                        />
                        <Popconfirm
                          title={t('lists.confirmDeleteList')}
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                          onClick={(e) => e?.stopPropagation()}
                        >
                          <Button 
                            icon={<DeleteOutlined />} 
                            size="small" 
                            type="text" 
                            danger
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      </Space>
                    )}
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Items Content */}
        <Col xs={24} lg={16}>
          {selectedList ? (
            <Card
              title={
                <div className="flex justify-between items-center">
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{selectedList.name}</Title>
                    <Text type="secondary">{selectedList.description}</Text>
                  </div>
                  <Space>
                    <Button 
                      icon={<PlusOutlined />}
                      onClick={handleCreateItem}
                    >
                      {t('lists.addItem')}
                    </Button>
                  </Space>
                </div>
              }
            >
              {/* Filters */}
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={8}>
                    <Input
                      placeholder={t('lists.filterByName')}
                      prefix={<SearchOutlined />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <RangePicker
                      placeholder={[t('lists.startDate'), t('lists.endDate')]}
                      onChange={(dates) => {
                        if (dates) {
                          handleFilterChange({
                            startDate: dates[0]?.format('YYYY-MM-DD'),
                            endDate: dates[1]?.format('YYYY-MM-DD'),
                          });
                        } else {
                          handleFilterChange({});
                        }
                      }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Button onClick={handleClearFilters}>
                      {t('lists.clearFilters')}
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Items List */}
              {itemsLoading ? (
                <div className="text-center py-8">
                  <Spin />
                </div>
              ) : filteredItems.length === 0 ? (
                <Empty 
                  description={t('lists.noItems')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" onClick={handleCreateItem}>
                    {t('lists.addFirstItem')}
                  </Button>
                </Empty>
              ) : (
                <List
                  dataSource={filteredItems}
                  renderItem={(item) => {
                    const expiration = getExpirationStatus(item);
                    return (
                      <List.Item
                        actions={canEditItem(item) ? [
                          <Button 
                            key="edit"
                            icon={<EditOutlined />} 
                            size="small" 
                            type="text"
                            onClick={() => handleEditItem(item)}
                          />,
                          <Popconfirm
                            key="delete"
                            title={t('lists.confirmDeleteItem')}
                            onConfirm={() => handleDeleteItem(item.id)}
                          >
                            <Button 
                              icon={<DeleteOutlined />} 
                              size="small" 
                              type="text" 
                              danger
                            />
                          </Popconfirm>
                        ] : []}
                      >
                        <List.Item.Meta
                          title={
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              <Tag color={expiration.color}>
                                {expiration.text}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              {item.description && (
                                <div className="text-gray-600 mb-2">{item.description}</div>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                {item.value && (
                                  <span>
                                    <DollarOutlined className="mr-1" />
                                    {item.value} MZN
                                  </span>
                                )}
                                {item.startDate && (
                                  <span>
                                    <CalendarOutlined className="mr-1" />
                                    {t('lists.startDate')}: {dayjs(item.startDate).format('DD/MM/YYYY')}
                                  </span>
                                )}
                                {item.endDate && (
                                  <span>
                                    <CalendarOutlined className="mr-1" />
                                    {t('lists.endDate')}: {dayjs(item.endDate).format('DD/MM/YYYY')}
                                  </span>
                                )}
                                <span>
                                  <UserOutlined className="mr-1" />
                                  {t('lists.createdBy')}: {item.createdBy.name}
                                </span>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>
          ) : (
            <Card>
              <Empty 
                description={t('lists.noLists')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={handleCreateList}>
                  {t('lists.createFirstList')}
                </Button>
              </Empty>
            </Card>
          )}
        </Col>
      </Row>

      {/* List Modal */}
      <Modal
        title={editingList ? t('lists.editList') : t('lists.createList')}
        open={listModalVisible}
        onCancel={() => setListModalVisible(false)}
        onOk={() => listForm.submit()}
      >
        <Form
          form={listForm}
          layout="vertical"
          onFinish={handleListSubmit}
        >
          <Form.Item
            name="name"
            label={t('lists.listName')}
            rules={[{ required: true, message: t('lists.errors.listNameRequired') }]}
          >
            <Input placeholder={t('lists.listName')} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('lists.listDescription')}
          >
            <TextArea rows={3} placeholder={t('lists.listDescription')} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Item Modal */}
      <Modal
        title={editingItem ? t('lists.editItem') : t('lists.addItem')}
        open={itemModalVisible}
        onCancel={() => setItemModalVisible(false)}
        onOk={() => itemForm.submit()}
        width={600}
      >
        <Form
          form={itemForm}
          layout="vertical"
          onFinish={handleItemSubmit}
        >
          <Form.Item
            name="name"
            label={t('lists.itemName')}
            rules={[{ required: true, message: t('lists.errors.itemNameRequired') }]}
          >
            <Input placeholder={t('lists.itemName')} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('lists.itemDescription')}
          >
            <TextArea rows={3} placeholder={t('lists.itemDescription')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="value"
                label={t('lists.valueInMZN')}
              >
                <InputNumber
                  min={0}
                  placeholder="0.00"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label={t('lists.startDate')}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="endDate"
            label={t('lists.endDate')}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
