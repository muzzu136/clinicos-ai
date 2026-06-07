import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldAlert } from "lucide-react";
import DenialDashboard from "@/components/claim-intelligence/DenialDashboard";
import ClaimScrubberTool from "@/components/claim-intelligence/ClaimScrubberTool";
import DenialAnalyzerTool from "@/components/claim-intelligence/DenialAnalyzerTool";
import RecoveryWorklist from "@/components/claim-intelligence/RecoveryWorklist";

export default function ClaimIntelligence() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Claim Intelligence</h1>
          <p className="text-sm text-muted-foreground">AI-powered denial management & claim accuracy layer</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="dashboard">Denial Dashboard</TabsTrigger>
          <TabsTrigger value="scrubber">Claim Scrubber</TabsTrigger>
          <TabsTrigger value="analyzer">Denial Analyzer</TabsTrigger>
          <TabsTrigger value="recovery">Recovery Worklist</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DenialDashboard />
        </TabsContent>
        <TabsContent value="scrubber" className="mt-6">
          <ClaimScrubberTool />
        </TabsContent>
        <TabsContent value="analyzer" className="mt-6">
          <DenialAnalyzerTool />
        </TabsContent>
        <TabsContent value="recovery" className="mt-6">
          <RecoveryWorklist />
        </TabsContent>
      </Tabs>
    </div>
  );
}