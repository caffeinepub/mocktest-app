import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TestResult {
    score: bigint;
    totalQuestions: bigint;
    correctAnswers: bigint;
    details: Array<[bigint, boolean]>;
}
export interface Category {
    id: bigint;
    name: string;
    description: string;
}
export type Time = bigint;
export interface Test {
    id: bigint;
    categoryId: bigint;
    title: string;
    createdBy: Principal;
    timeLimitMinutes: bigint;
    questionIds: Array<bigint>;
}
export interface Question {
    id: bigint;
    categoryId: bigint;
    difficulty: string;
    questionText: string;
    correctOptionIndex: bigint;
    options: Array<string>;
}
export interface UserProfile {
    name: string;
}
export interface TestAttempt {
    userName: string;
    userId: Principal;
    answers: Array<bigint>;
    score: bigint;
    totalQuestions: bigint;
    timestamp: Time;
    testId: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdminWithSecret(secret: string): Promise<boolean>;
    createCategory(name: string, description: string): Promise<bigint>;
    createQuestion(categoryId: bigint, questionText: string, options: Array<string>, correctOptionIndex: bigint, difficulty: string): Promise<bigint>;
    createTest(title: string, categoryId: bigint, questionIds: Array<bigint>, timeLimitMinutes: bigint): Promise<bigint>;
    deleteCategory(categoryId: bigint): Promise<void>;
    deleteQuestion(questionId: bigint): Promise<void>;
    deleteTest(testId: bigint): Promise<void>;
    deleteUserScoreRecord(userId: Principal, timestamp: Time): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllDataPublic(): Promise<{
        categories: Array<Category>;
        tests: Array<Test>;
        questions: Array<Question>;
        isAuthenticated: boolean;
    }>;
    getAllQuestions(): Promise<Array<Question>>;
    getAllTestAttempts(): Promise<Array<TestAttempt>>;
    getAllTests(): Promise<Array<Test>>;
    getCallerTestAttempts(): Promise<Array<TestAttempt>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategory(categoryId: bigint): Promise<Category>;
    getQuestion(questionId: bigint): Promise<Question>;
    getQuestionsByCategory(categoryId: bigint): Promise<Array<Question>>;
    getTest(testId: bigint): Promise<Test>;
    getTestResult(testId: bigint, answers: Array<bigint>): Promise<TestResult>;
    getTestsByCategory(categoryId: bigint): Promise<Array<Test>>;
    getTopScores(): Promise<Array<TestAttempt>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTestAttempts(user: Principal): Promise<Array<TestAttempt>>;
    isCallerAdmin(): Promise<boolean>;
    register(): Promise<void>;
    resetAllScores(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedData(): Promise<void>;
    submitTestAttempt(testId: bigint, answers: Array<bigint>, userName: string): Promise<void>;
    updateCategory(categoryId: bigint, name: string, description: string): Promise<void>;
    updateQuestion(questionId: bigint, categoryId: bigint, questionText: string, options: Array<string>, correctOptionIndex: bigint, difficulty: string): Promise<void>;
    updateTest(testId: bigint, title: string, categoryId: bigint, questionIds: Array<bigint>, timeLimitMinutes: bigint): Promise<void>;
}
