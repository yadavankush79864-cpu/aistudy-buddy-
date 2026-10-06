import {
  UserProfile,
  ActivityItem,
  StudyMaterial,
  SubjectProgress,
  WeakTopic,
  ChatMessage,
  QuizQuestion,
  ExamPrepItem,
  QuizAttempt,
  StudyPlanDay,
  StudyRecommendation,
} from '../types';

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'usr_aarav_01',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@dtu.ac.in',
    studentId: '2024-CSE-042',
    college: 'Delhi Technological University (DTU)',
    university: 'Delhi Technological University (DTU)',
    course: 'B.Tech CSE',
    major: 'B.Tech CSE',
    year: '3rd Year',
    semester: 'Semester 5',
    preferredLanguage: 'English',
    avatarUrl: '/src/assets/images/aarav_sharma_avatar_1791269387086.jpg',
  },
  {
    id: 'usr_priya_02',
    name: 'Priya Verma',
    email: 'priya.verma@annauniv.edu',
    studentId: '2024-AIML-118',
    college: 'College of Engineering, Anna University',
    university: 'Anna University',
    course: 'B.Tech CSE-AIML',
    major: 'B.Tech CSE-AIML',
    year: '2nd Year',
    semester: 'Semester 3',
    preferredLanguage: 'English',
    avatarUrl: '/src/assets/images/priya_verma_avatar_1791269400021.jpg',
  },
  {
    id: 'usr_rahul_03',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@mu.ac.in',
    studentId: '2023-BCA-089',
    college: 'St. Xavier’s College, Mumbai University',
    university: 'Mumbai University',
    course: 'BCA',
    major: 'BCA',
    year: '3rd Year',
    semester: 'Semester 5',
    preferredLanguage: 'Hindi',
    avatarUrl: '/src/assets/images/aarav_sharma_avatar_1791269387086.jpg',
  },
  {
    id: 'usr_ananya_04',
    name: 'Ananya Singh',
    email: 'ananya.singh@nitt.edu',
    studentId: '2025-MCA-014',
    college: 'National Institute of Technology (NIT Trichy)',
    university: 'NIT Trichy',
    course: 'MCA',
    major: 'MCA',
    year: '1st Year',
    semester: 'Semester 1',
    preferredLanguage: 'English',
    avatarUrl: '/src/assets/images/priya_verma_avatar_1791269400021.jpg',
  },
];

export const INITIAL_USER: UserProfile = DEMO_PROFILES[0];

export const INITIAL_SUBJECTS = [
  'All Subjects',
  'Machine Learning',
  'Operating Systems',
  'Java Programming & OOP',
  'Database Management Systems',
  'Software Engineering',
];

