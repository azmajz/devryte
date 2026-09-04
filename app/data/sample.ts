// ============================================================
// Devryte — Hardcoded Sample Data
// ============================================================

export interface Lesson {
  id: string
  title: string
  slug: string
  readTime: number // minutes
  updatedAt: string
  content: string
}

export interface Topic {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  color: string
  accentColor: string
  lessonCount: number
  lessons: Lesson[]
}

// ─── C# MARKDOWN CONTENT ─────────────────────────────────────

const csOopContent = `# Object-Oriented Programming in C#

Object-Oriented Programming (OOP) is a programming paradigm that organizes code into **objects** — self-contained units that bundle data and behavior together. C# is a fully object-oriented language built on four fundamental principles.

## The Four Pillars of OOP

### 1. Encapsulation

Encapsulation means **bundling data and the methods that operate on that data** within a class, and restricting direct access to some of the object's components.

\`\`\`csharp
public class BankAccount
{
    private decimal _balance; // Private field — hidden from outside

    public decimal Balance => _balance; // Read-only property

    public void Deposit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Deposit must be positive");

        _balance += amount;
        Console.WriteLine($"Deposited {amount:C}. New balance: {_balance:C}");
    }

    public void Withdraw(decimal amount)
    {
        if (amount > _balance)
            throw new InvalidOperationException("Insufficient funds");

        _balance -= amount;
    }
}
\`\`\`

> **Key insight**: The outside world can't directly manipulate \`_balance\`. They must go through \`Deposit()\` and \`Withdraw()\`, which enforce business rules.

### 2. Inheritance

Inheritance allows a class to **inherit properties and methods** from another class, enabling code reuse and establishing a natural hierarchy.

\`\`\`csharp
public abstract class Shape
{
    public string Color { get; set; }

    public Shape(string color)
    {
        Color = color;
    }

    public abstract double Area(); // Must be implemented by subclasses

    public virtual string Describe()
    {
        return $"I am a {Color} shape with area {Area():F2}";
    }
}

public class Circle : Shape
{
    public double Radius { get; }

    public Circle(string color, double radius) : base(color)
    {
        Radius = radius;
    }

    public override double Area() => Math.PI * Radius * Radius;
}

public class Rectangle : Shape
{
    public double Width { get; }
    public double Height { get; }

    public Rectangle(string color, double width, double height) : base(color)
    {
        Width = width;
        Height = height;
    }

    public override double Area() => Width * Height;
}
\`\`\`

### 3. Polymorphism

Polymorphism lets you **treat objects of different types uniformly** through a common interface.

\`\`\`csharp
List<Shape> shapes = new()
{
    new Circle("red", 5),
    new Rectangle("blue", 4, 6),
    new Circle("green", 3),
};

foreach (var shape in shapes)
{
    // Each shape uses its own Area() implementation
    Console.WriteLine(shape.Describe());
}

// Output:
// I am a red shape with area 78.54
// I am a blue shape with area 24.00
// I am a green shape with area 28.27
\`\`\`

### 4. Abstraction

Abstraction means **hiding complex implementation details** and exposing only what's necessary.

\`\`\`csharp
public interface IRepository<T>
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

// The caller doesn't need to know HOW data is stored
public class UserService
{
    private readonly IRepository<User> _repo;

    public UserService(IRepository<User> repo) => _repo = repo;

    public async Task<User?> GetUserAsync(int id) => await _repo.GetByIdAsync(id);
}
\`\`\`

## When to Use What

| Pillar | Use When |
|--------|----------|
| **Encapsulation** | You need to protect internal state |
| **Inheritance** | Classes share a clear "is-a" relationship |
| **Polymorphism** | Different types need to respond to the same message |
| **Abstraction** | You want to define a contract without implementation |

## Summary

OOP in C# isn't just about syntax — it's about **designing systems that are maintainable, extensible, and easy to reason about**. Mastering these four pillars gives you the mental models to build software that doesn't collapse under its own weight.
`

