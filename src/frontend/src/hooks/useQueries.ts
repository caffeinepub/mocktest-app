import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  Question,
  Test,
  TestAttempt,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllDataPublic() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allDataPublic"],
    queryFn: async () => {
      if (!actor)
        return {
          categories: [],
          tests: [],
          questions: [],
          isAuthenticated: false,
        };
      return actor.getAllDataPublic();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useGetAllCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTests() {
  const { actor, isFetching } = useActor();
  return useQuery<Test[]>({
    queryKey: ["tests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllQuestions() {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuestionsByIds(questionIds: bigint[], enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questionsByIds", questionIds.map(String).join(",")],
    queryFn: async () => {
      if (!actor) return [];
      const results = await Promise.all(
        questionIds.map((id) => actor.getQuestion(id)),
      );
      return results;
    },
    enabled: !!actor && !isFetching && enabled && questionIds.length > 0,
  });
}

export function useGetTestById(testId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Test | null>({
    queryKey: ["test", String(testId)],
    queryFn: async () => {
      if (!actor || testId === null) return null;
      return actor.getTest(testId);
    },
    enabled: !!actor && !isFetching && testId !== null,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetAllTestAttempts() {
  const { actor, isFetching } = useActor();
  return useQuery<TestAttempt[]>({
    queryKey: ["allTestAttempts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTestAttempts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerTestAttempts() {
  const { actor, isFetching } = useActor();
  return useQuery<TestAttempt[]>({
    queryKey: ["callerTestAttempts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerTestAttempts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.seedData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allDataPublic"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["tests"] });
      qc.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useSubmitTestAttempt() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      testId,
      answers,
      userName,
    }: { testId: bigint; answers: bigint[]; userName: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.submitTestAttempt(testId, answers, userName);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerTestAttempts"] });
      qc.invalidateQueries({ queryKey: ["allTestAttempts"] });
    },
  });
}

export function useGetTestResult() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      testId,
      answers,
    }: { testId: bigint; answers: bigint[] }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTestResult(testId, answers);
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: { name: string; description: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createCategory(name, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: { id: bigint; name: string; description: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateCategory(id, name, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteCategory(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useCreateQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      categoryId,
      questionText,
      options,
      correctOptionIndex,
      difficulty,
    }: {
      categoryId: bigint;
      questionText: string;
      options: string[];
      correctOptionIndex: bigint;
      difficulty: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createQuestion(
        categoryId,
        questionText,
        options,
        correctOptionIndex,
        difficulty,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      categoryId,
      questionText,
      options,
      correctOptionIndex,
      difficulty,
    }: {
      id: bigint;
      categoryId: bigint;
      questionText: string;
      options: string[];
      correctOptionIndex: bigint;
      difficulty: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateQuestion(
        id,
        categoryId,
        questionText,
        options,
        correctOptionIndex,
        difficulty,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteQuestion(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useCreateTest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      categoryId,
      questionIds,
      timeLimitMinutes,
    }: {
      title: string;
      categoryId: bigint;
      questionIds: bigint[];
      timeLimitMinutes: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTest(title, categoryId, questionIds, timeLimitMinutes);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

export function useUpdateTest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      categoryId,
      questionIds,
      timeLimitMinutes,
    }: {
      id: bigint;
      title: string;
      categoryId: bigint;
      questionIds: bigint[];
      timeLimitMinutes: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateTest(
        id,
        title,
        categoryId,
        questionIds,
        timeLimitMinutes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

export function useDeleteTest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteTest(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

export function useClaimAdminWithSecret() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (secret: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.claimAdminWithSecret(secret);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["isCallerAdmin"] });
      qc.invalidateQueries({ queryKey: ["callerUserRole"] });
    },
  });
}

export function useDeleteUserScoreRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      timestamp,
    }: { userId: Principal; timestamp: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteUserScoreRecord(userId, timestamp);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allTestAttempts"] }),
  });
}

export function useResetAllScores() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.resetAllScores();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allTestAttempts"] }),
  });
}
