"use client";

import { useState, useRef } from "react";
import { Card, Button, Space, message, Select, Input, List, Modal, Alert } from "antd";
import { 
  CameraOutlined, 
  DeleteOutlined, 
  FilePdfOutlined, 
  SaveOutlined,
  PlusOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

import { useTranslation } from "@/contexts/LanguageContext";

const { Option } = Select;

interface ScannedPage {
  id: string;
  blob: Blob;
  url: string;
  timestamp: Date;
}

export default function ScannerPage() {
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { t } = useTranslation();

  const mockLibraries = [
    { id: '1', name: 'Personal Documents' },
    { id: '2', name: 'Work Reports' },
    { id: '3', name: 'HR Documents' },
    { id: '4', name: 'Financial Records' },
  ];

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      message.error('Unable to access camera. Please check permissions.');
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const id = Date.now().toString();
        const url = URL.createObjectURL(blob);
        const newPage: ScannedPage = {
          id,
          blob,
          url,
          timestamp: new Date(),
        };

        setScannedPages(prev => [...prev, newPage]);
        message.success('Page captured successfully!');
      }
    }, 'image/jpeg', 0.8);
  };

  const removePage = (id: string) => {
    setScannedPages(prev => {
      const page = prev.find(p => p.id === id);
      if (page) {
        URL.revokeObjectURL(page.url);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const previewPage = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const generatePDF = async () => {
    if (scannedPages.length === 0) {
      message.warning('Please capture at least one page before generating PDF.');
      return;
    }

    if (!selectedLibrary || !fileName) {
      message.warning('Please select a library and enter a file name.');
      return;
    }

    setIsGeneratingPdf(true);
    
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success(`PDF "${fileName}.pdf" generated and saved to library successfully!`);
      
      // Clear the scanner
      scannedPages.forEach(page => URL.revokeObjectURL(page.url));
      setScannedPages([]);
      setFileName("");
      setDescription("");
      stopCamera();
    } catch (error) {
      message.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CameraOutlined />
            {t("scanner.scanDocument")}
          </h2>
          <p className="text-gray-600 mt-2">
            Use your device camera to scan documents and convert them to PDF.
          </p>
        </div>

        {/* Scanning Tips */}
        <Alert
          message={t("scanner.scanningTips")}
          description={
            <ul className="mt-2">
              <li>• {t("scanner.goodLighting")}</li>
              <li>• {t("scanner.keepFlat")}</li>
              <li>• {t("scanner.avoidShadows")}</li>
              <li>• {t("scanner.centerDocument")}</li>
            </ul>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Camera</h3>
            
            <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
              {isCapturing ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <CameraOutlined className="text-4xl mb-2" />
                    <p>Click "Start Camera" to begin scanning</p>
                  </div>
                </div>
              )}
            </div>

            <Space className="w-full justify-center">
              {!isCapturing ? (
                <Button type="primary" icon={<CameraOutlined />} onClick={startCamera}>
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button type="primary" icon={<CameraOutlined />} onClick={capturePhoto}>
                    {t("scanner.takePhoto")}
                  </Button>
                  <Button onClick={stopCamera}>
                    Stop Camera
                  </Button>
                </>
              )}
            </Space>

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Scanned Pages Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Scanned Pages ({scannedPages.length})
            </h3>
            
            <div className="border rounded-lg p-4 mb-4" style={{ minHeight: '300px' }}>
              {scannedPages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FilePdfOutlined className="text-3xl mb-2" />
                    <p>No pages scanned yet</p>
                  </div>
                </div>
              ) : (
                <List
                  grid={{ gutter: 16, xs: 2, sm: 2, md: 3 }}
                  dataSource={scannedPages}
                  renderItem={(page, index) => (
                    <List.Item>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={page.url}
                          alt={`Page ${index + 1}`}
                          className="w-full h-24 object-cover cursor-pointer"
                          onClick={() => previewPage(page.url)}
                        />
                        <div className="p-2 text-center">
                          <Space>
                            <Button
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => previewPage(page.url)}
                            />
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removePage(page.id)}
                            />
                          </Space>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>

            {/* PDF Generation Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("files.selectLibrary")} *
                </label>
                <Select
                  placeholder="Select a library"
                  className="w-full"
                  value={selectedLibrary}
                  onChange={setSelectedLibrary}
                >
                  {mockLibraries.map(lib => (
                    <Option key={lib.id} value={lib.id}>{lib.name}</Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("files.fileName")} *
                </label>
                <Input
                  placeholder="Enter file name (without extension)"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("files.fileDescription")}
                </label>
                <Input.TextArea
                  rows={3}
                  placeholder="Enter file description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                loading={isGeneratingPdf}
                disabled={scannedPages.length === 0 || !selectedLibrary || !fileName}
                onClick={generatePDF}
                className="w-full"
                size="large"
              >
                {t("scanner.generatePdf")}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={null}
          width="80%"
          style={{ maxWidth: '800px' }}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-auto"
          />
        </Modal>
      </Card>
    </div>
  );
}