const csLinqContent = `# LINQ — Language Integrated Query

LINQ (Language Integrated Query) is one of C#'s most powerful features. It lets you **query and transform collections** using a consistent, expressive syntax — directly in C# code.

## Why LINQ?

Before LINQ, querying data meant writing loops, conditions, and temporary lists manually. LINQ replaces that boilerplate with **declarative, composable, readable expressions**.

\`\`\`csharp
// Without LINQ
var result = new List<string>();
foreach (var name in names)
{
    if (name.StartsWith("A"))
        result.Add(name.ToUpper());
}

// With LINQ ✨
var result = names
    .Where(n => n.StartsWith("A"))
    .Select(n => n.ToUpper())
    .ToList();
\`\`\`

## Core LINQ Methods

### Filtering — \`Where\`

\`\`\`csharp
var adults = people.Where(p => p.Age >= 18);
var expensiveProducts = products.Where(p => p.Price > 100 && p.InStock);
\`\`\`

### Projecting — \`Select\`

\`\`\`csharp
var names = people.Select(p => p.Name);
var summaries = orders.Select(o => new {
    o.Id,
    Total = o.Items.Sum(i => i.Price),
    Date = o.CreatedAt.ToShortDateString()
});
\`\`\`

### Aggregating

\`\`\`csharp
var totalRevenue = orders.Sum(o => o.Total);
var avgAge = people.Average(p => p.Age);
var oldest = people.Max(p => p.Age);
var richest = people.MaxBy(p => p.NetWorth);
\`\`\`

### Sorting — \`OrderBy\`

\`\`\`csharp
var sorted = products
    .OrderBy(p => p.Category)
    .ThenByDescending(p => p.Price);
\`\`\`

### Grouping — \`GroupBy\`

\`\`\`csharp
var byCategory = products
    .GroupBy(p => p.Category)
    .Select(g => new {
        Category = g.Key,
        Count = g.Count(),
        AveragePrice = g.Average(p => p.Price)
    });
\`\`\`

### Joining — \`Join\`

\`\`\`csharp
var orderDetails = orders.Join(
    customers,
    o => o.CustomerId,
    c => c.Id,
    (o, c) => new { Order = o, CustomerName = c.Name }
);
\`\`\`

## Real-World Example

\`\`\`csharp
public record Product(string Name, string Category, decimal Price, bool InStock);

var inventory = new List<Product>
{
    new("MacBook Pro", "Laptops", 2499, true),
    new("iPad Air", "Tablets", 749, true),
    new("iPhone 15", "Phones", 999, false),
    new("AirPods Pro", "Audio", 249, true),
    new("Mac Mini", "Desktops", 699, true),
};

// Get top 3 in-stock items by price, grouped by category
var report = inventory
    .Where(p => p.InStock)
    .OrderByDescending(p => p.Price)
    .Take(3)
    .GroupBy(p => p.Category)
    .Select(g => new {
        Category = g.Key,
        Items = g.Select(p => p.Name).ToList(),
        TotalValue = g.Sum(p => p.Price)
    });


\`\`\`

## Deferred vs Immediate Execution

> **Important**: Most LINQ operators are *lazily evaluated* — they don't execute until you iterate the result.

\`\`\`csharp
// Deferred — nothing runs yet
var query = products.Where(p => p.Price > 100);

// Immediate execution — forces evaluation
var list = query.ToList();    // Executes + stores results
var count = query.Count();    // Executes + counts
var first = query.First();    // Executes + returns first
\`\`\`

## LINQ Query Syntax vs Method Syntax

Both are equivalent. Choose based on readability:

\`\`\`csharp
// Method syntax (preferred in most cases)
var result = products
    .Where(p => p.Category == "Laptops")
    .OrderBy(p => p.Price)
    .Select(p => p.Name);

// Query syntax (SQL-like)
var result = from p in products
             where p.Category == "Laptops"
             orderby p.Price
             select p.Name;
\`\`\`

## Key Takeaways

- LINQ makes collection manipulation **declarative and expressive**
- It works on any \`IEnumerable<T>\` or \`IQueryable<T>\`
- LINQ-to-EF translates queries to **SQL automatically**
- Master \`Where\`, \`Select\`, \`GroupBy\`, \`OrderBy\`, and the aggregation methods
`

