import { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface DocumentAnalysisProps {
  analysis: {
    summary: string;
    clauses: Array<{
      type: string;
      text: string;
      severity: 'minor' | 'medium' | 'major';
    }>;
    risks: Array<{
      text: string;
      severity: 'minor' | 'medium' | 'major';
    }>;
  };
}

export const DocumentAnalysis = ({ analysis }: DocumentAnalysisProps) => {
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const getRiskIcon = (severity: string) => {
    switch (severity) {
      case 'minor': return '🟢';
      case 'medium': return '🟡';
      case 'major': return '🔴';
      default: return '⚪';
    }
  };

  const getRiskClass = (severity: string) => {
    switch (severity) {
      case 'minor': return 'risk-minor';
      case 'medium': return 'risk-medium';
      case 'major': return 'risk-major';
      default: return 'risk-minor';
    }
  };

  const handleDownload = () => {
    const content = `
AI Legal Document Analysis
=========================

SUMMARY:
${analysis.summary}

KEY CLAUSES:
${analysis.clauses.map(clause => `- ${clause.type}: ${clause.text} (${clause.severity})`).join('\n')}

RISKS & RED FLAGS:
${analysis.risks.map(risk => `- ${risk.text} (${risk.severity})`).join('\n')}

Disclaimer: This AI tool is for informational purposes only and does not provide legal advice.
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-document-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your analysis has been downloaded as a text file.",
    });
  };

  const handleEmailSend = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate email sending
    toast({
      title: "Email sent!",
      description: `Analysis has been sent to ${email}`,
    });
    setEmail('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 fade-in">
      {/* Summary Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-bold text-foreground">Document Summary</span>
            <Collapsible open={summaryExpanded} onOpenChange={setSummaryExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {summaryExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible open={summaryExpanded} onOpenChange={setSummaryExpanded}>
            <div className="text-muted-foreground leading-relaxed">
              {summaryExpanded ? (
                <CollapsibleContent className="space-y-2">
                  {analysis.summary}
                </CollapsibleContent>
              ) : (
                <p>{analysis.summary.substring(0, 200)}...</p>
              )}
            </div>
            {!summaryExpanded && (
              <CollapsibleTrigger asChild>
                <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                  Read More
                </Button>
              </CollapsibleTrigger>
            )}
          </Collapsible>
        </CardContent>
      </Card>

      {/* Key Clauses Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Key Clauses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.clauses.map((clause, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-muted/30 rounded-xl">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary`}>
                  {clause.type}
                </span>
                <div className="flex-1">
                  <p className="text-foreground">{clause.text}</p>
                </div>
                <span className={getRiskClass(clause.severity)}>
                  {getRiskIcon(clause.severity)} {clause.severity}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risks & Red Flags Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-foreground">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Risks & Red Flags</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.risks.map((risk, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-muted/30 rounded-xl">
                <span className={getRiskClass(risk.severity)}>
                  {getRiskIcon(risk.severity)} {risk.severity}
                </span>
                <p className="text-foreground flex-1">{risk.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button onClick={handleDownload} variant="outline" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Download Summary
            </Button>
            
            <div className="flex flex-1 gap-2 w-full sm:w-auto">
              <Input
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleEmailSend} className="btn-hero">
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};