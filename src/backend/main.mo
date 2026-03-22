import Time "mo:core/Time";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let ADMIN_SECRET : Text = "PREPMASTER_ADMIN_2024";

  public type UserProfile = { name : Text };

  public type Category = {
    id : Nat;
    name : Text;
    description : Text;
  };

  public type Question = {
    id : Nat;
    categoryId : Nat;
    questionText : Text;
    options : [Text];
    correctOptionIndex : Nat;
    difficulty : Text;
  };

  public type Test = {
    id : Nat;
    title : Text;
    categoryId : Nat;
    questionIds : [Nat];
    timeLimitMinutes : Nat;
    createdBy : Principal;
  };

  public type TestAttempt = {
    userId : Principal;
    testId : Nat;
    answers : [Nat];
    score : Nat;
    totalQuestions : Nat;
    timestamp : Time.Time;
  };

  public type TestResult = {
    score : Nat;
    totalQuestions : Nat;
    correctAnswers : Nat;
    details : [(Nat, Bool)];
  };

  module TestAttempt {
    public func compareByScore(a : TestAttempt, b : TestAttempt) : Order.Order {
      Nat.compare(b.score, a.score);
    };
    public func compareByTimestamp(a : TestAttempt, b : TestAttempt) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let categoryStore = Map.empty<Nat, Category>();
  let questionStore = Map.empty<Nat, Question>();
  let testStore = Map.empty<Nat, Test>();
  let testAttemptStore = Map.empty<Principal, List.List<TestAttempt>>();

  var nextCategoryId = 1;
  var nextQuestionId = 1;
  var nextTestId = 1;

  // Helper: safely check admin without trapping
  func isAdminCaller(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  // Register user as #user (or keep existing role)
  public shared ({ caller }) func register() : async () {
    if (caller.isAnonymous()) { return };
    switch (accessControlState.userRoles.get(caller)) {
      case (?_) {};
      case (null) {
        accessControlState.userRoles.add(caller, #user);
      };
    };
  };

  // Claim admin with secret code
  public shared ({ caller }) func claimAdminWithSecret(secret : Text) : async Bool {
    if (secret != ADMIN_SECRET) { return false };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    return true;
  };

  // User Profiles
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Categories
  public shared ({ caller }) func createCategory(name : Text, description : Text) : async Nat {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    let id = nextCategoryId;
    categoryStore.add(id, { id; name; description });
    nextCategoryId += 1;
    id;
  };

  public query ({ caller }) func getCategory(categoryId : Nat) : async Category {
    switch (categoryStore.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?c) { c };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    categoryStore.values().toArray();
  };

  public shared ({ caller }) func updateCategory(categoryId : Nat, name : Text, description : Text) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (categoryStore.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) { categoryStore.add(categoryId, { id = categoryId; name; description }) };
    };
  };

  public shared ({ caller }) func deleteCategory(categoryId : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    categoryStore.remove(categoryId);
  };

  // Questions
  public shared ({ caller }) func createQuestion(categoryId : Nat, questionText : Text, options : [Text], correctOptionIndex : Nat, difficulty : Text) : async Nat {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    let id = nextQuestionId;
    questionStore.add(id, { id; categoryId; questionText; options; correctOptionIndex; difficulty });
    nextQuestionId += 1;
    id;
  };

  public query ({ caller }) func getQuestion(questionId : Nat) : async Question {
    switch (questionStore.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?q) { q };
    };
  };

  public query ({ caller }) func getQuestionsByCategory(categoryId : Nat) : async [Question] {
    questionStore.values().toArray().filter(func(q) { q.categoryId == categoryId });
  };

  public query ({ caller }) func getAllQuestions() : async [Question] {
    questionStore.values().toArray();
  };

  public shared ({ caller }) func updateQuestion(questionId : Nat, categoryId : Nat, questionText : Text, options : [Text], correctOptionIndex : Nat, difficulty : Text) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (questionStore.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) { questionStore.add(questionId, { id = questionId; categoryId; questionText; options; correctOptionIndex; difficulty }) };
    };
  };

  public shared ({ caller }) func deleteQuestion(questionId : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    questionStore.remove(questionId);
  };

  // Tests
  public shared ({ caller }) func createTest(title : Text, categoryId : Nat, questionIds : [Nat], timeLimitMinutes : Nat) : async Nat {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    let id = nextTestId;
    testStore.add(id, { id; title; categoryId; questionIds; timeLimitMinutes; createdBy = caller });
    nextTestId += 1;
    id;
  };

  public query ({ caller }) func getTest(testId : Nat) : async Test {
    switch (testStore.get(testId)) {
      case (null) { Runtime.trap("Test not found") };
      case (?t) { t };
    };
  };

  public query ({ caller }) func getAllTests() : async [Test] {
    testStore.values().toArray();
  };

  public query ({ caller }) func getTestsByCategory(categoryId : Nat) : async [Test] {
    testStore.values().toArray().filter(func(t) { t.categoryId == categoryId });
  };

  public shared ({ caller }) func updateTest(testId : Nat, title : Text, categoryId : Nat, questionIds : [Nat], timeLimitMinutes : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    switch (testStore.get(testId)) {
      case (null) { Runtime.trap("Test not found") };
      case (?old) { testStore.add(testId, { id = testId; title; categoryId; questionIds; timeLimitMinutes; createdBy = old.createdBy }) };
    };
  };

  public shared ({ caller }) func deleteTest(testId : Nat) : async () {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    testStore.remove(testId);
  };

  // Test Attempts
  public shared ({ caller }) func submitTestAttempt(testId : Nat, answers : [Nat]) : async () {
    let test = switch (testStore.get(testId)) {
      case (null) { Runtime.trap("Test not found") };
      case (?t) { t };
    };
    let questions = test.questionIds.map(func(qId) {
      switch (questionStore.get(qId)) {
        case (null) { Runtime.trap("Question not found") };
        case (?q) { q };
      };
    });
    var score = 0;
    for (i in Nat.range(0, answers.size())) {
      if (answers[i] == questions[i].correctOptionIndex) { score += 1 };
    };
    let attempt : TestAttempt = {
      userId = caller; testId; answers; score;
      totalQuestions = questions.size(); timestamp = Time.now();
    };
    let current = switch (testAttemptStore.get(caller)) {
      case (null) { List.empty<TestAttempt>() };
      case (?a) { a };
    };
    current.add(attempt);
    testAttemptStore.add(caller, current);
  };

  public query ({ caller }) func getTestResult(testId : Nat, answers : [Nat]) : async TestResult {
    let test = switch (testStore.get(testId)) {
      case (null) { Runtime.trap("Test not found") };
      case (?t) { t };
    };
    let questions = test.questionIds.map(func(qId) {
      switch (questionStore.get(qId)) {
        case (null) { Runtime.trap("Question not found") };
        case (?q) { q };
      };
    });
    var score = 0;
    let details = List.empty<(Nat, Bool)>();
    for (i in Nat.range(0, answers.size())) {
      let correct = answers[i] == questions[i].correctOptionIndex;
      if (correct) { score += 1 };
      details.add((i, correct));
    };
    { score; totalQuestions = questions.size(); correctAnswers = score; details = details.toArray() };
  };

  public query ({ caller }) func getCallerTestAttempts() : async [TestAttempt] {
    switch (testAttemptStore.get(caller)) {
      case (null) { [] };
      case (?a) { a.toArray().sort(TestAttempt.compareByTimestamp) };
    };
  };

  public query ({ caller }) func getUserTestAttempts(user : Principal) : async [TestAttempt] {
    switch (testAttemptStore.get(user)) {
      case (null) { [] };
      case (?a) { a.toArray().sort(TestAttempt.compareByTimestamp) };
    };
  };

  public query ({ caller }) func getAllTestAttempts() : async [TestAttempt] {
    if (not isAdminCaller(caller)) { Runtime.trap("Unauthorized") };
    var all = List.empty<TestAttempt>();
    for ((_, attempts) in testAttemptStore.entries()) {
      all.addAll(attempts.values());
    };
    all.toArray().sort(TestAttempt.compareByTimestamp);
  };

  public query ({ caller }) func getTopScores() : async [TestAttempt] {
    var all = List.empty<TestAttempt>();
    for ((_, attempts) in testAttemptStore.entries()) {
      all.addAll(attempts.values());
    };
    let sorted = all.toArray().sort(TestAttempt.compareByScore);
    if (sorted.size() > 10) { Array.tabulate(10, func(i) { sorted[i] }) } else { sorted };
  };

  // Seed sample data -- any logged-in user can trigger (frontend uses localStorage guard)
  public shared ({ caller }) func seedData() : async () {
    if (caller.isAnonymous()) { Runtime.trap("Must be logged in") };

    let catMath = nextCategoryId;
    categoryStore.add(catMath, { id = catMath; name = "Math"; description = "Mathematics questions" });
    nextCategoryId += 1;

    let catSci = nextCategoryId;
    categoryStore.add(catSci, { id = catSci; name = "Science"; description = "Science questions" });
    nextCategoryId += 1;

    let catGK = nextCategoryId;
    categoryStore.add(catGK, { id = catGK; name = "General Knowledge"; description = "GK questions" });
    nextCategoryId += 1;

    let mathQIds = List.empty<Nat>();
    func addMQ(q : Text, opts : [Text], correct : Nat, diff : Text) {
      let id = nextQuestionId;
      questionStore.add(id, { id; categoryId = catMath; questionText = q; options = opts; correctOptionIndex = correct; difficulty = diff });
      mathQIds.add(id);
      nextQuestionId += 1;
    };
    addMQ("What is 12 x 12?", ["124","144","132","148"], 1, "Easy");
    addMQ("Square root of 81?", ["7","8","9","10"], 2, "Easy");
    addMQ("15% of 200?", ["25","30","35","40"], 1, "Medium");
    addMQ("3x + 6 = 18, x = ?", ["2","3","4","6"], 2, "Medium");
    addMQ("2 to the power of 10?", ["512","1024","2048","256"], 1, "Hard");

    let sciQIds = List.empty<Nat>();
    func addSQ(q : Text, opts : [Text], correct : Nat, diff : Text) {
      let id = nextQuestionId;
      questionStore.add(id, { id; categoryId = catSci; questionText = q; options = opts; correctOptionIndex = correct; difficulty = diff });
      sciQIds.add(id);
      nextQuestionId += 1;
    };
    addSQ("Chemical symbol for water?", ["WO","H2O","HO2","W2O"], 1, "Easy");
    addSQ("Bones in adult human body?", ["196","206","216","226"], 1, "Medium");
    addSQ("Planet closest to the Sun?", ["Venus","Earth","Mercury","Mars"], 2, "Easy");
    addSQ("Speed of light (km/s approx)?", ["200000","300000","400000","500000"], 1, "Hard");
    addSQ("Gas plants absorb in photosynthesis?", ["Oxygen","Nitrogen","Carbon Dioxide","Hydrogen"], 2, "Easy");

    let gkQIds = List.empty<Nat>();
    func addGQ(q : Text, opts : [Text], correct : Nat, diff : Text) {
      let id = nextQuestionId;
      questionStore.add(id, { id; categoryId = catGK; questionText = q; options = opts; correctOptionIndex = correct; difficulty = diff });
      gkQIds.add(id);
      nextQuestionId += 1;
    };
    addGQ("Capital of France?", ["Berlin","London","Paris","Rome"], 2, "Easy");
    addGQ("Who wrote Romeo and Juliet?", ["Charles Dickens","William Shakespeare","Jane Austen","Mark Twain"], 1, "Easy");
    addGQ("Number of continents on Earth?", ["5","6","7","8"], 2, "Easy");
    addGQ("Largest ocean?", ["Atlantic","Indian","Arctic","Pacific"], 3, "Medium");
    addGQ("World War II ended in?", ["1943","1944","1945","1946"], 2, "Medium");

    let t1 = nextTestId;
    testStore.add(t1, { id = t1; title = "Math Quiz"; categoryId = catMath; questionIds = mathQIds.toArray(); timeLimitMinutes = 15; createdBy = caller });
    nextTestId += 1;

    let t2 = nextTestId;
    testStore.add(t2, { id = t2; title = "Science Quiz"; categoryId = catSci; questionIds = sciQIds.toArray(); timeLimitMinutes = 15; createdBy = caller });
    nextTestId += 1;

    let t3 = nextTestId;
    testStore.add(t3, { id = t3; title = "General Knowledge Quiz"; categoryId = catGK; questionIds = gkQIds.toArray(); timeLimitMinutes = 15; createdBy = caller });
    nextTestId += 1;
  };

  public query ({ caller }) func getAllDataPublic() : async {
    isAuthenticated : Bool;
    categories : [Category];
    tests : [Test];
    questions : [Question];
  } {
    {
      isAuthenticated = not caller.isAnonymous();
      categories = categoryStore.values().toArray();
      tests = testStore.values().toArray();
      questions = questionStore.values().toArray();
    };
  };
};
