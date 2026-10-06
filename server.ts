import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatHistoryItem {
  sender: 'user' | 'assistant';
  content: string;
}

// Endpoint to extract text from uploaded files (PDF, TXT, etc.)
app.post('/api/materials/extract-text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, fileType, fileContentBase64, textContent } = req.body;

    if (textContent && typeof textContent === 'string' && textContent.trim()) {
      const trimmed = textContent.trim();
      res.json({
        text: trimmed,
        pageCount: Math.max(1, Math.ceil(trimmed.length / 2000)),
        summary: trimmed.slice(0, 220) + (trimmed.length > 220 ? '...' : ''),
      });
      return;
    }

    if (!fileContentBase64) {
      res.status(400).json({ error: 'File content is required.' });
      return;
    }

    const buffer = Buffer.from(fileContentBase64, 'base64');
    let extractedText = '';
    let pageCount = 1;

    const lowerName = (fileName || '').toLowerCase();
    const isPdf = fileType === 'pdf' || lowerName.endsWith('.pdf');
    const isTxt = fileType === 'txt' || lowerName.endsWith('.txt') || lowerName.endsWith('.md');

    if (isPdf) {
      try {
        const pdfModule = await import('pdf-parse');
        const PDFParserClass = (pdfModule as any).PDFParse || (pdfModule as any).default?.PDFParse;
        if (typeof PDFParserClass === 'function') {
          const parser = new PDFParserClass({ data: new Uint8Array(buffer) });
          await parser.load();
          const textResult = await parser.getText();
          if (typeof textResult === 'string') {
            extractedText = textResult.trim();
          } else if (textResult && typeof (textResult as any).text === 'string') {
            extractedText = (textResult as any).text.trim();
          } else if (textResult && Array.isArray((textResult as any).pages)) {
            extractedText = (textResult as any).pages.map((p: any) => p.text || '').join('\n').trim();
          } else {
            extractedText = String(textResult || '').trim();
          }
          pageCount = (parser as any).doc?.numPages || (textResult as any)?.total || 1;
        } else {
          const fn = (pdfModule as any).default || pdfModule;
          if (typeof fn === 'function') {
            const parsed = await fn(buffer);
            extractedText = parsed.text ? parsed.text.trim() : '';
            pageCount = parsed.numpages || 1;
          }
        }
      } catch (pdfErr: any) {
        console.warn('pdf-parse error, falling back to text stream:', pdfErr?.message);
        const rawStr = buffer.toString('latin1');
        const printable = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        extractedText = printable.slice(0, 15000);
      }
    } else if (fileType === 'docx' || lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
      try {
        const mammothModule = await import('mammoth');
        const mammoth = (mammothModule as any).default || mammothModule;
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value ? result.value.trim() : '';
        pageCount = Math.max(1, Math.ceil(extractedText.length / 2000));
      } catch (docxErr: any) {
        console.warn('mammoth extraction error, falling back to string extract:', docxErr?.message);
        const rawStr = buffer.toString('utf-8');
        extractedText = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        pageCount = Math.max(1, Math.ceil(extractedText.length / 2000));
      }
    } else if (isTxt) {
      extractedText = buffer.toString('utf-8').trim();
      pageCount = Math.max(1, Math.ceil(extractedText.length / 2000));
    } else {
      const rawStr = buffer.toString('utf-8');
      extractedText = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      pageCount = Math.max(1, Math.ceil(extractedText.length / 2000));
    }

    if (!extractedText) {
      extractedText = `Uploaded document: ${fileName}. Content indexed and ready for AI Sathi Q&A.`;
    }

    const cleanSummary = extractedText
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220) + (extractedText.length > 220 ? '...' : '');

    res.json({
      text: extractedText,
      pageCount,
      summary: cleanSummary,
    });
  } catch (err: any) {
    console.error('Error in /api/materials/extract-text:', err);
    res.status(500).json({ 
      error: err?.message || 'Failed to extract text from file.' 
    });
  }
});