export const INITIAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-01',
    title: 'Machine Learning: Unit 3 - KNN & Classification Models',
    subject: 'Machine Learning',
    course: 'B.Tech CSE-AIML',
    semester: 'Semester 5',
    unit: 'Unit 3',
    topic: 'K-Nearest Neighbors (KNN)',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    pageCount: 34,
    uploadedAt: 'Today at 11:20 AM',
    status: 'indexed',
    isDemo: true,
    summary: 'Comprehensive notes covering KNN algorithm distance metrics (Euclidean, Manhattan, Minkowski), decision boundary, choice of optimal K, and curse of dimensionality.',
    content: `Machine Learning Unit 3: K-Nearest Neighbors (KNN) & Classification Models.
K-Nearest Neighbors (KNN) is a supervised, instance-based lazy learning algorithm used for both classification and regression.
1. Distance Metrics:
- Euclidean Distance: d(p,q) = sqrt(sum((qi - pi)^2)). Used for continuous variables.
- Manhattan Distance: d(p,q) = sum(|pi - qi|). City-block distance.
- Minkowski Distance: Generalized metric of order p.
2. Choice of Parameter K:
- Small K (e.g. K=1): Highly sensitive to noise and outliers; produces high variance and complex decision boundaries (overfitting).
- Large K: Smooths decision boundaries, reduces variance, but may include points from other classes (underfitting, high bias).
- Rule of thumb: Choose odd K in binary classification to eliminate vote ties.
3. Curse of Dimensionality:
In high-dimensional feature spaces, data points become equidistant from one another, rendering distance-based neighborhood comparisons less meaningful. Dimensionality reduction (PCA, LDA) or feature selection is advised.
4. Feature Normalization:
Because distances are scale-dependent, features with large numeric ranges (e.g., Salary in thousands) dominate features with small ranges (e.g., Age in tens). Min-Max scaling or Z-score normalization is mandatory before computing KNN distances.
5. Advantages: Simple to understand, no explicit training phase (lazy learner), naturally supports multi-class classification.
6. Disadvantages: High inference time complexity O(n*d) per query, high memory footprint, sensitive to irrelevant features and unscaled data.`,
  },
  {
    id: 'mat-02',
    title: 'Java OOP: Unit 1 - Inheritance, Abstract Classes & Interfaces',
    subject: 'Java Programming & OOP',
    course: 'B.Tech CSE',
    semester: 'Semester 3',
    unit: 'Unit 1',
    topic: 'Inheritance & Polymorphism',
    fileType: 'pdf',
    fileSize: '5.2 MB',
    pageCount: 42,
    uploadedAt: 'Yesterday',
    status: 'indexed',
    isDemo: true,
    summary: 'Single, Multilevel, Hierarchical inheritance with super keyword, method overriding rules, multiple inheritance via interfaces, and memory model.',
    content: `Java Programming & OOP Unit 1: Inheritance, Abstract Classes & Interfaces.
1. Concept of Inheritance:
Inheritance is the OOP mechanism where a subclass acquires fields and methods of a superclass using the 'extends' keyword. It models an IS-A relationship (e.g., Dog IS-A Animal).
2. Types of Inheritance in Java:
- Single Inheritance: One subclass derives from one superclass (Class B extends Class A).
- Multilevel Inheritance: Class C extends Class B, which extends Class A.
- Hierarchical Inheritance: Multiple subclasses extend the same parent class (Class B extends A, Class C extends A).
- Multiple Inheritance (via Classes): NOT supported in Java to avoid the Diamond Problem (method ambiguity if two parents define same method signature).
- Multiple Inheritance (via Interfaces): Supported using 'implements' keyword (Class C implements Interface A, Interface B).
3. The 'super' Keyword:
- super() invokes the parent class constructor (must be the first statement in child constructor).
- super.methodName() invokes parent method overridden by the child.
- super.fieldName accesses parent class fields hidden by child fields.
4. Method Overriding:
Subclass defines a method with the exact same name, return type, and parameter list as in the parent class. Marked with @Override. Used for runtime polymorphism (dynamic method dispatch). Private and static methods cannot be overridden.
5. Final Keyword in Inheritance:
- final class cannot be extended (e.g., java.lang.String is final).
- final method cannot be overridden.
- final variable behaves as a constant.
6. Root Class: java.lang.Object is the top-level superclass of all Java classes.`,
  },
  {
    id: 'mat-03',
    title: 'Operating Systems: Unit 2 - CPU Scheduling & Deadlock Prevention',
    subject: 'Operating Systems',
    course: 'B.Tech CSE',
    semester: 'Semester 4',
    unit: 'Unit 2',
    topic: 'Banker’s Algorithm & Semaphores',
    fileType: 'docx',
    fileSize: '2.1 MB',
    pageCount: 28,
    uploadedAt: '3 days ago',
    status: 'indexed',
    isDemo: true,
    summary: 'FCFS, SJF, Round Robin Gantt charts, Banker Algorithm safety state derivations, and 7-mark question templates for semester exams.',
    content: `Operating Systems Unit 2: CPU Scheduling & Deadlocks.
1. CPU Scheduling:
- FCFS (First-Come First-Served): Non-preemptive, suffers from Convoy Effect when short processes queue behind long CPU-bound process.
- SJF (Shortest Job First): Provably optimal minimum average waiting time. Preemptive SJF is known as Shortest Remaining Time First (SRTF). Vulnerable to starvation of longer processes.
- Round Robin (RR): Preemptive, designed for time-sharing systems. Uses a fixed time quantum q. If q is too large, behaves like FCFS; if q is too small, context-switching overhead degrades throughput.
- Priority Scheduling: Preemptive or non-preemptive. Can lead to starvation (solved using aging).
2. Deadlocks:
A situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by another process.
3. Four Coffman Conditions for Deadlock:
- Mutual Exclusion: At least one resource held in non-shareable mode.
- Hold and Wait: A process holds at least one resource and waits to acquire additional resources held by other processes.
- No Preemption: Resources cannot be forcibly taken from a process holding them.
- Circular Wait: A closed chain of processes P0, P1, ..., Pn exists such that P0 waits for resource held by P1, P1 waits for P2, ..., Pn waits for P0.
4. Banker's Algorithm (Deadlock Avoidance):
Developed by Dijkstra. Evaluates whether granting a resource request keeps the system in a 'Safe State'.
Data structures: Available[m], Max[n][m], Allocation[n][m], Need[n][m] where Need[i][j] = Max[i][j] - Allocation[i][j].
Safety Algorithm: Finds if there is at least one safe execution sequence <P1, P2, ... Pn> such that every process can finish.`,
  },
  {
    id: 'mat-04',
    title: 'DBMS: Unit 3 - Normalization (1NF, 2NF, 3NF, BCNF) with Examples',
    subject: 'Database Management Systems',
    course: 'B.Tech CSE',
    semester: 'Semester 4',
    unit: 'Unit 3',
    topic: 'Functional Dependencies & Normal Forms',
    fileType: 'notes',
    fileSize: '1.4 MB',
    pageCount: 19,
    uploadedAt: 'Sep 28, 2026',
    status: 'indexed',
    isDemo: true,
    summary: 'Step-by-step table decomposition examples, lossless join property, dependency preservation, and difference between 3NF and BCNF.',
    content: `Database Management Systems Unit 3: Normalization & Functional Dependencies.
1. Goals of Normalization:
Eliminate data redundancy, prevent insertion, deletion, and update anomalies, and maintain data consistency.
2. Functional Dependency (FD):
X -> Y indicates that attribute X uniquely determines attribute Y.
3. Normal Forms:
- 1NF (First Normal Form): All attribute values must be atomic (no multivalued attributes or repeating groups).
- 2NF (Second Normal Form): Relation is in 1NF and contains NO partial dependency. Every non-prime attribute must be fully functionally dependent on the entire candidate key.
- 3NF (Third Normal Form): Relation is in 2NF and contains NO transitive dependency. For every non-trivial FD X -> Y, either X is a Super Key OR Y is a prime attribute.
- BCNF (Boyce-Codd Normal Form): Stricter form of 3NF. For every non-trivial FD X -> Y, X must strictly be a Super Key.
4. Difference Between 3NF and BCNF:
In 3NF, Y can be a prime attribute even if X is not a super key. In BCNF, this exception is disallowed: X MUST be a super key.
Every BCNF relation is in 3NF, but not every 3NF relation is in BCNF.
5. Decomposition Properties:
- Lossless Join: Natural join of decomposed tables must recreate the original relation without spurious tuples (R1 intersect R2 -> R1 or R1 intersect R2 -> R2).
- Dependency Preservation: All original functional dependencies can be enforced using decomposed relations without computing joins.`,
  },
  {
    id: 'mat-05',
    title: 'Software Engineering: Unit 4 - Agile, Scrum Ceremonies & Testing',
    subject: 'Software Engineering',
    course: 'B.Tech CSE',
    semester: 'Semester 5',
    unit: 'Unit 4',
    topic: 'Agile vs Waterfall & Black-box Testing',
    fileType: 'pdf',
    fileSize: '3.6 MB',
    pageCount: 26,
    uploadedAt: 'Sep 22, 2026',
    status: 'indexed',
    isDemo: true,
    summary: 'Sprint planning, user stories, burn-down charts, boundary value analysis, and equivalence partitioning for university exam prep.',
    content: `Software Engineering Unit 4: Agile Methodologies, Scrum & Software Testing.
1. Agile Software Development:
Iterative and incremental development approach emphasizing adaptive planning, evolutionary development, early delivery, and continual improvement.
4 Core Values: Individuals and interactions over processes and tools; Working software over comprehensive documentation; Customer collaboration over contract negotiation; Responding to change over following a plan.
2. Scrum Framework:
- Roles: Product Owner (manages product backlog), Scrum Master (removes impediments, facilitates scrum events), Development Team (cross-functional engineers).
- Ceremonies: Sprint Planning (determines sprint goals), Daily Standup (15-min daily sync: what did I do yesterday, what will I do today, any blockers), Sprint Review (demo working product to stakeholders), Sprint Retrospective (team self-improvement reflection).
- Artifacts: Product Backlog (prioritized requirements), Sprint Backlog (selected tasks for sprint), Increment (deliverable product increment), Burndown Chart (tracks remaining work vs time).
3. Software Testing:
- Verification: Are we building the product right? (Static analysis, reviews, inspections).
- Validation: Are we building the right product? (Dynamic execution testing against user requirements).
- Black-box Testing: Functional testing without code knowledge (Equivalence Class Partitioning, Boundary Value Analysis BVA).
- White-box Testing: Structural testing analyzing internal code paths (Statement coverage, Branch coverage, Cyclomatic complexity M = E - N + 2P).`,
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-01',
    type: 'summary',
    title: 'Revised KNN (Machine Learning Unit 3)',
    subject: 'Machine Learning',
    unit: 'Unit 3',
    timestamp: '25 mins ago',
    durationMinutes: 20,
  },
  {
    id: 'act-02',
    type: 'quiz',
    title: 'Completed Java Quiz (Inheritance & Polymorphism)',
    subject: 'Java Programming & OOP',
    unit: 'Unit 1',
    timestamp: '2 hours ago',
    score: 92,
  },
  {
    id: 'act-03',
    type: 'material',
    title: 'Uploaded Software Engineering Notes (Agile & Scrum)',
    subject: 'Software Engineering',
    unit: 'Unit 4',
    timestamp: 'Yesterday at 5:30 PM',
  },
  {
    id: 'act-04',
    type: 'exam-prep',
    title: 'Generated 7-Mark Answer: Banker’s Algorithm',
    subject: 'Operating Systems',
    unit: 'Unit 2',
    timestamp: '2 days ago',
  },
  {
    id: 'act-05',
    type: 'tutor',
    title: 'Discussed Normalization (3NF vs BCNF) with AI Sathi',
    subject: 'Database Management Systems',
    unit: 'Unit 3',
    timestamp: '3 days ago',
    durationMinutes: 18,
  },
];