const csAsyncContent = `# Async/Await & Task Programming

Modern C# applications are built around asynchronous programming. Understanding \`async\`/\`await\` is essential for writing responsive, scalable apps.

## Why Async Matters

Synchronous code **blocks the thread** while waiting for I/O operations (file reads, HTTP requests, database queries). Async code releases the thread to do other work.

\`\`\`csharp
// ❌ Synchronous — blocks thread for entire duration
public string GetUserData(int id)
{
    var response = httpClient.GetString($"/users/{id}"); // Thread is frozen here
    return response;
}

// ✅ Asynchronous — thread is free while waiting
public async Task<string> GetUserDataAsync(int id)
{
    var response = await httpClient.GetStringAsync($"/users/{id}");
    return response;
}
\`\`\`

## The async/await Pattern

\`\`\`csharp
public class WeatherService
{
    private readonly HttpClient _http;

    public WeatherService(HttpClient http) => _http = http;

    public async Task<WeatherData> GetWeatherAsync(string city)
    {
        // await suspends this method, freeing the thread
        var json = await _http.GetStringAsync($"api/weather?city={city}");

        // Execution resumes here after HTTP response arrives
        return JsonSerializer.Deserialize<WeatherData>(json)!;
    }
}
\`\`\`

## Task vs Task\<T\>

| Type | Use Case |
|------|----------|
| \`Task\` | Async method with no return value |
| \`Task<T>\` | Async method that returns a value |
| \`ValueTask<T>\` | High-performance hot path (rarely needed) |

\`\`\`csharp
public async Task SendEmailAsync(string to, string subject) { ... }
public async Task<User> FindUserAsync(string email) { ... }
public async Task<bool> ValidateTokenAsync(string token) { ... }
\`\`\`

## Running Tasks in Parallel

\`\`\`csharp
// Sequential — takes sum of all durations
var user = await GetUserAsync(userId);
var orders = await GetOrdersAsync(userId);
var settings = await GetSettingsAsync(userId);

// Parallel — takes max of all durations ✨
var userTask = GetUserAsync(userId);
var ordersTask = GetOrdersAsync(userId);
var settingsTask = GetSettingsAsync(userId);

await Task.WhenAll(userTask, ordersTask, settingsTask);

var user = userTask.Result;
var orders = ordersTask.Result;
var settings = settingsTask.Result;
\`\`\`

## Cancellation Tokens

Always support cancellation in long-running operations:

\`\`\`csharp
public async Task<IEnumerable<Product>> SearchProductsAsync(
    string query,
    CancellationToken cancellationToken = default)
{
    await Task.Delay(100, cancellationToken); // Respects cancellation

    return await _db.Products
        .Where(p => p.Name.Contains(query))
        .ToListAsync(cancellationToken);
}

// Usage
using var cts = new CancellationTokenSource(timeout: TimeSpan.FromSeconds(10));
var results = await SearchProductsAsync("laptop", cts.Token);
\`\`\`

## Error Handling

\`\`\`csharp
public async Task<ApiResult<User>> GetUserSafeAsync(int id)
{
    try
    {
        var user = await _repo.GetByIdAsync(id);

        return user is null
            ? ApiResult<User>.NotFound($"User {id} not found")
            : ApiResult<User>.Ok(user);
    }
    catch (HttpRequestException ex)
    {
        _logger.LogError(ex, "Network error fetching user {Id}", id);
        return ApiResult<User>.Error("Network unavailable");
    }
    catch (OperationCanceledException)
    {
        return ApiResult<User>.Error("Request cancelled");
    }
}
\`\`\`

## Common Pitfalls

\`\`\`csharp
// ❌ Don't use .Result or .Wait() — causes deadlocks!
var user = GetUserAsync(id).Result;

// ✅ Await properly all the way up
var user = await GetUserAsync(id);

// ❌ Async void — exceptions are unobservable
public async void LoadData() { ... }

// ✅ Async Task — exceptions propagate correctly
public async Task LoadDataAsync() { ... }

// Exception: event handlers (must be async void)
button.Click += async (s, e) => { await DoWorkAsync(); };
\`\`\`

## Summary

- Use \`async Task\` / \`async Task<T>\` for all async methods
- \`await\` every async call — never ignore the task
- Use \`Task.WhenAll\` for parallel independent operations
- Always pass \`CancellationToken\` in library code
- Never use \`.Result\` or \`.Wait()\` in async context
`

