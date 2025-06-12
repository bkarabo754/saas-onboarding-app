import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateOnboardingRecommendations(onboardingData: any) {
  try {
    const prompt = `
    Based on the following user onboarding data, provide personalized SaaS recommendations:
    
    Role: ${onboardingData.role}
    Company: ${onboardingData.company}
    Company Size: ${onboardingData.companySize}
    Primary Goals: ${onboardingData.primaryGoals?.join(', ')}
    Industry: ${onboardingData.industryType}
    Current Challenges: ${onboardingData.currentChallenges?.join(', ')}
    Preferred Features: ${onboardingData.preferredFeatures?.join(', ')}
    Team Size: ${onboardingData.teamSize}
    Budget: ${onboardingData.budget}
    
    Please provide:
    1. Recommended plan (Starter, Professional, or Enterprise)
    2. Top 3 features they should focus on first
    3. Suggested integrations based on their needs
    4. Personalized next steps for getting started
    
    Respond in JSON format with keys: recommendedPlan, topFeatures, suggestedIntegrations, nextSteps
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    // Return fallback recommendations
    return {
      recommendedPlan: 'Professional',
      topFeatures: ['Analytics Dashboard', 'Team Collaboration', 'API Access'],
      suggestedIntegrations: ['Slack', 'Google Workspace', 'Zapier'],
      nextSteps: [
        'Complete your profile setup',
        'Invite team members',
        'Explore the dashboard',
      ],
    };
  }
}