export const INITIAL_SUBJECT_PROGRESS: SubjectProgress[] = [
  {
    subject: 'Machine Learning',
    code: 'CS-501',
    progressPercent: 78,
    quizzesTaken: 14,
    averageScore: 89,
    hoursStudied: 28.0,
    color: '#1E3A8A', // Deep Blue
  },
  {
    subject: 'Operating Systems',
    code: 'CS-402',
    progressPercent: 84,
    quizzesTaken: 11,
    averageScore: 82,
    hoursStudied: 22.5,
    color: '#F97316', // Saffron Accent
  },
  {
    subject: 'Java Programming & OOP',
    code: 'CS-303',
    progressPercent: 92,
    quizzesTaken: 16,
    averageScore: 94,
    hoursStudied: 31.0,
    color: '#4F46E5', // Indigo AI
  },
  {
    subject: 'Database Management Systems',
    code: 'CS-404',
    progressPercent: 68,
    quizzesTaken: 8,
    averageScore: 76,
    hoursStudied: 17.5,
    color: '#0284C7', // Sky Blue
  },
];

export const INITIAL_WEAK_TOPICS: WeakTopic[] = [
  {
    id: 'weak-01',
    subject: 'Database Management Systems',
    topic: 'BCNF Decomposition & Dependency Preservation',
    accuracyRate: 58,
    recommendation: 'Practice 3 university PYQ decompositions where functional dependencies cannot be preserved in BCNF.',
  },
  {
    id: 'weak-02',
    subject: 'Operating Systems',
    topic: 'Semaphores (Dining Philosophers & Producer-Consumer)',
    accuracyRate: 64,
    recommendation: 'Ask AI Sathi for pseudo-code explanation of wait() and signal() primitives to avoid deadlocks.',
  },
  {
    id: 'weak-03',
    subject: 'Machine Learning',
    topic: 'Curse of Dimensionality in KNN',
    accuracyRate: 68,
    recommendation: 'Review how high dimensions make Euclidean distance uniform and study PCA dimensionality reduction.',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-01',
    sender: 'assistant',
    content: `Namaste Aarav! 🙏 I am your **AI Sathi** — your personal study companion.

I can help you:
- Understand tricky syllabus concepts in simple, easy-to-grasp language
- Structure exam-ready **7-mark / 10-mark answers** with diagrams and key headings
- Create rapid viva questions and MCQs for internal assessments
- Clarify doubts from your uploaded notes and semester units

What topic are we revising today?`,
    timestamp: '10:00 AM',
    suggestedFollowUps: [
      "What is inheritance in Java? (Exam Ready)",
      "Explain KNN algorithm in simple language",
      "Give me a 7-mark answer for Banker's Algorithm",
      "Ask me 5 viva questions on Normalization",
    ],
  },
  {
    id: 'msg-02',
    sender: 'user',
    content: "What is inheritance in Java? Give me an exam-ready explanation with syntax.",
    timestamp: '10:02 AM',
  },
  {
    id: 'msg-03',
    sender: 'assistant',
    explanationMode: 'exam-ready',
    content: `Here is a structured, **Exam-Ready Answer** (Suitable for a 5 to 7-mark university question):

---

### 1. Definition
**Inheritance** is an Object-Oriented Programming (OOP) mechanism by which one class acquires the properties (methods and fields) of another class.
- **Superclass (Parent / Base class):** The class whose properties are inherited.
- **Subclass (Child / Derived class):** The class that inherits. It uses the \`extends\` keyword.

### 2. Objectives & Benefits
1. **Code Reusability:** Avoids redundant code by reusing parent logic.
2. **Method Overriding (Runtime Polymorphism):** Subclasses can customize parent behavior.
3. **Establish "IS-A" Relationship:** e.g., \`Car IS-A Vehicle\`.

### 3. Syntax & Example Code

\`\`\`java
// Base Superclass
class Animal {
    void eat() {
        System.out.println("This animal eats food.");
    }
}

// Subclass extending Animal
class Dog extends Animal {
    void bark() {
        System.out.println("The dog barks.");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog d = new Dog();
        d.eat();  // Inherited method from Animal
        d.bark(); // Subclass own method
    }
}
\`\`\`

### 4. Important Exam Note: Why Java Does Not Support Multiple Inheritance with Classes
Java does **not** allow a class to extend more than one class directly (to prevent the famous **Diamond Problem** / ambiguity). However, multiple inheritance is cleanly achieved using **Interfaces** (\`implements\`).

**Exam Tip:** In your answer sheet, draw the simple inheritance diagram showing \`Animal ↑ Dog\` with an arrow pointing to the superclass.`,
    timestamp: '10:04 AM',
    subjectTag: 'Java Programming & OOP',
    suggestedFollowUps: [
      "Explain the Diamond Problem with a diagram",
      "What is the difference between super and this keyword?",
      "Give me 3 viva questions on this topic",
    ],
  },
];

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-01',
    question: "Why does Java not support multiple inheritance through classes?",
    options: [
      "Due to memory restrictions in JVM",
      "To avoid ambiguity caused by the Diamond Problem",
      "Because interfaces are faster than classes",
      "To restrict the size of bytecode .class files",
    ],
    correctAnswerIndex: 1,
    explanation: "Multiple inheritance with classes creates ambiguity if two parent classes define the same method name (Diamond Problem). Java avoids this by requiring interfaces for multiple inheritance.",
    topic: "Java OOP",
  },
  {
    id: 'q-02',
    question: "In K-Nearest Neighbors (KNN), what happens if you choose an even value of K in a binary classification problem?",
    options: [
      "Computation time doubles",
      "A tie or vote deadlock can occur between both classes",
      "The algorithm converts into Linear Regression",
      "Overfitting is guaranteed to happen",
    ],
    correctAnswerIndex: 1,
    explanation: "An odd value of K is preferred in binary classification to eliminate tie-breaking deadlocks during majority voting.",
    topic: "Machine Learning Unit 3",
  },
  {
    id: 'q-03',
    question: "Which condition is strictly required for a relation to be in Boyce-Codd Normal Form (BCNF)?",
    options: [
      "Every non-prime attribute is fully functionally dependent on candidate key",
      "For every functional dependency X -> Y, X must be a super key",
      "No multi-valued dependencies exist",
      "All attributes must be numeric",
    ],
    correctAnswerIndex: 1,
    explanation: "BCNF is a stricter form of 3NF. In BCNF, for every functional dependency X -> Y, the left-hand side determinant X must strictly be a Super Key.",
    topic: "DBMS Normalization",
  },
  {
    id: 'q-04',
    question: "In Operating Systems, what does the Banker's Algorithm test before allocating requested resources?",
    options: [
      "Whether the CPU is idle",
      "Whether the requested allocation leaves the system in a Safe State",
      "Whether paging thrashing will happen",
      "Whether the process priority is higher than 10",
    ],
    correctAnswerIndex: 1,
    explanation: "The Banker's Algorithm ensures deadlock avoidance by finding if a safe execution sequence of processes exists where every process can satisfy its maximum remaining needs.",
    topic: "Operating Systems",
  },
  {
    id: 'q-05',
    question: "In Software Engineering, what is the key difference between Verification and Validation?",
    options: [
      "Verification is done by testers, Validation by developers",
      "Verification asks 'Are we building the product right?', Validation asks 'Are we building the right product?'",
      "Verification happens after deployment, Validation before coding",
      "There is no difference in Agile Scrum",
    ],
    correctAnswerIndex: 1,
    explanation: "Verification evaluates whether intermediate work conforms to requirements ('building right'). Validation evaluates whether the final software fulfills customer expectations ('right product').",
    topic: "Software Engineering Unit 4",
  },
];

