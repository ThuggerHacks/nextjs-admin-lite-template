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
  const { t } = useTranslation();
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      message.error(t('scanner.cameraAccessError'));
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

    // Enable image smoothing for better quality
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob with higher quality
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
        message.success(t('scanner.pageCapturedSuccessfully'));
      }
    }, 'image/jpeg', 0.95); // Increased quality from 0.8 to 0.95
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

  const movePageUp = (id: string) => {
    setScannedPages(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index > 0) {
        const newPages = [...prev];
        [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
        return newPages;
      }
      return prev;
    });
  };

  const movePageDown = (id: string) => {
    setScannedPages(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index < prev.length - 1) {
        const newPages = [...prev];
        [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
        return newPages;
      }
      return prev;
    });
  };

  const previewPage = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const generatePDF = async () => {
    if (scannedPages.length === 0) {
      message.warning(t('scanner.pleaseCaptureOnePage'));
      return;
    }

    if (!fileName) {
      message.warning(t('scanner.pleaseEnterFileName'));
      return;
    }

    setIsGeneratingPdf(true);
    
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      // Create new PDF document with A4 dimensions (210mm x 297mm)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Margins
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      // Add each scanned page to PDF
      for (let i = 0; i < scannedPages.length; i++) {
        const page = scannedPages[i];
        
        // Convert blob to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data:image/jpeg;base64, prefix
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(page.blob);
        });
        
        // Create a temporary image to get dimensions
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            
            // Calculate aspect ratio
            const aspectRatio = imgWidth / imgHeight;
            
            // Calculate dimensions to fit within content area while maintaining aspect ratio
            let finalWidth = contentWidth;
            let finalHeight = contentWidth / aspectRatio;
            
            // If height is too tall, scale down proportionally
            if (finalHeight > contentHeight) {
              finalHeight = contentHeight;
              finalWidth = contentHeight * aspectRatio;
            }
            
            // Center the image on the page
            const x = margin + (contentWidth - finalWidth) / 2;
            const y = margin + (contentHeight - finalHeight) / 2;
            
            // Add image to PDF with proper dimensions and positioning
            // Use 'FAST' for better performance, 'MEDIUM' for better quality
            pdf.addImage(base64, 'JPEG', x, y, finalWidth, finalHeight, `page${i + 1}`, 'MEDIUM');
            resolve();
          };
          img.src = URL.createObjectURL(page.blob);
        });
        
        // Add new page if not the last page
        if (i < scannedPages.length - 1) {
          pdf.addPage();
        }
      }
      
      // Save the PDF
      pdf.save(`${fileName}.pdf`);
      
      message.success(t('scanner.pdfGeneratedSuccessfully', { fileName }));
      
      // Clear the scanner
      scannedPages.forEach(page => URL.revokeObjectURL(page.url));
      setScannedPages([]);
      setFileName("");
      stopCamera();
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error(t('scanner.failedToGeneratePdf'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <CameraOutlined />
            {t('scanner.title')}
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {t('scanner.useDeviceCamera')}
          </p>
        </div>

        {/* Scanning Tips */}
        <Alert
          message={t('scanner.scanningTipsTitle')}
          description={
            <ul className="mt-2 text-sm">
              <li>{t('scanner.ensureGoodLighting')}</li>
              <li>{t('scanner.keepDocumentFlat')}</li>
              <li>{t('scanner.avoidShadowsGlare')}</li>
              <li>{t('scanner.centerDocumentFrame')}</li>
            </ul>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          className="mb-6"
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Camera Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('scanner.cameraSection')}</h3>
            
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
                  <div className="text-center p-4">
                    <CameraOutlined className="text-3xl sm:text-4xl mb-2" />
                    <p className="text-sm sm:text-base">
                      {t('scanner.clickStartCamera')} {t('scanner.toBeginScanning')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Space className="w-full justify-center" wrap>
              {!isCapturing ? (
                <Button type="primary" icon={<CameraOutlined />} onClick={startCamera} size="large">
                  {t('scanner.startCamera')}
                </Button>
              ) : (
                <>
                  <Button type="primary" icon={<CameraOutlined />} onClick={capturePhoto} size="large">
                    {t('scanner.takePhoto')}
                  </Button>
                  <Button onClick={stopCamera} size="large">
                    {t('scanner.stopCamera')}
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
              {t('scanner.scannedPagesSection')} ({scannedPages.length})
            </h3>
            
            <div className="border rounded-lg p-4 mb-4" style={{ minHeight: '300px' }}>
              {scannedPages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FilePdfOutlined className="text-3xl mb-2" />
                    <p className="text-sm sm:text-base">{t('scanner.noPagesScannedYet')}</p>
                  </div>
                </div>
              ) : (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
                  dataSource={scannedPages}
                  renderItem={(page, index) => (
                    <List.Item>
                      <div className="border rounded-lg overflow-hidden relative">
                        <img
                          src={page.url}
                          alt={`${t('scanner.pageNumber')} ${index + 1}`}
                          className="w-full h-20 sm:h-24 object-cover cursor-pointer"
                          onClick={() => previewPage(page.url)}
                        />
                        <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                          {index + 1}
                        </div>
                        <div className="p-2 text-center">
                          <Space size="small" direction="vertical">
                            <Space size="small">
                              <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => previewPage(page.url)}
                              >
                                {t('scanner.view')}
                              </Button>
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removePage(page.id)}
                              >
                                {t('scanner.delete')}
                              </Button>
                            </Space>
                            <Space size="small">
                              <Button
                                size="small"
                                disabled={index === 0}
                                onClick={() => movePageUp(page.id)}
                                style={{ fontSize: '10px', padding: '0 4px' }}
                                title={t('scanner.movePageUp')}
                              >
                                ↑
                              </Button>
                              <Button
                                size="small"
                                disabled={index === scannedPages.length - 1}
                                onClick={() => movePageDown(page.id)}
                                style={{ fontSize: '10px', padding: '0 4px' }}
                                title={t('scanner.movePageDown')}
                              >
                                ↓
                              </Button>
                            </Space>
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
                  {t('scanner.fileNameLabel')}
                </label>
                <Input
                  placeholder={t('scanner.enterFileNameWithoutExtension')}
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  size="large"
                />
              </div>

              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                loading={isGeneratingPdf}
                disabled={scannedPages.length === 0 || !fileName}
                onClick={generatePDF}
                className="w-full"
                size="large"
              >
                {isGeneratingPdf ? t('scanner.generatingPdf') : t('scanner.generatePdfButton')}
              </Button>
              
              {isGeneratingPdf && (
                <div className="text-center text-sm text-gray-500">
                  {t('scanner.processingPages')} {scannedPages.length} {scannedPages.length > 1 ? t('scanner.pagePlural') : t('scanner.pageSingular')}...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={null}
          width="90%"
          style={{ maxWidth: '800px' }}
          title={t('scanner.previewModal')}
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
