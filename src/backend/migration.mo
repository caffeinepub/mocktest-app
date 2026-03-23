import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type Actor = {
    nextCategoryId : Nat;
    nextTestId : Nat;
    nextQuestionId : Nat;
    categoryStore : Map.Map<Nat, {
      id : Nat;
      name : Text;
      description : Text;
    }>;
    testStore : Map.Map<Nat, {
      id : Nat;
      title : Text;
      categoryId : Nat;
      questionIds : [Nat];
      timeLimitMinutes : Nat;
      createdBy : Principal;
    }>;
    questionStore : Map.Map<Nat, {
      id : Nat;
      categoryId : Nat;
      questionText : Text;
      options : [Text];
      correctOptionIndex : Nat;
      difficulty : Text;
    }>;
    testAttemptStore : Map.Map<Principal, List.List<{
      userId : Principal;
      userName : Text;
      testId : Nat;
      answers : [Nat];
      score : Nat;
      totalQuestions : Nat;
      timestamp : Time.Time;
    }>>;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
