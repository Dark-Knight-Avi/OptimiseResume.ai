
interface GenerateContentResponse {
  resume: any;
  coverLetter: string;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    this.apiKey = "AIzaSyDfEmD1AsOG6KWFatjGWxG9ezFfncOYTI0";
  }

  async generateOptimizedResume(
    companyName: string,
    role: string,
    jobDescription: string,
    resumeJson: any
  ): Promise<GenerateContentResponse> {
    const prompt = `I will give you a structured resume.json containing all of my current skills, expertise, experiences, education, and achievements. Along with that, I will also provide:

The Company Name I'm applying to: ${companyName}

The Role I'm targeting: ${role}

The Full Job Description (JD) of the role: ${jobDescription}

Your task is to:

Carefully analyze the Job Description and extract keywords, responsibilities, and values that are prioritized for the role.

Compare that with my current resume content (from the given resume.json) and revise, rewrite, and reorganize the resume.json to:

✅ Maximize ATS compatibility using industry-specific and JD-specific keywords

✅ Optimize section titles, summary, experiences, and skills for better ranking in automated systems and HR scans

✅ Showcase leadership, initiative, and value alignment towards the JD

✅ Present the profile in a format that is impactful, concise, and HR-friendly

✅ Ensure no plagiarism, and keep the language natural but strategic

✅ Very Very Important: Ensure the word counts should match as it is present in the resume.json's every section's every points 

All updated sections should be internally consistent with the candidate's background, but highlight alignment with the role and company.

Finally, output the revised resume.json, formatted exactly like the original schema.

Also, create a professional cover letter for this application.

Please provide your response in the following JSON format:
{
  "resume": { /* the optimized resume.json here */ },
  "coverLetter": "/* the cover letter text here */"
}

resume.json:
${JSON.stringify(resumeJson, null, 2)}`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse JSON response from Gemini');
      }

      const result = JSON.parse(jsonMatch[0]);
      return result;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }
}