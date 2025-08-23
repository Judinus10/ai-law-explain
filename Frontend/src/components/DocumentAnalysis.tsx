import { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface DocumentAnalysisProps {
  analysis: {
    document_name?: string; // added to pass to backend
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

  // -----------------------------
  // Download TXT (summary + risks)
  // -----------------------------
  const handleDownload = () => {
    const content = `Summary for ${analysis.document_name || "Legal Document"}\n\n` +
                    `=== Summary ===\n` +
                    analysis.summary + "\n\n" +
                    `=== Risks ===\n` +
                    analysis.risks.map(r => `- ${r.text} (Severity: ${r.severity})`).join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.document_name || "Legal Document"}-Summary.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your TXT summary is being downloaded.",
    });
  };

  // -----------------------------
  // Send PDF via Email
  // -----------------------------
  const handleEmailSend = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/send-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: analysis.summary,
          risks: analysis.risks, // send risks as well
          email: email,
          document_name: analysis.document_name || "Legal Document",
          send_email: true // flag backend to send email
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Email sent!",
          description: `Analysis has been sent to ${email}`,
        });
        setEmail('');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Server error",
        description: "Could not connect to backend.",
        variant: "destructive",
      });
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
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
                  {summaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible open={summaryExpanded} onOpenChange={setSummaryExpanded}>
            <div className="text-muted-foreground leading-relaxed">
              {summaryExpanded ? (
                <CollapsibleContent className="space-y-2">{analysis.summary}</CollapsibleContent>
              ) : (
                <p>{analysis.summary.substring(0, 200)}...</p>
              )}
            </div>
            {!summaryExpanded && (
              <CollapsibleTrigger asChild>
                <Button variant="link" className="p-0 h-auto mt-2 text-primary">Read More</Button>
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
                <div className="flex-1"><p className="text-foreground">{clause.text}</p></div>
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
                <span className={getRiskClass(risk.severity)}>{getRiskIcon(risk.severity)} {risk.severity}</span>
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
            {/* TXT Download Button */}
            <Button onClick={handleDownload} variant="outline" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Download TXT
            </Button>

            {/* Email Input & Send */}
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
                Send Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