// AI Sathi Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      message, 
      explanationMode = 'exam-ready', 
      language = 'English', 
      subject = 'General College Curriculum', 
      fromMaterial = false,
      studyMaterialContext = '',
      studyMaterialName = '',
      history = [] 
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY to enable AI chat.' 
      });
      return;
    }

    // Explanation Mode Prompts
    let modeGuidance = '';
    switch (explanationMode) {
      case 'simple':
        modeGuidance = 'Explain using very simple and intuitive language, beginner-friendly terms, and relatable real-life analogies. Avoid heavy jargon.';
        break;
      case 'detailed':
        modeGuidance = 'Provide a deep, rigorous conceptual breakdown including theoretical foundation, mathematical derivations, or architecture if relevant.';
        break;
      case 'exam-ready':
        modeGuidance = 'Provide a structured answer tailored for a 5-mark or 7-mark college university exam. Include clear headings, definitions, syntax/diagram references, and high-yield bullet points expected by examiners.';
        break;
      case 'quick-revision':
        modeGuidance = 'Provide a concise, last-minute revision summary highlighting 3-5 core points, formulas, key definitions, and exam traps.';
        break;
      default:
        modeGuidance = 'Explain clearly and step-by-step with practical examples.';
    }

    // Language Guidance
    let languageGuidance = '';
    if (language === 'Hindi') {
      languageGuidance = 'Respond in clear and natural Hindi or conversational Hinglish (Hindi mixed with standard English technical terms like class, object, inheritance, algorithm, process, matrix, etc.) suitable for an Indian college student. Keep technical keywords in English for examination clarity.';
    } else {
      languageGuidance = 'Respond in clear, accessible English suitable for college and university students.';
    }

    // Study Material Grounding
    let materialGrounding = '';
    const hasStudyMaterial = Boolean(studyMaterialContext && studyMaterialContext.trim());

    if (hasStudyMaterial) {
      materialGrounding = `
SELECTED STUDY MATERIAL CONTEXT:
The student has selected their uploaded study material: "${studyMaterialName || 'Selected Study Material'}"

--- BEGIN STUDY MATERIAL CONTENT ---
${studyMaterialContext.trim()}
--- END STUDY MATERIAL CONTENT ---

STRICT GROUNDING RULES FOR SELECTED STUDY MATERIAL:
1. The student is asking this question based on their selected study material above. You must answer primarily using the facts, definitions, and concepts provided in the Study Material Content.
2. If the topic or question is covered in the study material, base your answer directly upon it and cite key definitions from it.
3. CRITICAL: If the answer CANNOT be found in the provided study material, you MUST explicitly begin your response with this exact sentence:
"I couldn't find this information in your selected study material (${studyMaterialName || 'Selected Material'}). I can still explain it using general knowledge."
followed by your general explanation. Do NOT pretend that the information was present in the material.`;
    }

    const systemInstruction = `You are Sathi AI, a friendly and reliable study companion for college students. Explain academic concepts clearly and simply. Use examples and step-by-step explanations when useful. If the student asks for an exam-ready answer, provide a well-structured answer suitable for college examinations. Do not unnecessarily complicate simple questions.

Context & Guidelines:
- Primary Subject: ${subject}
- Explanation Mode: ${modeGuidance}
- Preferred Language: ${languageGuidance}
- Formatting: Use clean Markdown with headers, bullet points, and code formatting where applicable. Keep responses focused and readable.
${materialGrounding}`;

    // Map conversation history to Gemini contents format
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      // Limit to last 6 messages for context window efficiency
      const recentHistory = history.slice(-6);
      for (const item of recentHistory as ChatHistoryItem[]) {
        if (item.content && item.sender) {
          contents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        }
      }
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Call Gemini with retry and fallback for high demand spikes
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let replyText = '';
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });
        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} temporary issue, checking next fallback:`, err?.message || err);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!replyText) {
      throw lastError || new Error('Could not generate response. Please try again.');
    }

    // Generate 3 contextual follow-up questions
    let followUps: string[] = [];
    if (explanationMode === 'exam-ready') {
      followUps = [
        'Ask me 3 viva questions on this topic',
        'Show a code or numerical example',
        'What are the common exam pitfalls for this question?',
      ];
    } else if (explanationMode === 'simple') {
      followUps = [
        'Give me another real-life example',
        'How would I explain this in an interview?',
        'Now give me an exam-ready answer',
      ];
    } else {
      followUps = [
        'Create 3 MCQs from this topic',
        'Give me a 7-mark model answer',
        'What are the key viva questions?',
      ];
    }

    res.json({
      text: replyText,
      explanationMode: explanationMode,
      suggestedFollowUps: followUps,
      usedMaterial: hasStudyMaterial,
      sourceMaterialName: hasStudyMaterial ? studyMaterialName : undefined,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ 
      error: error?.message || 'An error occurred while contacting Sathi AI. Please try again.' 
    });
  }
});

// Helper to call Gemini and extract JSON
async function generateGeminiJson<T>(prompt: string, systemInstruction: string, fallbackData: T): Promise<T> {
  if (!apiKey) {
    return fallbackData;
  }
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.5,
          responseMimeType: 'application/json',
        },
      });
      if (response.text) {
        let cleanText = response.text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        return JSON.parse(cleanText) as T;
      }
    } catch (e: any) {
      console.warn(`Gemini JSON parse/call error on ${model}:`, e?.message);
    }
  }
  return fallbackData;
}

// Phase 3: AI Quiz Generation Endpoint
app.post('/api/quiz/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      subject = 'Machine Learning',
      topic = 'General Syllabus',
      difficulty = 'Medium',
      questionCount = 5,
      fromMaterial = false,
      studyMaterialContext = '',
      studyMaterialName = '',
    } = req.body;

    const count = Math.min(20, Math.max(3, parseInt(questionCount, 10) || 5));

    let materialText = '';
    if (fromMaterial && studyMaterialContext && studyMaterialContext.trim()) {
      materialText = `\nSOURCE MATERIAL CONTEXT (${studyMaterialName}):\n${studyMaterialContext.trim().slice(0, 15000)}\nGenerate questions STRICTLY based on the source material above.`;
    }

    const systemInstruction = `You are Sathi AI, an academic exam engine for Indian college students.