export const INITIAL_EXAM_PREP_ITEMS: ExamPrepItem[] = [
  {
    id: 'ep-01',
    title: '7-Mark Model Answer: Banker’s Algorithm',
    type: '7-mark',
    subject: 'Operating Systems',
    unit: 'Unit 2',
    highYieldTag: 'Repeat PYQ (2022, 2023, 2024)',
    description: 'Step-by-step structure with safety algorithm matrix (Allocation, Max, Available, Need) and safety vector proof.',
    sampleQuestion: 'Explain Banker’s Algorithm for deadlock avoidance with suitable state vector example. (7 Marks)',
  },
  {
    id: 'ep-02',
    title: 'Important PYQ: 3NF vs BCNF Decomposition',
    type: 'important-pyq',
    subject: 'Database Management Systems',
    unit: 'Unit 3',
    highYieldTag: 'University Top Frequency',
    description: 'Comparative table, definition of determinants, and real example showing dependency preservation violation in BCNF.',
    sampleQuestion: 'Differentiate between 3NF and BCNF. Under what conditions is a 3NF relation not in BCNF? (5 Marks)',
  },
  {
    id: 'ep-03',
    title: 'Viva Prep: KNN Algorithm & Distance Metrics',
    type: 'viva',
    subject: 'Machine Learning',
    unit: 'Unit 3',
    highYieldTag: 'Lab External Viva',
    description: 'Top 10 examiner questions: distance formulas, impact of outlier values, lazy learner concept, and feature scaling.',
    sampleQuestion: 'Why is KNN called a Lazy Learner? How does feature scaling affect distance calculations?',
  },
  {
    id: 'ep-04',
    title: 'Quick Revision: Java OOP Concepts Cheat Sheet',
    type: 'quick-revision',
    subject: 'Java Programming & OOP',
    unit: 'Unit 1 & 2',
    highYieldTag: 'Last Night Cram Sheet',
    description: 'One-page reference with encapsulation, polymorphism, inheritance, access specifier matrix, and abstract class vs interface.',
    sampleQuestion: 'Summarize all 4 OOP pillars with 1-line real world analogies and syntax keywords.',
  },
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att-demo-01',
    subject: 'Machine Learning',
    topic: 'KNN & Classification Models',
    difficulty: 'Medium',
    questionCount: 5,
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    date: 'Yesterday at 4:30 PM',
    timestamp: 'Yesterday',
    weakTopics: ['Curse of Dimensionality in KNN'],
    questions: SAMPLE_QUIZ_QUESTIONS.slice(0, 5),
    userAnswers: { 0: 0, 1: 0, 2: 1, 3: 0, 4: 1 },
    isDemo: true,
  },
  {
    id: 'att-demo-02',
    subject: 'Java Programming & OOP',
    topic: 'Inheritance & Exception Handling',
    difficulty: 'Hard',
    questionCount: 5,
    score: 3,
    totalQuestions: 5,
    percentage: 60,
    date: '2 days ago',
    timestamp: '2 days ago',
    weakTopics: ['Multiple Inheritance via Interfaces', 'Checked vs Unchecked Exceptions'],
    questions: SAMPLE_QUIZ_QUESTIONS.slice(1, 6),
    userAnswers: { 0: 1, 1: 1, 2: 0, 3: 2, 4: 0 },
    isDemo: true,
  },
  {
    id: 'att-demo-03',
    subject: 'Operating Systems',
    topic: 'CPU Scheduling & Semaphores',
    difficulty: 'Medium',
    questionCount: 5,
    score: 5,
    totalQuestions: 5,
    percentage: 100,
    date: '3 days ago',
    timestamp: '3 days ago',
    weakTopics: [],
    questions: SAMPLE_QUIZ_QUESTIONS.slice(0, 5),
    userAnswers: { 0: 0, 1: 1, 2: 0, 3: 0, 4: 0 },
    isDemo: true,
  },
];

