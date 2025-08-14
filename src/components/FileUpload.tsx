import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUploaded: (analysis: any) => void;
}

export const FileUpload = ({ onFileUploaded }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock analysis result
      const mockAnalysis = {
        summary: "This is a standard employment contract that establishes the terms and conditions of employment between Company ABC and John Doe. The agreement outlines compensation, benefits, work responsibilities, and termination procedures. Key highlights include a competitive salary package, comprehensive health benefits, and standard non-disclosure provisions.",
        clauses: [
          { type: "Compensation", text: "Annual salary of $75,000 paid bi-weekly", severity: "minor" },
          { type: "Termination", text: "Either party may terminate with 30 days written notice", severity: "medium" },
          { type: "Non-disclosure", text: "Employee agrees to maintain confidentiality of company information", severity: "minor" },
          { type: "Non-compete", text: "6-month non-compete clause within same industry", severity: "major" }
        ],
        risks: [
          { text: "Non-compete clause may limit future employment opportunities", severity: "major" },
          { text: "Termination notice period is relatively standard", severity: "minor" },
          { text: "No mention of overtime compensation policy", severity: "medium" }
        ]
      };
      
      onFileUploaded(mockAnalysis);
      toast({
        title: "Document analyzed successfully!",
        description: "Your legal document has been processed.",
      });
    } catch (error) {
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
    <div className="w-full max-w-2xl mx-auto">
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
    </div>
  );
};