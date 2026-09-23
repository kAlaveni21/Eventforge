import { Request, Response } from 'express';
import { getGeminiAI } from '../config/gemini.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Model to use for text tasks
const GEMINI_MODEL = 'gemini-2.5-flash';

// @desc    Generate event description using Gemini API
// @route   POST /api/ai/generate-event-description
// @access  Private (Organizer, Admin)
export const generateEventDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, eventType, keyThemes, targetAudience } = req.body;

    if (!title) {
      sendError(res, 'Please provide an event title', 400);
      return;
    }

    const ai = getGeminiAI();

    if (!ai) {
      // High quality fallback if API key is not configured in local preview
      const fallbackDescription = `Join industry leaders and innovators at ${title}. This premier ${eventType || 'Conference'} brings together professionals across ${category || 'Technology'} to explore cutting-edge developments, hands-on strategies, and actionable takeaways. Experience keynote sessions, engaging panel discussions, and unmatched networking opportunities designed to elevate your career and accelerate business growth.`;
      sendSuccess(res, { description: fallbackDescription, provider: 'fallback' });
      return;
    }

    const prompt = `You are a world-class corporate event marketing strategist. Write an engaging, persuasive, and professional event description for an upcoming event called "${title}".
Category: ${category || 'Corporate/Tech'}
Event Type: ${eventType || 'Conference'}
Key Themes: ${keyThemes || 'Innovation, industry trends, leadership, operational excellence'}
Target Audience: ${targetAudience || 'Executives, professionals, developers, and corporate innovators'}

Format the response in 2-3 compelling paragraphs highlighting the vision, what attendees will learn, and why they cannot miss this event. Do not use markdown headers; provide polished paragraph copy suitable directly for the event details page.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const description = response.text || '';
    sendSuccess(res, { description: description.trim(), provider: 'gemini-2.5-flash' }, 'Event description generated successfully');
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    sendError(res, 'Failed to generate event description with AI', 500, err);
  }
};

// @desc    Generate / polish speaker biography
// @route   POST /api/ai/generate-speaker-bio
// @access  Private (Organizer, Speaker, Admin)
export const generateSpeakerBio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, designation, company, rawBio, topics } = req.body;

    if (!name || !designation) {
      sendError(res, 'Please provide speaker name and designation', 400);
      return;
    }

    const ai = getGeminiAI();

    if (!ai) {
      const fallbackBio = `${name} is currently ${designation} at ${company || 'industry leading organizations'}. With a proven track record in ${topics || 'technology and leadership'}, ${name} has led pivotal initiatives transforming modern business operations. Known for insightful keynote presentations, ${name} shares practical strategies for navigating today's complex corporate landscape.`;
      sendSuccess(res, { bio: fallbackBio, provider: 'fallback' });
      return;
    }

    const prompt = `You are an executive talent publicist. Write an authoritative, inspiring, third-person professional biography for a featured conference speaker:
Name: ${name}
Designation: ${designation}
Company: ${company || 'Global Enterprise'}
Notes / Background: ${rawBio || 'Industry veteran and visionary with notable domain leadership'}
Specialties: ${topics || 'Digital transformation, leadership, scaling solutions'}

Keep the bio concise (2 paragraphs, 130-180 words), emphasizing executive authority, industry impact, and stage presence.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const bio = response.text || '';
    sendSuccess(res, { bio: bio.trim(), provider: 'gemini-2.5-flash' }, 'Speaker bio generated');
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    sendError(res, 'Failed to generate speaker bio', 500, err);
  }
};

// @desc    Generate session summary & key takeaways
// @route   POST /api/ai/generate-session-summary
// @access  Private (Organizer, Speaker, Admin)
export const generateSessionSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, rawDescription, speakerName, category } = req.body;

    if (!title) {
      sendError(res, 'Please provide session title', 400);
      return;
    }

    const ai = getGeminiAI();

    if (!ai) {
      sendSuccess(res, {
        summary: `In this session, attendees will discover high-impact architectural patterns and operational strategies for modern systems.`,
        keyTakeaways: [
          `Core methodologies to streamline workflow execution`,
          `Practical patterns for scaling without compromising reliability`,
          `Live case study benchmarks from real-world deployments`,
        ],
        targetLevel: 'Intermediate to Advanced',
        provider: 'fallback',
      });
      return;
    }

    const prompt = `You are a technical conference curator. Given the following session details:
Title: "${title}"
Category: ${category || 'General'}
Speaker: ${speakerName || 'Featured Speaker'}
Description: ${rawDescription || 'Deep dive into emerging best practices and operational mechanics.'}

Generate a structured JSON response with:
1. "summary": A 2-sentence executive summary.
2. "keyTakeaways": An array of 3-4 bullet points detailing tangible attendee benefits.
3. "targetLevel": Target skill level (e.g. "All Levels", "Intermediate", "Advanced").

Respond ONLY with valid JSON with no enclosing markdown fences:
{"summary": "...", "keyTakeaways": ["...", "..."], "targetLevel": "..."}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    let resultText = (response.text || '').trim();
    // Clean potential markdown backticks
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(resultText);
      sendSuccess(res, { ...parsed, provider: 'gemini-2.5-flash' });
    } catch {
      sendSuccess(res, { summary: resultText, provider: 'gemini-2.5-flash' });
    }
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    sendError(res, 'Failed to generate session summary', 500, err);
  }
};

// @desc    Recommend sessions for an attendee based on their role and interests
// @route   POST /api/ai/recommend-sessions
// @access  Private (Attendee, Public)
export const recommendSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, interests, availableSessions } = req.body;

    if (!availableSessions || !Array.isArray(availableSessions) || availableSessions.length === 0) {
      sendError(res, 'Please provide an array of available sessions to evaluate', 400);
      return;
    }

    const ai = getGeminiAI();

    if (!ai) {
      // Pick the first 3 sessions with fallback recommendations
      const recommendations = availableSessions.slice(0, 3).map((s: any, idx: number) => ({
        sessionId: s.id || s._id,
        title: s.title,
        matchScore: 95 - idx * 5,
        reason: `Aligns with interest in ${interests || 'core enterprise topics'} and role as ${role || 'Attendee'}.`,
      }));
      sendSuccess(res, { recommendations, provider: 'fallback' });
      return;
    }

    const sessionListString = availableSessions
      .map((s: any) => `ID: ${s._id || s.id} | Title: ${s.title} | Category: ${s.category || 'General'} | Room: ${s.room || 'Main'}`)
      .join('\n');

    const prompt = `You are an AI conference concierge. An attendee with role "${role || 'Professional'}" and interests in "${interests || 'Technology, Cloud, Leadership'}" is looking for personalized recommendations from this schedule:

${sessionListString}

Select top 3-4 sessions that best match their profile. Return ONLY a valid JSON array of recommendations:
[
  {
    "sessionId": "ID from list",
    "title": "Title from list",
    "matchScore": 95,
    "reason": "Clear 1-sentence explanation of why this matches their background"
  }
]
No markdown fences, only the JSON array.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    let resultText = (response.text || '').trim();
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const recommendations = JSON.parse(resultText);
      sendSuccess(res, { recommendations, provider: 'gemini-2.5-flash' });
    } catch {
      sendSuccess(res, { recommendations: availableSessions.slice(0, 3), provider: 'fallback' });
    }
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    sendError(res, 'Failed to recommend sessions', 500, err);
  }
};
