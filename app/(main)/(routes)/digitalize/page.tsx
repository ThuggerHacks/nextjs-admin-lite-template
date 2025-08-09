"use client";

import { useState } from "react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Space, 
  message, 
  Modal, 
  Row, 
  Col,
  Typography,
  Divider,
  Alert
} from "antd";
import { 
  EditOutlined, 
  SaveOutlined, 
  FilePdfOutlined, 
  FileWordOutlined,
  SendOutlined,
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined
} from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'heading' | 'bullet' | 'number';
}

export default function DigitalizePage() {
  const [form] = Form.useForm();
  const [sections, setSections] = useState<DocumentSection[]>([
    {
      id: '1',
      title: 'Introduction',
      content: '',
      type: 'heading'
    }
  ]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { user } = useUser();
  const { t } = useTranslation();

  const addSection = (type: DocumentSection['type']) => {
    const newSection: DocumentSection = {
      id: Date.now().toString(),
      title: type === 'heading' ? 'New Section' : '',
      content: '',
      type
    };
    setSections(prev => [...prev, newSection]);
  };

  const updateSection = (id: string, field: keyof DocumentSection, value: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  const generatePreview = () => {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Title level={1}>{documentTitle || 'Document Title'}</Title>
        <Paragraph>
          <Text type="secondary">
            Created by: {user?.name} | Department: {user?.department} | Date: {new Date().toLocaleDateString()}
          </Text>
        </Paragraph>
        
        <Divider />
        
        {sections.map((section, index) => (
          <div key={section.id} className="mb-4">
            {section.type === 'heading' && (
              <Title level={2}>{section.title}</Title>
            )}
            
            {section.content && (
              <div>
                {section.type === 'text' && (
                  <Paragraph>{section.content}</Paragraph>
                )}
                {section.type === 'bullet' && (
                  <ul>
                    {section.content.split('\n').filter(line => line.trim()).map((line, i) => (
                      <li key={i}>{line.trim()}</li>
                    ))}
                  </ul>
                )}
                {section.type === 'number' && (
                  <ol>
                    {section.content.split('\n').filter(line => line.trim()).map((line, i) => (
                      <li key={i}>{line.trim()}</li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const saveDocument = async (action: 'save' | 'pdf' | 'word' | 'submit') => {
    if (!documentTitle.trim()) {
      message.warning('Please enter a document title');
      return;
    }

    if (sections.every(s => !s.content.trim())) {
      message.warning('Please add some content to your document');
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      switch (action) {
        case 'save':
          message.success('Document saved successfully!');
          break;
        case 'pdf':
          message.success('PDF generated and downloaded!');
          break;
        case 'word':
          message.success('Word document generated and downloaded!');
          break;
        case 'submit':
          message.success('Document submitted as a report!');
          // Here you would navigate to the reports page or show submission form
          break;
      }
    } catch (error) {
      message.error('Failed to process document');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSectionEditor = (section: DocumentSection, index: number) => (
    <Card key={section.id} size="small" className="mb-4">
      <div className="flex justify-between items-start mb-3">
        <Select
          value={section.type}
          onChange={(value) => updateSection(section.id, 'type', value)}
          style={{ width: 120 }}
          size="small"
        >
          <Option value="heading">Heading</Option>
          <Option value="text">Paragraph</Option>
          <Option value="bullet">Bullet List</Option>
          <Option value="number">Number List</Option>
        </Select>
        
        <Space>
          <Button 
            size="small" 
            onClick={() => moveSection(section.id, 'up')}
            disabled={index === 0}
          >
            ↑
          </Button>
          <Button 
            size="small" 
            onClick={() => moveSection(section.id, 'down')}
            disabled={index === sections.length - 1}
          >
            ↓
          </Button>
          <Button 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteSection(section.id)}
            disabled={sections.length === 1}
          />
        </Space>
      </div>

      {section.type === 'heading' && (
        <Input
          placeholder="Section title"
          value={section.title}
          onChange={(e) => updateSection(section.id, 'title', e.target.value)}
          className="mb-2"
        />
      )}

      <TextArea
        placeholder={
          section.type === 'heading' ? 'Section content (optional)' :
          section.type === 'bullet' ? 'Enter bullet points (one per line)' :
          section.type === 'number' ? 'Enter numbered items (one per line)' :
          'Enter paragraph content'
        }
        value={section.content}
        onChange={(e) => updateSection(section.id, 'content', e.target.value)}
        rows={section.type === 'text' ? 4 : 6}
      />
    </Card>
  );

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <EditOutlined />
            {t("navigation.digitalize")}
          </h2>
          <p className="text-gray-600 mt-2">
            Create professional documents and reports directly within the platform
          </p>
        </div>

        <Alert
          message="Digital Document Creator"
          description="Create structured documents with multiple sections. You can export to PDF/Word or submit directly as a report."
          type="info"
          showIcon
          className="mb-6"
        />

        <Row gutter={[24, 24]}>
          {/* Document Editor */}
          <Col xs={24} lg={16}>
            <Card title="Document Editor" size="small">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Document Title *</label>
                <Input
                  placeholder="Enter document title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  size="large"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <Text strong>Document Sections</Text>
                  <Space>
                    <Button 
                      icon={<PlusOutlined />} 
                      onClick={() => addSection('text')}
                      size="small"
                    >
                      Add Paragraph
                    </Button>
                    <Button 
                      icon={<PlusOutlined />} 
                      onClick={() => addSection('heading')}
                      size="small"
                    >
                      Add Section
                    </Button>
                  </Space>
                </div>

                {sections.map((section, index) => 
                  renderSectionEditor(section, index)
                )}
              </div>
            </Card>
          </Col>

          {/* Actions Panel */}
          <Col xs={24} lg={8}>
            <Card title="Actions" size="small">
              <Space direction="vertical" className="w-full">
                <Button 
                  icon={<EyeOutlined />} 
                  onClick={() => setIsPreviewVisible(true)}
                  block
                >
                  Preview Document
                </Button>
                
                <Button 
                  icon={<SaveOutlined />} 
                  onClick={() => saveDocument('save')}
                  loading={isSaving}
                  block
                >
                  Save Draft
                </Button>
                
                <Divider>Export Options</Divider>
                
                <Button 
                  icon={<FilePdfOutlined />} 
                  onClick={() => saveDocument('pdf')}
                  loading={isSaving}
                  block
                >
                  Download as PDF
                </Button>
                
                <Button 
                  icon={<FileWordOutlined />} 
                  onClick={() => saveDocument('word')}
                  loading={isSaving}
                  block
                >
                  Download as Word
                </Button>
                
                <Divider>Submit as Report</Divider>
                
                <Button 
                  type="primary"
                  icon={<SendOutlined />} 
                  onClick={() => saveDocument('submit')}
                  loading={isSaving}
                  block
                >
                  Submit as Report
                </Button>
              </Space>
            </Card>

            <Card title="Document Info" size="small" className="mt-4">
              <Space direction="vertical" size="small">
                <div>
                  <Text strong>Created by:</Text> {user?.name}
                </div>
                <div>
                  <Text strong>Department:</Text> {user?.department}
                </div>
                <div>
                  <Text strong>Sections:</Text> {sections.length}
                </div>
                <div>
                  <Text strong>Word count:</Text> {
                    sections.reduce((total, section) => 
                      total + section.content.split(' ').filter(word => word.trim()).length, 0
                    )
                  }
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Preview Modal */}
      <Modal
        title="Document Preview"
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewVisible(false)}>
            Close
          </Button>,
          <Button key="pdf" icon={<FilePdfOutlined />} onClick={() => saveDocument('pdf')}>
            Export PDF
          </Button>
        ]}
        width="90%"
        style={{ maxWidth: '1000px' }}
      >
        <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
          {generatePreview()}
        </div>
      </Modal>
    </div>
  );
}
