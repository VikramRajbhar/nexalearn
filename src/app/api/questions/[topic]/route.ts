export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getCachedQuestions } from '@/lib/question-cache';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ topic: string }> }
) {
    const { topic } = await params;
    const { searchParams } = new URL(req.url);
    const difficulty = parseInt(searchParams.get('difficulty') || '1');
    const count = parseInt(searchParams.get('count') || '10');

    console.log(`[API GET] topic: '${topic}', difficulty: ${difficulty}, count: ${count}`);

    if (!topic) {
        return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const questions = await getCachedQuestions(topic, difficulty, count);
    console.log(`[API GET] Retrieved ${questions.length} questions from cache`);

    // Shuffle options and strip explanations
    const sanitized = questions.map(q => {
        // Create array of indices [0, 1, 2, 3] and shuffle them
        const indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);

        // Map new options
        const shuffledOptions = indices.map(i => q.options[i]);

        // Find new correct index by parsing the original correct_index to int
        const originalCorrectIndex = parseInt(String(q.correct_index), 10);
        const newCorrectIndex = indices.indexOf(originalCorrectIndex);

        return {
            id: q.id,
            topic: q.topic,
            difficulty: q.difficulty,
            question: q.question,
            options: shuffledOptions,
            correct_index: newCorrectIndex,
            explanation: q.explanation || '',
        };
    });

    return NextResponse.json(sanitized);
}
