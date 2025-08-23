"use client";

import { useState } from "react";
import { Card, Table, Progress, Tag, Space, Button, Modal, Descriptions, Tabs } from "antd";
import { EyeOutlined, AimOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Goal, GoalStatus, UserRole } from "@/types";

const { TabPane } = Tabs;

// Mock goals data
const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'Q1 Sales Target',
    description: 'Achieve 150% of quarterly sales target for Q1 2024',
    assignedTo: [
      { id: '3', name: 'Pedro Costa', role: UserRole.USER, department: 'Vendas' } as any,
      { id: '4', name: 'Ana Silva', role: UserRole.USER, department: 'Vendas' } as any,
    ],
    assignedBy: { id: '2', name: 'Maria Santos', role: UserRole.ADMIN, department: 'Vendas' } as any,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    targetValue: 150,
    currentProgress: 125,
    status: GoalStatus.ACTIVE,
    department: 'Vendas',
  },
  {
    id: '2',
    name: 'Employee Training Completion',
    description: 'Complete annual compliance training for all HR department staff',
    assignedTo: [
      { id: '5', name: 'Carlos Oliveira', role: UserRole.USER, department: 'Recursos Humanos' } as any,
      { id: '6', name: 'Lucia Santos', role: UserRole.USER, department: 'Recursos Humanos' } as any,
    ],
    assignedBy: { id: '2', name: 'Maria Santos', role: UserRole.ADMIN, department: 'Recursos Humanos' } as any,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-04-30'),
    targetValue: 100,
    currentProgress: 100,
    status: GoalStatus.COMPLETED,
    department: 'Recursos Humanos',
  },
  {
    id: '3',
    name: 'System Upgrade Project',
    description: 'Complete the company-wide system upgrade and migration',
    assignedTo: [
      { id: '7', name: 'Roberto Silva', role: UserRole.USER, department: 'TI' } as any,
    ],
    assignedBy: { id: '1', name: 'João Silva', role: UserRole.SUPER_ADMIN, department: 'Administração Geral' } as any,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    targetValue: 100,
    currentProgress: 45,
    status: GoalStatus.ACTIVE,
    department: 'TI',
  },
  {
    id: '4',
    name: 'Cost Reduction Initiative',
    description: 'Reduce operational costs by 15% through process optimization',
    assignedTo: [
      { id: '2', name: 'Maria Santos', role: UserRole.ADMIN, department: 'Recursos Humanos' } as any,
      { id: '8', name: 'Fernando Costa', role: UserRole.ADMIN, department: 'Financeiro' } as any,
    ],
    assignedBy: { id: '1', name: 'João Silva', role: UserRole.SUPER_ADMIN, department: 'Administração Geral' } as any,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-12-31'),
    targetValue: 15,
    currentProgress: 3,
    status: GoalStatus.ACTIVE,
  },
];

