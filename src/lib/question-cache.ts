import { supabaseAdmin as supabase } from './supabase';
import { generateQuestions } from './question-engine';
import type { Question } from '@/types';
import PQueue from 'p-queue';

/**
 * Fetch cached questions from Supabase.
 * If less than 5 are available, triggers a background refresh.
 */
export async function getCachedQuestions(topic: string, difficulty: number, count = 10): Promise<Question[]> {
    try {
        // Query random selection using Postgres random() via rpc or just fetch more and slice
        // Supabase doesn't have a built-in 'random' order easily without a custom SQL function
        // We'll fetch 50 and pick random ones to avoid complexity for now
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('topic', topic)
            .eq('difficulty', difficulty)
            .limit(50);

        if (error) throw error;

        const available = data || [];

        // Trigger background refresh if count is low
        if (available.length < 5) {
            checkAndRefreshCache(topic, difficulty);
        }

        // Shuffle and return requested count
        return available.sort(() => Math.random() - 0.5).slice(0, count);
    } catch (error) {
        console.error(`[Question Cache] Error getting questions for ${topic}:`, error);
        return [];
    }
}

/**
 * Generate questions via AI and save to Supabase.
 * Skips duplicates based on question text.
 */
export async function seedQuestions(topic: string, difficulty: number): Promise<number> {
    try {
        console.log(`[Question Cache] Seeding ${topic} difficulty ${difficulty}...`);
        const questions = await generateQuestions(topic, difficulty, 20);

        if (!Array.isArray(questions)) {
            throw new Error(`Invalid AI response format for ${topic}`);
        }

        // Prepare for insert
        const toInsert = questions.map(q => ({
            topic: q.topic,
            difficulty: q.difficulty,
            question: q.question,
            options: q.options,
            correct_index: q.correct_index,
            explanation: q.explanation
        }));

        // Use upsert with resolution on question text if we had a unique constraint
        // For now, we'll just insert and rely on simple uniqueness check if possible
        // Better: filter out existing questions by text first
        const { data: existing } = await supabase
            .from('questions')
            .select('question')
            .eq('topic', topic)
            .eq('difficulty', difficulty);

        const existingTexts = new Set(existing?.map(e => e.question) || []);
        const uniqueToInsert = toInsert.filter(q => !existingTexts.has(q.question));

        if (uniqueToInsert.length === 0) return 0;

        const { error } = await supabase
            .from('questions')
            .insert(uniqueToInsert);

        if (error) throw error;

        console.log(`[Question Cache] Seeded ${uniqueToInsert.length} new questions for ${topic} (diff ${difficulty})`);
        return uniqueToInsert.length;
    } catch (error) {
        console.error(`[Question Cache] Seeding failed for ${topic}:`, error);
        return 0;
    }
}

/**
 * Check if question count is low and trigger seed if needed.
 * Non-blocking background job.
 */
export async function checkAndRefreshCache(topic: string, difficulty: number) {
    // Run in background (don't await)
    (async () => {
        const { count, error } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('topic', topic)
            .eq('difficulty', difficulty);

        if (!error && (count || 0) < 5) {
            await seedQuestions(topic, difficulty);
        }
    })().catch(err => console.error(`[Question Cache] Background refresh error:`, err));
}

/** 
 * Seed all demo topics: DSA, JavaScript, SQL (Difficulties 1, 2, 3)
 */
export async function seedAllTopics(progressCallback?: (msg: string) => void) {
    const topics = ["DSA", "JavaScript", "SQL"];
    const difficulties = [1, 2, 3];
    const queue = new PQueue({ concurrency: 2 });

    const tasks = [];
    for (const topic of topics) {
        for (const difficulty of difficulties) {
            tasks.push(async () => {
                const msg = `Seeding ${topic} difficulty ${difficulty}...`;
                console.log(`[Question Cache] ${msg}`);
                if (progressCallback) progressCallback(msg);

                const count = await seedQuestions(topic, difficulty);

                const doneMsg = `Seeding ${topic} difficulty ${difficulty}: done (${count} questions)`;
                console.log(`[Question Cache] ${doneMsg}`);
                if (progressCallback) progressCallback(doneMsg);
            });
        }
    }

    await queue.addAll(tasks);
    if (progressCallback) progressCallback("All seeding tasks complete!");
}
