import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChatInterface } from './ChatInterface'; // import your chat component

interface FileUploadProps {
  onFileUploaded?: (analysis: any) => void; // optional, in case parent wants it
}

export const FileUpload = ({ onFileUploaded }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null); // store upload result
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }

      const result = await response.json();
      setAnalysis(result); // save analysis for chat
      onFileUploaded?.(result); // optional callback to parent

      toast({
        title: "Document analyzed successfully!",
        description: "Your legal document has been processed.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis failed",
        description: "There was an error processing your document.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        className={`upload-area ${dragActive ? 'border-primary bg-primary/5' : ''} ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Analyzing your document...</h3>
              <p className="text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gradient-primary rounded-full">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Upload your legal document
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your PDF file here, or click to browse
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button className="btn-hero cursor-pointer">
                  <FileText className="h-5 w-5 mr-2" />
                  Choose File
                </Button>
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Supports PDF files up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Render ChatInterface only after analysis is ready */}
      {analysis && <ChatInterface documentContext={analysis.context} />}
    </div>
  );
};
