export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { questionId, userAnswer } = await req.json();

        if (!questionId) {
            return NextResponse.json({ error: "questionId is required" }, { status: 400 });
        }

        const { data: question, error } = await supabase
            .from('questions')
            .select('explanation, correct_index')
            .eq('id', questionId)
            .single();

        if (error || !question) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        const isCorrect = userAnswer === question.correct_index;

        return NextResponse.json({
            explanation: question.explanation,
            correct_index: question.correct_index,
            isCorrect
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
