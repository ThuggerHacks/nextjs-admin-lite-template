'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import { Button, Space, Select, Switch, Input, Tooltip, Divider, Card, Row, Col } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  PictureOutlined,
  CodeOutlined,
  ClearOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  theme?: 'snow' | 'bubble';
  height?: number;
  showToolbar?: boolean;
  showStatusBar?: boolean;
  showFullscreen?: boolean;
  showSaveOptions?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  theme = 'snow',
  height = 400,
  showToolbar = true,
  showStatusBar = true,
  showFullscreen = true,
  showSaveOptions = true,
  className = '',
  style = {}
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [currentFormat, setCurrentFormat] = useState<any>({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Enhanced toolbar with maximum features
  const customToolbar = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    ['blockquote', 'code-block'],
    [{ 'align': [] }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image', 'video', 'formula'],
    ['clean']
  ];

  // Advanced modules configuration - will be defined after functions
  let modules: any = {
    toolbar: customToolbar,
    keyboard: {
      bindings: {
        tab: {
          key: 9,
          handler: function() {
            return true;
          }
        }
      }
    },
    clipboard: {
      matchVisual: false
    },
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  };

  // All available formats
  const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'blockquote', 'code-block',
  'align', 'indent', 'direction',
  'list', 'bullet',
  'link', 'image', 'video', 'formula',
  'clean'
  ];

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      quill.on('text-change', () => {
        updateCounts();
        updateCurrentFormat();
      });

      const toolbar = quill.getModule('toolbar');
      toolbar.addHandler('table', () => {
        insertTable();
      });
    }
  }, []);

  const updateCounts = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const text = quill.getText();
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(text.length);
    }
  };

  const updateCurrentFormat = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        const format = quill.getFormat(range);
        setCurrentFormat(format);
      }
    }
  };

  const insertTable = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'table', {
          rows: 3,
          cols: 3
        });
      }
    }
  };

  const handleSave = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const content = quill.root.innerHTML;
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.html';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const content = quill.root.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Document</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                img { max-width: 100%; height: auto; }
                .ql-editor { line-height: 1.6; }
              </style>
            </head>
            <body>
              <div class="ql-editor">${content}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleExport = (format: 'html' | 'text' | 'pdf') => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      let content: string;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case 'html':
          content = quill.root.innerHTML;
          mimeType = 'text/html';
          extension = 'html';
          break;
        case 'text':
          content = quill.getText();
          mimeType = 'text/plain';
          extension = 'txt';
          break;
        case 'pdf':
          content = quill.root.innerHTML;
          mimeType = 'text/html';
          extension = 'html';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const insertSpecialCharacter = (char: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, char);
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, emoji);
      }
    }
  };

  const clearFormatting = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.removeFormat(range.index, range.length);
      }
    }
  };

  const undo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const history = quill.getModule('history');
      if (history) history.undo();
    }
  };

  const redo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const history = quill.getModule('history');
      if (history) history.redo();
    }
  };

  // Update modules with save and print handlers after functions are available
  modules.toolbar.handlers.save = () => handleSave();
  modules.toolbar.handlers.print = () => handlePrint();

  const editorStyle = {
    height: isFullscreen ? '100vh' : height,
    width: '100%',
    ...style
  };

  const containerStyle = isFullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'white',
    padding: '20px'
  } : {};

  return (
    <div style={containerStyle} className={className}>
      {showToolbar && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 8]} align="middle">
            <Col span={24}>
              <Space wrap>
                {/* Basic formatting */}
                <Tooltip title="Bold">
                  <Button 
                    icon={<BoldOutlined />} 
                    type={currentFormat.bold ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('bold', !currentFormat.bold)}
                  />
                </Tooltip>
                <Tooltip title="Italic">
                  <Button 
                    icon={<ItalicOutlined />} 
                    type={currentFormat.italic ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('italic', !currentFormat.italic)}
                  />
                </Tooltip>
                <Tooltip title="Underline">
                  <Button 
                    icon={<UnderlineOutlined />} 
                    type={currentFormat.underline ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('underline', !currentFormat.underline)}
                  />
                </Tooltip>
                <Tooltip title="Strikethrough">
                  <Button 
                    icon={<StrikethroughOutlined />} 
                    type={currentFormat.strike ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('strike', !currentFormat.strike)}
                  />
                </Tooltip>

                <Divider type="vertical" />

                {/* Alignment */}
                <Tooltip title="Align Left">
                  <Button 
                    icon={<AlignLeftOutlined />} 
                    type={currentFormat.align === '' ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('align', '')}
                  />
                </Tooltip>
                <Tooltip title="Align Center">
                  <Button 
                    icon={<AlignCenterOutlined />} 
                    type={currentFormat.align === 'center' ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('align', 'center')}
                  />
                </Tooltip>
                <Tooltip title="Align Right">
                  <Button 
                    icon={<AlignRightOutlined />} 
                    type={currentFormat.align === 'right' ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('align', 'right')}
                  />
                </Tooltip>
                <Tooltip title="Justify">
                  <Button 
                    icon={<EditOutlined />} 
                    type={currentFormat.align === 'justify' ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('align', 'justify')}
                  />
                </Tooltip>

                <Divider type="vertical" />

                {/* Lists */}
                <Tooltip title="Ordered List">
                  <Button 
                    icon={<OrderedListOutlined />} 
                    type={currentFormat.list === 'ordered' ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('list', 'ordered')}
                  />
                </Tooltip>
                <Tooltip title="Bullet List">
                  <Button 
                    icon={<UnorderedListOutlined />} 
                    type={currentFormat.list === 'bullet' ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('list', 'bullet')}
                  />
                </Tooltip>

                <Divider type="vertical" />

                {/* Special elements */}
                <Tooltip title="Insert Table">
                  <Button icon={<EditOutlined />} onClick={insertTable} />
                </Tooltip>
                <Tooltip title="Insert Image">
                  <Button icon={<PictureOutlined />} onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (quillRef.current) {
                            const quill = quillRef.current.getEditor();
                            const range = quill.getSelection();
                            if (range) {
                              quill.insertEmbed(range.index, 'image', reader.result);
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }} />
                </Tooltip>
                <Tooltip title="Insert Link">
                  <Button icon={<LinkOutlined />} onClick={() => {
                    const url = prompt('Enter URL:');
                    if (url && quillRef.current) {
                      const quill = quillRef.current.getEditor();
                      const range = quill.getSelection();
                      if (range) {
                        quill.format('link', url);
                      }
                    }
                  }} />
                </Tooltip>
                <Tooltip title="Code Block">
                  <Button 
                    icon={<CodeOutlined />} 
                    type={currentFormat['code-block'] ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('code-block', !currentFormat['code-block'])}
                  />
                </Tooltip>
                <Tooltip title="Blockquote">
                  <Button 
                    icon={<EditOutlined />} 
                    type={currentFormat.blockquote ? 'primary' : 'default'}
                    onClick={() => quillRef.current?.getEditor().format('blockquote', !currentFormat.blockquote)}
                  />
                </Tooltip>

                <Divider type="vertical" />

                {/* History */}
                <Tooltip title="Undo">
                  <Button icon={<EditOutlined />} onClick={undo} />
                </Tooltip>
                <Tooltip title="Redo">
                  <Button icon={<EditOutlined />} onClick={redo} />
                </Tooltip>
                <Tooltip title="Clear Formatting">
                  <Button icon={<ClearOutlined />} onClick={clearFormatting} />
                </Tooltip>

                <Divider type="vertical" />

                {/* Fullscreen */}
                {showFullscreen && (
                  <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                    <Button 
                      icon={isFullscreen ? <EyeOutlined /> : <EditOutlined />} 
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    />
                  </Tooltip>
                )}
              </Space>
            </Col>

            {/* Advanced options toggle */}
            <Col span={24} style={{ marginTop: 8 }}>
              <Button 
                type="link" 
                size="small"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
              </Button>
            </Col>

            {/* Advanced options */}
            {showAdvancedOptions && (
              <Col span={24}>
                <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
                  <Col span={6}>
                    <Select
                      placeholder="Font Family"
                      style={{ width: '100%' }}
                      onChange={(value) => quillRef.current?.getEditor().format('font', value)}
                    >
                      <Select.Option value="Arial">Arial</Select.Option>
                      <Select.Option value="Times New Roman">Times New Roman</Select.Option>
                      <Select.Option value="Courier New">Courier New</Select.Option>
                      <Select.Option value="Georgia">Georgia</Select.Option>
                      <Select.Option value="Verdana">Verdana</Select.Option>
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="Font Size"
                      style={{ width: '100%' }}
                      onChange={(value) => quillRef.current?.getEditor().format('size', value)}
                    >
                      <Select.Option value="8px">8px</Select.Option>
                      <Select.Option value="10px">10px</Select.Option>
                      <Select.Option value="12px">12px</Select.Option>
                      <Select.Option value="14px">14px</Select.Option>
                      <Select.Option value="16px">16px</Select.Option>
                      <Select.Option value="18px">18px</Select.Option>
                      <Select.Option value="20px">20px</Select.Option>
                      <Select.Option value="24px">24px</Select.Option>
                      <Select.Option value="28px">28px</Select.Option>
                      <Select.Option value="32px">32px</Select.Option>
                      <Select.Option value="36px">36px</Select.Option>
                      <Select.Option value="48px">48px</Select.Option>
                      <Select.Option value="72px">72px</Select.Option>
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Input
                      placeholder="Text Color"
                      type="color"
                      style={{ width: '100%' }}
                      onChange={(e) => quillRef.current?.getEditor().format('color', e.target.value)}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      placeholder="Background Color"
                      type="color"
                      style={{ width: '100%' }}
                      onChange={(e) => quillRef.current?.getEditor().format('background', e.target.value)}
                    />
                  </Col>
                </Row>

                {/* Special characters and emojis */}
                <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
                  <Col span={24}>
                    <Space wrap>
                      <span>Special Characters:</span>
                      {['©', '®', '™', '€', '£', '¥', '¢', '§', '¶', '†', '‡', '•', '–', '—', '…', '‹', '›', '«', '»'].map(char => (
                        <Button 
                          key={char} 
                          size="small" 
                          onClick={() => insertSpecialCharacter(char)}
                        >
                          {char}
                        </Button>
                      ))}
                    </Space>
                  </Col>
                </Row>

                <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
                  <Col span={24}>
                    <Space wrap>
                      <span>Emojis:</span>
                      {['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '💔', '🎉', '🎊', '🔥', '💯', '✨', '🌟', '💫', '⭐'].map(emoji => (
                        <Button 
                          key={emoji} 
                          size="small" 
                          onClick={() => insertEmoji(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </Space>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Main Editor */}
      <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
        <ReactQuill
          ref={quillRef}
          theme={theme}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          modules={modules}
          formats={formats}
          style={editorStyle}
        />
      </div>

      {/* Status Bar */}
      {showStatusBar && (
        <Card size="small" style={{ marginTop: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <span>Words: {wordCount}</span>
            </Col>
            <Col span={8}>
              <span>Characters: {charCount}</span>
            </Col>
            <Col span={8}>
              <span>Theme: {theme}</span>
            </Col>
          </Row>
        </Card>
      )}

      {/* Save/Export Options */}
      {showSaveOptions && (
        <Card size="small" style={{ marginTop: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={24}>
              <Space wrap>
                <span>Export as:</span>
                <Button size="small" onClick={() => handleExport('html')}>
                  <EditOutlined /> HTML
                </Button>
                <Button size="small" onClick={() => handleExport('text')}>
                  <EditOutlined /> Text
                </Button>
                <Button size="small" onClick={handlePrint}>
                  <EditOutlined /> Print
                </Button>
                <Button size="small" onClick={handleSave}>
                  <SaveOutlined /> Save
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 9998
        }} />
      )}
    </div>
  );
};

export default RichTextEditor;