const csRecordsContent = `# Records, Pattern Matching & Modern C# Features

Modern C# (versions 9–13) has evolved dramatically. These features let you write **more expressive, concise, and correct** code.

## Records

Records are **immutable reference types** with value-based equality — perfect for data transfer objects, domain models, and event payloads.

\`\`\`csharp
// Define a record
public record Person(string FirstName, string LastName, int Age);

// Instantiate
var alice = new Person("Alice", "Johnson", 30);
var bob = new Person("Bob", "Smith", 25);

// Value equality — compares by content, not reference
var alice2 = new Person("Alice", "Johnson", 30);
Console.WriteLine(alice == alice2); // True ✓

// Non-destructive mutation with "with"
var olderAlice = alice with { Age = 31 };
Console.WriteLine(olderAlice); // Person { FirstName = Alice, LastName = Johnson, Age = 31 }

// Deconstruction
var (first, last, age) = alice;
Console.WriteLine($"{first} is {age} years old");
\`\`\`

## Pattern Matching

Pattern matching transforms complex conditional logic into elegant, readable expressions.

### Switch Expressions

\`\`\`csharp
public record Shape();
public record Circle(double Radius) : Shape;
public record Rectangle(double Width, double Height) : Shape;
public record Triangle(double Base, double Height) : Shape;

// Switch expression with type patterns
double GetArea(Shape shape) => shape switch
{
    Circle c => Math.PI * c.Radius * c.Radius,
    Rectangle r => r.Width * r.Height,
    Triangle t => 0.5 * t.Base * t.Height,
    _ => throw new ArgumentException("Unknown shape")
};
\`\`\`

### Property Patterns

\`\`\`csharp
string ClassifyOrder(Order order) => order switch
{
    { Total: > 1000, IsPriority: true } => "VIP Rush Order",
    { Total: > 1000 } => "Large Order",
    { IsPriority: true } => "Priority Order",
    { Status: OrderStatus.Cancelled } => "Cancelled",
    _ => "Standard Order"
};
\`\`\`

### List Patterns (C# 11+)

\`\`\`csharp
string Describe(int[] numbers) => numbers switch
{
    [] => "Empty",
    [var single] => $"Single element: {single}",
    [var first, var second] => $"Two elements: {first}, {second}",
    [var first, .., var last] => $"Starts with {first}, ends with {last}",
};
\`\`\`

## Required Members (C# 11)

\`\`\`csharp
public class UserProfile
{
    public required string Username { get; init; }
    public required string Email { get; init; }
    public string? Bio { get; init; }
}

// Compiler error if required members are missing
var profile = new UserProfile
{
    Username = "devjane",
    Email = "jane@example.com"
    // Bio is optional
};
\`\`\`

## Raw String Literals (C# 11)

\`\`\`csharp
// No more escape hell for JSON, SQL, HTML
var json = """
    {
        "name": "Devryte",
        "version": "1.0",
        "features": ["notes", "markdown", "syntax-highlighting"]
    }
    """;

var sql = """
    SELECT u.Name, COUNT(o.Id) as OrderCount
    FROM Users u
    LEFT JOIN Orders o ON u.Id = o.UserId
    WHERE u.CreatedAt > '2024-01-01'
    GROUP BY u.Name
    ORDER BY OrderCount DESC;
    """;
\`\`\`

## Collection Expressions (C# 12)

\`\`\`csharp
// Before
var list = new List<int> { 1, 2, 3 };
var arr = new int[] { 1, 2, 3 };

// After — unified syntax!
List<int> list = [1, 2, 3];
int[] arr = [1, 2, 3];
Span<int> span = [1, 2, 3];

// Spread operator
int[] a = [1, 2, 3];
int[] b = [4, 5, 6];
int[] combined = [..a, ..b]; // [1, 2, 3, 4, 5, 6]
\`\`\`

## Primary Constructors (C# 12)

\`\`\`csharp
// Old way
public class OrderService
{
    private readonly IOrderRepository _repo;
    private readonly ILogger<OrderService> _logger;

    public OrderService(IOrderRepository repo, ILogger<OrderService> logger)
    {
        _repo = repo;
        _logger = logger;
    }
}

// New way — primary constructor
public class OrderService(IOrderRepository repo, ILogger<OrderService> logger)
{
    public async Task<Order?> GetAsync(int id)
    {
        logger.LogInformation("Fetching order {Id}", id);
        return await repo.GetByIdAsync(id);
    }
}
\`\`\`

## Summary

Modern C# features reward you with:
- **Records** → immutable data modeling with zero boilerplate
- **Pattern matching** → readable branching on data shapes
- **Required members** → compile-time initialization guarantees
- **Raw strings** → no more escape character soup
- **Collection expressions** → unified, concise collection syntax
`

// ─── SAMPLE DATA ──────────────────────────────────────────────

