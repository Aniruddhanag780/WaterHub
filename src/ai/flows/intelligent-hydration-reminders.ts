'use server';
/**
 * @fileOverview This file implements a Genkit flow that acts as a Smart Reminder Tool.
 * It learns user activity patterns to optimize notification timings for effective and non-disruptive hydration reminders.
 *
 * - intelligentHydrationReminders - A function that handles the intelligent reminder suggestion process.
 * - IntelligentHydrationRemindersInput - The input type for the intelligentHydrationReminders function.
 * - IntelligentHydrationRemindersOutput - The return type for the intelligentHydrationReminders function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntelligentHydrationRemindersInputSchema = z.object({
  wakeUpTime: z.string().describe("The user's typical wake-up time, e.g., '07:00 AM'."),
  sleepTime: z.string().describe("The user's typical sleep time, e.g., '10:00 PM'."),
  activityPattern: z.string().describe(
    "A description of the user's daily activity, e.g., 'I work from 9 AM to 5 PM, with a lunch break at 1 PM. I exercise from 6 PM to 7 PM.'"
  ),
  dailyGoalMl: z.number().describe("The user's daily water intake goal in milliliters, e.g., 2000."),
  averageIntakeMl: z.number().describe("The user's average daily water intake in milliliters, e.g., 1500."),
  existingReminders: z.array(z.string()).optional().describe("An optional array of existing reminder times, e.g., ['09:00 AM', '01:00 PM']. The AI should avoid suggesting these if they are already optimal."),
});
export type IntelligentHydrationRemindersInput = z.infer<typeof IntelligentHydrationRemindersInputSchema>;

const IntelligentHydrationRemindersOutputSchema = z.object({
  suggestedReminderTimes: z.array(z.string()).describe("An array of suggested optimal hydration reminder times, e.g., ['08:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '06:00 PM', '08:30 PM']. Times should be in HH:MM AM/PM format."),
  explanation: z.string().describe("A brief explanation of why these times were chosen, based on the user's activity pattern and goals."),
});
export type IntelligentHydrationRemindersOutput = z.infer<typeof IntelligentHydrationRemindersOutputSchema>;

export async function intelligentHydrationReminders(input: IntelligentHydrationRemindersInput): Promise<IntelligentHydrationRemindersOutput> {
  return intelligentHydrationRemindersFlow(input);
}

const intelligentHydrationRemindersPrompt = ai.definePrompt({
  name: 'intelligentHydrationRemindersPrompt',
  input: { schema: IntelligentHydrationRemindersInputSchema },
  output: { schema: IntelligentHydrationRemindersOutputSchema },
  prompt: `You are a smart hydration assistant. Your goal is to suggest optimal hydration reminder times for a user based on their daily routine and goals.
The reminders should help the user reach their daily water intake goal without being disruptive.

Here is the user's information:
- Wake-up Time: {{{wakeUpTime}}}
- Sleep Time: {{{sleepTime}}}
- Daily Activity Pattern: {{{activityPattern}}}
- Daily Water Intake Goal: {{{dailyGoalMl}}}ml
- Average Daily Water Intake: {{{averageIntakeMl}}}ml
{{#if existingReminders}}
- Existing Reminder Times to consider: {{{JSON.stringify existingReminders}}}
{{/if}}

Based on this information, suggest a set of optimal hydration reminder times between the user's wake-up and sleep times.
Consider spreading the reminders appropriately throughout their waking hours, taking into account their activity pattern to avoid interruptions during peak activity or sleep.
Aim for a reasonable number of reminders (e.g., 6-8 for an adult aiming for 2-3 liters) to help them gradually reach their daily goal.
Also, provide a brief explanation for your choices.

Return the response as a JSON object matching the following schema:
${JSON.stringify(IntelligentHydrationRemindersOutputSchema.jsonSchema(), null, 2)}`,
});


const intelligentHydrationRemindersFlow = ai.defineFlow(
  {
    name: 'intelligentHydrationRemindersFlow',
    inputSchema: IntelligentHydrationRemindersInputSchema,
    outputSchema: IntelligentHydrationRemindersOutputSchema,
  },
  async (input) => {
    const { output } = await intelligentHydrationRemindersPrompt(input);
    return output!;
  }
);