export default function ViewGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { user, hasRole } = useUser();
  const { t } = useTranslation();

  // Filter goals based on user role and involvement
  const getFilteredGoals = () => {
    if (!user) return [];
    
    if (hasRole(UserRole.SUPER_ADMIN)) {
      return goals; // Super admin sees all goals
    } else if (hasRole(UserRole.ADMIN)) {
      // Admin sees goals they created or are assigned to, or in their department
      return goals.filter(goal => 
        goal.assignedBy.id === user.id ||
        goal.assignedTo.some(assignee => assignee.id === user.id) ||
        goal.department === user.department?.name
      );
    } else {
      // Users see only goals they're assigned to
      return goals.filter(goal => 
        goal.assignedTo.some(assignee => assignee.id === user.id)
      );
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACTIVE:
        return 'blue';
      case GoalStatus.COMPLETED:
        return 'green';
      case GoalStatus.OVERDUE:
        return 'red';
      default:
        return 'default';
    }
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return '#52c41a'; // green
    if (percentage >= 75) return '#1890ff'; // blue
    if (percentage >= 50) return '#faad14'; // orange
    return '#f5222d'; // red
  };

  const isOverdue = (goal: Goal) => {
    return new Date() > goal.endDate && goal.status === GoalStatus.ACTIVE;
  };

  const handleViewGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsModalVisible(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const columns = [
    {
      title: t("goals.goalName"),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Goal) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.department}</div>
        </div>
      ),
    },
    {
      title: t("goals.assigned"),
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assignedTo: any[]) => (
        <div>
          {assignedTo.slice(0, 2).map(user => (
            <Tag key={user.id} icon={<UserOutlined />}>
              {user.name}
            </Tag>
          ))}
          {assignedTo.length > 2 && (
            <Tag>+{assignedTo.length - 2} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: t("goals.progress"),
      dataIndex: 'currentProgress',
      key: 'progress',
      render: (current: number, record: Goal) => {
        const percentage = Math.min((current / record.targetValue) * 100, 100);
        return (
          <div className="w-24">
            <Progress
              percent={Math.round(percentage)}
              size="small"
              strokeColor={getProgressColor(current, record.targetValue)}
            />
            <div className="text-xs text-gray-500 mt-1">
              {current} / {record.targetValue}
            </div>
          </div>
        );
      },
    },
    {
      title: t("goals.deadline"),
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: Date, record: Goal) => (
        <div>
          <div>{formatDate(date)}</div>
          {isOverdue(record) && (
            <Tag color="red" size="small">Overdue</Tag>
          )}
        </div>
      ),
    },
    {
      title: t("reports.status"),
      dataIndex: 'status',
      key: 'status',
      render: (status: GoalStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Goal) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => handleViewGoal(record)}
          size="small"
        >
          {t("common.view")}
        </Button>
      ),
    },
  ];

  const filteredGoals = getFilteredGoals();
  const myGoals = filteredGoals.filter(goal => 
    goal.assignedTo.some(assignee => assignee.id === user?.id)
  );
  const teamGoals = hasRole(UserRole.ADMIN) 
    ? filteredGoals.filter(goal => goal.department === user?.department?.name)
    : [];
  const activeGoals = filteredGoals.filter(goal => goal.status === GoalStatus.ACTIVE);
  const completedGoals = filteredGoals.filter(goal => goal.status === GoalStatus.COMPLETED);

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AimOutlined />
            {t("goals.viewGoals")}
          </h2>
          <p className="text-gray-600 mt-2">
            Track progress on your goals and objectives
          </p>
        </div>

        <Tabs defaultActiveKey="my">
          <TabPane 
            tab={`${t("goals.myGoals")} (${myGoals.length})`} 
            key="my"
          >
            <Table 
              columns={columns} 
              dataSource={myGoals}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          {hasRole(UserRole.ADMIN) && (
            <TabPane 
              tab={`${t("goals.teamGoals")} (${teamGoals.length})`} 
              key="team"
            >
              <Table 
                columns={columns} 
                dataSource={teamGoals}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          )}

          {hasRole(UserRole.SUPER_ADMIN) && (
            <TabPane 
              tab={`${t("goals.allGoals")} (${filteredGoals.length})`} 
              key="all"
            >
              <Table 
                columns={columns} 
                dataSource={filteredGoals}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          )}

          <TabPane 
            tab={`Active (${activeGoals.length})`} 
            key="active"
          >
            <Table 
              columns={columns} 
              dataSource={activeGoals}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane 
            tab={`${t("goals.completed")} (${completedGoals.length})`} 
            key="completed"
          >
            <Table 
              columns={columns} 
              dataSource={completedGoals}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Goal Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AimOutlined />
            Goal Details
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedGoal && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Goal Name">
                {selectedGoal.name}
              </Descriptions.Item>
              
              <Descriptions.Item label="Description">
                {selectedGoal.description}
              </Descriptions.Item>
              
              <Descriptions.Item label="Department">
                {selectedGoal.department}
              </Descriptions.Item>
              
              <Descriptions.Item label="Assigned By">
                {selectedGoal.assignedBy.name} ({selectedGoal.assignedBy.department})
              </Descriptions.Item>
              
              <Descriptions.Item label="Assigned To">
                <Space wrap>
                  {selectedGoal.assignedTo.map(user => (
                    <Tag key={user.id} icon={<UserOutlined />}>
                      {user.name} - {user.department?.name || 'No Department'}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Timeline">
                <Space direction="vertical" size="small">
                  <div><strong>Start:</strong> {formatDate(selectedGoal.startDate)}</div>
                  <div><strong>End:</strong> {formatDate(selectedGoal.endDate)}</div>
                  {isOverdue(selectedGoal) && (
                    <Tag color="red">Overdue by {Math.ceil((Date.now() - selectedGoal.endDate.getTime()) / (1000 * 60 * 60 * 24))} days</Tag>
                  )}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Progress">
                <div className="w-full">
                  <Progress
                    percent={Math.round((selectedGoal.currentProgress / selectedGoal.targetValue) * 100)}
                    strokeColor={getProgressColor(selectedGoal.currentProgress, selectedGoal.targetValue)}
                  />
                  <div className="mt-2">
                    <strong>{selectedGoal.currentProgress}</strong> / {selectedGoal.targetValue} 
                    <span className="text-gray-500 ml-2">
                      ({Math.round((selectedGoal.currentProgress / selectedGoal.targetValue) * 100)}% complete)
                    </span>
                  </div>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedGoal.status)}>
                  {selectedGoal.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