export const topics: Topic[] = [
  {
    id: '1',
    slug: 'csharp',
    name: 'C#',
    description: 'Modern, type-safe, object-oriented language for .NET development. From fundamentals to advanced patterns.',
    icon: '⚡',
    color: '#7c3aed',
    accentColor: 'rgba(124, 58, 237, 0.12)',
    lessonCount: 4,
    lessons: [
      {
        id: '1',
        title: 'Object-Oriented Programming',
        slug: 'oop',
        readTime: 8,
        updatedAt: '2026-08-28',
        content: csOopContent,
      },
      {
        id: '2',
        title: 'LINQ — Language Integrated Query',
        slug: 'linq',
        readTime: 10,
        updatedAt: '2026-08-30',
        content: csLinqContent,
      },
      {
        id: '3',
        title: 'Async/Await & Task Programming',
        slug: 'async-await',
        readTime: 9,
        updatedAt: '2026-09-01',
        content: csAsyncContent,
      },
      {
        id: '4',
        title: 'Records, Pattern Matching & Modern C#',
        slug: 'modern-csharp',
        readTime: 7,
        updatedAt: '2026-09-02',
        content: csRecordsContent,
      },
    ],
  },
  {
    id: '2',
    slug: 'javascript',
    name: 'JavaScript',
    description: 'The language of the web. Closures, event loops, promises, and modern ES features.',
    icon: '🟡',
    color: '#d97706',
    accentColor: 'rgba(217, 119, 6, 0.10)',
    lessonCount: 3,
    lessons: [
      {
        id: '5',
        title: 'Closures & Scope',
        slug: 'closures',
        readTime: 6,
        updatedAt: '2026-08-25',
        content: `# Closures & Scope in JavaScript\n\nA **closure** is a function that retains access to its outer scope even after the outer function has returned.\n\n## Lexical Scope\n\n\`\`\`javascript\nfunction makeCounter() {\n  let count = 0; // This variable is "enclosed"\n\n  return {\n    increment() { count++; },\n    decrement() { count--; },\n    value() { return count; },\n  };\n}\n\nconst counter = makeCounter();\ncounter.increment();\ncounter.increment();\ncounter.increment();\nconsole.log(counter.value()); // 3\n\`\`\`\n\nThe inner functions close over \`count\` — they remember it even though \`makeCounter\` has finished executing.\n\n## Practical Use: Memoization\n\n\`\`\`javascript\nfunction memoize(fn) {\n  const cache = new Map();\n\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}\n\nconst expensiveCalc = memoize((n) => {\n  // ... complex computation\n  return n * n;\n});\n\`\`\`\n`,
      },
      {
        id: '6',
        title: 'Promises & Async/Await',
        slug: 'promises',
        readTime: 7,
        updatedAt: '2026-08-26',
        content: `# Promises & Async/Await\n\nJavaScript is single-threaded but handles I/O asynchronously through the event loop.\n\n## Promises\n\n\`\`\`javascript\nconst fetchUser = (id) =>\n  fetch(\`/api/users/\${id}\`)\n    .then(res => {\n      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n      return res.json();\n    });\n\`\`\`\n\n## Async/Await\n\n\`\`\`javascript\nasync function loadDashboard(userId) {\n  const [user, posts, followers] = await Promise.all([\n    fetchUser(userId),\n    fetchPosts(userId),\n    fetchFollowers(userId),\n  ]);\n\n  return { user, posts, followers };\n}\n\`\`\`\n`,
      },
      {
        id: '7',
        title: 'The Event Loop',
        slug: 'event-loop',
        readTime: 5,
        updatedAt: '2026-08-27',
        content: `# The JavaScript Event Loop\n\nUnderstanding the event loop is key to understanding why JavaScript behaves the way it does.\n\n## Call Stack, Task Queue & Microtask Queue\n\n\`\`\`javascript\nconsole.log('1'); // Call stack\n\nsetTimeout(() => console.log('2'), 0); // Task queue\n\nPromise.resolve().then(() => console.log('3')); // Microtask queue\n\nconsole.log('4'); // Call stack\n\n// Output: 1, 4, 3, 2\n\`\`\`\n\nMicrotasks (Promise callbacks) always run before the next macro-task.\n`,
      },
    ],
  },
  {
    id: '3',
    slug: 'nuxt',
    name: 'Nuxt',
    description: 'The intuitive Vue framework. File-based routing, server-side rendering, and full-stack capabilities.',
    icon: '💚',
    color: '#059669',
    accentColor: 'rgba(5, 150, 105, 0.10)',
    lessonCount: 2,
    lessons: [
      {
        id: '8',
        title: 'File-Based Routing',
        slug: 'routing',
        readTime: 5,
        updatedAt: '2026-09-01',
        content: `# File-Based Routing in Nuxt\n\nNuxt automatically generates routes from your \`pages/\` directory structure.\n\n## Basic Routes\n\n\`\`\`\npages/\n├── index.vue          → /\n├── about.vue          → /about\n├── blog/\n│   ├── index.vue      → /blog\n│   └── [slug].vue     → /blog/:slug\n└── users/\n    └── [id].vue       → /users/:id\n\`\`\`\n\n## Accessing Route Params\n\n\`\`\`vue\n<script setup>\nconst route = useRoute()\nconsole.log(route.params.slug)\n</script>\n\`\`\`\n`,
      },
      {
        id: '9',
        title: 'Data Fetching with useFetch',
        slug: 'data-fetching',
        readTime: 6,
        updatedAt: '2026-09-02',
        content: `# Data Fetching in Nuxt\n\nNuxt provides composables for SSR-aware data fetching.\n\n## useFetch\n\n\`\`\`vue\n<script setup>\nconst { data: posts, status } = await useFetch('/api/posts')\n</script>\n\n<template>\n  <div v-if="status === 'pending'">Loading...</div>\n  <ul v-else>\n    <li v-for="post in posts" :key="post.id">{{ post.title }}</li>\n  </ul>\n</template>\n\`\`\`\n\n## useAsyncData\n\nUse when you need more control or custom fetch logic.\n\n\`\`\`vue\n<script setup>\nconst { data: user } = await useAsyncData('user', () =>\n  $fetch(\`/api/users/\${userId}\`)\n)\n</script>\n\`\`\`\n`,
      },
    ],
  },
  {
    id: '4',
    slug: 'postgresql',
    name: 'PostgreSQL',
    description: 'The world\'s most advanced open-source relational database. Queries, indexes, and performance tuning.',
    icon: '🐘',
    color: '#0369a1',
    accentColor: 'rgba(3, 105, 161, 0.10)',
    lessonCount: 2,
    lessons: [
      {
        id: '10',
        title: 'Window Functions',
        slug: 'window-functions',
        readTime: 9,
        updatedAt: '2026-08-29',
        content: `# Window Functions in PostgreSQL\n\nWindow functions perform calculations across a set of rows related to the current row — without collapsing them like GROUP BY.\n\n## Basic Syntax\n\n\`\`\`sql\nSELECT\n  name,\n  department,\n  salary,\n  AVG(salary) OVER (PARTITION BY department) AS dept_avg,\n  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank\nFROM employees;\n\`\`\`\n\n## Running Totals\n\n\`\`\`sql\nSELECT\n  order_date,\n  revenue,\n  SUM(revenue) OVER (\n    ORDER BY order_date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total\nFROM daily_sales;\n\`\`\`\n`,
      },
      {
        id: '11',
        title: 'Indexes & Query Performance',
        slug: 'indexes',
        readTime: 8,
        updatedAt: '2026-08-31',
        content: `# Indexes & Query Performance\n\nIndexes are the single most impactful tool for PostgreSQL performance.\n\n## Types of Indexes\n\n\`\`\`sql\n-- B-Tree (default) — equality and range queries\nCREATE INDEX idx_users_email ON users(email);\n\n-- Partial index — index only a subset\nCREATE INDEX idx_active_users ON users(email)\nWHERE is_active = true;\n\n-- Composite index\nCREATE INDEX idx_orders_customer_date ON orders(customer_id, created_at DESC);\n\`\`\`\n\n## EXPLAIN ANALYZE\n\n\`\`\`sql\nEXPLAIN ANALYZE\nSELECT * FROM orders\nWHERE customer_id = 42\nAND created_at > NOW() - INTERVAL '30 days';\n\`\`\`\n\nLook for: **Seq Scan** (bad on large tables) vs **Index Scan** (good).\n`,
      },
    ],
  },
]

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find(t => t.slug === slug)
}

export function getLessonById(topic: Topic, id: string): Lesson | undefined {
  return topic.lessons.find(l => l.id === id)
}

export function getAdjacentLessons(topic: Topic, currentId: string) {
  const idx = topic.lessons.findIndex(l => l.id === currentId)
  return {
    prev: idx > 0 ? topic.lessons[idx - 1] : null,
    next: idx < topic.lessons.length - 1 ? topic.lessons[idx + 1] : null,
  }
}
