import type { Question } from '@/types';

// The input format for the database (omits auto-generated fields like id/created_at)
export type SeedQuestion = Omit<Question, 'id' | 'created_at'>;

export const seedData: SeedQuestion[] = [
    // --- DSA ---
    {
        topic: "DSA", difficulty: 1,
        question: "What is the time complexity of accessing an element in an array by its index?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        correct_index: 0,
        explanation: "Array elements are stored in contiguous memory locations, so accessing any element by its index takes constant time O(1) by calculating its offset."
    },
    {
        topic: "DSA", difficulty: 1,
        question: "Which data structure follows the Last-In-First-Out (LIFO) principle?",
        options: ["Queue", "Stack", "Tree", "Graph"],
        correct_index: 1,
        explanation: "A stack is a linear data structure that follows the LIFO principle, meaning the last element added is the first one to be removed."
    },
    {
        topic: "DSA", difficulty: 1,
        question: "What is the primary advantage of a Linked List over an Array?",
        options: ["Faster random access", "Less memory usage", "Dynamic size and easy insertions/deletions", "Better cache locality"],
        correct_index: 2,
        explanation: "Unlike arrays, linked lists do not require contiguous memory. This allows elements to be easily inserted or removed without shifting other elements, and their size can grow dynamically."
    },
    {
        topic: "DSA", difficulty: 1,
        question: "In a Binary Search algorithm, what is the prerequisite condition for the target collection?",
        options: ["It must contain only integers", "It must be sorted", "It must be an array", "It must have an odd number of elements"],
        correct_index: 1,
        explanation: "Binary search works by repeatedly dividing the search space in half. This strategy relies on the collection being sorted to determine which half to discard."
    },
    {
        topic: "DSA", difficulty: 1,
        question: "Which of the following sorting algorithms works by repeatedly swapping adjacent elements if they are in the wrong order?",
        options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Insertion Sort"],
        correct_index: 2,
        explanation: "Bubble Sort steps through the list, compares adjacent elements, and swaps them if they are out of order, 'bubbling' the largest values to the end."
    },
    {
        topic: "DSA", difficulty: 2,
        question: "What is the worst-case time complexity of Quick Sort?",
        options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
        correct_index: 2,
        explanation: "Quick Sort generally runs in O(n log n) time, but its worst-case complexity is O(n^2) when the pivot chosen is consistently the smallest or largest element (e.g., when the array is already sorted)."
    },
    {
        topic: "DSA", difficulty: 2,
        question: "How does a Hash Map typically resolve hash collisions?",
        options: ["By throwing an exception", "Using a binary search tree", "Chaining (using linked lists) or open addressing", "By rejecting the new key"],
        correct_index: 2,
        explanation: "When two keys hash to the same index, Hash Maps commonly handle the collision either by chaining (storing a list of elements at the index) or open addressing (probe for the next empty slot)."
    },
    {
        topic: "DSA", difficulty: 2,
        question: "What is a complete binary tree?",
        options: ["A tree where every node has 0 or 2 children", "A tree where every level is completely filled, except possibly the last level which is filled left-to-right", "A tree where all leaves are at the same depth", "A tree with exactly 2^n - 1 nodes"],
        correct_index: 1,
        explanation: "A complete binary tree fills every level from left to right. This property is strictly maintained by Heaps when stored in an array representation."
    },
    {
        topic: "DSA", difficulty: 2,
        question: "Which graph traversal algorithm uses a Queue data structure?",
        options: ["Depth-First Search (DFS)", "Breadth-First Search (BFS)", "Dijkstra's Algorithm", "Kruskal's Algorithm"],
        correct_index: 1,
        explanation: "Breadth-First Search (BFS) explores the neighbor nodes first, before moving to the next level neighbors. It uses a queue to keep track of nodes to visit next."
    },
    {
        topic: "DSA", difficulty: 2,
        question: "What does the 'time complexity' of an algorithm measure?",
        options: ["The actual time taken in milliseconds", "The number of lines of code executed", "How the runtime scales as the input size grows", "The amount of memory required to run"],
        correct_index: 2,
        explanation: "Time complexity (Big-O notation) evaluates the asymptotic growth of an algorithm's execution time relative to the size of its input (n)."
    },
    {
        topic: "DSA", difficulty: 3,
        question: "What is the optimal algorithm to find the shortest path between a source node and all other nodes in a weighted directed graph with non-negative edge weights?",
        options: ["Bellman-Ford Algorithm", "A* Search", "Dijkstra's Algorithm", "Floyd-Warshall Algorithm"],
        correct_index: 2,
        explanation: "Dijkstra's Algorithm efficiently computes single-source shortest paths for graphs with non-negative weights using a priority queue."
    },
    {
        topic: "DSA", difficulty: 3,
        question: "Which of the following best describes 'Dynamic Programming'?",
        options: ["Writing programs that compile dynamically", "Solving a complex problem by breaking it down into a collection of simpler overlapping subproblems and caching their results", "Using recursion without caching", "Optimizing code execution at runtime"],
        correct_index: 1,
        explanation: "Dynamic programming combines problem decomposition with memoization or tabulation to avoid redundant calculations of overlapping subproblems."
    },
    {
        topic: "DSA", difficulty: 3,
        question: "In exactly what scenario is Breadth-First Search (BFS) guaranteed to find the shortest path in a graph?",
        options: ["In any weighted graph", "In a directed acyclic graph (DAG)", "In an unweighted graph where all edges have a cost of 1", "When the graph has negative edge weights"],
        correct_index: 2,
        explanation: "In an unweighted graph, BFS explores nodes level by level. When a target node is first reached, the path taken is guaranteed to be the shortest path."
    },
    {
        topic: "DSA", difficulty: 3,
        question: "What is the time complexity of building a Binary Heap from an unordered array?",
        options: ["O(n log n)", "O(log n)", "O(1)", "O(n)"],
        correct_index: 3,
        explanation: "Using the 'heapify' down-sifting approach, a binary heap can be built directly from an array in O(n) time, which is strictly faster than inserting elements one by one (O(n log n))."
    },
    {
        topic: "DSA", difficulty: 3,
        question: "Which data structure is most appropriate for answering Range Minimum Queries (RMQ) efficiently over an array that can be updated dynamically?",
        options: ["Hash Table", "Segment Tree", "Skip List", "Trie"],
        correct_index: 1,
        explanation: "A Segment tree allows both querying range statistics (like minimum, maximum, or sum) in O(log n) time and updating individual elements in O(log n) time."
    },

    // --- JavaScript ---
    {
        topic: "JavaScript", difficulty: 1,
        question: "Which keyword is used to declare a variable that cannot be reassigned?",
        options: ["var", "let", "const", "static"],
        correct_index: 2,
        explanation: "The `const` keyword declares a block-scoped local variable whose reference cannot be reassigned to a different value."
    },
    {
        topic: "JavaScript", difficulty: 1,
        question: "What does the `===` operator do in JavaScript?",
        options: ["Assigns a value", "Checks for equality with type conversion", "Checks for strict equality without type conversion", "Compares memory addresses only"],
        correct_index: 2,
        explanation: "`===` is the strict equality operator. It returns true only if the values and definitions of the two operands are strictly identical, preventing unpredicted type coercion."
    },
    {
        topic: "JavaScript", difficulty: 1,
        question: "Which of these is the correct syntax for an Arrow Function?",
        options: ["function myFunc() => {}", "() => {}", "=> () {}", "function() => {}"],
        correct_index: 1,
        explanation: "Arrow functions provide a concise syntax for writing function expressions, written as `(arguments) => { statements }`."
    },
    {
        topic: "JavaScript", difficulty: 1,
        question: "What does DOM stand for?",
        options: ["Document Output Model", "Document Object Model", "Dynamic Object Model", "Data Observation Mechanism"],
        correct_index: 1,
        explanation: "The Document Object Model (DOM) is an API that represents a web document as a logical tree, providing a way to manipulate HTML structure via JavaScript."
    },
    {
        topic: "JavaScript", difficulty: 1,
        question: "Which array method adds one or more elements to the end of an array and returns the new length?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correct_index: 0,
        explanation: "The `push()` method inserts items at the end of an array and changes the array's length, whereas `pop()` removes the last item."
    },
    {
        topic: "JavaScript", difficulty: 2,
        question: "What is a Closure in JavaScript?",
        options: ["Closing an open HTML tag dynamically", "When a function wraps another function returning null", "A function that has access to its outer function's scope, even after the outer function has returned", "The process of completing a Promise"],
        correct_index: 2,
        explanation: "A closure gives a function access to variables defined in its lexical scope, preserving the environment in which it was created."
    },
    {
        topic: "JavaScript", difficulty: 2,
        question: "What are the three states of a Promise?",
        options: ["Waiting, Received, Failed", "Pending, Fulfilled, Rejected", "Active, Paused, Terminated", "Starting, Running, Stopped"],
        correct_index: 1,
        explanation: "A Promise is always in one of three mutually exclusive states: Pending (initial), Fulfilled (operation successful), or Rejected (operation failed)."
    },
    {
        topic: "JavaScript", difficulty: 2,
        question: "What is 'hoisting' in JavaScript?",
        options: ["A JavaScript library for HTTP requests", "Moving an HTTP block to the top", "JavaScript's default behavior of moving variable and function declarations to the top of their current scope", "Elevating elements visually in CSS"],
        correct_index: 2,
        explanation: "Hoisting lets you use a function or variable before it has been formally declared. Note that only declarations (var, functions) are hoisted, not initializations/assignments."
    },
    {
        topic: "JavaScript", difficulty: 2,
        question: "What does `typeof null` evaluate to in JavaScript?",
        options: ["'null'", "'undefined'", "'object'", "'boolean'"],
        correct_index: 2,
        explanation: "Due to a historical bug in JavaScript's initial implementation, `typeof null` erroneously returns `'object'`. It was never fixed to avoid breaking legacy code."
    },
    {
        topic: "JavaScript", difficulty: 2,
        question: "Which of the following array methods does NOT mutate the original array?",
        options: ["splice()", "sort()", "reverse()", "map()"],
        correct_index: 3,
        explanation: "`map()` returns an entirely new array containing the results of calling a provided function on every element. Methods like splice, sort, and reverse mutate the original array inplace."
    },
    {
        topic: "JavaScript", difficulty: 3,
        question: "How does the JavaScript Event Loop handle execution?",
        options: ["It executes code top-to-bottom sequentially ignoring async tasks", "It pauses the main thread whenever an API call is made", "It continually checks the Web APIs and moves resolved call-backs to the callback queue, pushing them to the call stack when it's empty", "It creates a new system thread for every function call"],
        correct_index: 2,
        explanation: "The Event Loop continuously monitors the empty state of the Call Stack. While things run asynchronously via Web APIs, their callbacks queue up and are executed when the call stack is clear."
    },
    {
        topic: "JavaScript", difficulty: 3,
        question: "What is the difference between `==` and `Object.is()` in handling `NaN`?",
        options: ["They handle it identically", "`NaN == NaN` is true, `Object.is(NaN, NaN)` is false", "`NaN == NaN` is false, `Object.is(NaN, NaN)` is true", "Both return an exception"],
        correct_index: 2,
        explanation: "In JavaScript's default equality comparisons, `NaN` is not equal to itself. `Object.is()` resolves this specific quirk (along with -0 and +0 comparisons), so `Object.is(NaN, NaN)` evaluates to true."
    },
    {
        topic: "JavaScript", difficulty: 3,
        question: "What context does an arrow function's `this` keyword refer to?",
        options: ["The global window object", "The element that fired the event", "A dynamically bound context similar to standard functions", "The lexical context surrounding the arrow function at declaration"],
        correct_index: 3,
        explanation: "Unlike standard functions, arrow functions do not have their own `this` binding. They inherit `this` directly from the enclosing lexical scope."
    },
    {
        topic: "JavaScript", difficulty: 3,
        question: "What is the output of `console.log(1 + '1')` and `console.log(1 - '1')`?",
        options: ["'11' and 0", "2 and 0", "'11' and undefined", "TypeErrors"],
        correct_index: 0,
        explanation: "The `+` operator prefers string concatenation if any operand is a string, resulting in `'11'`. The `-` operator only works with numbers, so it coerces the string `'1'` to a number, resulting in `0`."
    },
    {
        topic: "JavaScript", difficulty: 3,
        question: "How does `async/await` behave under the hood?",
        options: ["It uses Web Workers", "It stops the event loop completely", "It relies on Generators and Promises to pause execution contexts", "It uses standard callbacks implicitly"],
        correct_index: 2,
        explanation: "Async/await is syntactic sugar over Promises. Under the hood, it's implemented similarly to combinations of Generators yielding execution control and Promises managing resolutions."
    },

    // --- SQL ---
    {
        topic: "SQL", difficulty: 1,
        question: "Which SQL clause is used to filter records that fulfill a specified condition?",
        options: ["FILTER", "FIND", "WHERE", "SELECT IF"],
        correct_index: 2,
        explanation: "The `WHERE` clause is placed immediately after the `FROM` clause to extract only those records that satisfy a specific condition."
    },
    {
        topic: "SQL", difficulty: 1,
        question: "Which core SQL statement is used to retrieve data from a database?",
        options: ["GET", "SELECT", "PULL", "EXTRACT"],
        correct_index: 1,
        explanation: "The `SELECT` statement is the fundamental SQL command used to query and extract data from tables in a database."
    },
    {
        topic: "SQL", difficulty: 1,
        question: "What does the `ORDER BY` clause do?",
        options: ["Filters data based on dates", "Sorts the result-set in ascending or descending order", "Randomizes the rows in the output", "Orders data into a new table"],
        correct_index: 1,
        explanation: "The `ORDER BY` keyword is used to sort the result-set. By default, it sorts alphabetically or numerically in ascending (ASC) order."
    },
    {
        topic: "SQL", difficulty: 1,
        question: "In a relational database, what is a Primary Key?",
        options: ["A password to access the table", "A unique identifier for each record in a table", "The first column in every table", "The largest numerical value in a column"],
        correct_index: 1,
        explanation: "A Primary Key constraint uniquely identifies each record. It must contain unique values and cannot contain NULL values."
    },
    {
        topic: "SQL", difficulty: 1,
        question: "Which of the following is NOT an aggregate function in SQL?",
        options: ["COUNT()", "MAX()", "LENGTH()", "SUM()"],
        correct_index: 2,
        explanation: "`COUNT()`, `MAX()`, and `SUM()` are aggregate functions operating on multiple rows. `LENGTH()` is a scalar function that operates on string data row-by-row."
    },
    {
        topic: "SQL", difficulty: 2,
        question: "What is the difference between `JOIN` (Inner Join) and `LEFT JOIN`?",
        options: ["They are identical", "INNER JOIN returns records having matching values in both tables; LEFT JOIN returns all records from the left table and matched records from the right.", "INNER JOIN returns random matches; LEFT JOIN prioritizes the left table.", "LEFT JOIN throws an error if right table differs."],
        correct_index: 1,
        explanation: "An INNER JOIN filters out rows that do not have matches on both sides. A LEFT JOIN ensures all rows from the primary (left) table remain in the results, emitting NULLs for missing right-side values."
    },
    {
        topic: "SQL", difficulty: 2,
        question: "Which clause acts as a filter specifically for groups or aggregate values?",
        options: ["WHERE", "FILTER", "HAVING", "GROUP FILTER"],
        correct_index: 2,
        explanation: "The `HAVING` clause was added to SQL because the `WHERE` keyword cannot be used to filter conditions containing aggregate functions (e.g., `COUNT(id) > 5`)."
    },
    {
        topic: "SQL", difficulty: 2,
        question: "What is the purpose of a Foreign Key?",
        options: ["To encrypt data going overseas", "To guarantee uniqueness in the current table", "To prevent NULL values", "To link two tables together and enforce referential integrity"],
        correct_index: 3,
        explanation: "A Foreign Key is a field in one table that refers to the Primary Key in another table, creating a relational link and preventing invalid data references."
    },
    {
        topic: "SQL", difficulty: 2,
        question: "What happens when you run a command like `CREATE INDEX` on a column?",
        options: ["It prevents users from querying that column", "It speeds up retrieval operations on that column but may slow down insert/update operations", "It automatically sorts the table on disk", "It renames the column physically"],
        correct_index: 1,
        explanation: "Database indexes function like the index of a book, drastically speeding up queries. However, modifying data takes longer because the index structure must be maintained on writes."
    },
    {
        topic: "SQL", difficulty: 2,
        question: "How would you combine the result sets of two SELECT queries that have identical column structures?",
        options: ["JOIN", "MERGE", "UNION", "CONCAT"],
        correct_index: 2,
        explanation: "The `UNION` operator combines the result sets of two or more SELECT queries into a single column set, removing duplicate rows automatically (unlike UNION ALL)."
    },
    {
        topic: "SQL", difficulty: 3,
        question: "What is the key functional difference between a Clustered Index and a Non-Clustered Index?",
        options: ["Clustered indexes physically alter the storage order of the data on disk; Non-clustered indexes are stored in a separate place.", "Clustered indexes are slower than Non-clustered.", "Non-clustered indexes do not allow duplicate values.", "Clustered indexes can be applied to many columns independently."],
        correct_index: 0,
        explanation: "A Clustered index physically sorts the data rows in the table. Therefore, a table can have only one clustered index, whereas it can have many non-clustered indexes."
    },
    {
        topic: "SQL", difficulty: 3,
        question: "In what exact phase of query execution does the database engine process the `WHERE` clause relative to `GROUP BY`?",
        options: ["Simultaneously with GROUP BY", "After GROUP BY operates", "Before the query begins parsing", "Before the GROUP BY aggregation occurs"],
        correct_index: 3,
        explanation: "According to SQL's order of execution, `FROM` is processed first, followed by `WHERE` filtering, and only then is data grouped with `GROUP BY`."
    },
    {
        topic: "SQL", difficulty: 3,
        question: "What prevents the phenomenon called 'Dirty Read' in SQL transactions?",
        options: ["Using the read uncommitted isolation level", "Vacuuming the database", "Setting the isolation level to Read Committed or higher", "Creating foreign keys"],
        correct_index: 2,
        explanation: "A dirty read occurs when a transaction reads data written by a concurrent uncommitted transaction. The Read Committed isolation level formally prevents this."
    },
    {
        topic: "SQL", difficulty: 3,
        question: "What is a Correlated Subquery?",
        options: ["A subquery that executes completely independently of the outer query", "A subquery that evaluates once per row processed by the outer query, using values from the outer query", "A syntax error", "A subquery that joins two identical tables together"],
        correct_index: 1,
        explanation: "A correlated subquery references columns from the outer query. It relies on the outer query for its values and executes once for every row evaluated by the outer query."
    },
    {
        topic: "SQL", difficulty: 3,
        question: "What does the SQL window function `RANK()` do to records with identical sort values?",
        options: ["It assigns them the same rank and skips the subsequent ranking numbers", "It assigns them sequential ranks randomly", "It throws an error if a tie occurs", "It assigns them the same rank and does NOT skip subsequent ranking numbers"],
        correct_index: 0,
        explanation: "`RANK()` gives tied records the same rank and creates a gap in the sequence (e.g., 1, 2, 2, 4). The `DENSE_RANK()` function, on the other hand, does NOT skip numbers (e.g., 1, 2, 2, 3)."
    }
];
