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
  Pagination,
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
  DownloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { listService, userService } from '@/lib/services';
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
  
  // Pagination states
  const [listsPagination, setListsPagination] = useState({
    current: 1,
    pageSize: 4,
    total: 0
  });
  const [itemsPagination, setItemsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Modal states
  const [listModalVisible, setListModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [editingList, setEditingList] = useState<ListType | null>(null);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  
  // Member management
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  
  // Form instances
  const [listForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [memberForm] = Form.useForm();
  
  // Filters and search
  const [filters, setFilters] = useState<ListFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [listSearchTerm, setListSearchTerm] = useState('');

  // Load users for member selection
  const loadUsers = useCallback(async () => {
    try {
      const response = await userService.getAll({ limit: 1000 }); // Get all users
      setAvailableUsers(response.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  // Load lists on component mount
  const loadLists = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await listService.getLists({
        page,
        limit: listsPagination.pageSize,
        search
      });
      setLists(response.lists);
      setListsPagination(prev => {
        const newPagination = {
          ...prev,
          current: page,
          total: response.total || response.lists.length
        };
        console.log('Lists pagination updated:', newPagination);
        return newPagination;
      });
      
      // Auto-select first list if none selected and lists exist
      if (response.lists.length > 0 && !selectedList) {
        setSelectedList(response.lists[0]);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
      message.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  }, [listsPagination.pageSize, selectedList]);

  // Load list items
  const loadListItems = useCallback(async (listId: string, page = 1) => {
    try {
      setItemsLoading(true);
      const response = await listService.getListItems(listId, {
        ...filters,
        page,
        limit: itemsPagination.pageSize
      });
      setListItems(response.items);
      setItemsPagination(prev => ({
        ...prev,
        current: page,
        total: response.total || response.items.length
      }));
    } catch (error) {
      console.error('Error loading list items:', error);
      message.error('Failed to load list items');
    } finally {
      setItemsLoading(false);
    }
  }, [filters, itemsPagination.pageSize]);

  // Load data on mount
  useEffect(() => {
    loadLists();
    loadUsers();
  }, [loadLists, loadUsers]);

  // Search handlers with debounce
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load items when list is selected or filters change
  useEffect(() => {
    if (selectedList) {
      loadListItems(selectedList.id);
    }
  }, [selectedList, loadListItems]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);
  
  const handleListSearch = useCallback((value: string) => {
    setListSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search
    const timeoutId = setTimeout(() => {
      loadLists(1, value);
    }, 300);
    
    setSearchTimeout(timeoutId);
  }, [loadLists, searchTimeout]);

  const handleItemSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (selectedList) {
      loadListItems(selectedList.id, 1);
    }
  }, [selectedList, loadListItems]);

  // Pagination handlers
  const handleListPageChange = useCallback((page: number) => {
    loadLists(page, listSearchTerm);
  }, [loadLists, listSearchTerm]);

  const handleItemPageChange = useCallback((page: number) => {
    if (selectedList) {
      loadListItems(selectedList.id, page);
    }
  }, [selectedList, loadListItems]);

  // Handle list selection
  const handleListSelect = (list: ListType) => {
    console.log('Selected list:', list);
    console.log('List members:', list.members);
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

  // Handle add members
  const handleAddMembers = () => {
    if (!selectedList) return;
    console.log('Available users:', availableUsers);
    console.log('Current members:', selectedList.members);
    setSelectedMemberIds([]);
    setMemberModalVisible(true);
  };

  // Handle member form submission
  const handleMemberSubmit = async () => {
    if (!selectedList || selectedMemberIds.length === 0) return;
    
    try {
      for (const userId of selectedMemberIds) {
        await listService.addMember(selectedList.id, userId);
      }
      message.success(t('lists.success.memberAdded'));
      setMemberModalVisible(false);
      
      // Reload the specific list to get updated member list
      const updatedList = await listService.getList(selectedList.id);
      setSelectedList(updatedList.list);
      loadLists(); // Also reload all lists
    } catch (error) {
      console.error('Error adding members:', error);
      message.error('Failed to add members');
    }
  };

  // Handle remove member
  const handleRemoveMember = async (userId: string) => {
    if (!selectedList) return;
    
    try {
      await listService.removeMember(selectedList.id, userId);
      message.success(t('lists.success.memberRemoved'));
      
      // Reload the specific list to get updated member list
      const updatedList = await listService.getList(selectedList.id);
      setSelectedList(updatedList.list);
      loadLists(); // Also reload all lists
    } catch (error) {
      console.error('Error removing member:', error);
      message.error('Failed to remove member');
    }
  };

  // Handle Excel export
  const handleExportExcel = async () => {
    if (!selectedList) return;
    
    try {
      const exportFilters = {
        ...filters,
        name: searchTerm || undefined
      };

      const blob = await listService.exportToExcel(selectedList.id, exportFilters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedList.name}_items_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('Excel exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Falha ao exportar para Excel');
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

  // Use backend search instead of frontend filtering
  const filteredItems = listItems;

  // Check if user can edit list (only list creator)
  const canEditList = (list: ListType) => {
    return list.createdById === user?.id;
  };

  // Check if user can edit item (only item creator)
  const canEditItem = (item: ListItem) => {
    return item.createdById === user?.id;
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
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

      <Row gutter={[16, 16]}>
        {/* Lists Sidebar */}
        <Col xs={24} lg={8} xl={6}>
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
            {/* Search for lists */}
            <div className="mb-4">
              <Input
                placeholder={t('lists.searchLists')}
                prefix={<SearchOutlined />}
                value={listSearchTerm}
                onChange={(e) => handleListSearch(e.target.value)}
                allowClear
              />
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : lists.length === 0 ? (
              <Empty 
                description={listSearchTerm ? t('lists.noListsFound') : t('lists.createFirstList')}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <>
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
                          overlayStyle={{ maxWidth: '90vw' }}
                          placement="topRight"
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
              
              {/* Lists Pagination */}
              {/* <div className="mt-2 text-xs text-gray-500 text-center">
                Debug: Total={listsPagination.total}, Current={listsPagination.current}, PageSize={listsPagination.pageSize}
              </div> */}
              {listsPagination.total > 0 && (
                <div className="mt-4 text-center">
                  <Pagination
                    current={listsPagination.current}
                    total={listsPagination.total}
                    pageSize={listsPagination.pageSize}
                    onChange={handleListPageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    size="small"
                  />
                </div>
              )}
            </>
            )}
          </Card>
        </Col>

        {/* Items Content */}
        <Col xs={24} lg={16} xl={18}>
          {selectedList ? (
            <Card
              title={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Title level={4} style={{ margin: 0 }} className="truncate">{selectedList.name}</Title>
                    <Text type="secondary" className="truncate block">{selectedList.description}</Text>
                  </div>
                  <Space wrap>
                    <Button 
                      icon={<DownloadOutlined />}
                      onClick={handleExportExcel}
                      size="small"
                    >
                      <span className="hidden sm:inline">Exportar Excel</span>
                    </Button>
                    {canEditList(selectedList) && (
                      <Button 
                        icon={<TeamOutlined />}
                        onClick={handleAddMembers}
                        size="small"
                      >
                        <span className="hidden sm:inline">{t('lists.addMember')}</span>
                      </Button>
                    )}
                    <Button 
                      icon={<PlusOutlined />}
                      onClick={handleCreateItem}
                      size="small"
                    >
                      <span className="hidden sm:inline">{t('lists.addItem')}</span>
                    </Button>
                  </Space>
                </div>
              }
            >
              {/* Members Section */}
              <div className="mb-4 p-4 bg-blue-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <Text strong>{t('lists.members')} ({selectedList.members?.length || 0})</Text>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedList.members?.map((member) => (
                    <Tag
                      key={member.id}
                      closable={canEditList(selectedList) && member.userId !== selectedList.createdById}
                      onClose={() => handleRemoveMember(member.userId)}
                      color={member.role === 'ADMIN' ? 'blue' : 'default'}
                    >
                      {member.user?.name || 'Unknown User'} {member.role === 'ADMIN' && '(Admin)'}
                    </Tag>
                  )) || []}
                </div>
              </div>

              {/* Filters */}
              <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded">
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} sm={12} md={8}>
                    <Input
                      placeholder={t('lists.filterByName')}
                      prefix={<SearchOutlined />}
                      value={searchTerm}
                      onChange={(e) => handleItemSearch(e.target.value)}
                      size="small"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <RangePicker
                      placeholder={[t('lists.startDate'), t('lists.endDate')]}
                      style={{ width: '100%' }}
                      size="small"
                      onChange={(dates) => {
                        if (dates && dates[0] && dates[1]) {
                          handleFilterChange({
                            startDate: dates[0].format('YYYY-MM-DD'),
                            endDate: dates[1].format('YYYY-MM-DD'),
                          });
                        } else {
                          handleFilterChange({});
                        }
                      }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Button onClick={handleClearFilters} size="small" block>
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
                <>
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
                            overlayStyle={{ maxWidth: '90vw' }}
                            placement="topRight"
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
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="truncate">{item.name}</span>
                              <Tag color={expiration.color} className="flex-shrink-0">
                                {expiration.text}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              {item.description && (
                                <div className="text-gray-600 mb-2 text-sm">{item.description}</div>
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm text-gray-500">
                                {item.value && (
                                  <span className="flex items-center">
                                    <DollarOutlined className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{item.value} MZN</span>
                                  </span>
                                )}
                                {item.startDate && (
                                  <span className="flex items-center">
                                    <CalendarOutlined className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{t('lists.startDate')}: {dayjs(item.startDate).format('DD/MM/YYYY')}</span>
                                  </span>
                                )}
                                {item.endDate && (
                                  <span className="flex items-center">
                                    <CalendarOutlined className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{t('lists.endDate')}: {dayjs(item.endDate).format('DD/MM/YYYY')}</span>
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <UserOutlined className="mr-1 flex-shrink-0" />
                                  <span className="truncate">{t('lists.createdBy')}: {item.createdBy.name}</span>
                                </span>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
                
                {/* Items Pagination */}
                {itemsPagination.total > itemsPagination.pageSize && (
                  <div className="mt-4 text-center">
                    <Pagination
                      current={itemsPagination.current}
                      total={itemsPagination.total}
                      pageSize={itemsPagination.pageSize}
                      onChange={handleItemPageChange}
                      showSizeChanger={false}
                      showQuickJumper
                      size="small"
                    />
                  </div>
                )}
                </>
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
          <Form.Item
            name="value"
            label={t('lists.valueInMZN')}
          >
            <InputNumber
              min={0}
              placeholder="0.00"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label={t('lists.startDate')}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label={t('lists.endDate')}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          </Form>
        </Modal>

        {/* Member Management Modal */}
        <Modal
          title={t('lists.addMember')}
          open={memberModalVisible}
          onCancel={() => setMemberModalVisible(false)}
          onOk={handleMemberSubmit}
          okText={t('common.add')}
          cancelText={t('common.cancel')}
        >
          <div className="mb-4">
            <Text type="secondary">
              {t('lists.selectMembers')}
            </Text>
          </div>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={t('lists.selectMembers')}
            value={selectedMemberIds}
            onChange={setSelectedMemberIds}
            options={availableUsers
              .filter(u => u.id !== user?.id) // Exclude current user
              .filter(u => !selectedList?.members.some(member => member.userId === u.id)) // Exclude existing members
              .map(u => ({
                label: `${u.name} (${u.email})`,
                value: u.id
              }))
            }
          />
        </Modal>
      </div>
    );
  }
