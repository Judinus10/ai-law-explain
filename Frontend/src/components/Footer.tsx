import { AlertTriangle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-16 py-8 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <p className="text-center max-w-2xl">
            <strong>Disclaimer:</strong> This AI tool is for informational purposes only and does not provide legal advice. 
            Always consult with a qualified attorney for legal guidance on important matters.
          </p>
        </div>
        <div className="text-center mt-4 text-xs text-muted-foreground/70">
          © 2024 AI Legal Doc Explainer. Built with modern AI technology.
        </div>
      </div>
    </footer>
  );
};