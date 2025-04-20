
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileInfo, FileType } from '@/types';
import { determineFileType, parseCSVFile } from '@/utils/csvParser';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, FileIcon, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  onFilesReady: (files: FileInfo[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesReady }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    let loadedCount = 0;
    const totalFiles = acceptedFiles.length;
    
    try {
      const newFiles: FileInfo[] = [];

      for (const file of acceptedFiles) {
        if (!file.name.endsWith('.csv')) {
          toast({
            title: "Invalid file format",
            description: `${file.name} is not a CSV file.`,
            variant: "destructive",
          });
          continue;
        }

        const fileType = determineFileType(file.name);
        
        try {
          const parsedData = await parseCSVFile(file);
          
          newFiles.push({
            id: uuidv4(),
            file,
            type: fileType,
            data: parsedData
          });
          
          loadedCount++;
          setProgress(Math.round((loadedCount / totalFiles) * 100));
          
        } catch (error) {
          toast({
            title: "Failed to parse CSV",
            description: `Could not parse ${file.name}.`,
            variant: "destructive",
          });
        }
      }

      setFiles(prev => [...prev, ...newFiles]);
      
      // Check if required files are present
      const hasExpirations = [...files, ...newFiles].some(f => f.type === 'expirations');
      if (!hasExpirations) {
        toast({
          title: "Missing expiration data",
          description: "Please upload the expirations report to proceed.",
          variant: "default",
        });
      }
      
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv']
    }
  });

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleProcessFiles = () => {
    if (files.length === 0) {
      toast({
        title: "No files to process",
        description: "Please upload at least one CSV file.",
        variant: "destructive",
      });
      return;
    }

    const hasExpirations = files.some(f => f.type === 'expirations');
    if (!hasExpirations) {
      toast({
        title: "Missing expiration data",
        description: "Please upload the expirations report to proceed.",
        variant: "destructive",
      });
      return;
    }

    onFilesReady(files);
  };

  const getFileTypeLabel = (type: FileType): string => {
    switch (type) {
      case 'expirations': return 'Expirations';
      case 'frozen': return 'Frozen';
      case 'notactivated': return 'Not Activated';
      default: return 'Unknown';
    }
  };

  const getFileTypeColor = (type: FileType): string => {
    switch (type) {
      case 'expirations': return 'bg-membership-expiration';
      case 'frozen': return 'bg-membership-frozen';
      case 'notactivated': return 'bg-membership-notactivated';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <FileIcon className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Drag &amp; drop CSV files here</h3>
            <p className="text-sm text-muted-foreground">
              Upload membership reports: expirations, frozen, and not activated
            </p>
          </div>
          <Button variant="secondary">Select Files</Button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center mt-2 text-muted-foreground">
            Processing files... {progress}%
          </p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Uploaded Files</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((fileInfo) => (
              <Card key={fileInfo.id} className="animate-float-in" style={{animationDelay: '0.1s'}}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getFileTypeColor(fileInfo.type)}`} />
                    <div>
                      <p className="font-medium truncate w-40">{fileInfo.file.name}</p>
                      <p className="text-xs text-muted-foreground">{getFileTypeLabel(fileInfo.type)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => { 
                      e.stopPropagation();
                      removeFile(fileInfo.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleProcessFiles} className="px-8">
              <CalendarIcon className="mr-2 h-4 w-4" /> Process Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
