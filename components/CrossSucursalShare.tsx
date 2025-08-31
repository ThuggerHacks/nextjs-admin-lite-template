'use client';

import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Space, Alert, Switch, message, Spin } from 'antd';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { sucursalService } from '@/lib/services/sucursalService';
import { userService } from '@/lib/services/userService';

const { TextArea } = Input;

interface CrossSucursalShareProps {
  type: 'goal' | 'file';
  itemId: string;
  itemName: string;
  onSuccess: () => void;
  onCancel: () => void;
  localShareableUsers?: any[];
  fileData?: any; // Add file data for file sharing
}

interface Sucursal {
  id: string;
  name: string;
  serverUrl: string;
}

interface RemoteUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: {
    name: string;
  };
}

export default function CrossSucursalShare({ 
  type, 
  itemId, 
  itemName, 
  onSuccess, 
  onCancel, 
  localShareableUsers = [],
  fileData
}: CrossSucursalShareProps) {
  const [form] = Form.useForm();
  const [sharing, setSharing] = useState(false);
  const [sucursals, setSucursals] = useState<Sucursal[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [loadingSucursals, setLoadingSucursals] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [shareToRemote, setShareToRemote] = useState(false);
  const { t } = useTranslation();
  const { user } = useUser();

  // Load sucursals on component mount
  useEffect(() => {
    loadSucursals();
  }, []);

  // Load remote users when sucursal changes
  useEffect(() => {
    if (selectedSucursal && shareToRemote) {
      loadRemoteUsers(selectedSucursal.serverUrl);
    }
  }, [selectedSucursal, shareToRemote]);

  const loadSucursals = async () => {
    setLoadingSucursals(true);
    try {
      const response = await sucursalService.getAll();
      setSucursals(response);
         } catch (error) {
       console.error('Failed to load sucursals:', error);
       message.error(t('sharing.failedToLoadSucursals'));
     } finally {
       setLoadingSucursals(false);
     }
  };

  const loadRemoteUsers = async (serverUrl: string) => {
    setLoadingUsers(true);
    try {
      // Get users from the remote sucursal
      const response = await fetch(`${serverUrl}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRemoteUsers(data.users || data);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
         } catch (error) {
       console.error('Failed to load remote users:', error);
       message.error(t('sharing.failedToLoadUsersFromSucursal'));
       setRemoteUsers([]);
     } finally {
       setLoadingUsers(false);
     }
  };

  const handleSubmit = async (values: any) => {
         if (!shareToRemote && (!values.localSharedWithIds || values.localSharedWithIds.length === 0)) {
       message.error(t('sharing.pleaseSelectUsersToShareWith'));
       return;
     }

     if (shareToRemote && (!values.remoteSharedWithIds || values.remoteSharedWithIds.length === 0)) {
       message.error(t('sharing.pleaseSelectRemoteUsersToShareWith'));
       return;
     }

    setSharing(true);
    try {
      let success = true;
      let errorMessage = '';

      // Share locally if local users are selected
      if (values.localSharedWithIds && values.localSharedWithIds.length > 0) {
        try {
          if (type === 'goal') {
            const result = await userService.shareGoal(itemId, values.localSharedWithIds, values.message);
            if (!result.success) {
              success = false;
              errorMessage = result.error || 'Failed to share locally';
            }
                       } else {
               // TODO: Implement local file sharing
               message.info(t('sharing.localFileSharingNotImplemented'));
             }
        } catch (error) {
          success = false;
          errorMessage = 'Failed to share locally';
        }
      }

      // Share to remote sucursal if remote users are selected
      if (shareToRemote && values.remoteSharedWithIds && values.remoteSharedWithIds.length > 0) {
        try {
          if (type === 'goal') {
            // Share goal to remote sucursal
            const result = await shareGoalToRemote(
              itemId, 
              selectedSucursal!.serverUrl, 
              values.remoteSharedWithIds, 
              values.message
            );
            if (!result.success) {
              success = false;
              errorMessage = result.error || 'Failed to share to remote sucursal';
            }
          } else {
            // Share file to remote sucursal
            const result = await shareFileToRemote(
              itemId, 
              selectedSucursal!.serverUrl, 
              values.remoteSharedWithIds, 
              values.message
            );
            if (!result.success) {
              success = false;
              errorMessage = result.error || 'Failed to share file to remote sucursal';
            }
          }
        } catch (error) {
          success = false;
          errorMessage = 'Failed to share to remote sucursal';
        }
      }

             if (success) {
         message.success(t('sharing.sharedSuccessfully'));
         onSuccess();
       } else {
         message.error(errorMessage);
       }
         } catch (error) {
       console.error('Error sharing:', error);
       message.error(t('sharing.failedToShare'));
     } finally {
       setSharing(false);
     }
  };

  const shareGoalToRemote = async (goalId: string, serverUrl: string, userIds: string[], message?: string) => {
    try {
      const response = await fetch(`${serverUrl}/api/goals/${goalId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sharedWithIds: userIds,
          message,
          sharedFromExternal: true
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const shareFileToRemote = async (fileId: string, serverUrl: string, userIds: string[], message?: string) => {
    try {
      // Use the file data passed from the parent component
      if (!fileData) {
        return { success: false, error: 'File data not available' };
      }

      const file = fileData;
      console.log('Sharing file to remote server:', { serverUrl, userIds, file, user: user?.id, userContext: user });

      // Share with each user individually
      const results = [];
      
      for (const userId of userIds) {
        try {
          const requestBody = {
            fileData: {
              name: file.name,
              originalName: file.originalName,
              description: file.description,
              url: file.url,
              size: file.size,
              type: file.type,
              mimeType: file.mimeType,
              sharedById: user?.id || null
            },
            targetUserId: userId,
            message
          };
          
          console.log('Sending request body:', requestBody);
          
          const response = await fetch(`${serverUrl}/api/libraries/files/share-remote`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Remote share failed for user:', userId, errorData);
            results.push({ userId, success: false, error: errorData.error || 'Failed to share file remotely' });
          } else {
            const result = await response.json();
            console.log('Remote share successful for user:', userId, result);
            results.push({ userId, success: true, data: result });
          }
        } catch (error: any) {
          results.push({ userId, success: false, error: error.message });
        }
      }

      // Check if all shares were successful
      const allSuccessful = results.every(r => r.success);
      if (allSuccessful) {
        return { success: true, data: results };
      } else {
        const failedCount = results.filter(r => !r.success).length;
        return { success: false, error: `Failed to share with ${failedCount} users`, details: results };
      }
    } catch (error: any) {
      console.error('File sharing error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSucursalChange = (sucursalId: string) => {
    const sucursal = sucursals.find(s => s.id === sucursalId);
    setSelectedSucursal(sucursal || null);
    setRemoteUsers([]);
  };

  const handleRemoteToggle = (checked: boolean) => {
    setShareToRemote(checked);
    if (!checked) {
      setSelectedSucursal(null);
      setRemoteUsers([]);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Alert
        message={type === 'goal' ? t('goals.shareGoal') : t('files.shareFile')}
        description={
          type === 'goal' 
            ? t('goals.shareCompletedGoalDescription', { goalName: itemName })
            : t('files.shareFileDescription', { fileName: itemName })
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

             {/* Local Sharing Section */}
       {localShareableUsers.length > 0 && (
         <>
           <h4>{t('sharing.shareWithLocalUsers')} - {user?.sucursal?.name || 'Current Sucursal'}</h4>
           <Form.Item
             label={t('sharing.selectLocalUsers')}
             name="localSharedWithIds"
           >
             <Select
               mode="multiple"
               placeholder={t('sharing.selectUsersFromSucursal')}
               showSearch
               filterOption={(input, option) => {
                 const user = localShareableUsers.find(u => u.id === option?.value);
                 return user?.name.toLowerCase().includes(input.toLowerCase()) || 
                        user?.email.toLowerCase().includes(input.toLowerCase()) || false;
               }}
             >
               {localShareableUsers.map(user => (
                 <Select.Option key={user.id} value={user.id}>
                   <div>
                     <div>{user.name}</div>
                     <div style={{ fontSize: '12px', color: '#666' }}>
                       {user.email} - {user.role} {user.department?.name && `(${user.department.name})`}
                     </div>
                   </div>
                 </Select.Option>
               ))}
             </Select>
           </Form.Item>
         </>
       )}

             {/* Cross-Sucursal Sharing Toggle */}
       <Form.Item label={t('sharing.shareWithExternalSucursal')}>
         <Switch 
           checked={shareToRemote} 
           onChange={handleRemoteToggle}
           checkedChildren={t('common.yes')}
           unCheckedChildren={t('common.no')}
         />

       </Form.Item>

      {/* Remote Sucursal Selection */}
      {shareToRemote && (
        <>
                     <Form.Item
             label={t('sharing.selectSucursal')}
             name="selectedSucursalId"
             rules={[{ required: true, message: t('sharing.pleaseSelectSucursal') }]}
           >
             <Select
               placeholder={t('sharing.selectSucursal')}
               onChange={handleSucursalChange}
               loading={loadingSucursals}
             >
               {sucursals.map(sucursal => (
                 <Select.Option key={sucursal.id} value={sucursal.id}>
                   {sucursal.name} ({sucursal.serverUrl})
                 </Select.Option>
               ))}
             </Select>
           </Form.Item>

                     {/* Remote Users Selection */}
           {selectedSucursal && (
             <Form.Item
               label={t('sharing.selectRemoteUsers')}
               name="remoteSharedWithIds"
               rules={[{ required: true, message: t('sharing.pleaseSelectRemoteUsers') }]}
             >
               <Select
                 mode="multiple"
                 placeholder={t('sharing.selectUsersFromSelectedSucursal')}
                 showSearch
                 loading={loadingUsers}
                 filterOption={(input, option) => {
                   const user = remoteUsers.find(u => u.id === option?.value);
                   return user?.name.toLowerCase().includes(input.toLowerCase()) || 
                          user?.email.toLowerCase().includes(input.toLowerCase()) || false;
                 }}
               >
                 {remoteUsers.map(user => (
                   <Select.Option key={user.id} value={user.id}>
                     <div>
                       <div>{user.name}</div>
                       <div style={{ fontSize: '12px', color: '#666' }}>
                         {user.email} - {user.role} {user.department?.name && `(${user.department.name})`}
                       </div>
                     </div>
                   </Select.Option>
                 ))}
               </Select>
             </Form.Item>
           )}
        </>
      )}

             {/* Message */}
       <Form.Item
         label={t('sharing.messageOptional')}
         name="message"
       >
         <TextArea
           rows={3}
           placeholder={t('sharing.addMessageAboutSharedContent')}
         />
       </Form.Item>

             {/* Submit Buttons */}
       <Form.Item>
         <Space>
           <Button type="primary" htmlType="submit" loading={sharing}>
             {sharing ? t('sharing.sharing') : t('sharing.share')}
           </Button>
           <Button onClick={onCancel}>
             {t('common.cancel')}
           </Button>
         </Space>
       </Form.Item>
    </Form>
  );
}