Generate ${count} university-level multiple-choice questions (MCQs) for the subject "${subject}" and topic "${topic}".
Difficulty level: ${difficulty}.

Return ONLY valid JSON matching this exact TypeScript structure:
{
  "questions": [
    {
      "id": "q-1",
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Clear explanation of why this answer is correct and why other options are wrong.",
      "topic": "${topic}"
    }
  ]
}
Rules:
- Provide exactly 4 options per question.
- correctAnswerIndex must be 0, 1, 2, or 3.
- Questions must be rigorous and test real conceptual understanding.
- Do NOT repeat questions.
${materialText}`;

    const prompt = `Generate ${count} ${difficulty} level MCQs for college student preparing for ${subject} exams on topic "${topic}".`;

    const fallbackQuestions = [
      {
        id: `q-fb-1-${Date.now()}`,
        question: `What is the primary operational principle in ${topic} within ${subject}?`,
        options: [
          'Minimizing empirical risk while maximizing generalization accuracy',
          'Linear projection without regularization constraints',
          'Heuristic state traversal without memory bounds',
          'Asynchronous checkpointing across distributed clusters'
        ],
        correctAnswerIndex: 0,
        explanation: 'In core academic curriculum, minimizing empirical risk while retaining generalization capability is fundamental.',
        topic: topic,
      },
      {
        id: `q-fb-2-${Date.now()}`,
        question: `Which metric is most commonly evaluated when testing ${topic}?`,
        options: [
          'Execution latency and memory complexity bounds',
          'Unbounded gradient divergence',
          'Constant polynomial variance',
          'Static register allocation overhead'
        ],
        correctAnswerIndex: 0,
        explanation: 'Performance evaluation prioritizes time and space complexity trade-offs under standard benchmark conditions.',
        topic: topic,
      },
      {
        id: `q-fb-3-${Date.now()}`,
        question: `How does increasing the complexity parameter affect the bias-variance trade-off in ${topic}?`,
        options: [
          'Decreases bias but increases variance (risk of overfitting)',
          'Increases bias and increases variance simultaneously',
          'Decreases both bias and variance to zero',
          'Has zero impact on model generalization'
        ],
        correctAnswerIndex: 0,
        explanation: 'Higher model complexity fits training points tightly, reducing bias but risking higher variance on unseen data.',
        topic: topic,
      },
      {
        id: `q-fb-4-${Date.now()}`,
        question: `What is a critical limitation or constraint of standard algorithms in ${topic}?`,
        options: [
          'Sensitivity to feature scale and high-dimensional noise',
          'Inability to process floating-point arithmetic',
          'Deterministic execution guarantees',
          'Linear convergence rate on convex sets'
        ],
        correctAnswerIndex: 0,
        explanation: 'Unscaled data and high-dimensional curse of dimensionality are common challenges discussed in university questions.',
        topic: topic,
      },
      {
        id: `q-fb-5-${Date.now()}`,
        question: `In university examinations, which step is essential when implementing ${topic}?`,
        options: [
          'Input validation, feature normalization, and metric calibration',
          'Omitting boundary condition verification',
          'Hardcoding training hyperparameters in source',
          'Bypassing test set isolation'
        ],
        correctAnswerIndex: 0,
        explanation: 'Normalization and formal metric evaluation are mandatory high-yield points for exam marks.',
        topic: topic,
      },
    ];

    const result = await generateGeminiJson<{ questions: any[] }>(
      prompt,
      systemInstruction,
      { questions: fallbackQuestions.slice(0, count) }
    );

    res.json({
      questions: (result.questions || fallbackQuestions).map((q: any, i: number) => ({
        id: q.id || `q-${i + 1}-${Date.now()}`,
        question: q.question || `Question ${i + 1} on ${topic}`,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3 ? q.correctAnswerIndex : 0,
        explanation: q.explanation || 'Refer to the textbook and lecture notes for detailed conceptual breakdown.',
        topic: q.topic || topic,
      })),
    });
  } catch (err: any) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate quiz.' });
  }
});

// Phase 6: Quick Revision Notes Generator
app.post('/api/revision/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      subject = 'Machine Learning',
      topic = 'KNN & Classification',
      language = 'English',
      studyMaterialContext = '',
      studyMaterialName = '',
    } = req.body;

    const langInstruction = language === 'Hindi'
      ? 'Explain in clear conversational Hinglish / Hindi suitable for Indian college students, keeping core technical terms in English.'
      : 'Explain in crisp, high-yield English suitable for college examinations.';

    let materialContext = '';
    if (studyMaterialContext) {
      materialContext = `\nSELECTED MATERIAL (${studyMaterialName}):\n${studyMaterialContext.slice(0, 12000)}`;
    }

    const systemInstruction = `You are Sathi AI, an exam revision specialist for Indian college students.
