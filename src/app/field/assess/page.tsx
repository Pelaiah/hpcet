'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BrainCircuit, Loader2, Sparkles, AlertTriangle, Activity, User, ArrowLeft } from 'lucide-react';
import { generateRiskAssessmentSummary } from '@/ai/flows/generate-risk-assessment-summary';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const RISK_FACTORS = [
  'Inconsistent condom use',
  'High number of sexual partners',
  'Reported alcohol/substance use before sex',
  'Experience of gender-based violence (GBV)',
  'Lack of access to health facilities',
  'Frequent travel away from home ward',
];

export default function PeerAssessPage() {
  const [uin, setUin] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; rationale: string } | null>(null);
  const [assignedLevel, setAssignedLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const toggleFactor = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
  };

  const handleAssessment = async () => {
    if (!uin.trim()) {
      toast({
        title: 'UIN Required',
        description: "Please enter the client's Unique Identifier (UIN).",
        variant: 'destructive',
      });
      return;
    }

    if (selectedFactors.length === 0) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least one risk factor.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const output = await generateRiskAssessmentSummary({
        identifiedRiskFactors: selectedFactors,
        assignedRiskLevel: assignedLevel,
      });
      setResult(output);
      toast({
        title: 'Assessment Generated',
        description: `Rationale ready for client ${uin}.`,
      });
    } catch (error) {
      console.error('Risk assessment generation failed:', error);
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not generate assessment rationale.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <Link
          href="/field"
          aria-label="Back to PE Field Kit"
          className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Risk Assessment Tool</h1>
          <p className="text-xs text-white/65">Assess risk factors and generate clinical rationale for field verification</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel rounded-3xl border-white/15">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Client Parameters</CardTitle>
            <CardDescription className="text-white/65">Input identification and observed risks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="uin" className="text-xs font-semibold text-white/75 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#6CE429]" /> Unique Identifier (UIN)
              </Label>
              <Input
                id="uin"
                placeholder="e.g. V-A-80063"
                value={uin}
                onChange={(e) => setUin(e.target.value)}
                className="bg-black/30 border-white/20 text-white h-11"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-semibold text-white/75">Vulnerability Factors</Label>
              <div className="space-y-2">
                {RISK_FACTORS.map((factor) => (
                  <div
                    key={factor}
                    className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                    onClick={() => toggleFactor(factor)}
                  >
                    <Checkbox checked={selectedFactors.includes(factor)} onCheckedChange={() => toggleFactor(factor)} />
                    <Label className="text-sm text-white/90 cursor-pointer font-medium">{factor}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <Label className="text-sm font-semibold text-[#8BE84A]">Assigned Risk Level</Label>
              <RadioGroup value={assignedLevel} onValueChange={(v) => setAssignedLevel(v as 'Low' | 'Medium' | 'High')} className="flex gap-5">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Low" id="r1" />
                  <Label htmlFor="r1" className="text-white">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Medium" id="r2" />
                  <Label htmlFor="r2" className="text-white">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="High" id="r3" />
                  <Label htmlFor="r3" className="text-white">High</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAssessment}
              disabled={loading}
              className="w-full h-12 rounded-full btn-emerald-gradient font-semibold text-sm gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
              <span>Generate AI Rationale</span>
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass-panel rounded-3xl border-white/15 flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg font-bold text-white">
                <span>Intelligence Report</span>
                {result && <Sparkles className="h-5 w-5 text-[#6CE429]" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 text-white/50">
                  <Activity className="h-14 w-14 text-[#6CE429]/60" />
                  <p className="text-sm font-medium">Awaiting client parameters to generate rationale.</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-3 text-white">
                  <Loader2 className="h-10 w-10 animate-spin text-[#6CE429]" />
                  <p className="text-sm font-semibold">Generating clinical rationale...</p>
                </div>
              )}

              {result && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-white/60">Client ID</Label>
                      <div className="text-lg font-bold text-white tabular-nums">{uin}</div>
                    </div>
                    <div className="text-right">
                      <Label className="text-xs text-white/60">Risk Category</Label>
                      <div
                        className={cn(
                          'text-lg font-bold',
                          assignedLevel === 'High'
                            ? 'text-red-400'
                            : assignedLevel === 'Medium'
                            ? 'text-amber-400'
                            : 'text-[#6CE429]'
                        )}
                      >
                        {assignedLevel}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/60">Automated Summary</Label>
                    <p className="text-sm leading-relaxed text-white/90 bg-black/30 p-4 rounded-2xl border border-white/10">
                      {result.summary}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/60">Clinical Rationale</Label>
                    <p className="text-sm leading-relaxed text-white/85 border-l-2 border-[#6CE429] pl-4 py-1">
                      {result.rationale}
                    </p>
                  </div>

                  {assignedLevel === 'High' && (
                    <div className="bg-amber-500/15 border border-amber-400/35 p-4 rounded-2xl flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-300">Critical Follow-up Required</p>
                        <p className="text-xs text-white/80">Trigger weekly outreach protocol for node {uin}.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </div>

          {result && (
            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-full bg-white/5 border-white/20 text-white"
                onClick={() => {
                  setResult(null);
                  setUin('');
                  setSelectedFactors([]);
                }}
              >
                Clear
              </Button>
              <Button
                className="flex-1 h-11 rounded-full btn-emerald-gradient font-semibold"
                onClick={() => toast({ title: 'Committed to Sync Queue', description: `Assessment for ${uin} queued.` })}
              >
                Add to Sync Queue
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