export const INITIAL_RECOMMENDATIONS: StudyRecommendation[] = [
  {
    id: 'rec-01',
    title: 'Revise Java Exception Handling & Take 5-Q Drill',
    description: 'Your recent Java quiz score was 60%. Questions on checked exceptions and interface hierarchies were missed.',
    reason: 'Score is below 70% threshold',
    subject: 'Java Programming & OOP',
    topic: 'Exception Handling',
    actionType: 'quiz',
    priority: 'high',
  },
  {
    id: 'rec-02',
    title: 'Machine Learning: Review Curse of Dimensionality',
    description: '18 days left for End-Sem. Study how high-dimensional spaces impact KNN distances.',
    reason: 'Identified weak topic from Unit 3 drill',
    subject: 'Machine Learning',
    topic: 'KNN & Classification',
    actionType: 'revision',
    priority: 'medium',
  },
  {
    id: 'rec-03',
    title: 'Operating Systems: Practice 7-Mark Banker’s Proof',
    description: 'Your scheduling accuracy is high (100%). Master the 7-mark state safety vector proof for maximum exam marks.',
    reason: 'Capitalize on strong foundational understanding',
    subject: 'Operating Systems',
    topic: 'Banker’s Algorithm',
    actionType: 'tutor',
    priority: 'normal',
  },
];