Generate a structured, last-minute Quick Revision Sheet for:
Subject: ${subject}
Topic: ${topic}
${langInstruction}
${materialContext}

Return ONLY valid JSON matching this schema:
{
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "importantDefinitions": [
    { "term": "Term 1", "definition": "Clear concise definition" },
    { "term": "Term 2", "definition": "Clear concise definition" }
  ],
  "importantFormulas": ["Formula or Rule 1", "Formula or Rule 2"],
  "importantPoints": ["Key exam takeaway 1", "Key exam takeaway 2", "Key exam takeaway 3"],
  "commonMistakes": ["Common exam mistake students make 1", "Common mistake 2"],
  "revisionQuestions": [
    { "q": "Quick question 1?", "a": "Crisp answer 1" },
    { "q": "Quick question 2?", "a": "Crisp answer 2" },
    { "q": "Quick question 3?", "a": "Crisp answer 3" },
    { "q": "Quick question 4?", "a": "Crisp answer 4" },
    { "q": "Quick question 5?", "a": "Crisp answer 5" }
  ]
}`;

    const fallback = {
      keyConcepts: [
        `${topic} fundamental architecture and working mechanism`,
        'Mathematical formulation and algorithmic steps',
        'Time and space complexity trade-offs for examinations',
      ],
      importantDefinitions: [
        { term: topic, definition: `The primary algorithmic paradigm for solving problems in ${subject}.` },
        { term: 'Optimal Convergence', definition: 'The state where further parameter adjustments yield diminishing loss reduction.' }
      ],
      importantFormulas: [
        'Objective Function: Minimize Loss(y_true, y_pred) + λ * Regularizer',
        'Time Complexity: O(n * d) under standard linear formulation',
      ],
      importantPoints: [
        'Always check feature normalization before distance or gradient computations.',
        'High-dimensional spaces induce sparsity (curse of dimensionality).',
        'Include clear diagrams and step-by-step pseudo-code in university answer sheets.',
      ],
      commonMistakes: [
        'Confusing bias and variance during complexity scaling.',
        'Forgetting to mention edge cases and tie-breaking conditions in exams.',
      ],
      revisionQuestions: [
        { q: `What is the core idea of ${topic}?`, a: 'Solving classification or optimization by local neighbor consensus or iterative descent.' },
        { q: 'Why is normalization essential?', a: 'To prevent large-scale attributes from disproportionately dominating distance metrics.' },
        { q: 'What happens if complexity is set too high?', a: 'The model overfits training noise, leading to high variance on test data.' },
        { q: 'How do you handle tie votes?', a: 'Use odd values of K or distance-weighted voting schemes.' },
        { q: 'State one real-world application.', a: 'Recommendation engines, anomaly detection, and handwriting recognition.' },
      ]
    };

    const result = await generateGeminiJson(
      `Generate complete quick revision sheet for ${topic} in ${subject}.`,
      systemInstruction,
      fallback
    );

    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/revision/generate:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate revision sheet.' });
  }
});

// Phase 7: Study Planner Generator
app.post('/api/planner/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      targetDate = 'In 2 weeks',
      subjects = ['Machine Learning', 'Operating Systems', 'Java OOP'],
      topics = ['Classification', 'CPU Scheduling', 'Inheritance'],
      dailyHours = 2,
      priority = 'High',
    } = req.body;

    const subjectsStr = Array.isArray(subjects) ? subjects.join(', ') : String(subjects);
    const topicsStr = Array.isArray(topics) ? topics.join(', ') : String(topics);

    const systemInstruction = `You are Sathi AI, an academic mentor for college students preparing for semester exams.
