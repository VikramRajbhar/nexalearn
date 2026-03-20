export interface User {
    id: string;
    auth_id: string;
    username: string;
    email: string;
    college: string;
    semester: number;
    avatar_url?: string;
    total_xp: number;
    league: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
    battles_played: number;
    battles_won: number;
    created_at: string;
    updated_at: string;
}

export interface SkillScore {
    id: string;
    user_id: string;
    topic: string;
    score: number;
    battles_played: number;
    correct_answers: number;
    last_updated: string;
}

export interface Question {
    id: string;
    topic: string;
    difficulty: number;
    question: string;
    options: string[];
    correct_index: number;
    explanation?: string;
    created_at: string;
}

export interface QuestionResult {
    question: Question
    user_answer: number
    is_correct: boolean
    time_taken_ms: number
    points_earned: number
}

export interface BattleQuestion {
    question: Question
    time_limit_seconds: number
    question_number: number
    total_questions: number
}

export interface Battle {
    id: string;
    room_id: string;
    player1_id: string;
    player2_id?: string;
    winner_id?: string;
    topic: string;
    player1_score: number;
    player2_score: number;
    total_questions: number;
    status: 'waiting' | 'active' | 'completed' | 'abandoned';
    started_at?: string;
    ended_at?: string;
    created_at: string;
}

export interface Guild {
    id: string;
    name: string;
    description?: string;
    leader_id: string;
    weekly_xp: number;
    total_xp: number;
    member_count: number;
    invite_token?: string;
    invite_expires_at?: string;
    created_at: string;
}

export interface GuildMember {
    id: string;
    guild_id: string;
    user_id: string;
    weekly_xp: number;
    role: 'leader' | 'member';
    joined_at: string;
}

export interface Achievement {
    id: string;
    user_id: string;
    badge_type: string;
    badge_name: string;
    earned_at: string;
}

export interface BattleHistory {
    id: string;
    battle_id: string;
    user_id: string;
    opponent_id: string;
    topic: string;
    user_score: number;
    opponent_score: number;
    result: 'win' | 'loss' | 'draw';
    xp_earned: number;
    played_at: string;
}
