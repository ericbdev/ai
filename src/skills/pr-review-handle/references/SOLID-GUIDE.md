# SOLID Principles Guide for Code Review

This guide explains the two SOLID principles that this skill focuses on, when they matter, and when pragmatic tradeoffs are acceptable.

## What is SOLID?

SOLID is an acronym for five design principles that help make code more maintainable, testable, and flexible:

- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle (not used in this skill)
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

We focus on **OCP** and **DIP** because they most directly impact code review feedback about design and maintainability.

## Open/Closed Principle (OCP)

**Definition**: Software entities should be open for extension but closed for modification.

**In Plain English**: When you need new behavior, you should be able to add it without changing existing code.

### Example: Payment Processor

**Violates OCP**:
```javascript
// Current code hardcodes PayPal
class CheckoutService {
  processPayment(amount) {
    // This method is "closed for modification" but the hardcoded processor makes it "closed for extension"
    const processor = new PayPalProcessor();
    return processor.charge(amount);
  }
}

// To support Stripe, you must modify CheckoutService (violation!)
class CheckoutService {
  processPayment(amount, processor) {
    if (processor === 'paypal') {
      return new PayPalProcessor().charge(amount);
    } else if (processor === 'stripe') {
      return new StripeProcessor().charge(amount);
    }
  }
}
```

**Follows OCP**:
```javascript
// Use an abstraction
class CheckoutService {
  constructor(paymentProcessor) {
    this.processor = paymentProcessor; // Depends on abstraction, not concrete implementation
  }

  processPayment(amount) {
    return this.processor.charge(amount);
  }
}

// To add Stripe, just create a new class
class StripeProcessor implements PaymentProcessor {
  charge(amount) { /* ... */ }
}

// No modifications needed to CheckoutService!
const checkout = new CheckoutService(new StripeProcessor());
```

### When OCP Matters
- Multiple payment processors, databases, or APIs
- You anticipate frequent changes to a specific component
- You want to avoid cascading changes across the codebase

### When OCP Tradeoff is OK
- Simple scripts or utilities with one use case
- Premature abstraction costs more than it saves
- The code is stable and rarely changes

---

## Dependency Inversion Principle (DIP)

**Definition**: High-level modules should not depend on low-level modules. Both should depend on abstractions. Additionally, abstractions should not depend on details; details should depend on abstractions.

**In Plain English**: Don't hardcode dependencies to specific implementations. Inject them or pass them as parameters so they can be swapped out.

### Example: Logger

**Violates DIP**:
```javascript
// Low-level concrete dependency
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
    // Tightly coupled to ConsoleLogger - hard to test!
    this.logger = new ConsoleLogger();
  }

  getUser(id) {
    this.logger.info(`Fetching user ${id}`);
    return this.userRepository.findById(id);
  }
}

// To test without logging, you're stuck. Can't replace it.
```

**Follows DIP**:
```javascript
// Depend on abstraction (interface or base class)
class UserService {
  constructor(userRepository, logger) {
    this.userRepository = userRepository;
    this.logger = logger; // Dependency injected - can be swapped!
  }

  getUser(id) {
    this.logger.info(`Fetching user ${id}`);
    return this.userRepository.findById(id);
  }
}

// Testing is easy - inject a mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};
const service = new UserService(mockRepo, mockLogger);
service.getUser(1);
expect(mockLogger.info).toHaveBeenCalled();
```

### When DIP Matters
- You need to test code without external dependencies (logging, APIs, databases)
- You want to swap implementations (different loggers, storage backends)
- You're building a library or framework that others will use
- Coupling to concrete implementations makes code hard to understand or modify

### When DIP Tradeoff is OK
- Simple glue code that orchestrates libraries
- Global configuration where one implementation is truly sufficient
- Prototyping or proof-of-concept code that won't be maintained
- The dependency is stable and unlikely to change (e.g., built-in language functions)

---

## Evaluating SOLID Violations in Code Review

When you see feedback about SOLID, ask yourself:

### 1. Is the Principle Actually Being Violated?
Not all design decisions that deviate from SOLID are violations:
- A different approach that also works is not necessarily wrong
- Sometimes simpler code that repeats slightly is better than over-abstracted code

### 2. What's the Real Cost vs. Benefit?

**Cost of Following SOLID**:
- Additional abstraction layers (more code to read)
- Extra constructor parameters or configuration
- Complexity in the dependency graph
- Learning curve for developers

**Benefit of Following SOLID**:
- Easier to add new implementations later
- Easier to test in isolation (mock dependencies)
- Cleaner separation of concerns
- Less cascading changes when requirements shift

### 3. Context Matters

**Follow SOLID when**:
- The code is central, frequently modified, or foundational
- You anticipate extensions or variations
- Testing is important and mocking is necessary
- Multiple teams or projects will depend on this code

**Consider pragmatic tradeoffs when**:
- The code is stable and rarely changes
- Abstraction adds more complexity than it prevents
- The codebase is small enough that duplication doesn't hurt
- The team is less experienced with SOLID patterns

---

## Common Tradeoff Scenarios

### Scenario 1: Simple Utility That Logs
```javascript
// This is fine - not all code needs to be perfectly SOLID
function validateEmail(email) {
  console.log(`Validating: ${email}`);
  return email.includes('@');
}

// Refactoring to inject a logger would be overkill here
```

### Scenario 2: Core Domain Logic
```javascript
// This should follow SOLID - it's central to the app
class OrderProcessingService {
  constructor(paymentProcessor, notificationService, orderRepository) {
    // Each dependency is injected - testable and extensible
    this.payment = paymentProcessor;
    this.notifier = notificationService;
    this.repo = orderRepository;
  }
}

// Easy to test with mocks, easy to support new payment methods
```

### Scenario 3: Rapidly Changing Feature
```javascript
// During development, don't over-engineer
class ExperimentalFeature {
  constructor() {
    this.db = new MongoDatabase(); // OK while experimenting
  }
}

// Once the design stabilizes, refactor to inject the database
```

---

## Discussion Questions for Code Review

If a reviewer suggests following SOLID, consider these questions:

1. **"Is this code likely to need multiple implementations?"**
   - If yes, OCP/DIP makes sense
   - If no, simpler code is better

2. **"How hard is it to test without this abstraction?"**
   - If testing is difficult, DIP is valuable
   - If testing is already easy, it's optional

3. **"What's the maintenance burden of the abstraction vs. the duplication?"**
   - A small amount of duplication can be clearer than a complex abstraction
   - A central piece of code that changes often benefits from abstraction

4. **"Is this code new or stable?"**
   - New code: start simple, refactor to SOLID as patterns emerge
   - Stable code: refactor to SOLID if you're touching it anyway

---

## Resources

- [Robert C. Martin - SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Dependency Injection Patterns](https://martinfowler.com/articles/injection.html)
- [The Pragmatic Programmer - Conventions](https://pragprog.com/)

Remember: SOLID principles are guidelines for better design, not rules that must always be followed. The best code is code that your team understands and can maintain.

---

This guide is available in the skill's `references/` directory and can be consulted when code review feedback about design comes up.