Create a realistic, structured 7-day study plan leading up to: ${targetDate}.
Subjects: ${subjectsStr}
Topics: ${topicsStr}
Daily Study Time: ${dailyHours} hours/day
Priority Level: ${priority}

Return ONLY valid JSON with this schema:
{
  "planTitle": "7-Day High-Yield Exam Preparation Plan",
  "summary": "Concise overview of targets",
  "dailyTargetHours": ${dailyHours},
  "days": [
    {
      "day": 1,
      "title": "Day 1 Focus",
      "subject": "Subject Name",
      "topic": "Topic Name",
      "durationMinutes": 120,
      "type": "study",
      "tasks": [
        "Task 1: Concept breakdown (45 mins)",
        "Task 2: Solve 2 previous year questions (45 mins)",
        "Task 3: Take 5-question Sathi practice drill (30 mins)"
      ]
    }
  ]
}
Rules:
- Include 7 distinct days.
- Include a mix of: deep study ('study'), active revision ('revision'), assessment drills ('quiz'), and weak-topic reinforcement ('weak-topic').
- Make tasks specific, realistic, and motivating.`;

    const fallback = {
      planTitle: '7-Day Semester Exam Acceleration Plan',
      summary: `Dedicated ${dailyHours}h/day preparation strategy covering ${subjectsStr} with spaced repetition and quiz drills.`,
      dailyTargetHours: dailyHours,
      days: [
        {
          day: 1,
          title: 'Foundations & High-Yield Units',
          subject: subjects[0] || 'Machine Learning',
          topic: topics[0] || 'Classification & KNN',
          durationMinutes: dailyHours * 60,
          type: 'study',
          tasks: [
            'Read Unit notes and highlight distance formulas (45 min)',
            'Write down 5-mark answer structure for KNN algorithm (40 min)',
            'Attempt 5-question Sathi Practice Quiz to test recall (35 min)',
          ]
        },
        {
          day: 2,
          title: 'Algorithmic Drills & Code Practice',
          subject: subjects[1] || 'Operating Systems',
          topic: topics[1] || 'CPU Scheduling & Banker’s Algorithm',
          durationMinutes: dailyHours * 60,
          type: 'study',
          tasks: [
            'Review Gantt chart calculations for Round Robin and SJF (50 min)',
            'Solve deadlock prevention numerical with Safety Algorithm (45 min)',
            'Take 10-question MCQ drill (25 min)',
          ]
        },
        {
          day: 3,
          title: 'OOP Concepts & Viva Drills',
          subject: subjects[2] || 'Java OOP',
          topic: topics[2] || 'Inheritance & Interfaces',
          durationMinutes: dailyHours * 60,
          type: 'study',
          tasks: [
            'Revise super keyword, method overriding rules, and dynamic dispatch (45 min)',
            'Write clean Java code examples for multiple inheritance using interfaces (45 min)',
            'Ask Sathi 5 viva questions on OOP concepts (30 min)',
          ]
        },
        {
          day: 4,
          title: 'Mid-Plan Diagnostics & Weak Topic Revision',
          subject: subjects[0] || 'Machine Learning',
          topic: 'Weak Topics Review',
          durationMinutes: dailyHours * 60,
          type: 'weak-topic',
          tasks: [
            'Review all incorrect answers from previous practice quizzes (40 min)',
            'Summarize confusion points between Euclidean vs Manhattan metrics (40 min)',
            'Retake weak-topic assessment drill (40 min)',
          ]
        },
        {
          day: 5,
          title: '7-Mark University Question Preparation',
          subject: subjects[1] || 'Operating Systems',
          topic: '7-Mark Model Answers',
          durationMinutes: dailyHours * 60,
          type: 'revision',
          tasks: [
            'Memorize 7-mark structured template: Definition, Architecture, Example, Conclusion (40 min)',
            'Practice drawing clear architectural diagrams by hand (40 min)',
            'Ask AI Sathi for exam feedback on structured answer (40 min)',
          ]
        },
        {
          day: 6,
          title: 'Cross-Subject Rapid Fire Revision',
          subject: 'All Subjects',
          topic: 'Comprehensive Cram Sheet',
          durationMinutes: dailyHours * 60,
          type: 'revision',
          tasks: [
            'Review Quick Revision sheets for Units 1 to 5 (50 min)',
            'Solve 15-question full-length assessment drill on Sathi (40 min)',
            'Note down 3 key formulas to review before sleeping (30 min)',
          ]
        },
        {
          day: 7,
          title: 'Pre-Exam Confidence & Mock Test',
          subject: subjects[0] || 'Machine Learning',
          topic: 'Final Mock Drill',
          durationMinutes: dailyHours * 60,
          type: 'quiz',
          tasks: [
            'Simulate 20-question timed exam drill (45 min)',
            'Verify all formulas and high-yield definitions (45 min)',
            'Relax and prepare stationary & hall ticket with peace of mind (30 min)',
          ]
        },
      ]
    };

    const result = await generateGeminiJson(
      `Generate 7-day study plan for ${subjectsStr} (${topicsStr}) targeting ${targetDate}.`,
      systemInstruction,
      fallback
    );

    res.json(result);
  } catch (err: any) {
    console.error('Error generating study plan:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate study plan.' });
  }
});

// Phase 8: AI Summarizer Endpoint for Study Material
app.post('/api/summarizer/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      materialTitle = 'Course Notes',
      materialContent = '',
      length = 'medium', // short | medium | detailed
    } = req.body;

    const lengthGuide = length === 'short'
      ? 'Ultra-crisp: 1-paragraph summary and 5 bullet points'
      : length === 'detailed'
      ? 'In-depth: comprehensive 3-paragraph summary with full topic coverage'
      : 'Standard: balanced 2-paragraph summary with key exam takeaways';

    const systemInstruction = `You are Sathi AI, an expert academic document summarizer for Indian college students.
