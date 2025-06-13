'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  Sparkles,
  FileText,
  Mail,
  Building,
  User,
  Briefcase,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import defaultResume from '@/data/resume.json';
import { GeminiService } from '@/lib/gemini';
import CopySection from '@/components/ui/CopySelection';



export default function Home() {
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    jobDescription: '',
  });
  useEffect(() => {
    const savedData = localStorage.getItem('AI_RESUME_OPTIMIZER_FORM_DATA');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(prev => ({
        ...prev,
        companyName: parsedData.companyName || '',
        role: parsedData.role || '',
        jobDescription: parsedData.jobDescription || '',
      }));
    }
  }, [])

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    resume: any;
    coverLetter: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    localStorage.setItem('AI_RESUME_OPTIMIZER_FORM_DATA', JSON.stringify(formData));
  };

  const handleOptimize = async () => {
    if (!formData.companyName || !formData.role || !formData.jobDescription) {
      setError('Please fill in all fields including your Gemini API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const geminiService = new GeminiService();
      const result = await geminiService.generateOptimizedResume(
        formData.companyName,
        formData.role,
        formData.jobDescription,
        defaultResume
      );
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resume');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResume = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results.resume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-resume.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCoverLetter = () => {
    if (!results) return;
    const blob = new Blob([results.coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const ResumeDisplay = ({ resume, title }: { resume: any; title: string }) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            <CopySection copyData={resume.title}>
              <div>
                <h3 className="text-xl font-bold">{resume.name}</h3>
                <p className="text-muted-foreground">{resume.title}</p>
              </div>
            </CopySection>

            <CopySection copyData={resume.profile}>
              <div>
                <h4 className="font-semibold mb-2">Profile</h4>
                <p className="text-sm">{resume.profile}</p>
              </div>
            </CopySection>

            <div>
              <h4 className="font-semibold mb-3">Work Experience</h4>
              <div className="space-y-4">
                {resume.work_experience?.map((exp: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary/20 pl-4">
                    <h5 className="font-medium">{exp.Role}</h5>
                    <p className="text-sm text-muted-foreground">{exp["Company Name"]}</p>
                    <p className="text-xs text-muted-foreground mb-2">{exp["Project/Team Involvement"]}</p>
                    {exp["Overall contribution"] && (
                      <CopySection copyData={exp["Overall contribution"]}>
                        <p className="text-sm font-[300] mb-2">{exp["Overall contribution"]}</p>
                      </CopySection>
                    )}
                    {exp["Experience Points"] && (
                      <div className="space-y-2">
                        {Array.isArray(exp["Experience Points"]) &&
                          exp["Experience Points"].map((point: any, pointIndex: number) => (
                            <div key={pointIndex}>
                              {typeof point === 'string' ? (
                                <CopySection copyData={point}>
                                  <p className="text-sm">• {point}</p>
                                </CopySection>
                              ) : (
                                <div>
                                  <p className="font-medium text-sm">{point.Application}</p>
                                  <CopySection copyData={point.Details}>
                                    {point.Details?.map((detail: string, detailIndex: number) => (
                                      <p key={detailIndex} className="text-xs ml-2">• {detail}</p>
                                    ))}
                                  </CopySection>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-3'>Bespoke Projects</h4>
              <div className="space-y-4">
                {resume.projects?.map((project: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary/20 pl-4">
                    <h5 className="font-medium">{project.title}</h5>
                    <CopySection copyData={project["description"]}>
                      {project["description"] && (
                        <div className="space-y-2">
                          {Array.isArray(project["description"]) &&
                            project["description"].map((point: any, pointIndex: number) => (
                              <div key={pointIndex}>
                                {typeof point === 'string' ? (
                                  <p className="text-sm">• {point}</p>
                                ) : (
                                  <div>
                                    <p className="font-medium text-sm">{point.Application}</p>
                                    {point.Details?.map((detail: string, detailIndex: number) => (
                                      <p key={detailIndex} className="text-xs ml-2">• {detail}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </CopySection>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Skills</h4>
              <div className="space-y-3">
                {Object.entries(resume.skills || {}).map(([category, skills]) => (
                  <div key={category}>
                    <h5 className="text-sm font-medium mb-2 capitalize">{category.replace('_', ' ')}</h5>
                    <div className="flex flex-wrap gap-1">
                      {(skills as string[]).map((skill, index) => (
                        <CopySection key={index} copyData={skill}>
                          <Badge variant="secondary" className="text-xs px-10">
                            {skill}
                          </Badge>
                        </CopySection>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {resume.expertise && (
              <CopySection copyData={resume.expertise}>
                <div>
                  <h4 className="font-semibold mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {resume.expertise.map((item: string, index: number) => (
                      <CopySection key={index} copyData={item}>
                        <Badge key={index} variant="outline" className="text-xs px-10">
                          {item}
                        </Badge>
                      </CopySection>
                    ))}
                  </div>
                </div>
              </CopySection>
            )}

            {resume.achievements && (
              <CopySection copyData={resume.achievements}>
                <div>
                  <h4 className="font-semibold mb-3">Achievements</h4>
                  {resume.achievements.map((achievement: any, index: number) => (
                    <div key={index} className="mb-3">
                      <h5 className="font-medium">{achievement.title}</h5>
                      <p className="text-sm text-muted-foreground">{achievement.location} • {achievement.dates}</p>
                      <p className="text-sm">• {achievement.description}</p>
                      {achievement.project && <p className="text-sm">• {achievement.project}</p>}
                    </div>
                  ))}
                </div>
              </CopySection>
            )}

            {resume.qualities && (
              <CopySection copyData={resume.qualities}>
                <div>
                  <h4 className="font-semibold mb-2">Qualities</h4>
                  <div className="flex flex-wrap gap-1">
                    {resume.qualities.map((quality: string, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {quality}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CopySection>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Resume Optimizer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your resume into an ATS-friendly powerhouse with AI-powered optimization
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Job Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google, Microsoft, Apple"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="border-2 border-dashed border-gray-300 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Target Role
              </Label>
              <Input
                id="role"
                placeholder="e.g., Senior Full Stack Developer, Product Manager"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="border-2 border-dashed border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Job Description
              </Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the complete job description here..."
                value={formData.jobDescription}
                onChange={(e) => {
                  handleInputChange('jobDescription', e.target.value)
                  localStorage.setItem('AI_RESUME_OPTIMIZER_FORM_DATA', JSON.stringify({
                    ...formData,
                    jobDescription: e.target.value
                  }));
                }}
                className="min-h-[200px] border-2 border-dashed border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleOptimize}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Optimize Resume with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Success Alert */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your resume has been successfully optimized! Download the results below.
              </AlertDescription>
            </Alert>

            {/* Download Buttons */}
            <div className="flex gap-4 justify-center">
              <Button onClick={downloadResume} className="bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </Button>
              <Button onClick={downloadCoverLetter} variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Download Cover Letter
              </Button>
            </div>

            {/* Results Tabs */}
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="optimized">Optimized Resume</TabsTrigger>
                <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResumeDisplay resume={defaultResume} title="Original Resume" />
                  <ResumeDisplay resume={results.resume} title="Optimized Resume" />
                </div>
              </TabsContent>

              <TabsContent value="optimized" className="mt-6">
                <ResumeDisplay resume={results.resume} title="Your Optimized Resume" />
              </TabsContent>

              <TabsContent value="cover-letter" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Generated Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {results.coverLetter}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Original Resume Display */}
        {!results && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Your Current Resume</h2>
            <ResumeDisplay resume={defaultResume} title="Current Resume" />
          </div>
        )}
      </div>
    </div>
  );
}