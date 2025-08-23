import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DocumentAnalysis } from '@/components/DocumentAnalysis';
import { ChatInterface } from '@/components/ChatInterface';
import { Footer } from '@/components/Footer';
import { Scale, Sparkles } from 'lucide-react';
import heroImage from '@/assets/legal-hero.jpg';

const Index = () => {
  const [analysis, setAnalysis] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Background Gradients and Hero Image */}
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />

        <div className="container mx-auto relative z-10">
          {/* Hero Text */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-primary rounded-2xl">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                AI Legal Doc Explainer
              </h1>
              <div className="p-3 bg-gradient-primary rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Understand your legal documents in simple language.
              <br />
              <span className="text-primary font-semibold">No legal degree required.</span>
            </p>
          </div>

          {/* Upload Section / Analysis Section */}
          {!analysis ? (
            <div className="fade-in">
              <FileUpload onFileUploaded={setAnalysis} />

              {/* Features Preview */}
              <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📄</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Plain English Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a clear, understandable explanation of your document's key points
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Risk Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Identify potential risks and red flags with color-coded severity levels
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">AI Chat Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask questions and get instant answers about your document
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Analysis Results */
            <div className="space-y-12 fade-in">
              <DocumentAnalysis analysis={analysis} />
              <ChatInterface documentContext={analysis.context} />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