Summarize the following study material ("${materialTitle}"):
Detail Level: ${lengthGuide}

--- MATERIAL CONTENT ---
${(materialContent || 'Standard course lecture notes').slice(0, 16000)}
--- END MATERIAL ---

Return ONLY valid JSON matching this schema:
{
  "shortSummary": "Clear, engaging summary paragraph.",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "importantTerms": [
    { "term": "Key Term 1", "meaning": "Precise academic definition" },
    { "term": "Key Term 2", "meaning": "Precise academic definition" },
    { "term": "Key Term 3", "meaning": "Precise academic definition" }
  ],
  "examImportantPoints": [
    "High-yield point frequently tested in exams 1",
    "High-yield point 2",
    "Common trap to avoid 3"
  ],
  "quickRevisionNotes": "Compact 150-word cram sheet summarizing the entire document for night-before revision."
}`;

    const fallback = {
      shortSummary: `This document covers essential concepts of ${materialTitle}, explaining fundamental principles, operational trade-offs, and practical implementations required for semester examination excellence.`,
      keyPoints: [
        'Fundamental conceptual formulation and foundational equations.',
        'Algorithmic execution phases and state transition properties.',
        'Time and space complexity characteristics under standard constraints.',
        'Feature scaling and preprocessing prerequisites.',
        'Comparative performance trade-offs against baseline methodologies.',
      ],
      importantTerms: [
        { term: 'Core Mechanism', meaning: 'The central algorithm or pipeline responsible for task execution.' },
        { term: 'Evaluation Metric', meaning: 'The quantitative benchmark used to validate model or process accuracy.' },
        { term: 'Constraint Bound', meaning: 'Upper and lower computational thresholds governing performance.' },
      ],
      examImportantPoints: [
        'Memorize the standard 5-step lifecycle and draw labeled architectural diagrams.',
        'State both advantages and disadvantages explicitly in 7-mark questions.',
        'Verify edge cases and tie-breaking conditions in university problem sheets.',
      ],
      quickRevisionNotes: `${materialTitle} Summary: Understand the core definition, memorize key distance/loss formulas, know the trade-offs between small vs large parameters, and practice 2 numerical examples. Ensure inputs are normalized to score full marks.`
    };

    const result = await generateGeminiJson(
      `Summarize study document ${materialTitle} with ${length} depth.`,
      systemInstruction,
      fallback
    );

    res.json(result);
  } catch (err: any) {
    console.error('Error summarizing material:', err);
    res.status(500).json({ error: err?.message || 'Failed to summarize study material.' });
  }
});

// Phase 9: Important Questions Generator
app.post('/api/important-questions/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      subject = 'Machine Learning',
      topic = 'KNN & Classification',
      unit = 'Unit 3',
      difficulty = 'Exam Level',
    } = req.body;

    const systemInstruction = `You are Sathi AI, a seasoned professor authoring examination questions for Indian university colleges (AKTU, Mumbai University, VTU, Anna University pattern).