export const INITIAL_STUDY_PLAN_DAYS: StudyPlanDay[] = [
  {
    day: 1,
    title: 'Machine Learning: KNN & Metric Distance',
    subject: 'Machine Learning',
    topic: 'Unit 3: KNN Distance Metrics & Scaling',
    durationMinutes: 90,
    type: 'study',
    isCompleted: true,
    tasks: [
      'Read Unit 3 PDF notes on Euclidean & Manhattan formulas',
      'Write 5-mark answer for distance weighting trade-offs',
      'Complete 5-question Sathi practice quiz',
    ],
  },
  {
    day: 2,
    title: 'Java OOP: Inheritance & Interfaces',
    subject: 'Java Programming & OOP',
    topic: 'Unit 1: Multiple Inheritance & Super keyword',
    durationMinutes: 75,
    type: 'study',
    isCompleted: true,
    tasks: [
      'Code example demonstrating interface implementation in Java',
      'Revise difference between abstract class vs interface',
      'Ask Sathi for 3 common exam pitfalls',
    ],
  },
  {
    day: 3,
    title: 'Operating Systems: Deadlock Prevention & Banker’s',
    subject: 'Operating Systems',
    topic: 'Unit 2: Resource Allocation Graph & Safety Test',
    durationMinutes: 90,
    type: 'study',
    isCompleted: false,
    tasks: [
      'Solve Banker’s algorithm numerical matrix with 3 processes',
      'Review condition for Deadlock Prevention vs Avoidance',
      'Take 10-question practice assessment drill',
    ],
  },
  {
    day: 4,
    title: 'Weak Topic Diagnostics & Rapid Revision',
    subject: 'Java Programming & OOP',
    topic: 'Weak Areas: Exception Handling & Polymorphism',
    durationMinutes: 60,
    type: 'weak-topic',
    isCompleted: false,
    tasks: [
      'Review all missed questions from Day 2 quiz attempt',
      'Generate Quick Revision sheet for Java error hierarchies',
      'Re-attempt focused 5-question drill',
    ],
  },
  {
    day: 5,
    title: 'Database Systems: Normalization Drills',
    subject: 'Database Management Systems',
    topic: 'Unit 3: 1NF to BCNF Decomposition',
    durationMinutes: 80,
    type: 'study',
    isCompleted: false,
    tasks: [
      'Practice 3 dependency preservation decomposition problems',
      'Review 5-mark PYQ: 3NF vs BCNF',
      'Ask AI Sathi for real-world transaction examples',
    ],
  },
  {
    day: 6,
    title: 'Cross-Subject 7-Mark Exam Writing Drill',
    subject: 'All Subjects',
    topic: 'University Pattern 7-Mark Model Answers',
    durationMinutes: 90,
    type: 'revision',
    isCompleted: false,
    tasks: [
      'Structure 7-mark model answer for Banker’s Algorithm',
      'Structure 7-mark model answer for KNN classifier',
      'Draw neat architecture diagrams by hand',
    ],
  },
  {
    day: 7,
    title: 'Full-Length Timed Assessment Mock',
    subject: 'Machine Learning',
    topic: 'End-Sem Comprehensive Mock Drill',
    durationMinutes: 90,
    type: 'quiz',
    isCompleted: false,
    tasks: [
      'Attempt 20-question timed exam drill on Sathi',
      'Analyze final diagnostics and accuracy report',
      'Review last-minute formula sheet before exam',
    ],
  },
];
