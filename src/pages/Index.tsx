
import React, { useState } from 'react';
import { FileInfo, MembershipRecord, ProcessedData } from '@/types';
import { processFiles } from '@/utils/csvParser';
import FileUpload from '@/components/FileUpload';
import DataVisualization from '@/components/DataVisualization';
import ProcessingAnimation from '@/components/ProcessingAnimation';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const handleFilesReady = (uploadedFiles: FileInfo[]) => {
    setFiles(uploadedFiles);
    setIsProcessing(true);

    // We'll set a timeout to show the animation for a few seconds
    setTimeout(() => {
      try {
        const data = processFiles(uploadedFiles);
        setProcessedData(data);
        
        toast({
          title: "Processing complete",
          description: `Successfully processed ${data.allRecords.length} membership records.`,
        });
      } catch (error) {
        console.error("Error processing files:", error);
        toast({
          title: "Processing failed",
          description: "An error occurred while processing the files. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }, 3000); // Show animation for 3 seconds
  };

  const handleReset = () => {
    setFiles([]);
    setProcessedData(null);
  };
  
  const handleDataUpdate = (updatedRecords: MembershipRecord[]) => {
    if (!processedData) return;
    
    // Create updated processed data with the new records
    const updatedData = processFiles([
      ...files.filter(file => file.type !== 'expirations'),
      {
        ...files.find(file => file.type === 'expirations')!,
        data: updatedRecords
      }
    ]);
    
    setProcessedData(updatedData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 animate-fade-in">
      <header className="bg-white shadow-sm py-6 px-4 md:px-6 border-b border-border/40">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Membership Expiry Navigator
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload and analyze membership expiration data
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 md:px-6">
        {!processedData && !isProcessing && (
          <div className="animate-float-in">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Upload Membership Reports</h2>
              <p className="text-muted-foreground">
                Drag and drop CSV files to begin analysis. The system will automatically detect file types.
              </p>
            </div>
            <FileUpload onFilesReady={handleFilesReady} />
          </div>
        )}

        {isProcessing && (
          <div className="my-12">
            <ProcessingAnimation onComplete={() => {}} />
          </div>
        )}

        {processedData && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Processed Membership Data</h2>
              <button
                onClick={handleReset}
                className="text-sm text-primary hover:text-primary/80 underline"
              >
                Upload New Files
              </button>
            </div>
            <DataVisualization 
              data={processedData} 
              onDataUpdate={handleDataUpdate} 
            />
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-6 px-4 md:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left text-sm text-muted-foreground">
            Membership Expiry Navigator &copy; {new Date().getFullYear()}
          </div>
          <div className="text-xs text-muted-foreground mt-2 md:mt-0">
            Track and manage membership expirations efficiently
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