Generate high-yield exam questions for Subject: "${subject}", Unit: "${unit}", Topic: "${topic}".

Return ONLY valid JSON matching this schema:
{
  "twoMarkQuestions": [
    { "question": "Define ...?", "answer": "Crisp 2-sentence definition suitable for 2 marks." },
    { "question": "State two advantages of ...?", "answer": "1. Point one. 2. Point two." },
    { "question": "Why is ... required?", "answer": "Reasoning with keyword." }
  ],
  "fiveMarkQuestions": [
    { "question": "Explain the working principle of ... with an example.", "answer": "Structured 5-mark answer with clear bullet points." },
    { "question": "Differentiate between X and Y.", "answer": "Comparative breakdown with key criteria." }
  ],
  "sevenMarkQuestions": [
    {
      "question": "Discuss ... in detail with suitable architectural diagram references and algorithmic steps.",
      "structuredAnswer": {
        "definition": "Clear formal academic definition and introductory overview.",
        "mainExplanation": "Comprehensive technical breakdown with step-by-step logic.",
        "importantPoints": [
          "Key high-yield bullet point 1",
          "Key high-yield bullet point 2",
          "Key high-yield bullet point 3"
        ],
        "example": "Concrete numerical or code illustration demonstrating the concept.",
        "conclusion": "Summary concluding statement highlighting practical applications and limitations."
      }
    }
  ],
  "vivaQuestions": [
    { "question": "Viva Q1?", "answer": "Concise verbal response", "examinerTip": "What the professor is secretly looking for" },
    { "question": "Viva Q2?", "answer": "Concise verbal response", "examinerTip": "Examiner evaluation tip" }
  ]
}`;

    const fallback = {
      twoMarkQuestions: [
        { question: `Define ${topic} in the context of ${subject}.`, answer: `${topic} is a foundational academic concept used to evaluate, classify, or manage computational states under deterministic rules.` },
        { question: `Why is normalization essential in ${topic}?`, answer: 'Normalization rescales features to a uniform range so that attributes with large values do not dominate distance calculations.' },
        { question: 'What is the effect of an extreme parameter value?', answer: 'Extremely small values cause high variance (overfitting), while excessively large values cause high bias (underfitting).' },
      ],
      fiveMarkQuestions: [
        {
          question: `Explain the step-by-step algorithm for ${topic}.`,
          answer: 'Step 1: Ingest and preprocess input vectors.\nStep 2: Compute pairwise distance metrics.\nStep 3: Sort neighbors in ascending order.\nStep 4: Select top-K candidates and perform majority vote.\nStep 5: Return predicted class label.'
        },
        {
          question: `Differentiate between parametric and non-parametric approaches in ${subject}.`,
          answer: '1. Parametric assumes fixed distribution shape; Non-parametric makes no strict prior distribution assumptions.\n2. Parametric trains faster with constant memory; Non-parametric complexity grows with sample count.'
        }
      ],
      sevenMarkQuestions: [
        {
          question: `Explain ${topic} in comprehensive detail with mathematical foundations and practical trade-offs.`,
          structuredAnswer: {
            definition: `${topic} is an instance-based, non-parametric methodology widely employed in ${subject} for classification and numerical estimation without explicit prior model training phases.`,
            mainExplanation: 'The algorithm operates on the principle that similar items exist in close proximity within high-dimensional Euclidean space. Given a query vector, it evaluates distance against stored points, identifies nearest clusters, and assigns the mode of the neighboring labels.',
            importantPoints: [
              'Lazy learner: Zero training time computation, but high query-time inference cost O(n*d).',
              'Distance metric sensitivity: Euclidean, Manhattan, and Minkowski distance options.',
              'Boundary smoothing: Increasing K smooths decision contours, decreasing variance.',
              'Curse of dimensionality: Equidistance phenomena in high dimensions necessitate PCA reduction.'
            ],
            example: 'Consider points P1(2,3) [Class A] and P2(5,4) [Class B]. For query Q(3,3), distance to P1 is 1.0 and to P2 is 2.23. With K=1, Q is unambiguously classified as Class A.',
            conclusion: 'In summary, while computationally demanding at inference, ${topic} provides an intuitive, robust baseline methodology widely applied in anomaly detection and recommendation systems.'
          }
        }
      ],
      vivaQuestions: [
        {
          question: `Can ${topic} be used for regression as well as classification?`,
          answer: 'Yes! For regression, we average the target values of the K nearest neighbors instead of taking a majority vote.',
          examinerTip: 'Examiners check if you know both classification and continuous regression use cases.'
        },
        {
          question: `Why is K chosen as an odd number in binary classification?`,
          answer: 'To prevent tie votes between the two classes.',
          examinerTip: 'Give a direct one-sentence answer immediately without hesitating.'
        }
      ]
    };

    const result = await generateGeminiJson(
      `Generate university exam questions for ${topic} (${unit}) in ${subject}.`,
      systemInstruction,
      fallback
    );

    res.json(result);
  } catch (err: any) {
    console.error('Error generating important questions:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate important questions.' });
  }
});

// Full-stack Vite / Static integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Sathi AI server running on http://0.0.0.0:${port}`);
  });
}

startServer();
